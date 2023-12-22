const express = require('express');
const router = express.Router();
const {User} = require('./models')
const bcrypt = require('bcrypt');

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
        console.log(password);
        console.log(user.password);
        const isPasswordValid = await bcrypt.compare(password, user.password);
    
        if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // If login is successful, set a session with user information
        req.session.user = {
        id: user._id,
        username: user.username,
        
        };

        console.log(req.session.user);
    
        // Respond with success and user information
        res.status(200).json({ message: 'Login successful', user: req.session.user, redirect: 'http://127.0.0.1:3000/home.html' });
        
      } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
    });

    
  router.get('/home', async(req, res) => {
    console.log(req.session.user);
    if (req.session.user) {
        const loggedInUsername = req.session.user.username;
        console.log(loggedInUsername);
        res.json({ username: loggedInUsername });
    } else {
        console.log("problem with session");
        res.status(401).json({ error: 'User not logged in' });
    }
});


// Add a new route for logout
router.post('/logout', async(req, res) => {
  // Clear the session on logout
  req.session.destroy(err => {
      if (err) {
          console.error('Error during logout:', err);
          return res.status(500).json({ error: 'Internal server error' });
      }
      res.status(200).json({ message: 'Logout successful' });
  });
});


module.exports = router;