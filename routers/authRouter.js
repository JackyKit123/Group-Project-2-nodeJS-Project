module.exports = (router, passport, knex) => {
    router.post('/login', passport.authenticate('local-login', {
        failureRedirect: '/login',
        failureFlash: true
    }), (req, res) => (req.session.save(() => res.redirect('/lobby')))
    );

    router.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/login',
        successFlash: true,
        failureRedirect: '/signup',
        failureFlash: true
    }));

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
        res.redirect('/logout');
    })

    router.get("/auth/verify/:id", async (req, res) => {
        try {
            const key = req.params.id
            const users = await knex('login_info')
            if (!users.some(e => {
                return e.verifying == key
            })) return res.end('invalid verification');
            let user = await knex('login_info').where('verifying',key);
            user = user[0];
            const newUser = {
                email: user.email,
                password: user.password,
                verifying: null
            }
            await knex('login_info').where('verifying',key).update(newUser);
            res.render('registered')
        } catch (err) {
            res.status(500).end(err)
        }
    })
}
