module.exports = (router, passport, knex, randomstring, bcrypt, nodemailer) => {
    router.post('/login', passport.authenticate('local-login', {
        failureRedirect: '/login',
        failureFlash: true
    }), (req, res) => (req.session.save(() => res.redirect('/lobby')))
    );

    router.post('/signup', async (req, res) => {
        try {
            const username = req.body.username;
            const email = req.body.email;
            const password = req.body.password;
            const checkUsername = await knex('login_info').where('username', username);
            const checkEmail = await knex('login_info').where('email', email);
            const usernameRegistered = checkUsername[0];
            const emailRegistered = checkEmail[0];
            if (!/^[0-9a-zA-Z_.-]+$/i.test(username)) {
                req.flash('error', 'Invalid Username');
                return res.redirect('/signup')
            }
            if (!/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(email)) {
                req.flash('error', 'Invalid Email Address');
                return res.redirect('/signup');
            }
            if (password.length < 8 || password.legnth > 16 || ! /[a-z]|[A-z]/.test(password) || ! /[0-9]/.test(password)) {
                req.flash('error', 'Bad Password')
                return res.redirect('/signup');
            }
            if (typeof emailRegistered !== 'undefined' && emailRegistered.verifying) {
                req.flash('error', 'Email is already registered but not verified')
                return res.redirect('/signup');
            }
            if (emailRegistered) {
                req.flash('error', 'Email has already been taken')
                return res.redirect('/signup');
            }
            if (usernameRegistered) {
                req.flash('error', 'Username has already been taken')
                return res.redirect('/signup');
            }
            const hash = await bcrypt.hashPassword(password);
            const verifyString = randomstring.generate();
            const newUser = {
                username: username,
                email: email,
                password: hash,
                verifying: verifyString
            };
            nodemailer.sendMail(email, verifyString);
            await knex('login_info').insert(newUser);
            req.flash('registered', `You have successfully registered
            Please check your email box for verifcation email
            Please note that the email may be in junk mail box`);
            return res.redirect('/registered');
        } catch (err) {
            return res.status(500).json(err)
        }
    });

    router.get("/auth/google", passport.authenticate('google', {
        scope: ['profile']
    }));

    router.get("/auth/google/callback", passport.authenticate('google', {
        failureRedirect: '/login',
        failureFlash: true
    }), (req, res) => (req.session.save(() => res.redirect('/lobby')))
    );

    router.get("/auth/facebook", passport.authenticate('facebook', {
        scope: ['user_friends', 'manage_pages']
    }));

    router.get("/auth/facebook/callback", passport.authenticate('facebook', {
        failureRedirect: '/login',
        failureFlash: true
    }), (req, res) => (req.session.save(() => res.redirect('/lobby')))
    );

    router.post("/logout", (req, res) => {
        req.logout();
        req.flash('logout', `You have successfully logged out`)
        res.redirect('/logout');
    })

    router.get("/auth/verify/:id", async (req, res) => {
        try {
            const key = req.params.id
            const users = await knex('login_info')
            if (!users.some(e => {
                return e.verifying == key
            })) return res.end('invalid verification');
            let user = await knex('login_info').where('verifying', key);
            user = user[0];
            const newUser = {
                email: user.email,
                password: user.password,
                verifying: null
            }
            await knex('login_info').where('verifying', key).update(newUser);
            req.flash('registered', `You have successfully verified your email address, you may now login to the game`);
            res.redirect('/registered')
        } catch (err) {
            res.status(500).json(err)
        }
    })
}
