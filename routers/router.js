module.exports = (express, redisClient, recaptcha, passport, authService) => {
    const router = express.Router();
    require('./viewRouter')(router, redisClient, authService);
    require('./authRouter')(router, recaptcha, passport, authService)
    return router;
};
