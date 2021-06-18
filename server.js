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
    username: String,
    email: String,
    password: String,
    googleId: String,
    quizzes: [],
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
    studentGrade: Number,
    quizQuestions: []
}, {strict: false});
const FeedBackSchema = new mongoose.Schema({
    name: String,
    email: String,
    massage: String
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
const FeedBack = new mongoose.model("feedback", FeedBackSchema);
passport.use(User.createStrategy());
passportConfig(passport, User, GoogleStrategy, FacebookStrategy);
passportAuthenticationProcess(app, User, passport);
adminOperations(app, User, Quiz, Course, FeedBack, upload);

app.get("/courseContent/:courseId", function (req, res) {
    let courseId = req.params.courseId;
   
    if (req.isAuthenticated()) {
        let userId = req.user._id;
        User.findById(userId, (error, user) => {
            Course.findById(courseId, (err, course) => {
                res.render("courseContent", {course: course, logged: true , user: user});
            })
        });

    } else {
        Course.find({}, (err, found) => {
            res.render("showCourses", {courses: found, logged: false});
        });
    }


});

app.get("/allCourse", (req, res) => {
    if (req.isAuthenticated()) {
        let userId = req.user._id;
        User.findById(userId, (error, user) => {
            Course.find({}, (err, found) => {
                res.render("showCourses", {logged: true, user: user, courses: found});
            });
        });

    } else {
        Course.find({}, (err, found) => {
            res.render("showCourses", {courses: found, logged: false});
        });
    }


});

app.get("/", (req, res) => {
    renderPages(req, res, "wiseQuiz");
});
app.get("/login", ((req, res) => {
    renderPages(req, res, "userLogin");

}));

app.get("/quiz/:quizId", (req, res) => {
    if (req.isAuthenticated()) {
        let id = req.params.quizId;
        let userId = req.user._id;
        Quiz.findById(id, (err, quiz) => {
            User.findById(userId, (error, user) => {
                res.render("pageQuiz", {quiz: quiz, logged: true, user: user});
            })

        });
    } else res.redirect("/login")
});
app.get("/logout", (req, res) => {
    req.logout();
    res.redirect('/');
})
app.post("/submitQuiz", (req, res) => {
    let userId = req.user._id;
    let quizId = req.body.quizId;
    let answers = Object.values(req.body);
    answers.pop();
    console.log(answers);
    Quiz.findById(quizId, (err, quiz) => {
        let mark = 0;
        let wrongAnswer = 0;
        let trueAnswer = 0;
        quiz.quizQuestions.forEach((question, index) => {
            if (question.answer.coiseNumber === parseInt(answers[index])) {
                mark = mark + parseInt(question.mark);
                trueAnswer++;
            } else wrongAnswer++;

        });
        quiz.studentGrade = mark;
        User.findByIdAndUpdate(userId, {$push: {quizzes: quiz}}, {useFindAndModify: false}, err => {
            User.findById(userId, (err, user) => {
                for (let i = user.quizzes.length - 1; i >= 0; i--) {
                    let tmp = String(user.quizzes[i]._id);
                    if (tmp === quizId) {
                        res.render("resultMark", {quiz: user.quizzes[i], answered: trueAnswer, wrong: wrongAnswer});
                        return;
                    }
                }
                console.log("ENDED FOR")
            });
        });

    })

});
app.get("/showQuiz/:quizId", (req, res) => {
    if (req.isAuthenticated()) {
        let id = req.params.quizId;
        let userId = req.user._id;
        Quiz.findById(id, (err, quiz) => {
            User.findById(userId, (error, user) => {
                res.render("showQuiz", {logged: true, user: user, quiz: quiz})
            });
        });
    } else res.redirect("/login");

});
app.get("/loginFail", (req, res) => {
    renderPages(req, res, "wrongLogin");
});
app.post("/feedback", (req, res) => {
    let data = req.body;
    const tmp = new FeedBack({
        name: data.name,
        email: data.email,
        massage: data.massage
    })
    tmp.save();
    res.redirect("/");
});

app.listen(port || 80, function () {
    console.log("system is work on" + 3000);
})

app.get('/signup', (req, res) => {
    User.register({
        username: "h@adminEmail.edu.jo",
        name: "Hamza",
        Role: "Admin"
    }, "123", function (err, user) {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/adminPage");
            });
        }
    })
});

function renderPages(req, res, name) {
    if (req.isAuthenticated()) {
        let userId = req.user._id;
        User.findById(userId, (error, user) => {
            res.render(name, {logged: true, user: user})
        });

    } else res.render(name, {logged: false})
}