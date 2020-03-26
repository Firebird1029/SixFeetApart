"use strict"; /* eslint-env node */ /* global */ /* eslint no-warning-comments: [1, { "terms": ["todo", "fix", "help"], "location": "anywhere" }] */
var debug = false;

/*
 * Notes
 *
 * Resources:
 * https://bulma.io/documentation/
 * https://pugjs.org/api/getting-started.html
 * http://html2jade.vida.io/
 * https://fontawesome.com/icons
 */

// Load Node Dependencies & Custom Modules
var express = require("express"),
	app = express(),
	server = app.listen(process.env.PORT || (process.argv[2] || 8000), function expressServerListening () {
		console.log(server.address());
	}),

	// Express Middleware
	helmet = require("helmet"),
	pugStatic = require("pug-static");


// Setup Express Middleware
app.set("view engine", "pug");
app.use(helmet());
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/dist"));
app.use(pugStatic(__dirname + "/views"));
app.use((req, res, next) => {
	res.status(404).render("404.pug");
});
