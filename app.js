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
var currentUser = require('./routes/currentuser');
var events = require('./routes/events');
var clubs = require('./routes/clubs');
var jwt = require('express-jwt');
var jwks = require('jwks-rsa');

var chats = require('./routes/chats');
var Chat = require('./models/Chat.js');
var Message = require('./models/Message.js');
var app = express();
var MongoClient = require('mongodb').MongoClient;
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

app.use('/', index);
app.use('/users', users);
app.use('/events', events);
app.use('/clubs', clubs);
clients = {};
userObjects = {};
app.set('users', {});
app.set('userObjects', {});

io.on('connect', function (socket) {
    console.log('User connected');
    socket.auth = false;
    socket.on('authenticate', function(data){
        //check the auth data sent by the client
        console.log(data);
        currentUser(data).then(function(success){
            if (success){
                console.log("Authenticated socket ", socket.id);
                socket.auth = true;
                /*app.get('users')[success._id] = socket.id;
                app.get('userObjects')[socket.id]=success;*/
                clients[success._id]=socket.id;
                userObjects[socket.id]=success;
            }
        }).catch(function (e) {
            console.log(e);
        });
    });
    setTimeout(function(){
        //If the socket didn't authenticate, disconnect it
        if (!socket.auth) {
            console.log("Disconnecting socket ", socket.id);
            socket.disconnect('unauthorized');
            /*app.get('users')[socket.id] = null;
            app.get('userObjects')[socket.id] = null;*/
            userObjects[socket.id] = null;
        }
    }, 2000);

    socket.on('disconnect', function() {
        console.log('User disconnected');
        userObjects[socket.id] = null;
    });

    socket.on('save-message', function (data) {
        console.log(data);
        //data.fromId=app.get('userObjects')[socket.id]._id;
        data.fromId=userObjects[socket.id]._id;
        //io.to(app.get('users')[data.toId]).emit('new-message', { message: data });
        io.to(clients[data.toId]).emit('new-message', { message: data });
    });

    socket.on('iamtyping', function (data) {
        console.log('typing... to ' +data.toId);
        console.log(clients);
        /*console.log(app.get('userObjects'));
        console.log(socket.id);*/
        //data.hash= app.get('userObjects')[socket.id]._id;
        data.hash= userObjects[socket.id]._id;
        //io.to(app.get('users')[data.toId]).emit('heistyping', { message: data });
        io.to(clients[data.toId]).emit('heistyping', { message: data });
    });
});

app.post('/chat', function(req, res, next) {
  currentUser(req).then(function (user) {
    console.log('post request');
    console.log(user._id + " current userid");
    req.body.fromId=user._id;
    //console.log(app.get('users')[req.body.toId] + ' socket_id to send');
    //console.log(app.get('users')[req.body.fromId] + ' socket_id from user');

    //io.to(app.get('users')[req.body.toId]).emit('new-message', req.body);
    io.to(clients[req.body.toId]).emit('new-message', req.body);
    Message.create(req.body, function (err, post) {
          if (err) return next(err);
          res.json(post);
      });
  }).catch(function (e) {
      console.log(e);
  })
});

app.get('/chat/users', function(req, res, next) {
  console.log(req.body);
   MongoClient.connect('mongodb://rider:rider2017@ds145208.mlab.com:45208/ridersdb', function(err, db){
        if (err) return console.log(err);
        db.collection('users').find({}).toArray(function(err, users){
            console.log(users);
            res.json(users);
        });
    });
});

app.get('/chat/messages/:id', function(req, res, next) {
  console.log(req.params.id +' => getMessages of userId ');
  currentUser(req).then(function (user) {
      var q = Message.find({$or:[{fromId:user._id, toId:req.params.id}, {fromId:req.params.id, toId:user._id}]}).sort({createdDate:1}).limit(20);
      q.exec(function(err, msgs){
          res.send(msgs);
      });
  })


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
