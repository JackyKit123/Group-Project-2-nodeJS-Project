module.exports = (passport, LocalStrategy, FacebookStrategy, GoogleStrategy, bcrypt, knex) => {
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
                    return done(null, false, { message: '<p>Incorrect credentials.</p>' })
                };
                if (user.verifying) return done(null, false, { message: `<p>Email is already registered but not verified, <a href='/resend/${username}'>Click Here</a> if you wish to recieve the verification email again.</p>` })
                const result = await bcrypt.checkPassword(password, user.password);
                return (result) ? done(null, user) : done(null, false, { message: '<p>Incorrect credentials.</p>' });
            } catch (err) {
                return done(err);
            }
        }
    ));

    passport.use('google', new GoogleStrategy({
        clientID: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_SECRET,
        callbackURL: `/auth/google/callback`
    }, async (accessToken, refreshToken, profile, done) => {
        const matchedUser = await knex('login_info').where({ access_token: accessToken })
        if (matchedUser.length === 0) {
            const newUser = {
                display_name: profile.displayName,
                google_id: profile.id,
                access_token: accessToken
            }
            const userId = await knex('login_info').insert(newUser).returning('id');
            newUser.id = userId[0];
            return done(null, newUser)
        }
        return done(null, matchedUser[0]);
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
                display_name: profile.displayName,
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