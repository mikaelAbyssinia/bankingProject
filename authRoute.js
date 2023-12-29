const express = require('express');

const {User, Account} = require('./models')






router.post('/register', async(req, res) => {
    try{
      const { name, email, username, password } = req.body;
      const newUser = new User({ name, email, username, password });

      const token = await newUser.generateAuthToken();
          
          // Set the token in a cookie
          res.cookie('jwt', token);
          console.log(token);
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
  
          const attemptingUser = await User.findOne({ username });
  
          if (!attemptingUser) {
              return res.status(401).json({ error: 'Invalid credentials' });
          }
  
          // Compare the hashed password
          const isPasswordValid = await bcrypt.compare(password, attemptingUser.password);
  
          if (!isPasswordValid) {
              return res.status(401).json({ error: 'Invalid credentials' });
          }
          console.log(attemptingUser);
          // Generate and save the authentication token
          const token = await attemptingUser.generateAuthToken();
          
          // Set the token in a cookie
          res.cookie('jwt', token);
          console.log(token);
  
          // Send a success response
          res.status(200).json({ message: 'Login successful', token });
      } catch (error) {
          console.error('Error during login:', error);
          res.status(500).json({ error: 'Internal server error' });
      }
  });
  


  
    router.get('/home', async (req, res) => {
      try {
          const verifyToken = async()=>{
            const verTok = jws.verify(token,"thefirstpersontodevelopscientificunderstanding" );
            console.log(verTok);
          }

          verifyToken();
          
  
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