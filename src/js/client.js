"use strict"; /* eslint-env browser */ /* global */ /* eslint no-warning-comments: [1, { "terms": ["todo", "fix", "help"], "location": "anywhere" }] */
const debug = true;

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
function getRandomArbitrary (min, max) {
	return Math.random() * (max - min) + min;
}

function getRandomInt (min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Navbar Burger
$(document).ready(function () {
	$(".overlay").text("bob");

	var game = {};
	game.data = {};

	var config = {
		type: Phaser.AUTO,
		width: (window.innerWidth) * 1,
		height: (window.innerHeight) * 1,
		parent: "game",
		backgroundColor: 0xFFFFFF,
		physics: {
			default: "arcade",
			arcade: {
				debug: debug,
				// gravity: { y: 300 }
			}
		},
		scene: {
			preload: preload,
			create: create,
			update: update
		}
	};

	var gameContainer = new Phaser.Game(config);

	function preload () {
		// this.load.image("sky", "assets/img/space3.png");
		// this.load.image("red", "assets/img/redParticle.png");
		this.load.image("man", "assets/img/man.png");
		this.load.image("covid", "assets/img/covid1.png");
		this.load.image("toiletpaper", "assets/img/toiletpaper.png");
	}

	function create () {
		// Excess Quickstart Tutorial Code
		// this.add.image(400, 300, "sky");
		// var particles = this.add.particles("red");
		// var emitter = particles.createEmitter({
		// 	speed: 100,
		// 	scale: { start: 1, end: 0 },
		// 	blendMode: "ADD"
		// });
		// // emitter.startFollow(game.covid);
		
		// Main Character, the Man
		game.man = this.physics.add.image(window.innerWidth / 2, window.innerHeight / 2, "man");
		game.man.displayWidth = 58;
		game.man.displayHeight = 102;
		game.man.setCollideWorldBounds(true);
		game.man.setGravity(0, 0);
		game.man.setAcceleration(200, 200);
		game.data.manSpeed = 200;

		// Generate Rectangles Where Covids Will Be Placed Outside Of
		// https://phaser.io/examples/v3/view/geom/rectangle/get-random-point-outside
		// https://rexrainbow.github.io/phaser3-rex-notes/docs/site/geom-rectangle/
		game.outerFrame = new Phaser.Geom.Rectangle(window.innerWidth * 0.05, window.innerHeight * 0.05, window.innerWidth * 0.9, window.innerHeight * 1);
		game.innerFrame = new Phaser.Geom.Rectangle(window.innerWidth * 0.1, window.innerHeight * 0.1, window.innerWidth * 0.8, window.innerHeight * 0.8);
		
		// Debug Rectangles
		var graphics = this.add.graphics();
		debug && graphics.lineStyle(1, 0x000000);
		debug && graphics.strokeRectShape(game.outerFrame); graphics.strokeRectShape(game.innerFrame);

		// Group of Covids
		// game.covid = this.physics.add.image(400, 100, "covid");
		game.covidGroup = this.physics.add.group();
		for (var i = 0; i < 5; i++) {
			// https://phaser.io/examples/v3/view/physics/arcade/sprite-vs-multiple-groups
			var zone = Phaser.Geom.Rectangle.RandomOutside(game.outerFrame, game.innerFrame);
			var covid = game.covidGroup.create(zone.x, zone.y, "covid");
			this.physics.add.existing(covid);

			covid.displayWidth = 30;
			covid.displayHeight = 30;
			covid.setVelocity(getRandomInt(100, 200), getRandomInt(100, 200));
			covid.setBounce(1, 1);
			covid.setCollideWorldBounds(true);
			covid.setGravity(0, 0);
		}

		// The Toilet Paper Rolls
		game.toiletGroup = this.physics.add.group();
		spawnToiletPaper(this);

		// Collision Code
		// http://phaser.io/tutorials/making-your-first-phaser-3-game/part8
		// this.physics.add.collider(game.man, game.covid);
		this.physics.add.overlap(game.man, game.covidGroup, infected, null, this);
		this.physics.add.overlap(game.man, game.toiletGroup, plusOne.bind(this), null, this);

		// Timers
		// Increase covid speed every 3 seconds
		var covidSpeedIncreaser = setInterval(increaseCovidSpeed, 3000);

		// Drop some toilet paper every so often
		var toiletPaperSpawnTimer = setInterval(spawnToiletPaper.bind(this), 3000);
	}

	function update () {
		// if (this.input.mousePointer.isDown) {
		// 	console.log(this.input.mousePointer.x)
		// }
		
		// Move man toward cursor
		if ( (this.input.x > game.man.body.x && this.input.x < game.man.body.x+game.man.displayWidth) && (this.input.y > game.man.body.y && this.input.y < game.man.body.y+game.man.displayHeight) ) {
			// Cursor/pointer is touching main character (man), so make the man stop
			game.man.body.velocity.setTo(0, 0);
		} else {
			// http://labs.phaser.io/view.html?src=src/physics\arcade\move%20to%20pointer.js
			this.physics.moveToObject(game.man, this.input.activePointer, game.data.manSpeed);
		}

		// Collision Code
		console.log(this.physics.world.overlap(game.man, game.toiletGroup));
	}

	// Drop a toilet paper roll from top of screen to bottom
	function spawnToiletPaper () {
		// Extra random delay
		setTimeout(function () {
			var toilet = game.toiletGroup.create(game.innerFrame.x + (window.innerWidth * getRandomArbitrary(0, 0.8)), -40, "toiletpaper");
			this.physics.add.existing(toilet);

			toilet.displayWidth = 40;
			toilet.displayHeight = 38;
			toilet.setGravity(0, 40);
			this.physics.add.overlap(game.man, game.toiletGroup, plusOne.bind(this), null, this);
		}, getRandomInt(0, 3000));
	}

	// Function runs every 3 seconds to increase speed of each covid
	function increaseCovidSpeed () {
		for (var i = 0; i < game.covidGroup.getChildren().length; i++) {
			game.covidGroup.getChildren()[i].body.velocity.x *= getRandomArbitrary(1.01, 1.1);
		}
		if (game.data.manSpeed < 400) {
			game.data.manSpeed *= (1.05, 1.1);
		}
	}

	// When man overlaps a toilet paper, add a point
	function plusOne () {
		console.log("test")
		var toiletx, toilety;
		for (var i = 0; i < game.toiletGroup.getChildren().length; i++) {
			toiletx = game.toiletGroup.getChildren()[i].body.x;
			toilety = game.toiletGroup.getChildren()[i].body.y;
			if (toiletx > game.man.body.x && toiletx < game.man.body.x+game.man.displayWidth) && (toilety > game.man.body.y && toilety < game.man.body.y+game.man.displayHeight) {
				// This toilet paper is touching the man
				debug && console.log("+1!");
			}
		}
	}

	// Function runs when man sprite overlaps a covid sprite
	function infected () {
		// Game Over! Man touched Covid
		debug && console.log("Game over!");
	}
});
