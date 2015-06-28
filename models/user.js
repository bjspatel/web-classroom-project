var mongoose	= require("mongoose"),
	bcrypt		= require("bcrypt-nodejs");

//define user schema
var userSchema	= mongoose.Schema({
		firstname: String,
		lastname: String,
		username: String, 
		password: String,
		usertype: String
	}
);

//------------------------------userSchema methods------------------------\\
//generates hash
userSchema.methods.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

//checks password validity
userSchema.methods.validPassword = function(password) {
	return bcrypt.compareSync(password, this.password);
};

//create the user model, and expose it to the app
module.exports = mongoose.model("User", userSchema);
