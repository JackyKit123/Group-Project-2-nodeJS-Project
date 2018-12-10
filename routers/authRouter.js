module.exports = (router, passport, knex, randomstring, bcrypt, nodemailer) => {
    router.post('/login', passport.authenticate('local-login', {
        failureRedirect: '/login',
        failureFlash: true
    }), (req, res) => (req.session.save(() => res.redirect('/lobby')))
    );

    router.post('/signup', async (req, res) => {
        try {
            const username = req.body.username;
            const displayname = req.body.display_name;
            const email = req.body.email;
            const password = req.body.password;
            const checkUsername = await knex('login_info').where('username', username);
            const checkEmail = await knex('login_info').where('email', email);
            const usernameRegistered = checkUsername[0];
            const emailRegistered = checkEmail[0];
            if ((username.length < 5 || username.length > 15 || /\W/.test(username))) {
                req.flash('error', 'Invalid Username');
                return res.redirect('/signup')
            }
            if (!/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(email)) {
                req.flash('error', '<p>Invalid Email Address</p>');
                return res.redirect('/signup');
            }
            if (password.length < 8 || password.legnth > 16 || ! /[a-z]|[A-z]/.test(password) || ! /[0-9]/.test(password)) {
                req.flash('error', '<p>Bad Password</p>')
                return res.redirect('/signup');
            }
            if (displayname.legnth < 5 || displayname.length > 15) {
                req.flash('error', '<p>Bad Displayed Name</p>')
                return res.redirect('/signup');
            }
            if (typeof emailRegistered !== 'undefined' && emailRegistered.verifying) {
                req.flash('error', `<p>Email is already registered but not verified, <a href='/resend/${email}'>Click Here<a> if you wish to recieve the verification email again.</p>`)
                return res.redirect('/signup');
            }
            if (emailRegistered) {
                req.flash('error', '<p>Email has already been taken</p>')
                return res.redirect('/signup');
            }
            if (usernameRegistered) {
                req.flash('error', '<p>Username has already been taken</p>')
                return res.redirect('/signup');
            }
            const hash = await bcrypt.hashPassword(password);
            const verifyString = randomstring.generate();
            const newUser = {
                username: username,
                display_name: displayname,
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

    router.get("/resend/:id", async (req, res) => {
        try {
            const email = req.params.id
            let user = await knex('login_info').where('email', email)
            user = user[0]
            if(!user) return res.end('invalid email');
            nodemailer.sendMail(email, user.verifying);
            req.flash('registered', `Email sent, please be reminded that the email may be in your junk mail box`);
            res.redirect('/registered')
        } catch (err) {
            res.status(500).json(err)
        }
    })

    router.get("/auth/verify/:id", async (req, res) => {
        try {
            const key = req.params.id
            let user = await knex('login_info').where('verifying', key);
            user = user[0];
            if(!user) return res.end('Invalid Verification Code')
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
