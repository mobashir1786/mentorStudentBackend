const express = require("express");
const userRoute = express.Router();
const mongoose = require('mongoose');
const userSchema = require('../schema/userShema')
const bcrypt = require("bcryptjs");
mongoose.connect("mongodb+srv://mobashir:mobashir123@cluster0.sv5dvda.mongodb.net/MentorStudent?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("connected with mongodb");
    })
    .catch((err) => {
        console.log(err);
    });


// signup
const userModel = new mongoose.model("Users", userSchema)
userRoute.post("/signup", async (req, res) => {

    const bodyData = req.body;
    const name = bodyData.name;
    const email = bodyData.email;
    const password = bodyData.password;
    console.log(name, email, password);

    const output = await userModel.create({
        name, email, password
    });
    const token = output.getJwtToken();
    output.token = token;
    await output.save();

    res.status(200).json({
        success: true,
        message: "User Register Successfully",
        "token": token
    })
})

//login routes
userRoute.post('/login', async (req, res) => {
    const bodyData = req.body;
    const email = bodyData.email;
    const password = bodyData.password;
    const userData = await userModel.findOne({ email: email });
    console.log(userData);
    let token = userData.getJwtToken();
    if (!userData) {
        return res.json({ status: 200, message: "User Not Exist Please Register First", "key": 0, "token": null })
    } else {
        const result2 = await bcrypt.compare(password, userData.password);
        if (result2) {
            console.log("match");
            userData.token = token;
            await userData.save();
            return res.json({ status: 200, message: "User Successfully Login", "key": 1, "token": token })
        } else {
            return res.json({ status: 200, message: "Email Id Or Password Did Not Match", "key": 0, "token": null })
        }

    }
})

// add to cart 
userRoute.post('/addvideo', async (req, res) => {
    const bodyData = req.body;
    const prod_ID = bodyData.prod_id;
    const hallQuantity = bodyData.hallQuantity;

    let cookie = bodyData.token;
    const user = await userModel.findOne({ token: cookie });
    if (user.cart.length == 1) {
        if (user.cart[0].event_ID == "") {
            user.cart = [];
        }
    }
    let userCart = user.cart;

    let checkFlag = 0;
    for (let i = 0; i < userCart.length; i++) {
        let singleCart = userCart[i];
        if (singleCart.event_ID === prod_ID) {
            checkFlag = 1;
            singleCart.hallQuantity = hallQuantity;
            break;
        }
    }
    if (checkFlag === 0) {
        user.cart.push({ event_ID: prod_ID, hallQuantity: hallQuantity });
    }
    await user.save();
    const lengthOfCart = user.cart.length;
    res.status(200).json({
        success: true,
        user,
        lengthOfCart
    })
})



module.exports = userRoute;