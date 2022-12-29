const mongoose = require('mongoose')
const { isEmail } = require('validator')
const bcrypt = require('bcrypt')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please enter an username'],
        unique: true,
        minLength: [3, 'Minimum username length is 3 characters']
    },
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    phonenumber: {
        type: String,
        required: [true, 'Please enter a phone number'],
        unique: true
    },
    email: {
        type: String,
        required: [true, 'Please enter an email'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Please enter a valid email']
    },
    password:{
        type: String,
        required: [true, 'Please enter an password'],
        minLength: [6, 'Minimum password length is 6 characters']
    },
    phonenumber:{
        type: String,
        required: [true, 'Please enter a phone number'],
        unique: true
    }
});

userSchema.statics.isThisPhoneInUse = async function(phonenumber){
    try {
        const user = await this.findOne({phonenumber})
        if(user) {
            console.log('Phone number already used');
            return true
        }
    }   catch(error) {
        console.log('already used', error.message)
        return false
    }
}

userSchema.statics.isThisPhoneValid = async function(phonenumber){
    validPhone = false
    if((phonenumber < 999999999) && (phonenumber > 100000000) || (phonenumber < +48999999999) && (phonenumber > +48100000000))
        validPhone = true
    return validPhone
}

userSchema.statics.isThisUsernameInUse = async function(username){
    try {
        const user = await this.findOne({username})
        if(user) {
            console.log('Username used try another');
            return true
        }
    }   catch(error) {
        console.log('already used', error.message)
        return false
    }
}

userSchema.post('save', function (doc, next){
    console.log("new user was created & saved", doc);
    next();
})

// use a function before saving to db
userSchema.pre('save', async function (next) {
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt);
    next();
})

// static method to login user
userSchema.statics.login = async function(username, password) {
    const user = await this.findOne( {username });
    if (user) {
        const auth = await bcrypt.compare(password, user.password);
        if (auth) {
            return user;
        }
        throw Error('incorrect password');
    }
    throw Error('incorrect username');
}

const User = mongoose.model('user', userSchema);

module.exports = User;