///////////////////////////////////////////////////////////////////////////////////////////
//////////////////// Including modules and setting up variables ///////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

//Include all modules
var express = require('express');
var http = require('http');
var app = express();
var bodyParser = require('body-parser');
var staticConnect = require('serve-static');
var compression = require('compression');
var ejs = require('ejs');
var session = require('express-session');
var mongoose = require('mongoose');

//Enable different modules
app.use(bodyParser.urlencoded({extended: true}));
app.use(compression());
app.engine("html", ejs.renderFile);
app.set("view engine", "ejs");
app.set("views", __dirname + "/httpdocs/views");
app.use(session({secret: "OOOOOOOOOOOOOF", resave: false, saveUninitialized: false, logInError: false, errString: "", level: 0}));

//Set up database
mongoose.connect("mongodb://localhost:27017/sitedata");
var db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error."));
db.once("open", function(callback) {
	console.log("MongoDB connection successful.");
});
var userSchema = mongoose.Schema({
	username: String,
	email: String,
	password: String
});
var levelSchema = mongoose.Schema({
	level: String,
	stageString: String,
	levelString: String,
	narrString: String,
});
var users = mongoose.model("user", userSchema);
var levels = mongoose.model("levels", levelSchema);

//Set up bcrypt
var bcrypt = require('bcrypt-nodejs');

var levelArray = new Array();
///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////// FUNCTIONS  //////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////


///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////// GET requests ////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

app.get("/", function (request, result, next) {
	tmpString = request.session.errString;
	request.session.errString = "";
	if (request.session.user) {
		levels.findOne({level: levelArray[request.session.user] + ""}, function(err, lev) {
			if (levels && lev) {
				if (levelArray[request.session.user] == 3  && request.query.loggedin == "true") {
					levelArray[request.session.user] = levelArray[request.session.user] + 1;
				}
				if (levelArray[request.session.user] == 2  && request.query.loggedin == "false") {
					levelArray[request.session.user] = levelArray[request.session.user] + 1;
				}
				console.log(levelArray[request.session.user]);
				result.render("index.html", {title: lev.levelString, stage: lev.stageString, level: lev.levelString, levelNum: levelArray[request.session.user], narrString: lev.narrString, errString: tmpString});
			}
		});
	} else {
		result.render("index.html", {title: "Login Stage", stage: "0 - Login Stage", level: "0 - Login Stage", levelNum: 0, narrString: "Welcome to Pandora's Network! Login or create an account to play!", errString: tmpString});
	}
});

app.get("/adduser", function(request, result) {
	tmpString = request.session.errString;
	request.session.errString = "";
	if (!request.session.user) {
		result.render("index.html", {title: "Add User", stage: "Add User", level: "Add User", levelNum: 10, narrString: "Use this page to create an account.", errString: tmpString});
	} else {
		result.redirect("/");
	}
});

app.get("/escape", function(request, result) {
	request.session.destroy();
	result.redirect("/");
});

app.get("/sites/gov/default", function(request, result) {
	if (levelArray[request.session.user] == 5) {
		result.render("index.html", {title: "You Win", stage: "You Win", level: "You Win", levelNum: 6, narrString: "Well, you won the game for now..... But I will be back.......", errString: ""});
	} else {
		result.redirect("/");
	}
});

///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////// POST requests ///////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

app.post("/adduser", function(request, result) {
	users.findOne({username: request.body.username}, function(err, user) {
		if (user && request.session.user) {
			request.session.errString = "Error: User already exists.";
			result.redirect("/adduser");
		} else {
			if (request.body.password.length >= 8 && request.body.password == request.body.passwordconf && request.body.username != "" && request.body.password != "" && request.body.email != "") {
				var hash = bcrypt.hashSync(request.body.password);
				var user = new users({
	  				username: request.body.username,
					email: request.body.email,
	  				password: hash
				});
				user.save(function(err) {
	  				if (err) throw err;
				});
				result.redirect("/");
			} else {
				if (request.body.password != request.body.passwordconf) {
					request.session.errString = "Error: Your password and verification don't match.";
				} else if (request.body.username == "") {
					request.session.errString = "Error: Your username cannot be blank.";
				} else if (request.body.password == "") {
					request.session.errString = "Error: Your password cannot be blank.";
				} else if (request.body.password.length < 8) {
					request.session.errString = "Error: Your password should be greater than 8 characters.";
				} else {
					request.session.errString = "Error: Your email cannot be blank.";
				}
				result.redirect("/adduser");
			}
		}
	});
});

app.post("/login", function (request, result) {
	users.findOne({username: request.body.username}, function(err, user) {
		if (user && bcrypt.compareSync(request.body.password, user.password) && !request.session.user) {
			console.log("Some dude tried to login with username " + request.body.username + " and correct password");
			request.session.user = request.body.username;
			levelArray[request.session.user] = 1;
			result.redirect("/");
		} else {
			console.log("Some dude tried to login with username " + request.body.username + " and password " + request.body.password);
			request.session.errString = "Error: Login attempt failure.";
			result.redirect("/");
		}
	});
});

app.post("/level", function (request, result) {
	if (levelArray[request.session.user] == 1) {
		if (request.body.username == "sysadmin5" && request.body.password == "jjjfffaaa8") {
			levelArray[request.session.user] = levelArray[request.session.user] + 1;
			result.redirect("/");
		} else {
			request.session.errString = "Error: Wrong Credentials";
			result.redirect("/");
		}
	} else if (levelArray[request.session.user] == 3) {
		request.session.errString = "Error: Wrong Credentials";
		result.redirect("/?loggedin=false");
	} else if (levelArray[request.session.user] == 4) {
		if (request.body.username == "root" && request.body.password == "certuserpw") {
			levelArray[request.session.user] = levelArray[request.session.user] + 1;
			result.redirect("/");
		} else {
			request.session.errString = "Error: Wrong Credentials";
			result.redirect("/");
		}
	}
});

///////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////// Finishing server setup //////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////

//Statically serve css
app.use("/css/", staticConnect(__dirname + "/httpdocs/css"));

//Statically serve html
app.use("/", staticConnect(__dirname + "/httpdocs/public"));

//Statically serve js
app.use("/script/", staticConnect(__dirname + "/httpdocs/script"));

//Statically serve images
app.use("/images/", staticConnect(__dirname + "/httpdocs/images"));

// Start up the server, and listen for connections form the internet
http.createServer(app).listen(process.env.PORT || 8181);
