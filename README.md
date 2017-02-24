# node-express-workshop-complete

This is the reference implementation for the node-express-workshop I am working on.

The workshop is still being written, but I'd love feedback on this.

The outcome is a simple blog website using:

* [Node.js](https://nodejs.org/) v7.6+
* [Express](http://expressjs.com/) for the web server
* [EJS](http://ejs.co/) for templates
* [Bootstrap](https://v4-alpha.getbootstrap.com/) for styling
* [LevelDB](https://github.com/Level/levelup) to store content

The website includes:

* A home page that displays all blog posts
* A view that displays the full content of a post
* A create post form that lets you add a new post to the database
* Simple 404 (not found) and error handlers

## Setup

First, make sure you have Node.js v7.6 or higher installed. Then clone or fork this repository.

Then install the dependencies by running:

```sh
npm install
```

To start the website, run:

```sh
node server
```

Then visit [localhost:3000](http://localhost:3000) to view the blog.

If you want to reset the content database, you can do that by running:

```sh
node server --reset
```

## Caveats

There are a few things you'd want to do in a production app that I haven't included, because the point of this project is to demonstrate the core concepts involved in setting up a database-driven blog / cms with node.js as simply as possible.

Specifically, it doesn't handle:

* Performance (thousands of posts would cause problems)
  * Posts on the homepage should be paginated
  * Markdown is converted to HTML in real time, in a production app you'd cache the output in the database
* Sessions or security - anyone can add a post
* Database errors
* SEO - it doesn't generate friendly URLs, meta tags or a sitemap

## Next Steps

There are a number of "good next steps" you could take from here. They include:

* Customise the style of the blog
* Add a favicon (hint: there's an express package for that!)
* Generate friendly IDs for posts, instead of using the current time (there's a package for that too)
* Give posts an image upload field
* Add a [Sitemap](https://en.wikipedia.org/wiki/Sitemaps) handler
* Switch from markdown to a rich HTML editor, e.g. [CKEditor](http://ckeditor.com/), [TinyMCE](https://www.tinymce.com/) or [Trix](https://trix-editor.org/)
* Use a [different database](http://expressjs.com/en/guide/database-integration.html)
* Add session management to protect creating posts

If you're interested in a proper CMS for building Node.js websites, check out [KeystoneJS](http://keystonejs.com/)

## License

MIT License. Copyright (c) 2017 Jed Watson.
