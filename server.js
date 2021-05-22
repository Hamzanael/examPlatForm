const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require("passport");
const multer = require("multer");
const passportLocalMongoose = require("passport-local-mongoose");
const findOrCreate = require('mongoose-findorcreate');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const passportAuthenticationProcess = require("./passportAuthanticationProcess");
const passportConfig = require("./passportConfig");
const adminOperations = require("./adminOperations");

const port = process.env.PORT;
const app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(session({
    secret: "Welcome to the best web site",
    resave: false,
    saveUninitialized: false,
    expires: new Date(Date.now() + (30 * 86400 * 1000))
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/QuizDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

mongoose.set("useCreateIndex", true);

const UserSchema = new mongoose.Schema({
    email: String,
    password: String,
    googleId: String,
    quizzes: [],
    courses: [],
    name: String,
    Role: String,
    facebookId: String
}, {strict: false});
const CourseSchema = new mongoose.Schema({
    name: {type: String, unique: true, required: true, dropDups: true},
    quizzes: []
});
const QuizSchema = new mongoose.Schema({
    name: String,
    grade: Number,
    type: String,
    time: Number,
    courseName: String,
    quizQuestions: []
});

UserSchema.plugin(passportLocalMongoose);
UserSchema.plugin(findOrCreate);

/**
 * multer
 * */

// SET STORAGE
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
        let extension = file.originalname.split(".")[1]
        cb(null, file.fieldname + '-' + Date.now() + Math.floor(Math.random() * 9999) + "." + extension)
    }
})
let upload = multer({
    storage: storage
});


const User = new mongoose.model("user", UserSchema);
const Quiz = new mongoose.model("quiz", QuizSchema);
const Course = new mongoose.model("course", CourseSchema);

passport.use(User.createStrategy());
passportConfig(passport, User, GoogleStrategy, FacebookStrategy);
passportAuthenticationProcess(app, User, passport);
adminOperations(app, Quiz, Course, upload);

app.get("/test", function (req, res) {


});


app.get("/", (req, res) => {
    res.render("wiseQuiz");
});
app.get("/login", ((req, res) => {
    res.render("userLogin");
}));
app.listen(port || 3000, function () {
    console.log("system is work on" + 3000);
})
