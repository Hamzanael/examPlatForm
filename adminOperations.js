const examExtractor = require("./examExtractor");
const passport = require("passport");

function adminOperations(app, User, Quiz, Course, upload) {

    app.get("/adminPage", (req, res) => {
        if (req.isAuthenticated()) {
            User.findOne({username: req.user.username}, (err, admin) => {
                //console.log(admin);
               res.render("admin", {admin: admin});
            });
        } else res.redirect("/adminLogin");
    });
    app.get("/adminAddQuiz", (req, res) => {
        if (req.isAuthenticated())
            res.render("addQuiz");
        else res.redirect("/adminLogin");
    });
    app.get("/adminDeleteQuiz", (req, res) => {
        if (req.isAuthenticated())
            res.render("deleteQuiz");
        else res.redirect("/adminLogin");
    });
    app.get("/softwareEngineering", (req, res) => {
        if (req.isAuthenticated())
            res.render("softwareEngineer");
        else res.redirect("/adminLogin");
    });
    app.get("/adminAddCourse", (req, res) => {
        if (req.isAuthenticated())
            res.render("addCourses")
        else res.redirect("/adminLogin");
    });
    app.get("/adminLogin", (req, res) => {
        res.render("adminLogin")
    });


    app.post("/adminLogin", (req, res) => {
        let data = req.body
        let user;
        if (data.username.includes("@adminEmail.edu.jo"))
            user = new User({username: data.username, password: data.password});
        else user = null;
        req.login(user, function (err) {
            if (err) {
                console.log(err);
            } else {
                passport.authenticate("local", {failureRedirect: '/adminLogin'})(req, res, function () {
                    res.redirect("/adminPage");
                });
            }
        });
    });

    app.post("/addCourse", (req, res) => {
        const course = new Course({
            name: req.body.name
        });
        course.save((err, doc) => {
            if (err) res.send("This course is There");
            else
                res.redirect("/adminPage");
        });
    });
    app.post("/addQuiz", upload.single('wordFile'), (req, res) => {
        const data = req.body;
        const file = req.file
        setTimeout(() => {
            examExtractor("public/uploads/" + file.filename, data, Quiz, Course, res);
        }, 10000)

    });
    app.post("/deleteQuiz", (req, res) => {
        const data = req.body;
        Quiz.deleteOne({
            name: data.name,
            type: data.type,
            courseName: data.courseName
        }, {useFindAndModify: false}, err => {
            console.log(err)
        });
        Course.findOneAndUpdate({name: data.courseName},
            {$pull: {'quizzes': {'name': data.name}}},
            {useFindAndModify: false}, err => {
                console.log(err);
            });
        res.redirect("/adminPage");
    });
}

module.exports = adminOperations;