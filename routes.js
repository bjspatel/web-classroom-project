module.exports = function(express, app, passport, classesList, usersList) {
	var config = require("./config/development.js"),
		router = express.Router();

	//Home page
	router.get("/", function(req, res) {
		res.redirect("/signin");
	});

	//Login page
	router.get("/signin", function(req, res) {
		res.render("signin", {title: "Web-Classroom Signin", message: req.flash("signinMessage")});
	});
	//Process Signin form
	router.post("/signin", passport.authenticate('local-signin', {
		successRedirect: '/classroomsList',
		failureRedirect: '/signin'
	}));

	//Signup page
	router.get("/signup", function(req, res) {
		res.render("signup", {title: "Web-Clasroom Signup", message: req.flash("signupMessage")});
	});
	//Process Signup form
	router.post("/signup", passport.authenticate('local-signup', {
		successRedirect: '/signin',
		failureRedirect: '/signup',
		failureFlash: true
	}));

	//Profile page
	router.get("/profile", isLoggedIn, function(req, res) {
		res.render("profile", {title: "Web-Clasroom", user: req.user, message: req.flash("profileMessage")});
	});

	//Classrooms List page
	router.get("/classroomsList", isLoggedIn, function(req, res) {
		res.render("classroomsList", {title: "Classrooms", config: config, user: req.user, message: req.flash("profileMessage")});
	});

	//Classroom Chat page
	router.get("/classroom/:id", isLoggedIn, function(req, res) {
		var className = classesList.getClassName(req.params.id);
		res.render("classroom", {user:req.user, classNumber: req.params.id, className: className, config: config});
	});

	//Add Students page
	router.get("/addStudents/:id", isLoggedIn, function(req, res) {
		var indexedUsersList = [],
			indexedSelectedList = [],
			selectedList = usersList[req.params.id],
			renderDataObj = {};
		if(!selectedList) {
			selectedList = [];
		}
		usersList.getAllUsers().map(function(user, index) {
			indexedUsersList.push({index: index, user: user});
		});

		selectedList.map(function(user, index) {
			indexedSelectedList.push({index: index, user: user});
		});

		renderDataObj.teacher		= req.user;
		renderDataObj.usersList 	= indexedUsersList;
		renderDataObj.selectedList 	= indexedSelectedList;
		renderDataObj.className 	= classesList.getClassName(req.params.id);
		res.render("addStudents", renderDataObj);
	});
	//Process Add Students page
	router.post("/addStudents/:id", isLoggedIn, function(req, res) {
		var newUsers 		= [],
			newUserNames 	= [],
			prevUsers		= usersList[req.params.id],
			allUsers 		= usersList.getAllUsers();
		if(!prevUsers) {
			prevUsers = [];
		}
		for(var i=0; i<prevUsers.length; i++) {
			if(req.body[prevUsers[i].user_name]) {
				newUsers.push(prevUsers[i]);
				newUserNames.push(prevUsers[i].user_name);
			}
		}
		for(var i=0; i<allUsers.length; i++) {
			if(req.body[allUsers[i].user_name] && newUserNames.indexOf(allUsers[i].user_name) < 0) {
				var newUser = JSON.parse(JSON.stringify(allUsers[i]));
				newUser.online = false;
				newUsers.push(newUser);
				newUserNames.push(newUser.user_name);
			}
		}
		console.log("NEW USERS: " + JSON.stringify(newUsers));
		console.log("NEW USER NAMES: " + JSON.stringify(newUserNames));
		usersList[req.params.id] = newUsers;
		usersList.sort(req.params.id);
		classesList.saveUsers(req.params.id, newUserNames);
		res.redirect("/classroomsList");
	});

	//Process logout
	router.get("/logout", function(req, res) {
		req.logout();
		res.redirect("/");
	});

	app.use(router);
};

function isLoggedIn(req, res, next) {
	if(req.isAuthenticated()) {
		next();
	} else {
		res.redirect("/signin");
	}
}
