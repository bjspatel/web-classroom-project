var database 	= require('./database'),
	bookshelf 	= database.bookshelf,
	knex		= database.knex;

var User = bookshelf.Model.extend({
   tableName: 'user'
});

var Classroom = bookshelf.Model.extend({
   tableName: 'classroom'
});

var ClassUserMap = bookshelf.Model.extend({
   tableName: 'class_user_map'
});

var Messages = bookshelf.Model.extend({
   tableName: 'messages'
});

module.exports = {
   User: User,
   Classroom: Classroom,
   ClassUserMap: ClassUserMap,
   Messages: Messages,
   knex: knex
};
