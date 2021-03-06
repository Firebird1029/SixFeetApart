"use strict"; /* eslint-env browser */ /* global */ /* eslint no-warning-comments: [1, { "terms": ["todo", "fix", "help"], "location": "anywhere" }] */
const debug = false;
var gameStopped, highScore, startCursorMovement = false;
// Phaser
	var game = {};
	game.data = {};

// Navbar Burger
$(document).ready(function () {
	// Get high score
	if (localStorage.getItem("sixFeetApartHighScore")) {
		highScore = localStorage.getItem("sixFeetApartHighScore");
	} else {
		highScore = 0;
	}

	// Set Random Game Over Message
	var randomGameOverMsgs = ["Crikey!", "Oh no!", "Yikes!", "Oops-a-daisy!", "Ouch!", "Ruh roh!", "Heavens, no."]
	$("#gameOverText").text(randomGameOverMsgs[_.random(0, randomGameOverMsgs.length-1)] + " You've been hit!");

	// Phaser
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

	// Start Game
	$("#startGameBtn").click(function () {
		var gameContainer = new Phaser.Game(config);
		$("#startGameScreen").remove();
	});

	function preload () {
		this.load.image("bg", "assets/img/bg1.jpg");
		this.load.image("man", "assets/img/man.png");
		this.load.image("covid", "assets/img/covid1.png");
		this.load.image("toiletpaper", "assets/img/toiletpaper.png");
		// this.load.image("red", "assets/img/redParticle.png");
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
		
		// Background Image
		// game.bg = this.add.image(0, 0, "bg");
		// game.bg.displayHeight = window.innerHeight * window.devicePixelRatio;
		// game.bg.displayWidth = window.innerWidth * window.devicePixelRatio;
		// game.bg.smoothed = false;
		
		// Scoreboard
		game.score = 0;
		game.scoreText = this.add.text(20, 20, "Score: 0", {color: "#000"});
		game.highScoreText = this.add.text(20, 40, "High Score: " + highScore, {color: "#000"});
		
		// Main Character, the Man
		game.man = this.physics.add.image(window.innerWidth / 2, window.innerHeight / 2, "man");
		game.man.displayWidth = 58;
		game.man.displayHeight = 102;
		// game.man.body.setSize(200, 470);
		// game.man.body.setOffset(40, 10);
		game.man.setCollideWorldBounds(true);
		game.man.setGravity(0, 0);
		game.man.setVelocity(0, 0);
		// game.man.setAcceleration(200, 200);
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
			covid.body.setCircle(90, 40, 40); // Why is radius (100) > display size??
			covid.setVelocity(_.random(100, 200), _.random(100, 200));
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
		!debug && this.physics.add.overlap(game.man, game.covidGroup, infected.bind(null, this), null, this);

		// Timers
		// Increase covid speed every 2 seconds
		game.covidSpeedIncreaser = setInterval(increaseCovidSpeed, 2000);

		// Drop some toilet paper every so often
		game.toiletPaperSpawnTimer = setInterval(spawnToiletPaper.bind(null, this), 3000);

		// Fix glitch where man starts moving before cursor at start of game
		this.input.on("pointermove", function () {
			startCursorMovement = true;
		});
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
			if (startCursorMovement && !gameStopped) {
				this.physics.moveToObject(game.man, this.input.activePointer, game.data.manSpeed);
			}
		}
	}

	// Score Tracking Functionality
	function updateScore () {
		game.score++;
		game.scoreText.text = "Score: " + game.score;
		if (game.score > highScore) {
			highScore = game.score;
			localStorage.setItem("sixFeetApartHighScore", highScore);
			game.highScoreText.text = "High Score: " + highScore;
		}
	}

	// Drop a toilet paper roll from top of screen to bottom
	function spawnToiletPaper (phaserObj) {
		// Extra random delay
		setTimeout(function () {
			var toilet = game.toiletGroup.create(game.innerFrame.x + (window.innerWidth * _.random(0, 0.8)), -40, "toiletpaper");
			!gameStopped && phaserObj.physics.add.existing(toilet); // Make sure game is still running, since the setInterval might have started right before game ended

			toilet.displayWidth = 40;
			toilet.displayHeight = 38;
			toilet.setGravity(0, 40);

			// Collision Detection -- when collision happens with this instance of toilet paper, then remove it & update score
			phaserObj.physics.add.overlap(game.man, toilet, function () {
				toilet.destroy(); // Get rid of the toilet paper sprite
				updateScore();
			}, null, this);
		}, _.random(0, 3000));
	}

	// Function runs every 3 seconds to increase speed of each covid
	function increaseCovidSpeed () {
		for (var i = 0; i < game.covidGroup.getChildren().length; i++) {
			game.covidGroup.getChildren()[i].body.velocity.x *= _.random(1.01, 1.1);
			game.covidGroup.getChildren()[i].body.velocity.y *= _.random(1.01, 1.1);
		}
		if (game.data.manSpeed < 400) {
			game.data.manSpeed *= (1.05, 1.1);
		}
	}

	// Function runs when man sprite overlaps a covid sprite
	function infected (phaserObj) {
		// Game Over! Man touched Covid
		debug && console.log("Game over!");
		gameStopped = true;
		// Kill the Timers
		clearInterval(game.covidSpeedIncreaser);
		clearInterval(game.toiletPaperSpawnTimer);

		// Stop all Movement
		game.man.body.acceleration.setTo(0, 0);
		game.man.body.velocity.setTo(0, 0);
		for (var i = 0; i < game.toiletGroup.getChildren().length; i++) {
			game.toiletGroup.getChildren()[i].body.velocity.x = 0;
			game.toiletGroup.getChildren()[i].body.velocity.y = 0;
			game.toiletGroup.getChildren()[i].body.gravity.setTo(0, 0);
		}
		for (var i = 0; i < game.covidGroup.getChildren().length; i++) {
			if (!phaserObj.physics.overlap(game.man, game.covidGroup.getChildren()[i])) {
				// For all the covids that are NOT touching the man, destroy them
				game.covidGroup.getChildren()[i].destroy();
			} else {
				// For the covid touching the man, stop it from moving
				game.covidGroup.getChildren()[i].body.velocity.x = 0;
				game.covidGroup.getChildren()[i].body.velocity.y = 0;
			}
		}

		// Show Game Over Screen
		$("#gameOverScreen").removeClass("is-hidden");
	}
});
