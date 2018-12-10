module.exports = (router, redisClient) => {
    this.isLoggedIn = (req, res, next) => {
        if (req.isAuthenticated()) return next()
        req.flash('error', 'Please log in');
        res.redirect('/login');
    }

    this.notLoggedIn = (req, res, next) => {
        if (!req.isAuthenticated()) return next()
        res.redirect('/lobby');
    }

    router.get('/', (req, res) => res.render('index', {
        script: 'main',
    }));

    router.get('/login', this.notLoggedIn, (req, res) => res.render('login', {
        error: req.flash('error'),
        success: req.flash('success')
    }));

    router.get('/signup', this.notLoggedIn, (req, res) => res.render('signup', {
        script: 'signup',
        stylesheet: 'signup',
        error: req.flash('error')
    }));

    router.get('/password/forget', this.notLoggedIn, (req, res) => res.render('forget'));

    router.get('/password/reset/:id', this.notLoggedIn, (req, res) => {
        const key = req.params.id
        redisClient.get(key, (err, data) => {
            if (err) throw err
            if (!data) res.end('Expired Password Reset Key')
            else res.render('reset', {
                key: key,
                script: 'reset',
                stylesheet: 'reset'
            })
        })
    })

    router.get('/success', this.notLoggedIn, (req, res) => res.render('success', {
        script: 'success',
        success: req.flash('success')
    }));

    router.get('/logout', this.notLoggedIn, (req, res) => res.render('logout', {
        script: 'logout',
        success: req.flash('logout')
    }));

    router.get('/lobby', this.isLoggedIn, (req, res) => res.render('lobby'));
}