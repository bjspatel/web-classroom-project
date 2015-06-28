var config = require("../config/development.js");

var knex = require("knex")({
   client: 'mysql', 
   connection: {
	   host: 		config.dburl,  // your host
	   user: 		config.dbusername, // your database user
	   password: 	config.dbpassword, // your database password
	   database: 	config.dbdatabasename

	   // host: 		'localhost',  // your host
	   // user: 		'wcUser', // your database user
	   // password: 	'wcPassword', // your database password
	   // database: 	'web_classroom'
	}
});

module.exports.bookshelf 	= require('bookshelf')(knex);
module.exports.knex			= knex;
