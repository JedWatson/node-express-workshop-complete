// We're going to use leveldb to store our posts. It's a simple file-based
// database for node.js, and we tell it we're storing JSON data
const levelup = require('level');
const db = levelup('./data', { valueEncoding: 'json' });

// We're going to write our blog posts in markdown, but we want to server our
// content as HTML so we're going to use the marked package to do that for us
const marked = require('marked');

// Express is our web server. We use it to create the app and listen for http
// requests matching the handlers defined below.
const express = require('express');
// We'll also need the body-parser middleware so we can accept form data
const bodyParser = require('body-parser');

// Here we create the express app
const app = express();
// This tells express that we want to use ejs to render our templates
app.set('view engine', 'ejs');
// The static middleware serves files from the public directory
app.use(express.static('public'));
// The bodyparser middleware will turn form data into the req.body object
app.use(bodyParser.urlencoded({ extended: true }));

// This method serves the home page, which is an index of posts
app.get('/', (req, res) => {
	db.get('index', (err, posts) => {
		if (err) {
			console.log('Error retrieving Index from database:', err);
			res.status(500).send('Error retrieving Index');
		} else {
			res.render('index', { posts: posts });
		}
	});
});

// This method serves a single post
app.get('/:post', (req, res) => {
	db.get(req.params.post, (err, content) => {
		if (err) {
			if (err.name === 'NotFoundError') {
				res.status(404).send('Not Found');
			} else {
				console.log('Error retrieving Post from database:', err);
				res.status(500).send('Error retrieving Post');
			}
			return;
		}
		res.json(content);
	});
});

app.get('/create-post', (req, res) => {
	res.send('Create post');
});

// This method handles the create-post action when a form is submitted
app.post('/create-post', (req, res) => {
	// We simply create a new id using the current time
	const id = Date.now();
	// Put the post content in the database
	db.put(id, req.body.content, (err) => {
		if (err) {
			console.log('Error creating Post:', err);
			res.status(500).send('Error creating Post');
			return;
		}
		console.log(`Created Post ${id}`);
		res.redirect(`/${id}`);
	});
});

// Ensure the index of posts has been created
db.get('index', (err, index) => {
	if (!index || process.argv[2] === '--reset') {
		// if the index doesn't exist, set it to an empty array
		db.put('index', []);
		console.log('Initialised content database');
	}
});

// This method starts the web server.
app.listen(3000, () => {
	console.log('Server is listening on port 3000');
});
