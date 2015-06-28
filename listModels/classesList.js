var classes_list 	= [],
	Model			= require("../mysql/model");			//Load bookshelf model
/*
this[i] = {
	class_number: Class number,
	class_name: Class name,
	teacher_name: Name of teacher,
	description: Description of Class,
	users: Array[] of usernames
}
*/

classes_list.load = function() {
	new Model.Classroom().fetchAll().then(function(collection) {
		classes_list.splice(0, classes_list.length);
		Array.prototype.push.apply(classes_list, JSON.parse(JSON.stringify(collection)));
		for(var i=0; i<classes_list.length; i++) {
			classes_list.updateUsers(classes_list[i].class_number);
		}
	});
};

classes_list.updateUsers = function(classNumber, callback) {
	var classObj = this.getClass(classNumber);
		classObj.users = [];
	new Model.ClassUserMap()
		.query({where: {class_number: classNumber}})
		.fetchAll().then(function(collection) {
			var rows = JSON.parse(JSON.stringify(collection));
			for(var i=0; i<rows.length; i++) {
				classObj.users.push(rows[i].user_name);
			}
			if(callback) {
				callback(classObj);
			}
		});
}

classes_list.saveUsers = function(classNumber, userNames) {

	new Model.ClassUserMap()
		.query({where: {class_number: classNumber}})
		.destroy()
		.then(function() {
			console.log("Class " + classNumber + " is emptied.");
		});

	var mapObjects = [];
	for(var i=0; i<userNames.length; i++) {
		var mapObject = {'class_number': classNumber, 'user_name': userNames[i]};
		new Model.ClassUserMap(mapObject)
			.save()
			.then(function(model) {
				console.log("Saved Map: " + JSON.stringify(model));
				classes_list.updateUsers(classNumber);
			})
			.catch(function(err) {
				console.log("Error saving mapObject " + JSON.stringify(mapObject) + ": " + err);
			});
	}
}

classes_list.getTeacherName = function(className) {
	return this[className].teacher_name;
};

classes_list.getClassName = function(classNumber) {
	var classObj = this.getClass(classNumber);
	return (classObj) ? classObj.class_name : "";
};

classes_list.getClass = function(classNumber) {
	for(var i=0; i<this.length; i++) {
		if(this[i].class_number == parseInt(classNumber)) {
			return this[i];
		}
	}
}

classes_list.addClassroom = function (classData, callback) {
	
	//Add class data to local variable
	classData.users = [];
	this.push(classData);
	this.sort(function(a, b) {
		return (a.class_name.toLowerCase() < b.class_name.toLowerCase()) ? true : false;
	});


	var dbObject = JSON.parse(JSON.stringify(classData));
	delete dbObject["users"];
	//Store class data to database
	new Model.Classroom(dbObject)
		.save()
		.then(function(model) {
			return done(null, model);
		})
		.catch(function(err) {
			console.log("#Error while saving class: " + JSON.stringify(err));
		});
	if(callback) {
		callback();
	}
};

classes_list.removeClassroom = function(user, classNumber) {
    //REMOVE USER FROM CLASSROOM FROM DATABASE
};

classes_list.load();

module.exports = classes_list;
