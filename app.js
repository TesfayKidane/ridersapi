var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var lessMiddleware = require('less-middleware');
var cors = require('cors');
var index = require('./routes/index');
var users = require('./routes/users');
var events = require('./routes/events');
var clubs = require('./routes/clubs');
var jwt = require('express-jwt');
var jwks = require('jwks-rsa');

var chats = require('./routes/chats');
var Chat = require('./models/Chat.js');
var Message = require('./models/Message.js');
var app = express();
var jwtCheck = jwt({
    secret: jwks.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: "https://bikeriders.auth0.com/.well-known/jwks.json"
    }),
    audience: 'http://localhost:9000',
    issuer: "https://bikeriders.auth0.com/",
    algorithms: ['RS256']
});

app.use(jwtCheck);

var server = app.listen(9000, ()=>console.log("running on port 9000"));
var io = require('socket.io').listen(server);

app.use(cors({credentials:true,  origin: true}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));


app.all(cors());
app.options('*', cors({'credentials':true, 'origin':true}));
/*
app.all('/events/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next(req, res, next);
 });*/
var user={ _id:1, firstName:'Sherali', lastName:'Obidov'};

app.use('/', index);
app.use('/users', users);
app.use('/events', events);
app.use('/clubs', clubs);

io.on('connect', function (socket) {
  console.log('User connected');
  socket.on('disconnect', function() {
    console.log('User disconnected');
  });
  socket.on('save-message', function (data) {
    console.log(data);
    data.fromId=user._id;
    io.emit('new-message', { message: data });
  });

  socket.on('iamtyping', function (data) {
    console.log(data + ' ' + 'typing');
    data.hash= user._id + '#' + data.toId;
    io.emit('heistyping', { message: data });
  });
});


app.post('/chat', function(req, res, next) {
  req.body.fromId=user._id;
  console.log(req.body);
  Message.create(req.body, function (err, post) {
    if (err) return next(err);
    res.json(post);
  });
});

app.get('/chat/users', function(req, res, next) {
  console.log(1);
  console.log(req.body);
  var users=[
    {_id:2, firstName:'Tesfay', lastName:'Aregay'},
    {_id:3, firstName:'Miga', lastName:'Ochirgiev'},
    {_id:4, firstName:'Sonam', lastName:'Buldi'},
    {_id:5, firstName:'James', lastName:'Ketdi'}
  ]
  users.push(user);
  console.log(users);

  res.json(users);
});

app.get('/chat/messages/:id', function(req, res, next) {
  console.log(req.params.id +' => getMessages of userId ');
  var q = Message.find({fromId:user._id, toId:req.params.id}).sort({createdDate:1}).limit(20);
  q.exec(function(err, msgs){
    res.send(msgs);
  });

});
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

module.exports = app;
