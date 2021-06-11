const examExtractor = require("./examExtractor");
const passport = require("passport");

function adminOperations(app, User, Quiz, Course, FeedBack, upload) {

    app.get("/adminPage", (req, res) => {
        if (req.isAuthenticated() && req.user.Role.includes("Admin")) {
            User.findOne({username: req.user.username}, (err, admin) => {
                //console.log(admin);
                res.render("admin", {admin: admin});
            });
        } else res.redirect("/adminLogin");
    });
    app.get("/adminAddQuiz", (req, res) => {
        if (req.isAuthenticated() && req.user.Role.includes("Admin")) {
            User.findOne({username: req.user.username}, (err, admin) => {
                //console.log(admin);
                Quiz.find({}, (err, quizzes) => {
                    res.render("addQuiz", {admin: admin, quizzes: quizzes});
                })

            });
        } else res.redirect("/adminLogin");
    });
    app.get("/adminDeleteQuiz", (req, res) => {
        if (req.isAuthenticated() && req.user.Role.includes("Admin")) {
            User.findOne({username: req.user.username}, (err, admin) => {
                Quiz.find({}, (err, quizzes) => {
                    res.render("deleteQuiz", {admin: admin, quizzes: quizzes});
                })
                //console.log(admin);

            });
        } else res.redirect("/adminLogin");
    });
    app.get("/softwareEngineering", (req, res) => {
        if (req.isAuthenticated() && req.user.Role.includes("Admin")) {
            User.findOne({username: req.user.username}, (err, admin) => {
                //console.log(admin);
                res.render("softwareEngineer", {admin: admin});
            });
        } else res.redirect("/adminLogin");
    });
    app.get("/adminAddCourse", (req, res) => {
        if (req.isAuthenticated() && req.user.Role.includes("Admin")) {
            User.findOne({username: req.user.username}, (err, admin) => {
                //console.log(admin);
                res.render("addCourses", {admin: admin});
            });
        } else res.redirect("/adminLogin");
    });

    app.get("/showFeedBack", (req, res) => {
        if (req.isAuthenticated() && req.user.Role.includes("Admin")) {
            User.findOne({username: req.user.username}, (err, admin) => {
                FeedBack.find({}, (error, found) => {
                    res.render("showFeedBack", {admin: admin, feedback: found});
                })

            });
        } else res.redirect("/adminLogin");
    });


    app.get("/showAllUsers", (req, res) => {
        if (req.isAuthenticated() && req.user.Role.includes("Admin")) {
            User.findOne({username: req.user.username}, (err, admin) => {
                //console.log(admin);
                User.find({Role: "User"}, (err, found) => {
                    res.render("showUsers", {users: found, admin: admin});
                });
            });

        } else res.redirect("/adminLogin");
    });

    app.get("/adminLogin", (req, res) => {
        res.render("adminLogin")
    });
    app.get("/adminLogOut", (req, res) => {
        req.logout();
        res.redirect('/adminLogin');
    });
    app.get("/deleteQuiz", (req, res) => {
        let id = req.query.id;
        console.log(id)
        Quiz.findById(id, (err, found) => {
            Course.findOneAndUpdate({name: found.courseName},
                {$pull: {'quizzes': {'name': found.name}}},
                {useFindAndModify: false}, err => {
                    console.log(err);
                });
        });
        Quiz.deleteOne({
            _id: id,
        }, {useFindAndModify: false}, err => {
            console.log(err)
        });
        res.redirect("/adminPage");
    });
    app.get("/addAdmin", (req, res) => {
        if (req.isAuthenticated() && req.user.Role.includes("Admin")) {
            User.findOne({username: req.user.username}, (err, admin) => {
                //console.log(admin);
                res.render("addNewAdmin", {admin: admin});
            });
        } else res.redirect("/adminLogin");
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
            if (err) {
                User.findOne({username: req.user.username}, (err, admin) => {
                    res.render("alertAddCourses", {admin: admin});
                });
            } else
                res.redirect("/adminPage");
        });
    });
    app.post("/addQuiz", upload.single('wordFile'), (req, res) => {
        const data = req.body;
        const file = req.file
        setTimeout(() => {
            examExtractor("public/uploads/" + file.filename, data, Quiz, Course, res, req, User);
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
        res.render("alertDeleteQuiz");
    });
    app.post("/addNewAdmin", (req, res) => {
        User.register({
            username: req.body.username,
            name: req.body.name,
            Role: "Admin"
        }, req.body.password, function (err, user) {
            if (err) {
                console.log(err);
            } else {
                passport.authenticate("local")(req, res, function () {
                    res.redirect("/adminPage");
                });
            }
        })
    });
}

module.exports = adminOperations;