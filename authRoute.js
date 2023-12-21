const express = require('express');
const mongoose = require('mongoose');
const { User } = require('./models');


const bcrypt = require('bcrypt');

const app = express();

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


router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
    
        const user = await User.findOne({ username });
    
        if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Compare the hashed password
        const isPasswordValid = await bcrypt.compare(password, user.password);
    
        if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
        }
    
        // If login is successful, set a session with user information
        req.session.user = {
        id: user._id,
        username: user.username,
        
        };
    
        // Respond with success and user information
        res.status(200).json({ message: 'Login successful', user: req.session.user, redirect: '/http://127.0.0.1:3001/home.html' });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
    });

module.exports = router;