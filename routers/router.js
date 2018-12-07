module.exports = (express, passport) => {
    const router = express.Router();
    require('./viewRouter')(router);
    require('./authRouter')(router, passport);
    return router;
};
