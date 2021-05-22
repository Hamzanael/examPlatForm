const examExtractor = require("./examExtractor");

function adminOperations(app,Quiz,Course,upload){

    app.get("/adminPage", (req, res) => {
        res.render("admin");
    });
    app.get("/adminAddQuiz", (req, res) => {
        res.render("addQuiz");
    });
    app.get("/adminDeleteQuiz", (req, res) => {
        res.render("deleteQuiz");
    });
    app.get("/softwareEngineering", (req, res) => {
        res.render("softwareEngineer");
    });
    app.get("/adminAddCourse", (req, res) => {
        res.render("addCourses")
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
    app.post("/addQuiz", upload.single('wordFile'),(req, res) => {
        const data = req.body;
        const file = req.file
        setTimeout(()=>{
            examExtractor("public/uploads/"+file.filename,data,Quiz,Course,res);
        },10000)

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
module.exports=adminOperations;