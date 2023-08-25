const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: [true, 'please enter Email'],
    },
    password: {
        type: String,
        required: [true, 'please enter your query or message']
    },
    video: {
        type: [{
            videoname: {
                type: String,
                default: ""
            },
            videodate: {
                type: String,
                default: ""
            }
        }],
        default: [-1]
    },
    token: {
        type: String,
        default: ""
    }
});

//to hash password
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10)
})

// to get jwt token 
userSchema.methods.getJwtToken = function () {
    return jwt.sign({ id: this._id }, "MENTORSTUDENT", {
        expiresIn: "5d"
    })
}

module.exports = userSchema;