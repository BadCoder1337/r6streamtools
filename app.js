require('dotenv').config();

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var socketIO = require('socket.io');
var bot = require('./lib/discord');

var PORT = process.env.PORT || 5000;

var app = express();
var server = http.createServer(app);
var io = socketIO(server);

var index = require('./routes/index');
//var socket = require('./routes/socket.io');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
//app.use('/', socket);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

io.sockets.on('connection', function (socket) {
  console.log('client connected');
  socket.on('disconnect', function () {
    console.log('client disconnected');

  })
});

bot.events.on('match', function (match) {
  console.log('sending match info');
  console.log(match);
  io.sockets.json.send(match);
})

bot.events.on('message', function (msg) {
  console.log('recieve bot msg: ', msg);
  io.sockets.json.send(msg);
})

server.listen(PORT, () => console.log(`Listening on ${PORT}`))

//module.exports = app;