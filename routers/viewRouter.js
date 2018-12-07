module.exports = router => {
    this.isLoggedIn = (req, res, next) => {
        if (req.isAuthenticated()) return next()
        req.flash('error', 'Please log in');
        res.redirect('/login');
    }

    router.get('/', (req, res) => res.render('index'));
    router.get('/login', (req, res) => res.render('login', { error: req.flash('error'), success: req.flash('success') }))
    router.get('/signup', (req, res) => res.render('signup', { error: req.flash('error')}));
    router.get('/lobby', this.isLoggedIn, (req, res) => res.render('lobby'));
}