function passportAuthenticationProcess(app, User, passport) {
    app.post("/login", function (req, res) {
        const user = new User({
            username: req.body.username,
            password: req.body.password
        });
        req.login(user, function (err) {
            if (err) {
                console.log(err);
            } else {
                passport.authenticate("local", {failureRedirect: '/loginFail'})(req, res, function () {
                    res.redirect("/");
                });
            }
        });

    });
    app.post('/signup', (req, res) => {
        User.register({
            username: req.body.username, name: req.body.name,Role:"User"
        }, req.body.password, function (err, user) {
            if (err) {
                console.log(err);
                res.render("userLogin");
            } else {
                passport.authenticate("local")(req, res, function () {
                    res.redirect("/");
                });
            }
        });
    });
    app.get('/auth/google', passport.authenticate('google', {
            scope: ['profile']
        })
    );

    app.get('/auth/google/home',
        passport.authenticate('google', {
            failureRedirect: '/login'
        }),
        function (req, res) {
            // Successful authentication, redirect home.
            res.redirect("/");
        });


    app.get('/auth/facebook',
        passport.authenticate('facebook'));

    app.get('/auth/facebook/home',
        passport.authenticate('facebook', {failureRedirect: '/login'}),
        function (req, res) {
            // Successful authentication, redirect home.
            res.redirect('/');
        });
}

module.exports = passportAuthenticationProcess;