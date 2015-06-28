var usersList 	= [],
	Model		= require("../mysql/model");			//Load bookshelf model

/*

this[classNumber][userName] = {
	username: Name of user,
	firstname: First Name of User,
	lastname: Last Name of User,
	usertype: Type of User
	online: true/false
};

*/

usersList.load = function() {

	this.allUsers = [];
	new Model.User()
		.fetchAll({columns: ['user_name', 'first_name', 'last_name', 'user_type']})
		.then(function(collection) {
			usersList.allUsers = JSON.parse(JSON.stringify(collection));
			usersList.allUsers.getUserClone = function(username) {
				for(var i=0; i<this.length; i++) {
					if(this[i].user_name === username) {
						return JSON.parse(JSON.stringify(this[i]));
					}
				}
			}
			new Model.ClassUserMap()
				.fetchAll()
				.then(function(collection) {
					var mappings = JSON.parse(JSON.stringify(collection));
					usersList.splice(0, this.length);
					for(var i=0; i<mappings.length; i++) {
						var classNumber = mappings[i].class_number,
							userClone 	= usersList.allUsers.getUserClone(mappings[i].user_name);
						if(!usersList[classNumber]) {
							usersList[classNumber] = [];
						}
						userClone.online = false;
						usersList[classNumber].push(userClone);
					}
				});
		});
};

usersList.getAllUsers = function() {
	return usersList.allUsers;
};

usersList.getUser = function(user_name) {
	for(var i=0; i<this.allUsers.length; i++) {
		if(this.allUsers[i].user_name === user_name) {
			return this.allUsers[i];
		}
	}
};

usersList.addUserToClassroom = function (user, classNumber) {
	if(this[classNumber]) {
		this[classNumber].push(user);
	} else {
		this[classNumber] = [user];
	}
	this.sort(classNumber);
};

usersList.removeUserFromClassroom = function(user, classNumber) {
    var users = this[classNumber];
    for(var i=0; i<users.length; i++) {
        if(users[i].user_name == user.user_name) {
            users.splice(i, 1);
            break;
        }
    }
};

usersList.sort = function (classNumber) {
	if(!this[classNumber]) {
		this[classNumber] = [];
	}
	this[classNumber].sort(function(a, b) {
		if(a.online === b.online) {
			return ((a.first_name + a.last_name).toLowerCase() > (b.first_name + b.last_name).toLowerCase()) ? true : false;
		} else {
			return a.online;
		}
	});
};

usersList.getUsersFromClassroom = function(classNumber) {
	return this[classNumber];
};

usersList.changeUserStatus = function(user, classNumber, status) {
    var users = this[classNumber];
    for(var i=0; i<users.length; i++) {
        if(users[i].user_name == user.user_name) {
            users[i].online = status;
            break;
        }
    }
    console.log("USERS BEFORE SORT: " + JSON.stringify(this[classNumber], null, 4));
    this.sort(classNumber);
    console.log("USERS AFTER SORT: " + JSON.stringify(this[classNumber], null, 4));
};

usersList.updateUsersListUI = function(socket, classNumber) {
	if(!classNumber) {
		classNumber = socket.classNumber;
	}
	socket.emit("notification", JSON.stringify(this[classNumber]));
	socket.to(classNumber).emit("notification", JSON.stringify(this[classNumber]));
};

usersList.load();

module.exports = usersList;
