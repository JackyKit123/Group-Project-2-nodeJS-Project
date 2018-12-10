module.exports = (express, passport, knex, randomstring, bcrypt, nodemailer, redisClient) => {
    const router = express.Router();
    require('./viewRouter')(router, redisClient);
    require('./authRouter')(router, passport, knex, randomstring, bcrypt, nodemailer, redisClient)
    return router;
};
