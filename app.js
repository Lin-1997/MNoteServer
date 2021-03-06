var express = require ('express');
var path = require ('path');
//var favicon = require ('serve-favicon');
var logger = require ('morgan');
var cookieParser = require ('cookie-parser');
var bodyParser = require ('body-parser');

var app = express ();

app.all ('*', function (req, res, next)
{
	res.header ('Access-Control-Allow-Origin', '*');
	res.header ('Access-Control-Allow-Headers', 'Content-Type,Content-Length,Authorization,Accept,X-Requested-With');
	res.header ('Access-Control-Allow-Methods', 'PUT,POST,GET,DELETE,OPTIONS');
	res.header ('X-Powered-By', ' 3.2.1');
	//让options请求快速返回
	if (req.method === 'OPTIONS')
	{
		res.send (200);
	}
	else
	{
		next ();
	}
});

// view engine setup
app.set ('views', path.join (__dirname, 'views'));
app.set ('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use (logger ('dev'));
app.use (bodyParser.json ());
app.use (bodyParser.urlencoded ({limit: '100mb', extended: true}));
app.use (cookieParser ());
app.use (express.static (path.join (__dirname, 'public')));

var user = require ('./routes/user');
app.use ('/user', user);
var note = require ('./routes/note');
app.use ('/note', note);
var help = require ('./routes/help');
app.use ('/help', help);

// catch 404 and forward to error handler
app.use (function (req, res, next)
{
	var err = new Error ('Not Found');
	err.status = 404;
	next (err);
});

// error handler
app.use (function (err, req, res, next)
{
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get ('env') === 'development' ? err : {};

	// render the error page
	res.status (err.status || 500);
	res.render ('error');
});

module.exports = app;
