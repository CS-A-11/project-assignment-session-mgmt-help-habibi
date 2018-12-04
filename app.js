var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var clientRouter = require('./routes/client');
var adminRouter = require('./routes/admin')
var chat = require('./routes/chat');
var exphbs  = require('express-handlebars');
var flash = require('express-flash');
var mongoose = require('mongoose');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var app = express();

// view engine setup
app.engine('handlebars', exphbs({defaultLayout: 'layout'}));
app.set('view engine', 'handlebars');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('express-session')({
  secret: 'randompasswordzsrtdtyuutytyt57667',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use(flash());

app.use('/chat',chat)
app.use('/api/chat', chat);
app.use('/', indexRouter);
app.use('/client',clientRouter);
app.use('/admin',adminRouter)


// passport config
var Account = require('./models/Account');
passport.use(new LocalStrategy(Account.authenticate()));
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// mongoose
//mongoose.connect('mongodb://localhost/helphabibi');

mongoose.connect('mongodb://bhatti:bhatti123@ds151853.mlab.com:51853/heroku_czv4180r');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

 
function functionName() {
  // function body
  // optional return; 
  console.log('Hello world');
} 
app.listen(process.env.PORT || 5000, function () {
    console.log("listening on port 5000!");
});
 
module.exports = app;
