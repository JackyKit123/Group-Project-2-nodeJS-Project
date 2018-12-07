module.exports = (router, passport) => {
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

    router.get("/auth/facebook",passport.authenticate('facebook',{
        scope: ['user_friends', 'manage_pages'] 
    }));

    router.get("/auth/facebook/callback",passport.authenticate('facebook',{
        failureRedirect: '/login',
        failureFlash: true
    }), (req,res)=> (req.session.save(() =>res.redirect('/lobby')))
    );
}
