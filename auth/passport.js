module.exports = (passport, LocalStrategy, FacebookStrategy, bcrypt, knex) => {
    passport.use('local-login', new LocalStrategy(
        async (username, password, done) => {
            try {
                const users = await knex('login_info').where({ username: username });
                if (users.length == 0) return done(null, false, { message: 'Incorrect credentials.' });
                const user = users[0];
                const result = await bcrypt.checkPassword(password, user.password);
                return (result) ? done(null, user) : done(null, false, { message: 'Incorrect credentials.' });
            } catch (err) {
                return done(err);
            }
        }
    ));

    passport.use('local-signup', new LocalStrategy(
        async (username, password, done) => {
            try {
                const users = await knex('login_info').where({ username: username });
                if (users.length > 0) return done(null, false, { message: 'username already taken' });
                const hash = await bcrypt.hashPassword(password)
                const newUser = {
                    username: username,
                    password: hash
                };
                const userId = await knex('login_info').insert(newUser).returning('id');
                newUser.id = userId[0];
                return done(null, newUser);
            } catch (err) {
                return done(err);
            }
        }));

    passport.use('facebook', new FacebookStrategy({
        clientID: process.env.FACEBOOK_ID,
        clientSecret: process.env.FACEBOOK_SECRET,
        callbackURL: `/auth/facebook/callback`
    }, async (accessToken, refreshToken, profile, done) => {
        const matchedUser = await knex('login_info').where({ facebook_id: profile.id })
        console.log(matchedUser)
        if (matchedUser.length == 0) {
            const amountOfUsers = await knex('login_info');
            const newUser = {
                id: amountOfUsers.length++,
                facebook_id: profile.id,
                access_token: accessToken
            }
            await knex('login_info').insert(newUser);
            return done(null, newUser)
        }
        return done(null, matchedUser[0]);
    }
    ));

    passport.serializeUser((user, done) => {
        console.log(user.id)
        return done(null, user.id);
    });

    passport.deserializeUser(async (id, done) => {
        const users = await knex('login_info').where({ id: id });
        if (users.length == 0) return done(new Error(`Wrong user id ${id}`));
        const user = users[0];
        return done(null, user);
    });
};
