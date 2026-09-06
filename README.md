# Backend Learning Notes

This README is a growing set of notes explaining how this backend works, topic by topic.
It's meant for students following along with the code — each section covers one
piece of the app, which file it lives in, and why it's written the way it is.

New topics get added here as the project grows, so check back for updates.

---

## Table of Contents

1. [Signup Flow (Auth Controller)](#1-signup-flow-auth-controller)
2. [Validating Signup Input (express-validator)](#2-validating-signup-input-express-validator)

---

## 1. Signup Flow (Auth Controller)

**File:** [`controller/authController.js`](controller/authController.js)
**Also touches:** [`model/user.js`](model/user.js), [`Routes/authRoutes.js`](Routes/authRoutes.js)

This is the handler that runs when a client sends `POST /signup`. Here's what
each part does:

```js
const UserModel = require("../model/user")

const signupController = async (req, res) => {
     const { username, email, password } = req.body
     try {
        const user = new UserModel({ username, email, password })
        await user.save()
        const { password: _, ...safeUser } = user.toObject()
        res.status(201).json({ message: "Sign up successful", data: safeUser })
     } catch (error) {
       res.status(400).json({ message: error.message })
     }
}

module.exports = { signupController }
```

**Line by line:**

- **`require("../model/user")`** — imports the Mongoose model. This gives us
  `new UserModel(...)`, `.save()`, and everything else Mongoose provides for
  reading/writing the `User` collection.

- **`async (req, res) => { ... }`** — an Express route handler marked `async` so
  we can `await` promises inside it instead of chaining `.then()`. `req` is the
  incoming request (body, headers, params); `res` is how we send a response back.

- **`const { username, email, password } = req.body`** — pulls the three fields
  the client is expected to send as JSON. This only works because
  `server.use(express.json())` is enabled in `index.js` — that middleware parses
  the raw request body into `req.body`.

- **`try { ... } catch (error) { ... }`** — wraps the risky async work. Anything
  that throws or returns a rejected promise inside `try` jumps straight to
  `catch`, instead of crashing the server or leaving the request hanging forever.

- **`new UserModel({ username, email, password })`** — builds an in-memory
  Mongoose document. Nothing touches the database yet — this just applies the
  schema shape and runs basic validators like `required`.

- **`await user.save()`** — this is where the document actually gets written to
  MongoDB. Two important things happen here that aren't visible in this file:
  - Mongoose runs the `pre("save")` hook defined in `model/user.js`, which
    hashes the plaintext password with `bcrypt` **before** it's written to the
    database. We never store plaintext passwords.
  - If `username` or `email` breaks a schema rule (`required`, or `unique` —
    checked at the database level), `.save()` rejects. Because we used `await`,
    that rejection becomes a normal JavaScript exception that our `catch` block
    can handle.

- **`const { password: _, ...safeUser } = user.toObject()`** — `.toObject()`
  turns the Mongoose document into a plain JS object (this includes the now
  *hashed* password, plus Mongo's internal `_id` and `__v` fields). We then
  destructure it: `password` gets pulled out into a throwaway variable named
  `_` (a common convention meaning "I don't need this"), and `...safeUser`
  collects everything else. **We do this so we never send the password field
  back to the client**, even hashed — the client never needs it, and returning
  it is an unnecessary security exposure.

- **`res.status(201).json({ message: ..., data: safeUser })`** — sends the
  response. `201 Created` is the correct HTTP status code for "a new resource
  was successfully created" (as opposed to `200`, which is more generic).

- **`catch (error) { res.status(400).json({ message: error.message }) }`** —
  catches anything that went wrong, most commonly:
  - A Mongoose `ValidationError` (a required field was missing).
  - A MongoDB duplicate-key error (`E11000`) when `username` or `email`
    already exists, because of the `unique: true` constraint in the schema.

  We respond with `400 Bad Request` and the error message. (Improvement idea
  for later: `error.code === 11000` duplicate-key errors return a fairly raw
  MongoDB message — cleaning that up into "username or email already taken"
  is a good exercise.)

- **`module.exports = { signupController }`** — exports the handler as a
  *named* export (an object with a `signupController` key), which is why
  `Routes/authRoutes.js` imports it like this:

  ```js
  const { signupController } = require("../controller/authController")
  ```

### Related file: the password hashing hook

**File:** [`model/user.js`](model/user.js)

```js
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})
```

This runs automatically, right before any `.save()` call. `isModified("password")`
checks whether the password field changed on this save (so if you later update a
user's email without touching their password, it won't get re-hashed by mistake).
`bcrypt.hash(this.password, 10)` replaces the plaintext password with a salted
hash — `10` is the "cost factor" (how much CPU work goes into the hash; higher is
slower but more secure).

### Related file: wiring the route

**File:** [`Routes/authRoutes.js`](Routes/authRoutes.js)

```js
const { signupController } = require("../controller/authController")
const express = require("express")
const router = express.Router()

router.post("/signup", signupController)

module.exports = router
```

This connects the URL path `POST /signup` to the `signupController` function.
`router` is then mounted onto the main app in `index.js` via
`server.use(authRoutes)`, which is what makes `/signup` actually reachable.

---

## 2. Validating Signup Input (express-validator)

**File:** [`Routes/authRoutes.js`](Routes/authRoutes.js)
**Also touches:** [`controller/authController.js`](controller/authController.js)
**Package used:** [`express-validator`](https://express-validator.github.io/docs/)

Before this, `signupController` trusted whatever the client sent — an empty
`username`, a malformed email, or a 2-character password would sail straight
through to `new UserModel(...)` and only fail (maybe) when Mongoose's schema
validators caught it. `express-validator` lets us check the request body
*before* it ever reaches the controller, and gives much friendlier error
messages.

```js
const { signupController } = require("../controller/authController")
const { body } = require('express-validator')
const UserModel = require("../model/user")
const express = require("express")
const router = express.Router()

router.post("/signup",
    [
        body('username').trim().not().isEmpty().withMessage("Username is required"),
        body('email').isEmail().withMessage("Email is invalid")
            .custom(async (value) => {
                const existingUser = await UserModel.findOne({ email: value })
                if (existingUser) {
                    throw new Error("Email is already in use")
                }
            }),
        body('password').trim().isLength({ min: 5 }).withMessage("Password must be at least 5 characters")
    ],
    signupController)

module.exports = router
```

**How it works:**

- **`router.post("/signup", [ ...validators ], signupController)`** — Express
  route handlers can take an *array* of middleware before the final handler.
  Each validator in the array runs in order, attaching any errors it finds to
  `req`, then calls `next()` automatically. `signupController` still runs
  either way — the validators don't block the request by themselves, they just
  record problems for the controller to check (see below).

- **`body('username')`** — tells express-validator to look at
  `req.body.username`. This has to match the field name your controller
  actually reads (`const { username, email, password } = req.body` in
  `authController.js`) — a common bug is validating a field name (like `name`)
  that the controller never looks at, which silently does nothing useful.

- **`.trim().not().isEmpty()`** — chainable checks. `trim()` strips whitespace
  first, `not().isEmpty()` then fails if what's left is an empty string. So
  `"   "` correctly fails as "empty" instead of slipping through as truthy.

- **`.withMessage("...")`** — the message attached to that specific check if it
  fails. Without it, express-validator falls back to a generic "Invalid value".

- **`body('email').isEmail()`** — a built-in check using the `validator.js`
  library under the hood (basic format checking, not full RFC validation, but
  good enough for signup forms).

- **`.custom(async (value) => { ... })`** — for anything the built-in checks
  can't do. Here we run our own async logic: query Mongo for a user with that
  email, and `throw new Error(...)` if one already exists. **Throwing** inside
  `.custom()` is how you fail a custom check — returning `false` also works,
  but throwing lets you attach a specific message directly.

  You might wonder: doesn't the schema already have `unique: true` on `email`
  (see `model/user.js`)? Yes — but that constraint only surfaces as a raw,
  unfriendly MongoDB duplicate-key error *after* trying to save. This custom
  validator catches the same problem earlier and returns a clean, expected
  error message instead.

- **`body('password').trim().isLength({ min: 5 })`** — rejects passwords
  shorter than 5 characters after trimming whitespace.

### The missing piece: actually checking the errors

Adding validators to the route is only half the job — something has to check
whether any of them failed and stop the request if so. That happens in the
controller, using `validationResult`:

```js
const { validationResult } = require("express-validator")

const signupController = async (req, res) => {
     const errors = validationResult(req)
     if (!errors.isEmpty()) {
       return res.status(400).json({ message: errors.array()[0].msg, errors: errors.array() })
     }

     const { username, email, password } = req.body
     // ...
}
```

- **`validationResult(req)`** — collects every error recorded by the validators
  that ran on this request.
- **`errors.isEmpty()`** — `true` if nothing failed. If something *did* fail,
  we immediately `return` a `400 Bad Request` with the error messages, and
  `return` here is important — without it, the code would keep running and try
  to create the user anyway, even though we know the input is bad.
- **`errors.array()`** — an array of every failed check, each with a `msg`,
  the offending field (`path`), and the value that was rejected. We send back
  the first message as the main `message`, plus the full list under `errors`
  in case the client wants to show all of them at once (e.g. highlighting
  multiple invalid form fields).

### Installing the package

This required adding the dependency to the project:

```bash
yarn add express-validator
```

---

*More topics will be added here as the project grows — login, JWT auth,
student routes, error handling patterns, etc.*
