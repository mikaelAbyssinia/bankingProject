const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const authRoute = require('./authRoute');


const { User, Account, Transaction } = require('./models');

const PORT = process.env.PORT || 3000;

const app = express();


mongoose.connect('mongodb://localhost:27017/OurBank')

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to the database');
});


app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: 'mongodb://localhost:27017/OurBank',
    ttl: 60 * 60 * 24, // Time-to-live for sessions in seconds (optional)
  }),
  cookie: {
    secure: false, // Set to true if using HTTPS
    httpOnly: true,
    maxAge: 3600000, // 1 hour (adjust as needed)
},
  }));

  
  app.use(cors({ 
    origin: 'http://127.0.0.1:3000',  // Specify the allowed origin
    credentials: true  // Allow credentials (cookies)
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use('/auth', authRoute);

app.use((err, req, res, next) => {
console.error(err.stack);
res.status(500).send('Something went wrong!');
});
  

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });