const User = require("../models/User");
const jwt = require('jsonwebtoken');

// handle errors
const handleErrors = (err) => {
  console.log(err.message, err.code);
  let errors = { username: '', phonenumber: '', email: '', password: '' };

  // incorrect username
  if (err.message === 'username used') {
    errors.username = 'That username is already used, try another';
  }

  if (err.message === 'phone used') {
    errors.phonenumber = 'That phone number is already used';
  }

  if (err.message === 'phone not valid') {
    errors.phonenumber = 'That phone number is not valid';
  }


  if (err.message === 'incorrect username') {
    errors.username = 'That username is not correct';
  }

  // incorrect password
  if (err.message === 'incorrect password') {
    errors.password = 'That password is incorrect';
  }

  // duplicate email error
  if (err.code === 11000) {
    errors.email = 'that email is already used';
    return errors;
  }

  // validation errors
  if (err.message.includes('user validation failed')) {
    // console.log(err);
    Object.values(err.errors).forEach(({ properties }) => {
      // console.log(val);
      // console.log(properties);
      errors[properties.path] = properties.message;
    });
  }

  return errors;
}

// create json web token
const maxAge = 3 * 24 * 60 * 60;

const createToken = (id) => {
  return jwt.sign({ id }, 'net ninja secret', {
    expiresIn: maxAge
  });
};

// controller actions
module.exports.signup_get = (req, res) => {
  res.render('signup');
}

module.exports.login_get = (req, res) => {
  res.render('login');
}

module.exports.signup_post = async (req, res) => {
  const { username, firstname, lastname, phonenumber, email, password } = req.body;

  try {
    const isUsernameUsed = await User.isThisUsernameInUse(username);
    if(isUsernameUsed)
    {
      throw Error ('username used');
    };
    const isPhoneUsed = await User.isThisPhoneInUse(phonenumber);
    if(isPhoneUsed)
    {
      throw Error ('phone used');
    };
    const isPhoneValid = await User.isThisPhoneValid(phonenumber);
    if(!isPhoneValid)
    {
      throw Error ('phone not valid');
    };
    const user = await User.create({ username, firstname, lastname, phonenumber, email, password });
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(201).json({ user: user._id });
  }
  catch(err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
 
}

module.exports.login_post = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.login(username, password);
    const token = createToken(user._id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } 
  catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }

}

module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
  }