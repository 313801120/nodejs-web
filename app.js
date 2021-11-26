var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var httpProxy = require('http-proxy');
var proxy = httpProxy.createProxyServer({ changeOrigin: true });



var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var mRouter = require('./routes/m');
var yzmRouter = require('./routes/yzm');

var app = express();


app.all('/apis/*', function(req, res, next) {
    var target = req.originalUrl.replace("/apis/", "");
    // Change this API url to suit your project
    var url = `/${target}`;
    req.url = url;
    console.log(url);
    delete req.headers.host;
    proxy.web(req, res, { target: 'http://localhostaa', changeOrigin: true });
})


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/m', mRouter);
app.use('/yzm', yzmRouter);

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

module.exports = app;