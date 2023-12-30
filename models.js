// models.js
const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Define User Schema
const userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },

  tokens:[{
    token: {
      type: String,
      required: true,
    }
  }]
});

// Define Account Schema
const accountSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
    unique: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
});

// Define Transaction Schema
const transactionSchema = new Schema({
    fromAccount: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    toAccount: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['transfer'],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  });

  userSchema.methods.generateAuthToken = async function() {
    try {
      const token = jwt.sign({ _id: this._id }, process.env.SECRET, { expiresIn: '10 seconds' });
      console.log("the created token during login is " + token);
      this.tokens = [];
      this.tokens = this.tokens.concat({ token: token });
      await this.save();
      return token;
    } catch (error) {
      console.log("error in creating token is " + error);
      // You might want to throw an error or handle it differently
      throw new Error("An error occurred while trying to create registration token: " + error);
    }
  }
  


  // userSchema.pre('save', async function (next) {
  //   try {
  //     // Generate a salt
  //     const salt = await bcrypt.genSalt(10);
  
  //     // Hash the password with the salt
  //     const hashedPassword = await bcrypt.hash(this.password, salt);
  
  //     // Set the hashed password
  //     this.password = hashedPassword;
  //     next();
  //   } catch (error) {
  //     next(error);
  //   }
  // });

  
// Create models
const User = mongoose.model('User', userSchema);
const Account = mongoose.model('Account', accountSchema);
const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = {
  User,
  Account,
  Transaction,
};
