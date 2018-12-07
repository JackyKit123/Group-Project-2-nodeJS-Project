module.exports = (express, app, bodyParser, hb, router, passport, flash) => {
    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(express.static('public'));
    app.use(bodyParser.urlencoded({ extended: false }))
    app.use(bodyParser.json())
    app.use(router);
    app.engine('handlebars', hb({ defaultLayout: 'main' }));
    app.set('view engine', 'handlebars');
}