//config
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const options = {
  cert: fs.readFileSync(path.join(__dirname, 'cert', 'localhost.crt')),
  key: fs.readFileSync(path.join(__dirname, 'cert', 'localhost.key'))
};
const port = process.env.PORT || 3030;

//library dependencies
const https = require('https');
const express = require('express');
const app = express();
const server = https.createServer(options, app);
const io = require('socket.io')(server);
const bodyParser = require('body-parser');
const hb = require('express-handlebars');
const passport = require('passport');
const bcrypt = require('bcrypt');
const flash = require('connect-flash');
const expressSession = require('express-session');
const RedisStore = require('connect-redis')(expressSession);
const socketIOSession = require("socket.io.session");
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const redis  = require('redis');
const knex = require('knex')({
  client: 'postgresql',
  connection: {
      database: process.env.DB_NAME,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
  }
});

//modules
const Bcrypt = require('./auth/bcrypt');
const redisClient = require('./util/redis')(redis);
const router = require('./router/router')(express, passport);
require('./init/init-session')(app, io, redisClient, expressSession, RedisStore, socketIOSession);
require('./init/init-app')(express, app, bodyParser, hb, router, passport, flash);
require('./auth/passport')(passport, LocalStrategy, FacebookStrategy, new Bcrypt(bcrypt), knex);
require('./util/socket.io')(io);

//server starts
server.listen(port, () => console.log(`server started at port ${port} at ${new Date()}`));