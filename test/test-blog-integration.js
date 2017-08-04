const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const should = chai.should();
const {DATABASE_URL} = require('../config');
const {BlogPost} = require('../models');
const {app, runServer, closeServer} =  require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

function tearDownDb(){
   return new Promise ((resolve, reject) => {
    console.warn('Deleting database');
    mongoose.connection.dropDatabase()
 	 .then(result => resolve(result))
 	 .catch(err => reject(err))
   });	
}

function seedBlogData(){
 console.info('seeding blog data');
 const seedData = [];

 for(let i = 0; i <= 10; i++){
 	seedData.push({
 		author: {
 			firstName: faker.name.firstName(),
 			lastName: faker.name.lastName()
 		},
 		title: faker.lorem.sentence(),
 		body: faker.lorem.text(),
 		image: faker.lorem.sentence()
 	});
 }

 return BlogPost.insertMany(seedData);
}



describe('Blog API resource', function(){

	before(function(){
		return runServer(TEST_DATABASE_URL);
	});

	beforeEach(function(){
		return seedBlogData();
	});

	afterEach(function(){
		return tearDownDb();
	});

	after(function(){
		return closeServer();
	});

 describe('GET endpoint', function() {

	it('should return all posts', function(){
		let res;
		return chai.request(app)
		 .get('/posts')
		 .then(_res => {
		 	res = _res;
		 	res.should.have.status(200);
		 	res.body.should.have.length.of.at.least(1);

		 	return BlogPost.count();

		 })
		 .then(count => {
		 	return chai.request(app)
		 		res.body.should.have.length.of(count);
		 });
	});

	 it('should return posts with correct fields', function(){
		let resPost;
		return chai.request(app)
		 .get('/posts')
		 .then(function(res){
		 	res.should.have.status(200);
		 	res.should.be.json;
		 	res.body.should.be.a('array');
		 	res.body.should.have.length.of.at.least(1);

		 	res.body.forEach(function(post){
		 		post.should.be.a('object');
		 		post.should.include.keys('title','author','body');
		 	});

		 	resPost = res.body[0];
		 	return BlogPost.findById(resPost.id).exec();
		 })

		 .then(post =>{
		 	resPost.title.should.equal(post.title);
		 	resPost.body.should.equal(post.body);
		 	resPost.author.should.equal(post.authorName);
		 });

	 });
 });


	describe('Post endpoint', function(){
     it('should add a new blog post', function(){
     	const newPost = {
     		title: faker.lorem.sentence(),
     		author: {
     			firstName: faker.name.firstName(),
     			lastName: faker.name.lastName(),
     		},
     		body: faker.lorem.text(),
     		image: faker.lorem.sentence()
     	};

     	return chai.request(app)
     	 .post('/posts')
     	 .send(newPost)
     	 .then(function(res){
     	 	res.should.have.status(201);
     	 	res.should.be.json;
     	 	res.body.should.be.a('object');
     	 	res.body.should.have.keys('title', 'body', 'author', 'id', 'created');
     	 	res.body.title.should.equal(newPost.title);

     	 	res.body.id.should.not.be.null
     	 	res.body.author.should.equal(`${newPost.author.firstName} ${newPost.author.lastName}`);
     	 	res.body.body.should.equal(newPost.body);

     	 	return BlogPost.findById(res.body.id).exec();
     	 })
     	 .then(function(post){
     	 	post.title.should.equal(newPost.title);
     	 	post.body.should.equal(newPost.body);
     	 	post.author.firstName.should.equal(newPost.author.firstName);
     	 	post.author.lastName.should.equal(newPost.author.lastName);

     	 });
     });
});


	describe('Put endpoint', function(){

		it('should changed updated fields', function(){
			const updatePost = {
				title: 'updated title',
				body: 'updated body',
				author: {
					firstName: 'updated firstName',
					lastName: 'updated lastName'
				}
			};

			return BlogPost
			 .findOne()
			 .exec()
			 .then(post => {
			 	updatePost.id = post.id;

			 	return chai.request(app)
			 	 .put(`/posts/${post.id}`)
			 	 .send(updatePost);
			 })

			 .then(res => {
			 	res.should.have.a.status(201);
			 	res.should.be.json;
			 	res.body.should.be.a('object');
			 	res.body.title.should.equal(updatePost.title);
			 	res.body.author.should.equal(`${updatePost.author.firstName} ${updatePost.author.lastName}`);
			 	res.body.body.should.equal(updatePost.body);

			 	return BlogPost.findById(res.body.id).exec();
			 })
			 .then(post => {
			 	post.title.should.equal(updatePost.title);
			 	post.body.should.equal(updatePost.body);
			 	post.author.firstName.should.equal(updatePost.author.firstName);
			 	post.author.lastName.should.equal(updatePost.author.lastName);
			 });
		});
	});

	describe('Delete endpoint', function(){

		it('should delete a post by id', function(){

			let post;

			return BlogPost
			 .findOne()
			 .exec()
			 .then(_post => {
			 	post = _post;
			 	return chai.request(app).delete(`/posts/${post.id}`)
			 })
			 .then(res => {
			 	res.should.have.status(204);
			 	return BlogPost.findById(post.id)
			 })
			 .then(_post => {
			 	should.not.exist(_post);
			 });
		});
	});

});