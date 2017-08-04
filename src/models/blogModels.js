const mongoose = require('mongoose');

const blogPostSchema = mongoose.Schema({
	author: {
		firstName: String,
		lastName: String
	},
	title: {type: String, required: true},
	image: {data: Buffer, contentType: String },
	body: {type: String},
	created:{type: Date, default: Date.now}
});

blogPostSchema.virtual('authorName').get(function(){
	return `${this.author.firstName} ${this.author.lastName}`.trim();
});

blogPostSchema.methods.apiRepr = function() {
	return {
		id: this._id,
		author: this.authorName,
		title: this.title,
		created: this.created,
		body: this.body
	};
}

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

module.exports = {BlogPost};