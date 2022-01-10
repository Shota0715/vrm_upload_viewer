'use strict';

const express = require('express');
const socketIO = require('socket.io');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

//アップロード用
var uploadRouter = require('./routes/upload');

const app = express();

//app.use(logger('tiny', { stream: fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' }) }));
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static( path.join(__dirname, 'public')));
app.use(cors());
//アップロード用
app.use('/upload', uploadRouter);

const SESSION_SECRET_KEY = process.env.SESSION_SECRET_KEY || 'secret_key';
app.use(session({
    secret: SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: true }
}));

const routing = require('./api/controllers/routing');

const BASE_PATH = process.env.BASE_PATH || '/';

app.use(BASE_PATH, routing);
app.all('*', function(req, res) {
//  console.log(req);
  console.log('Unknown Endpoint');
  console.log('\tmethod=' + req.method);
  console.log('\tendpoint=' + req.params[0]);
  res.sendStatus(404);
});

var port = Number(process.env.PORT) || 3000;
const server = app.listen(port, () =>{
  console.log('http PORT=' + port)
})

//Socket.io
const io = socketIO(server);
console.log("socketが接続されました");
io.on('connection', (socket) => {
  console.log('接続されました。');

  // socket.on('UUID', function(data) {

  //   console.log('UUID:',data);

  //   exports.UUID = data;
  // }); 

  socket.on("disconnect", function () {
      console.log('接続が切れました。');
    });

});

const https = require('https');
try{
  const options = {
    key:  fs.readFileSync('./cert/privkey.pem'),
    cert: fs.readFileSync('./cert/cert.pem'),
    ca: fs.readFileSync('./cert/chain.pem')
  };
  const sport = Number(process.env.SPORT) || 10443;
  const servers = https.createServer(options, app);
  console.log('https PORT=' + sport );
  servers.listen(sport);
}catch(error){
//  console.log(error);
  console.log('can not load https');
}