require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('./auth');

const { User, Account, Transaction } = require('./models');


const app = express();

 

mongoose.connect('mongodb://localhost:27017/OurBank');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to the database');
});

app.use(cors({
  origin: ['http://127.0.0.1:3001', 'http://localhost:3001'],  // Update this to your client's origin
  credentials: true
}));



app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));


app.post('/register', async(req, res) => {
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


  app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        console.log(password);
        const attemptingUser = await User.findOne({ username });

        if (!attemptingUser) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        console.log(attemptingUser.password);
        // Compare the hashed password
        const isPasswordValid = (password == attemptingUser.password);


        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Generate and save the authentication token
        const token = await attemptingUser.generateAuthToken();
        
        console.log(token);

        // Send a success response
        res.status(200).json({ message: 'Login successful', token:token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});




app.get('/home', auth,  async (req, res) => {
  try {
      // Retrieve the JWT token from the headers
      const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

      
      const user = req.user;

      const userName = user.username;
      console.log(`JWT token from headers: ${token}`);
      res.json({ message: 'Home page accessed successfully', username: userName });
  } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/deposit', auth, async(req, res) => {
  try{
    const {amount} = req.body;
    const user = req.user;

    const account = await Account.findOne({userId: user._id});
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    account.balance = Number(account.balance) + Number(amount);
    await account.save();
    res.status(200).json({ message: 'Deposit successful', newBalance: account.balance });
  }
  catch(error){
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

app.post('/withdraw', auth, async (req, res) => {
  try {
    const { amount } = req.body;
    const user = req.user;

    // Find the user's account
    const account = await Account.findOne({ userId: user._id });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Ensure both balance and amount are treated as numbers
    const currentBalance = Number(account.balance);
    const withdrawalAmount = Number(amount);

    // Check if the available balance is sufficient for the withdrawal
    if (currentBalance >= withdrawalAmount) {
      // Deduct the amount from the account balance
      account.balance = currentBalance - withdrawalAmount;

      // Save the updated account
      await account.save();

      // Respond with success message
      res.status(200).json({ message: 'Withdrawal successful', newBalance: account.balance });
    } else {
      res.status(400).json({ error: 'Insufficient funds' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/transfer', auth, async (req, res) => {
  try {
    const { amount, recipient } = req.body;
    const user = req.user;

    // Find the user's account
    const senderAccount = await Account.findOne({ userId: user._id });

    if (!senderAccount) {
      return res.status(404).json({ error: 'Sender account not found' });
    }

    // Ensure both balance and amount are treated as numbers
    const currentBalance = Number(senderAccount.balance);
    const transferAmount = Number(amount);

    // Check if the sender has sufficient funds for the transfer
    if (currentBalance >= transferAmount) {
      // Deduct the amount from the sender's account balance
      senderAccount.balance = currentBalance - transferAmount;

      // Find the recipient's account
      const recipientAccount = await Account.findOne({ accountNumber: recipient });

      if (!recipientAccount) {
        return res.status(404).json({ error: 'Recipient account not found' });
      }

      // Add the amount to the recipient's account balance
      recipientAccount.balance += transferAmount;

      // Save both accounts
      await senderAccount.save();
      await recipientAccount.save();

      // Record the transaction
      const transaction = new Transaction({
        fromAccount: user._id,
        toAccount: recipientAccount.userId,
        amount: transferAmount,
        type: "transfer"
      });

      await transaction.save();

      // Respond with success message
      res.status(200).json({ message: 'Transfer successful', newBalance: senderAccount.balance });
    } else {
      res.status(400).json({ error: 'Insufficient funds' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/balance', auth, async (req, res) => {
  try {
    const user = req.user;

    // Find the user's account
    const account = await Account.findOne({ userId: user._id });

    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }

    // Respond with the user's balance
    res.status(200).json({ balance: account.balance });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/transaction-history', auth, async (req, res) => {
  try {
    const user = req.user;

    // Find all transactions related to the user
    const transactions = await Transaction.find({
      $or: [{ fromAccount: user._id }],
    });

    // Respond with the user's transaction history
    res.status(200).json({ transactions });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Add a new route for logout
app.post('/logout', auth, async(req, res) => {
// Clear the session on logout
 try{
    res.send("log out successful");
 }
 catch(error){
    res.send(error);
 }
});

function generateUniqueAccountNumber() {
// Generate a unique account number using timestamp and random number
const timestamp = Date.now().toString(); // Convert current timestamp to a string
const randomDigits = Math.floor(Math.random() * 1000); // Generate a random 3-digit number

// Combine timestamp and random number to create a unique account number
const accountNumber = timestamp + randomDigits;

return accountNumber;
}


app.use((err, req, res, next) => {
console.error(err.stack);
res.status(500).send('Something went wrong!');
});
  
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });