module.exports = (app, io ,redisClient, expressSession, RedisStore, socketIOSession)=>{
    const sessionStore = new RedisStore({
        client: redisClient,
        unset: "destroy"
    });
    const settings = {
        store: sessionStore,
        secret: "extremelysecret",
        cookie: { "path": '/', "httpOnly": true, "secure": false,  "maxAge": null },
        resave: true,
        saveUninitialized: true
    }
    app.use(expressSession(settings));
    io.use(socketIOSession(settings).parser);
}