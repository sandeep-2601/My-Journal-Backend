const express = require('express');
const router = express.Router();
const User = require('./../models/User');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

//Creating a User using : POST "/api/user" .No login required
router.post(
  '/',
  [
    body('name', 'Invalid name').isLength({ min: 8 }),
    body('email', 'Invalid email').isEmail(),
    body('password', 'Invalid password').isLength({ min: 8 })
  ],
  async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      
      let user = await User.findOne({ email: req.body.email });

      if (user !== null) {
        return res.status(400).json({
          errors: `Invalid mail id`,
          message: `user with email ${req.body.email} already exists`
        });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(req.body.password,salt);

      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
      });

      const data = {
        user : {
          id : user.id
        }
      }

      console.log(user.id);
      const authToken = jwt.sign(data,"SANDY");
      return res.json({ authToken});
    }
    catch (err) {
      console.error(err.message);
      return res.status(500).send({ error: "Internal server error", message: "Something went wrong with mongodb Database" })
    }
  }
);

module.exports = router;