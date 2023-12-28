const express = require('express');
const router = express.Router();
const {User, Account} = require('./models')
const bcrypt = require('bcrypt');

router.post('/register', async(req, res) => {
    try{
      const { name, email, username, password } = req.body;
      const newUser = new User({ name, email, username, password });
      const savedUser = await newUser.save();

      const newAccount = new Account({
        userId: savedUser._id, // Link the account to the newly created user
        accountNumber: generateUniqueAccountNumber(), // Assuming you have a function to generate a unique account number
        balance: 0, // Set initial balance as needed
    });
    await newAccount.save();
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
        console.log(user);
    
        if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Compare the hashed password
        
        const isPasswordValid = await bcrypt.compare(password, user.password);
    
        if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // If login is successful, set a session with user information
        req.session.userId = user._id;

        console.log(req.session);
    
        // Respond with success and user information
        res.status(200).cookie('connect.sid', req.sessionID, { maxAge: 900000, httpOnly: true, secure: true }).json({ message: 'Login successful', redirect: '/home.html'});

        
      } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
    });


  
    router.get('/home', async (req, res) => {
      try {
          console.log(req.session.userId);
  
          if (req.session.userId) {
              // Assuming you have a User model
              const user = await User.findById(req.session.userId);
  
              if (!user) {
                  throw new Error('User not found');
              }
  
              const loggedInUsername = user.username;
              console.log(loggedInUsername);
  
              res.json({ username: loggedInUsername });
          } else {
              console.log("problem with session");
              res.status(401).json({ error: 'User not logged in' });
          }
      } catch (error) {
          console.error('Error in /home route:', error);
          res.status(500).json({ error: 'Internal server error' });
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

function generateUniqueAccountNumber() {
  // Generate a unique account number using timestamp and random number
  const timestamp = Date.now().toString(); // Convert current timestamp to a string
  const randomDigits = Math.floor(Math.random() * 1000); // Generate a random 3-digit number

  // Combine timestamp and random number to create a unique account number
  const accountNumber = timestamp + randomDigits;

  return accountNumber;
}


module.exports = router;