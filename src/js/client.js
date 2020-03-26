"use strict"; /* eslint-env browser */ /* global */ /* eslint no-warning-comments: [1, { "terms": ["todo", "fix", "help"], "location": "anywhere" }] */

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Navbar Burger
$(document).ready(function () {
	$(".overlay").text("bob");

	var game = {};
	var config = {
		type: Phaser.AUTO,
		width: (window.innerWidth * window.devicePixelRatio) * 1,
		height: (window.innerHeight * window.devicePixelRatio) * 1,
		parent: "game",
		backgroundColor: 0xFFFFFF,
		physics: {
			default: "arcade",
			arcade: {
				debug: false,
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
		this.load.image("covid", "assets/img/covid1.png");
		this.load.image("man", "assets/img/man.png");
	}

	function create () {
		// this.add.image(400, 300, "sky");
		// var particles = this.add.particles("red");
		// var emitter = particles.createEmitter({
		// 	speed: 100,
		// 	scale: { start: 1, end: 0 },
		// 	blendMode: "ADD"
		// });

		game.covid = this.physics.add.image(400, 100, "covid");
		game.covid.displayWidth = 30;
		game.covid.displayHeight = 30;
		game.covid.setVelocity(getRandomInt(200, 300), getRandomInt(200, 300));
		game.covid.setBounce(1, 1);
		game.covid.setCollideWorldBounds(true);
		game.covid.setGravity(0, 0);
		// emitter.startFollow(game.covid);
		
		game.man = this.physics.add.image(20, 20, "man");
		game.man.displayWidth = 58;
		game.man.displayHeight = 102;
		game.man.setCollideWorldBounds(true);
		game.man.setGravity(0, 0);

		// http://phaser.io/tutorials/making-your-first-phaser-3-game/part8
		this.physics.add.collider(game.man, game.covid);
		this.physics.add.overlap(game.man, game.covid, infected, null, this);
	}

	function update () {
		// if (this.input.mousePointer.isDown) {
		// 	console.log(this.input.mousePointer.x)
		// }
		
		if ( (this.input.x > game.man.body.x && this.input.x < game.man.body.x+game.man.displayWidth) && (this.input.y > game.man.body.y && this.input.y < game.man.body.y+game.man.displayHeight) ) {
			// Cursor/pointer is touching main character (man), so make the man stop
			game.man.body.velocity.setTo(0, 0);
		} else {
			// http://labs.phaser.io/view.html?src=src/physics\arcade\move%20to%20pointer.js
			this.physics.moveToObject(game.man, this.input.activePointer, 300);
		}
	}

	function infected () {
		// game.man.setVisibility(false);
	}
});
