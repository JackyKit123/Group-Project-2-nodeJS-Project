module.exports = (express, recaptcha, passport, knex, randomstring, bcrypt, nodemailer, redisClient) => {
    const router = express.Router();
    require('./viewRouter')(router, redisClient);
    require('./authRouter')(router, recaptcha, passport, knex, randomstring, bcrypt, nodemailer, redisClient)
    return router;
};
