const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



app.post('/register', (req, res) => {
    const { name, email, username, password } = req.body;
    console.log(name, email, username, password);
    res.status(200).json({ message: 'JSON data received' });

  });


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