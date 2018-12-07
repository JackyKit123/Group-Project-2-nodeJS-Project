module.exports = (passport, LocalStrategy, FacebookStrategy, randomstring, bcrypt, nodemailer, knex) => {
    passport.use('local-login', new LocalStrategy(
        async (email, password, done) => {
            try {
                let user = await knex('login_info').where({ email: email });
                user = user[0]
                if (user.length == 0) return done(null, false, { message: 'Incorrect credentials.' });
                if (typeof user.verifying !== 'undefined') return done(null, false, { message: 'Email is not verified, please check your mailbox for verification'})
                const result = await bcrypt.checkPassword(password, user.password);
                return (result) ? done(null, user) : done(null, false, { message: 'Incorrect credentials.' });
            } catch (err) {
                return done(err);
            }
        }
    ));

    passport.use('local-signup', new LocalStrategy(
        async (email, password, done) => {
            try {
                const user = await knex('login_info').where({ email: email });
                if (!/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(email)) return done(null, false, { message: 'Invalid Email Address' });
                if (password.length < 8 || password.legnth > 16 || ! /[a-z]|[A-z]/.test(password) || ! /[0-9]/.test(password)) return done(null, false, { message: 'Bad Password' });
                if (user.verifying) return done(null, false, { message: 'Email is already registered but not verified' })
                if (user.email) return done(null, false, { message: 'Email has already been taken' })
                const hash = await bcrypt.hashPassword(password);
                const verifyString = randomstring.generate();
                const newUser = {
                    email: email,
                    password: hash,
                    verifying: verifyString
                };
                nodemailer.sendMail(email, verifyString);
                const userId = await knex('login_info').insert(newUser).returning('id');
                newUser.id = userId[0];
                return done(null, false, {message: 'Registered'});
            } catch (err) {
                return done(err);
            }
        }));

    passport.use('facebook', new FacebookStrategy({
        clientID: process.env.FACEBOOK_ID,
        clientSecret: process.env.FACEBOOK_SECRET,
        callbackURL: `/auth/facebook/callback`
    }, async (accessToken, refreshToken, profile, done) => {
        const matchedUser = await knex('login_info').where({ access_token: accessToken })
        if (matchedUser.length === 0) {
            const newUser = {
                facebook_id: profile.id,
                access_token: accessToken
            }
            const userId = await knex('login_info').insert(newUser).returning('id');
            newUser.id = userId[0];
            return done(null, newUser)
        }
        return done(null, matchedUser[0]);
    }
    ));

    passport.serializeUser((user, done) => {
        return done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        const users = await knex('login_info').where({ id: id });
        if (users.length == 0) return done(new Error(`Wrong user id ${id}`));
        const user = users[0];
        return done(null, user);
    });
};