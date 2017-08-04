const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = mongoose.Schema({
	userName: {
		type: String,
	  required: true,
	  unique: true,
	  lowercase: true
	},

	  password: {type: String, required: true}
});

userSchema.pre('save',
	function(next){
		const user = this;
		if(this.isModified('password') || this.isNew){
			bcrypt.gensalt(10)
			.then((salt) =>{
				bcrypt.hash(user.password, salt)
					.then((hash) =>{
						user.password = hash;
						next();
					})
					.catch(hashErr => next(hashErr));
			})
			.catch(saltErr => next(saltErr));
		}
	});

blogPostSchema.methods.isProperPassword = function(clientPassword) {
	return new Promise((resolve, reject) => {
		bcrypt.compare(clientPassword, this.password)
		.then((res) =>{
			resolve(res);
		})
		.catch((compareError) =>{
			console.error(compareError);
			console.error('error in bcryptCompare');
			reject(compareError);
		});
	});
};

const User = mongoose.model('User', userSchema);

module.exports = {User};