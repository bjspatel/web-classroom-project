var Model = require("../mysql/model");			//Load bookshelf model

module.exports = function(io, classesList, usersList) {

	io.of("/nsClassroomsList").on("connection", function(socket){
		console.log("Connection establisedd on server!!");
		socket.emit("classUpdate", JSON.stringify(classesList));

		socket.on("newclass", function(data) {
			function emitClassUpdates() {
				socket.broadcast.emit("classUpdate", JSON.stringify(classesList));
				socket.emit("classUpdate", JSON.stringify(classesList));
			}
			classesList.addClassroom(data, emitClassUpdates);
		});
	});

	io.of("/nsMessages").on("connection", function(socket) {

		socket.on("postConnect", function(data) {
			socket.user = data.user;
			socket.classNumber = data.classNumber;
			socket.join(data.classNumber, function () {
				socket.emit('updateUsersList', JSON.stringify(usersList.getUsersFromClassroom(socket.classNumber)));
				new Model.Messages()
					.query({where: {class_number: socket.classNumber}})
					.query(function(qb){
					    qb.orderBy('datetime','ASC');
					})
					.fetchAll().then(function(collection) {
						var rows = JSON.parse(JSON.stringify(collection)),
							messages = [];
						for(var i=0; i<rows.length; i++) {
							var messageData = {};
							messageData.message = rows[i].message;
							messageData.datetime = rows[i].datetime;
							messageData.user = usersList.getUser(rows[i].user_name);
							messages.push(messageData);
						}
						socket.emit('addOldMessages', JSON.stringify(messages));
					});
			});

		});

		socket.on("userStatusChanged", function(data) {
			usersList.changeUserStatus(data.user, socket.classNumber, data.online);
			var data = {
				message: (data.user.first_name + " " + data.user.last_name + " has " + (data.online ? "joined" : "left") + " the classroom."),
				type: 'userStatus',
				users: usersList.getUsersFromClassroom(socket.classNumber)
			}
			console.log("##userStatusChanged: " + JSON.stringify(data));
			socket.broadcast.to(socket.classNumber).emit("notification", JSON.stringify(data));
			socket.emit('notification', JSON.stringify(data));
		});

		socket.on("newMessage", function(data) {
			var dateObject = new Date();
			data.datetime = dateObject.toISOString();
			socket.broadcast.to(data.classNumber).emit("message", JSON.stringify(data));

			var messageObject = {
				'message': data.message,
				'class_number': socket.classNumber,
				'user_name': data.user.user_name,
				datetime: dateObject
			};
			new Model.Messages(messageObject)
				.save()
				.then(function(model) {
					console.log("Saved Message: " + JSON.stringify(model));
				})
				.catch(function(err) {
					console.log("Error saving message '" + data.message + "': " + err);
				});
		});

	    socket.on('disconnect', function () {
			var data = {
				message: (socket.user.first_name + " " + socket.user.last_name + " has left the classroom."),
				type: 'userStatus',
				users: usersList.getUsersFromClassroom(socket.classNumber)
			}
			socket.broadcast.to(data.classNumber).emit("notification", JSON.stringify(data));
	    });
	});
};
