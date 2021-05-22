const mammoth = require("mammoth");
const cheerio = require('cheerio');


function examExtractor(path, data, Quiz, Course, res) {
    let readyQuestions = [];
    let arrayOfQuestion = [];
    // let readyQuestions = [];
    let i = 0;
    let t = mammoth.convertToHtml({path: path})
        .then((result) => {
                let html = result.value;
                let $ = cheerio.load(html);
                //   console.log($.text())
                $("li", "ol").each(function () {
                    if ($(this).html().includes("?"))
                        arrayOfQuestion.push($(this).html())
                });
                arrayOfQuestion.forEach(element => {
                    let tmp = cheerio.load(element);
                    let obj = {
                        question: tmp.html().split("?")[0].replace("<html><head></head><body>", ""),
                        choices: [],
                        answer: ""
                    }

                    tmp("li").each(function () {
                        obj.choices.push({
                            choise: tmp(this).html(),
                            coiseNumber: obj.choices.length
                        })
                    })
                    readyQuestions.push(obj);
                })

                let answerCounter = 0;
                $("p").each(function () {
                    if ($(this).html().includes("Answer:")) {
                        readyQuestions[answerCounter].answer = $(this).html().replace("Answer: ", "");
                    } else {
                        readyQuestions[answerCounter].mark = $(this).html().replace("Mark: ", "");
                        readyQuestions[answerCounter].quesitionNumber = answerCounter;
                        answerCounter++;

                    }

                });

                readyQuestions.forEach(element => {
                    let x = +element.answer;
                    element.answer = element.choices[x - 1];
                });
                return readyQuestions;
            }
        ).then(finalData => {
            console.log(finalData)
            const quiz = new Quiz({
                name: data.name,
                grade: data.grade,
                type: data.type,
                time: data.time,
                courseName: data.courseName,
                quizQuestions: finalData
            });
            quiz.save((err, doc) => {
                if (!err) {
                    Course.findOneAndUpdate({name: data.courseName}, {$push: {quizzes: quiz}}, {useFindAndModify: false}, err => {
                        console.log(err);
                    });
                    res.redirect("/adminPage");
                }
            });

        });
}

module.exports = examExtractor;