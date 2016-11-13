(function (window) {
	var canvas = window.document.getElementById("canvas");
	var snakeGame = SnakeGame(document, canvas);

	snakeGame.start();
	canvas.onclick = function () {
		if (!snakeGame.isGameStopped) {
			snakeGame.stop();
		}
		else {
			snakeGame.start();
		}
	}
}(window))