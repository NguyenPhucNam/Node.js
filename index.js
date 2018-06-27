"use strict";
var express = require('express'),
	  app = express(),
	  bodyParser = require("body-parser"),
		ProductsController = require('./controller/products'),
		mongoose = require('mongoose'),
		morgan = require('morgan'),
		cookieParser = require('cookie-parser'),
		session = require('express-session'),
		passport = require('passport'),
		flash = require('connect-flash'),
		cloudinary = require('cloudinary'),
		validator = require('express-validator'),
		mongoMemory = require('connect-mongo')(session),
		admin = require('./Routes/Admin'),
		home = require('./Routes/Home'),
		user = require('./Routes/User'),
		products = require('./Routes/Product'),
		config = require('./config/default'),
    path = require('path'),
		compression = require('compression'),
		csrf = require('csurf'),
	  server = require("http").Server(app),
		io = require('socket.io')(server);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text());
app.use(bodyParser.json({ type: 'application/json'}));

app.use((req, res, next) => {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Header', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
	if(req.method === 'OPTIONS') {
		res.header('Access-Control-Allow-Methods', 'GET, PUT, POST');
		return res.status(200).json();
	}
	return next();
});

app.use(validator());
app.use(cookieParser());
app.use(session({
	secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
	secure: true,
	cookie: {
    httpOnly: true,
		maxAge:  new Date(Date.now() + 10800000),
		expires : new Date(Date.now() + 10800000),
	}, //# 3 tiếng
	store: new mongoMemory({ mongooseConnection: mongoose.connection })
}));
app.use(csrf());
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(compression());
app.use("*", (req, res, next) => {
	res.locals.user = req.user || null || undefined;
	res.locals.session = req.session;
	res.locals.success_messages = req.flash('success_messages');
  res.locals.error_messages = req.flash('error_messages');
	return next();
});

app.use((req, res, next) => {
  req.url = req.url.replace(/\/([^\/]+)\.[0-9a-f]+\.(css|js|jpg|png|gif|svg)$/, '/$1.$2');
  next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1 year' }));
app.set("view engine", "ejs");
app.set("views", "./Views");

mongoose.Promise = global.Promise;
mongoose.connect(config.DBSchool)
.then(() => console.log("Start Database DBSchool Success"))
.catch(() => {
	console.log("Could not connect to DBSchool");
	console.log("Waiting to retry...");
	mongoose.connect(config.DBHost)
	.then(() => console.log("Start Database DBHost Success"))
	.catch((err, done) => done("Could not connect to DBHost: " + err));
});
require('./config/passport');

//Socket
ProductsController.socket(io);
// routes
app.use(config.Path, home);
app.use(config.Path+"admin", admin);
app.use(config.Path+"san-pham", products);
app.use(config.Path+"tai-khoan", user);


// handler
app.use((req, res, next) => {
	let err = new Error("Không tìm thấy hoặc có thể trang đang được phát. Vui lòng quay lại sau...");
	err.status = 404;
	next(err);
});

app.use((err, req, res, next) => {
		res.status(err.status || 500);
		res.render('error', {
				title: 'Lỗi',
				path: config.Path,
				message: err.message,
				error: err
		});
});

const port = process.env.PORT || config.Port;
server.listen(port,() => console.log('Server start: ' + port));

module.exports = app;
