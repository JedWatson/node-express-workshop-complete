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
// And morgan, which is a logging framework for express that will log all
// requests to the console for us
const morgan = require('morgan');

// Here we create the express app
const app = express();
// This tells express that we want to use ejs to render our templates
app.set('view engine', 'ejs');
// The static middleware serves files from the public directory
app.use(express.static('public'));
// Morgan should go next, so all dynamic requests get logged to the console
app.use(morgan(':method :url :status - :response-time ms'));
// The bodyparser middleware will turn form data into the req.body object
app.use(bodyParser.urlencoded({ extended: true }));

// This method serves the home page, which is an index of posts
app.get('/', (req, res, next) => {
	// Here we create an empty array of posts, then read all the data from the
	// database adding each post onto the array. When the set is complete, we
	// pass the array of posts to the index template and render it.
	const posts = [];
	// Note: in a production application, you should really handle errors from
	// the database, and implement pagination. We're going to skip both of those
	// here for the sake of simplicity.
	db.createReadStream()
		.on('data', post => {
			// We apply a little bit of transformation here to make the data
			// easier to work with in the template, including converting the
			// content from markdown to html
			posts.push({
				url: '/' + post.key,
				title: post.value.title || post.key,
				content: marked(post.value.short),
			});
		})
		.on('end', () => {
			// Now we've got all our posts, so let's render them!
			res.render('index', { posts });
		});
});

// This method serves up the new post form
app.get('/create-post', (req, res) => {
	res.render('create-post');
});

// This method handles the create-post action when a form is submitted
app.post('/create-post', (req, res) => {
	// We simply create a new id using the current time
	const id = Date.now();
	// Put the post content in the database
	db.put(id, {
		title: req.body.title,
		short: req.body.short,
		long: req.body.long,
	}, (err) => {
		if (err) return next(err);
		console.log(`Created Post ${id}`);
		res.redirect(`/${id}`);
	});
});

// This method serves a single post
app.get('/:post', (req, res, next) => {
	db.get(req.params.post, (err, post) => {
		// If we received an error, it may either mean that the post wan't
		// found, or that for some reason the database errored
		if (err) {
			if (err.name === 'NotFoundError') {
				// In this case, the post wan't found so we call next() to
				// move on to the generic "not found" 404 handler below
				return next();
			} else {
				// Other errors are passed to our generic error handler
				return next(err);
			}
		}
		// Make sure we turn the post content from markdown into html. We're
		// also going to default to the short content if the long content
		// hasn't been written.
		res.render('post', {
			post: {
				title: post.title,
				content: marked(post.long || post.short),
			},
		});
	});
});

// This is the main handler for routes that aren't matched
app.use((req, res, next) => {
	res.status(404).render('not-found');
});

// This is the main handler for any error passed to next()
app.use((err, req, res, next) => {
	console.log('---------');
	console.error(err);
	res.status(err.status || 500).render('error', { err });
});

// This method starts the web server.
app.listen(3000, () => {
	console.log('Server is listening on port 3000');
});

// It's handy to be able to reset the content database; that's what this
// little thing does. To run it, use $ node server --reset
if (process.argv[2] === '--reset') {
	db.createKeyStream().on('data', key => db.del(key));
	console.log('Reset the content database');
}
