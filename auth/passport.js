module.exports = (passport, LocalStrategy, FacebookStrategy, bcrypt, knex) => {
    passport.use('local-login', new LocalStrategy(
        async (username, password, done) => {
            try {
                const loginByEmail = await knex('login_info').where({ email: username });
                const loginByUsername = await knex('login_info').where({ username: username });
                let user;
                if (loginByEmail.length > 0) {
                    user = loginByEmail[0];
                } else if (loginByUsername.length > 0) {
                    user = loginByUsername[0];
                }  else {
                    return done(null, false, { message: 'Incorrect credentials.' })
                };
                if (user.verifying) return done(null, false, { message: 'Email is not verified, please check your mailbox for verification' })
                const result = await bcrypt.checkPassword(password, user.password);
                return (result) ? done(null, user) : done(null, false, { message: 'Incorrect credentials.' });
            } catch (err) {
                return done(err);
            }
        }
    ));

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