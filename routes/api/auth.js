const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");

const User = require("../../models/User");

// @route   GET api/auth
// @desc    Test route
// @access  Public
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/auth
// @desc    Test route
// @access  Public
router.delete("/", auth, async (req, res) => {
  try {
    const user = await User.find({ email: req.email }).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ msg: "User can't be deleted, user not found" });
    }

    await user.remove();
    res.status(200).json("user removed");
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/auth
// @desc    Authenticate user and get token
// @access  Public
router.post(
  "/",
  [
    check("email", "Please include a valid email").isEmail(),
    check("password", "Password is required").exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      //see if email already exists
      let user = await User.findOne({ email });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Did not find a user by that email" }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({
          errors: [
            {
              msg:
                "Wrong password. Try again or click Forgot password to reset it."
            }
          ]
        });
      }

      //return jsonwebtoken to log user in once they register
      const payload = {
        user: {
          id: user.id
        }
      };
      //config.get('jwtSecret'),
      //const configdata = config.get('jwtSecret');
      jwt.sign(
        payload,
        "mysecrettoken",
        { expiresIn: 3600 },
        (error, token) => {
          if (error) throw error;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error: " + err.message);
    }
  }
);

module.exports = router;
