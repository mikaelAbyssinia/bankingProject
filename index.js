const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const cors = require('cors');
const authRoute = require('./authRoute');


const { User, Account, Transaction } = require('./models');

const PORT = process.env.PORT || 3000;

const app = express();


mongoose.connect('mongodb://localhost:27017/OurBank', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to the database');
});

const store = new MongoDBStore({
  uri: 'mongodb://localhost:27017/OurBank',
  collection: 'sessions',
});

store.on('error', function (error) {
  console.error('MongoDBStore error:', error);
});

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  store: store,
  }));

  
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



app.use('/auth', authRoute);


app.post('/login', (req, res) => {
    const { username, password} = req.body;
    console.log(username, password);
    res.status(200).json({ message: 'JSON data received' });
})

app.use((err, req, res, next) => {
console.error(err.stack);
res.status(500).send('Something went wrong!');
});
  

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });