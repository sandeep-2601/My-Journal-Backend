const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const fetchUser = require('../middleware/fetchUser');

//Route 1 : Creating a User using : POST "/api/user" .No login required
router.post(
  '/createuser',
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
      
      const authToken = jwt.sign(data,"SANDY");
      return res.status(201).json({ authToken});
    }
    catch (err) {
      return res.status(500).send({ error: "Internal server error", message: "Something went wrong with mongodb Database" })
    }
  }
);

//Route 2 : Creating a User using : POST "/api/user/login". No login required
router.post(
  '/login',
  [
    body('email', 'Invalid email').isEmail(),
    body('password', 'Invalid password').exists()
  ],
  async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const {email,password} = req.body;

      let user = await User.findOne({ email: email });

      if (user == null) {
        return res.status(400).json({
          error: "Invalid Credentials"
        });
      }

      const comparePassword = await bcrypt.compare(password,user.password);
      
      if(!comparePassword) {
        return res.status(404).json({error:"Invalid credentials"});
      }

      const data = {
        user : {
          id : user.id
        }
      }

      const authToken = jwt.sign(data,"SANDY");
      return res.json({ authToken});
    }
    catch (err) {
      return res.status(500).send({ error: "Internal server error", message: "Something went wrong with mongodb Database" })
    }
  }
);

// Router 3 : Get loggedin user details using : POST "/api/user/fetchuser". Login required
router.post("/fetchuser",fetchUser,async (req,res)=>{
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select(["name","email","-_id"]);
    if(user !== null) 
      return res.status(200).json({user});
    return res.status(401).json({error:"Authenticate using a valid Token"});
  } catch (error) {
    return res.status(404).json({error:"Bad Request"});
  }
});


module.exports = router;