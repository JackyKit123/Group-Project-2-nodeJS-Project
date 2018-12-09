module.exports = (express, passport, knex, randomstring, bcrypt, nodemailer) => {
    const router = express.Router();
    require('./viewRouter')(router);
    require('./authRouter')(router, passport, knex, randomstring, bcrypt, nodemailer)
    return router;
};
