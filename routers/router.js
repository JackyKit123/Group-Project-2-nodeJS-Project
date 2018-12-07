module.exports = (express, passport, knex) => {
    const router = express.Router();
    require('./viewRouter')(router);
    require('./authRouter')(router, passport, knex);
    return router;
};
