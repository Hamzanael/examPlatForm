function passportConfig(passport, User, GoogleStrategy, FacebookStrategy) {


    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id)
            .then((user) => {
                done(null, user);
            })
            .catch((error) => {
                console.log(`Error: ${error}`);
            });
    });


    passport.use(new GoogleStrategy({
            clientID: "654362428614-m9ep0o6fskfpdft9rdhgmk0trcboof4j.apps.googleusercontent.com",
            clientSecret: "aDsoP9CmYiliOKmtypovzcJl",
            callbackURL: "http://localhost:3000/auth/google/home",
        },
        function (accessToken, refreshToken, profile, cb) {
            User.findOrCreate({
                googleId: profile.id,
                username: profile.id,
                name: profile.displayName,
                Role: "User"
            }, function (err, user) {
                return cb(err, user);
            });
        }
    ));

    passport.use(new FacebookStrategy({
            clientID: "832597784027074",
            clientSecret: "51c1b4b879514433dd81580aa3025ab1",
            callbackURL: "http://localhost:3000/auth/facebook/home"
        },
        function (accessToken, refreshToken, profile, cb) {
            User.findOrCreate({
                facebookId: profile.id,
                name: profile.displayName,
                username: profile.id,
                Role: "User"
            }, function (err, user) {
                return cb(err, user);
            });
        }
    ));
}

module.exports = passportConfig;