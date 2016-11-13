function SnakeGame(control, canvas, options) {
	var options = defaultOptions(options);

	var ctx = canvas.getContext("2d");
	var w = canvas.clientWidth;
	var h = canvas.clientHeight;
	var cw = options.cellWidth;
	var direction = options.direction;

	var snake = [];
	var food;
	var portalA;
	var portalB;
	var poison = [];
	var isGameOver;
	var score;
	var author = 'Avdeev Andrew';

	this.isGameOver = false;
	this.isGameStopped = false;
	this.isGamePaused = false;

	var fps = options.fps;
	var fpsInterval = 1000 / fps;

	var now, then, elapsed;

	function defaultOptions(o) {
		if (o === undefined) o = {};
		//rendering options
		if (o.r === undefined) o.r = 255;
		if (o.g === undefined) o.g = 255;
		if (o.b === undefined) o.b = 255;
		if (o.alphaDecreaseLevel === undefined) o.alphaDecreaseLevel = 1;
		if (o.backgroundColor === undefined) o.backgroundColor = 'black';
		if (o.backgroundStrokeColor === undefined) o.backgroundStrokeColor = 'white';
		if (o.cellStrokeColor === undefined) o.cellStrokeColor = 'black';
		if (o.foodColor === undefined) o.foodColor = 'white';
		if (o.portalColor === undefined) o.portalColor = 'blue';
		if (o.poisonColor === undefined) o.poisonColor = 'red';
		if (o.textColor === undefined) o.textColor = 'white';
		//game mechanic options
		if (o.fps === undefined) o.fps = 10;
		if (o.fpsIncreaseLevel === undefined) o.fpsIncreaseLevel = 2;
		if (o.fpsIncreaseValue === undefined) o.fpsIncreaseValue = 10;

		if (o.increaseDifficultyLevel === undefined) o.increaseDifficultyLevel = 5;

		if (o.portalsRate === undefined) o.portalsRate = 2;
		if (o.poisonRate === undefined) o.poisonRate = 1;

		if (o.direction === undefined) o.direction = 'r';
		if (o.headX === undefined) o.headX = 10;
		if (o.headY === undefined) o.headY = 0;
		if (o.length === undefined) o.length = 5;

		if (o.cellWidth === undefined) o.cellWidth = 10;
		if (o.scoreX === undefined) o.scoreX = canvas.clientWidth / 2 - 20;
		if (o.scoreY === undefined) o.scoreY = canvas.clientHeight / 2;

		if (o.authorX === undefined) o.authorX = 10;
		if (o.authorY === undefined) o.authorY = canvas.clientHeight - 10;
		if (o.authorDuration === undefined) o.authorDuration = 2000;

		if (o.helpX === undefined) o.helpX = canvas.clientWidth * 4 / 5;
		if (o.helpY === undefined) o.helpY = canvas.clientHeight - 10;
		if (o.helpDuration === undefined) o.helpDuration = 4000;

		return o;
	}


	function Snake(x, y, length, d) {
		var array = new Array(length);
		for (var i = 0; i < length; i++) {
			if (d == 'r') array[i] = { x: x - i, y: y };
			else if (d == 'l') array[i] = { x: x + i, y: y };
			else if (d == 'u') array[i] = { x: x, y: y - i };
			else if (d == 'd') array[i] = { x: x, y: y + i };
		}
		return array;
	}

	function Food() {
		return {
			x: Math.round(Math.random() * (w - cw) / cw),
			y: Math.round(Math.random() * (h - cw) / cw),
		};
	}
	function Portal() {
		return {
			x: Math.round(Math.random() * (w - cw) / cw),
			y: Math.round(Math.random() * (h - cw) / cw),
		};
	}
	function Poison() {
		return {
			x: Math.round(Math.random() * (w - cw) / cw),
			y: Math.round(Math.random() * (h - cw) / cw),
		};
	}

	function random(min, max) {
		return Math.round(Math.random() * (max - min)) + min;
	}
	function checkCollision(x, y, array) {
		var isCollide = false;
		var i = -1;
		while (!isCollide && ++i < array.length) if (array[i].x == x && array[i].y == y) isCollide = true;
		return isCollide;
	}

	function update() {
		var nx = snake[0].x;
		var ny = snake[0].y;

		if (direction == 'r') nx++;
		else if (direction == 'l') nx--;
		else if (direction == 'u') ny--;
		else if (direction == 'd') ny++;

		if (nx == -1
			|| nx == w / cw
			|| ny == -1
			|| ny == h / cw
			|| checkCollision(nx, ny, snake)
			|| checkCollision(nx, ny, poison)) isGameOver = true;

		var tail;
		if (nx == food.x && ny == food.y) {
			tail = { x: nx, y: ny };
			score++;
			food = Food();
		}
		else {
			tail = snake.pop();
			tail.x = nx; tail.y = ny;
		}
		snake.unshift(tail);

		if (score >= options.increaseDifficultyLevel) {
			//poison creation
			if (random(0, 10) >= 10 / options.poisonRate) poison.push(Poison());
			//portal creation
			if (portalA.x < 0 && portalB.x < 0) {
				if (random(0, 10) >= 10 / options.portalsRate) {
					portalA = Portal();
					portalB = Portal();
				}
			}

			var nx = snake[0].x;
			var ny = snake[0].y;
			if (nx == portalA.x && ny == portalA.y) {
				head = { x: portalB.x, y: portalB.y };
				score++;
				snake.unshift(head);
				portalA.x = -cw;
				portalA.y = -cw;
				portalB.x = -cw;
				portalB.y = -cw;
			}
			if (nx == portalB.x && ny == portalB.y) {
				head = { x: portalA.x, y: portalA.y };
				score++;
				snake.unshift(head);
				portalA.x = -cw;
				portalA.y = -cw;
				portalB.x = -cw;
				portalB.y = -cw;
			}
		}

		if (score + 1 % options.fpsIncreaseLevel == 0) fpsInterval = 1000 / (fps + options.fpsIncreaseValue);
	}

	function drawCell(x, y, color) {
		ctx.fillStyle = color;
		ctx.fillRect(x * cw, y * cw, cw, cw);
		ctx.strokeStyle = options.cellStrokeColor;
		ctx.strokeRect(x * cw, y * cw, cw, cw);
	}

	function render() {
		//background rendering
		ctx.font = "11px Arial";
		ctx.fillStyle = options.backgroundColor;
		ctx.fillRect(0, 0, w, h);
		ctx.strokeStyle = options.backgroundStrokeColor;
		ctx.strokeRect(0, 0, w, h);
		//snake rendering
		for (var i = 0; i < snake.length; i++) {
			drawCell(snake[i].x, snake[i].y, 'rgba(' + options.r + ',' + options.g + ',' + options.b + ',' + (1 - i / (options.alphaDecreaseLevel + snake.length)) + ')');
		}
		//food rendering
		drawCell(food.x, food.y, options.foodColor);
		//portals rendering
		drawCell(portalA.x, portalA.y, options.portalColor);
		drawCell(portalB.x, portalB.y, options.portalColor);
		//poison rendering
		for (var i = 0; i < poison.length; i++) {
			drawCell(poison[i].x, poison[i].y, options.poisonColor);
		}
		//score rendering
		ctx.fillStyle = options.textColor;
		var scoreText = "Score: " + score;
		ctx.fillText(scoreText, options.scoreX, options.scoreY);
		//author rendering
		if (now - startTime < options.authorDuration) ctx.fillText('Made by ' + author, options.authorX, options.authorY);
		//help rendering
		if (now - startTime < options.helpDuration) {
			var nextLineMargin = 10;
			var nextLineCounter = 0;
			var helpText1 = "controls: arrows";
			var helpText2 = options.poisonColor + ": poison";
			var helpText3 = options.portalColor + ": teleport";
			var helpText4 = "p: pause";

			ctx.fillText(helpText4, options.helpX, options.helpY - nextLineMargin * nextLineCounter++);
			ctx.fillText(helpText3, options.helpX, options.helpY - nextLineMargin * nextLineCounter++);
			ctx.fillText(helpText2, options.helpX, options.helpY - nextLineMargin * nextLineCounter++);
			ctx.fillText(helpText1, options.helpX, options.helpY - nextLineMargin * nextLineCounter++);
		}
	}

	function gameLoop() {
		now = Date.now();
		elapsed = now - then;

		if (!isGamePaused) {
			if (!isGameOver) {
				if (elapsed > fpsInterval) {
					then = now - (elapsed % fpsInterval);
					update();
					render();
				}
			}
		} else {
			//pause render
			ctx.font = "20px Arial";
			ctx.fillStyle = options.textColor;
			ctx.fillText("pause", 10, 20);
		}

		if (isGameOver) this.start();
		if (!isGameStopped) requestAnimationFrame(gameLoop);
	}

	function arrowControls(e) {
		var key = e.keyCode;
		switch (key) {
			case 37:
				if (direction != 'r') direction = 'l';
				break;
			case 38:
				if (direction != 'd') direction = 'u';
				break;
			case 39:
				if (direction != 'l') direction = 'r';
				break;
			case 40:
				if (direction != 'u') direction = 'd';
				break;
			case 80:
				isGamePaused = !isGamePaused;
				break;
		}
	}

	function enableControls(domElement) {
		domElement.addEventListener("keydown", arrowControls);
	}

	this.start = function () {
		score = 0;
		fps = options.fps;
		direction = options.direction;
		isGameOver = false;
		isGameStopped = false;
		isGamePaused = false;
		control.addEventListener("keydown", arrowControls);

		snake = Snake(options.headX, options.headY, options.length, options.direction);
		food = Food();
		portalA = { x: -cw, y: -cw };
		portalB = { x: -cw, y: -cw };
		poison = [];

		then = Date.now();
		startTime = then;

		requestAnimationFrame(gameLoop);
	}
	this.stop = function () {
		isGameStopped = true;
		control.removeEventListener("keydown", arrowControls);
	}
	this.pause = function () {
		isGamePaused = true;
	}
	this.resume = function () {
		isGamePaused = false;
	}

	return this;
}