var express 		= require("express"),
	app 			= express(),
	path 			= require("path"),
	http			= require("http"),
	mongoose 		= require("mongoose"),
	passport 		= require("passport"),
	flash 			= require("connect-flash"),

	morgan			= require("morgan"),
	cookieParser	= require("cookie-parser"),
	bodyParser		= require("body-parser"),
	session			= require("express-session"),

	config 			= require("./config/development"),
	port			= 3000,
	classesList		= require("./listModels/classesList"),
	usersList		= require("./listModels/usersList");

//---------------------------------configuration------------------------------------\\

mongoose.connect(config.url);

//-------------------------setup the express application----------------------------\\

app.use(morgan("dev"));		//logs every request to console
app.use(cookieParser());	//use cookie - needed for auth
app.use(bodyParser());		//gets information from html forms

//-----------------------setup hogan-express for templating-------------------------\\

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "html");
app.engine("html", require("hogan-express"));

app.use(session({secret:config.sessionSecret, resave: true, saveUninitialized: true}));
app.use(flash());
app.use(express.static(path.join(__dirname, "public")));

//-----------------------initialize and configure passport--------------------------\\

app.use(passport.initialize());
app.use(passport.session());
require("./passport/local_passport.js")(passport, usersList);
require("./routes.js")(express, app, passport, classesList, usersList);

//---------------------------------start server-------------------------------------\\

var server = http.createServer(app),
	io	= require("socket.io")(server);
require("./socket/socket.js")(io, classesList, usersList);
server.listen(port, function() {
	console.log("Web-Classroom is running on port '3000'");
});
