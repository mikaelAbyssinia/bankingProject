const jwt = require('jsonwebtoken');
const { User, Account, Transaction } = require('./models');

const auth = async (req, res, next) => {
    try {
        // Retrieve the JWT token from the headers
        const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
        
        console.log(`JWT token from headers: ${token}`);

        const verifyUser = jwt.verify(token, process.env.SECRET);
        console.log(verifyUser);
        const user = await User.findById(verifyUser._id);

        if (!user) {
            throw new Error('User not found');
        }

        req.user = user;

        next();
    } catch (error) {
        console.error('Error:', error);
        return res.status(401).json({ error: 'Unauthorized' });
    }

}


module.exports = auth;