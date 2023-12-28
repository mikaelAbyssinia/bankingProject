const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
const authRoute = require('./authRoute');


const { User, Account, Transaction } = require('./models');


const app = express();


mongoose.connect('mongodb://localhost:27017/OurBank');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to the database');
});

app.use(cors({
  origin: 'http://127.0.0.1:3001',
  credentials: true
}));



const sessionMiddleware = session({
  secret: 'abc',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: 'mongodb://localhost:27017/OurBank',
    ttl: 900000,
  }),
  cookie: {
    secure: true, // Set to true if using HTTPS
    httpOnly: true,
    maxAge: 900000, // Set to match the ttl value
  },
});

app.use(sessionMiddleware);



app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


app.use('/auth', authRoute);

app.use((err, req, res, next) => {
console.error(err.stack);
res.status(500).send('Something went wrong!');
});
  
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });