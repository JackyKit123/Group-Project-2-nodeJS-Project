module.exports = router => {
    this.isLoggedIn = (req, res, next) => {
        if (req.isAuthenticated()) return next()
        req.flash('error', 'Please log in');
        res.redirect('/login');
    }
    
    this.notLoggedIn = (req, res, next) => {
        if (!req.isAuthenticated()) return next()
        res.redirect('/lobby');
    }

    router.get('/', (req, res) => res.render('index'));
    router.get('/login', this.notLoggedIn, (req, res) => res.render('login', { error: req.flash('error'), success: req.flash('success') }))
    router.get('/signup', this.notLoggedIn, (req, res) => res.render('signup', { script: 'signup', stylesheet: 'signup', error: req.flash('error') }));
    router.get('/registered', this.notLoggedIn, (req, res) => res.render('registered', { script: 'registered'}));
    router.get('/logout', this.notLoggedIn, (req, res) => res.render('logout', { script: 'logout'}));
    router.get('/lobby', this.isLoggedIn, (req, res) => res.render('lobby', {}));
}