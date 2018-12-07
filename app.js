//config
require('dotenv').config();
const 
fs = require('fs'),
path = require('path'),
options = {
  cert: fs.readFileSync(path.join(__dirname, 'cert', 'localhost.crt')),
  key: fs.readFileSync(path.join(__dirname, 'cert', 'localhost.key'))
}

//library dependencies
const 
https = require('https'),
express = require('express'),
app = express(),
server = https.createServer(options, app),
io = require('socket.io')(server),
bodyParser = require('body-parser'),
hb = require('express-handlebars'),
passport = require('passport'),
bcrypt = require('bcrypt'),
nodemailer = require('nodemailer'),
randomstring = require("randomstring"),
flash = require('connect-flash'),
expressSession = require('express-session'),
RedisStore = require('connect-redis')(expressSession),
socketIOSession = require("socket.io.session"),
LocalStrategy = require('passport-local').Strategy,
FacebookStrategy = require('passport-facebook').Strategy,
redis  = require('redis'),
knex = require('knex')({
  client: 'postgresql',
  connection: {
      database: process.env.DB_NAME,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
  }
});

//modules
const 
Bcrypt = require('./auth/bcrypt'),
NodeMailer = require('./auth/mailVerify'),
redisClient = require('./util/redis')(redis),
router = require('./routers/router')(express, passport, knex);
require('./init/init-session')(app, io, redisClient, expressSession, RedisStore, socketIOSession);
require('./init/init-app')(express, app, bodyParser, hb, router, passport, flash);
require('./auth/passport')(passport, LocalStrategy, FacebookStrategy, randomstring, new Bcrypt(bcrypt), new NodeMailer(nodemailer), knex);
require('./util/socket.io')(io);

//server starts
server.listen(process.env.PORT, () => console.log(`server started at port ${process.env.PORT} at ${new Date()}`));