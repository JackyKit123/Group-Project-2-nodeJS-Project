module.exports = (router, recaptcha, passport, authService) => {
    const loginCaptcha = (req, res, next) => {
        if (req.recaptcha.error) {
            req.flash('error', 'Invalid reCAPTCHA');
            res.redirect('/login');
        } else {
            return next();
        }
    }

    const signupCaptcha = (req, res, next) => {
        if (req.recaptcha.error) {
            req.flash('error', 'Invalid reCAPTCHA');
            res.redirect('/signup');
        } else {
            return next();
        }
    }

    router.post('/login', recaptcha.middleware.verify, loginCaptcha, passport.authenticate('local-login', {
        failureRedirect: '/login',
        failureFlash: true
    }), (req, res) => (req.session.save(() => res.redirect('/lobby'))));

    router.post('/signup', recaptcha.middleware.verify, signupCaptcha, async (req, res) => {
        try {
            const result = await authService.signUp(req.body.username, req.body.display_name, req.body.email, req.body.password, req.body.confirm_password)
            if (result.error) {
                req.flash('error', result.error);
                return res.redirect('/signup');
            } else {
                req.flash('success', result.success);
                return res.redirect('/success');
            }
        } catch (err) {
            return res.status(500).json(err)
        }
    });

    router.post('/password/forget', recaptcha.middleware.verify, async (req, res) => {
        if (req.recaptcha.error) {
            req.flash('error', 'Invalid reCAPTCHA');
            return res.redirect('/password/forget');
        }
        try {
            const result = await authService.forgetPassword(req.body.email);
            if (result.error) {
                req.flash('error', result.error);
                return res.redirect('/password/forget');
            } else {
                req.flash('success', result.success);
                return res.redirect('/success');
            }
        } catch (err) {
            return res.status(500).json(err)
        }
    });

    router.post('/password/reset/:id', async (req, res) => {
        try {
            const key = req.params.id
            const result = await authService.resetPassword(key, req.body.password, req.body.confirm_password)
            if (result.error == 'Expired Password Reset Key') {
                return res.end('Expired Password Reset Key');
            } else if (result.error) {
                req.flash('error', result.error)
                return res.redirect(`/password/reset/${key}`);
            } else {
                req.flash('success', result.success);
                return res.redirect('/success');
            }
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
            const result = await authService.resendVerificationMail(req.params.id);
            if (result.error) return res.end(result.error);
            req.flash('success', result.success);
            res.redirect('/success');
        } catch (err) {
            res.status(500).json(err)
        }
    })

    router.get("/auth/verify/:id", async (req, res) => {
        try {
            const result = await authService.verifyEmail(req.params.id);
            if (result.error) return res.end(result.err);
            req.flash('success', result.success);
            res.redirect('/success');
        } catch (err) {
            res.status(500).json(err)
        }
    })
}
