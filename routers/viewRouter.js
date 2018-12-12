module.exports = (router, authService) => {
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
        stylesheet: 'index',
    }));

    router.get('/login', this.notLoggedIn, (req, res) => res.render('login', {
        stylesheet: 'login',
        error: req.flash('error'),
        success: req.flash('success'),
        recaptcha: process.env.reCAPTCHA_SITE_KEY
    }));

    router.get('/signup', this.notLoggedIn, (req, res) => res.render('signup', {
        script: 'signup',
        stylesheet: 'signup',
        error: req.flash('error'),
        recaptcha: process.env.reCAPTCHA_SITE_KEY
    }));

    router.get('/password/forget', this.notLoggedIn, (req, res) => res.render('forget', {
        stylesheet: 'forget',
        error: req.flash('error'),
        recaptcha: process.env.reCAPTCHA_SITE_KEY 
    }));

    router.get('/password/reset/:id', this.notLoggedIn, (req, res) => {
        const verify = authService.verifyResetKey(req.params.id);
        if (verify) res.render('reset', {
            recaptcha: process.env.reCAPTCHA_SITE_KEY ,
            key: key,
            script: 'reset',
            stylesheet: 'reset'
        });
        else res.end('Expired Password Reset Key');
    })

    router.get('/success', this.notLoggedIn, (req, res) => res.render('success', {
        stylesheet: 'success',
        script: 'success',
        success: req.flash('success')
    }));

    router.get('/logout', this.notLoggedIn, (req, res) => res.render('logout', {
        stylesheet: 'logout',
        script: 'logout',
        success: req.flash('logout')
    }));

    router.get('/lobby', this.isLoggedIn, (req, res) => res.render('lobby'));
}