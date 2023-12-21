const express = require('express');
const mongoose = require('mongoose');
const { User } = require('./models');


const router = express.Router();

router.post('/register', async(req, res) => {
    try{
      const { name, email, username, password } = req.body;
      const newUser = new User({ name, email, username, password });
      const savedUser = await newUser.save();
      console.log(name, email, username, password);
      res.status(200).json({ message: 'data has been saved in the database!!' });
    }
    catch(error){
      res.status(500).json({ error: error.message });
    }
    });

module.exports = router;