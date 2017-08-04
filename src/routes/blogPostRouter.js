const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const mongoose = require('mongoose');

const {BlogPost} = require('./models');


router.get('/', (req, res) => {
    BlogPost
        .find()
        .exec()
        .then(posts => {
            res.json(posts.map(post => post.apiRepr()));
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'something went terribly wrong' });
        });
});

router.get('/:id',(req, res) => {
	BlogPost
		.findById(req.params.id)
		.exec()
		.then(post => res.json(post.apiRepr()))
		.catch(err => {
			console.error(err);
			res.status(500).json({ error: 'something went horribly wrong'});
		});
});



router.post('/',(req, res) => {
	const requiredFields = ['title', 'author', 'body','image'];
  for(let i = 0; i< requiredFields.length; i++){
  	const field = requiredFields[i];
  	if(!(field in req.body)) {
  		const message = `Missing \`${field}\` in request body`
  		console.error(message);
  		return res.status(400).send(message);
  	}
  }

  BlogPost
  	.create({
  		title: req.body.title,
  		author: req.body.author,
  		image: req.body.image,
  		body: req.body.body 
  	})
  	.then(blogPost => res.status(201).json(blogPost.apiRepr()))
  	.catch(err => {
      console.error(err);
  	  res.status(500).json({ error: 'something went horribly wrong'});
    });
});

router.put('/:id',(req, res) =>{
  if(!(req.params.id && req.body.id && req.params.id === req.body.id)){
    res.status(400).json({ error: ' The request path id and request body id values must match '});
  }

  const updated = {};
  const updateableFields = ['title', 'body', 'author'];

  updateableFields.forEach(field =>{
    if(field in req.body){
      updated[field] = req.body[field];
    }
  });

  BlogPost
    .findByIdAndUpdate(req.params.id,{$set: updated }, {new: true})
    .exec()
    .then(updatedPost => res.status(201).json(updatedPost.apiRepr()))
    .catch(err => res.status(500).json({message: 'something went terribly wrong'}));

});

router.delete('/:id', (req, res) =>{
  BlogPost
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(()=>{
      res.status(204).json({message:'You have successfully deleted  blog post with id'});
    })
    .catch(err =>{
      console.error(err);
      res.status(500).json({error: 'something went terribly wrong'});
    });
});

module.exports = router;