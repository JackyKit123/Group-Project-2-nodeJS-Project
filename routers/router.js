module.exports = (express, recaptcha, passport, authService) => {
    const router = express.Router();
    require('./viewRouter')(router, authService);
    require('./authRouter')(router, recaptcha, passport, authService)
    return router;
};
