/*
Name:     Luke Martin
Class:    CPSC 332 - Web Dev
Semester: Fall 2022
Project:  Homework 5
Last Mod: November 6, 2022
Desc:     The file contains the Javscript for a basic breakout game using JS and a canvas.
Modified from https://github.com/end3r/Gamedev-Canvas-workshop
*/

var mainColor = "skyblue";
var secondaryColor = "grey";
var thirdColor = "white";
var fourthColor = "#0095DD";

window.onload = function () {
    const gameSpeedSlider = document.getElementById("gameSpeedSlider");
    const gameSpeedLabel = document.getElementById("gameSpeedLabel");
    const pauseButton = document.getElementById("pauseButton");
    const continueButton = document.getElementById("continueButton");
    const newGameButton = document.getElementById("newGameButton");
    const reloadButton = document.getElementById("reloadButton");


    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");
    const startMenuBorder = 15;
    ctx.textAlign = "center";

    var startButtonWidth = canvas.width / 2;
    var startButtonHeight = 50;
    var startButtonX = canvas.width / 2 - startButtonWidth / 2;
    var startButtonY = 150

    var ballRadius = 10;
    var x = canvas.width / 2;
    var y = canvas.height - 30;
    var dx = 2;
    var dy = -2;

    var paddleHeight = 10;
    var paddleWidth = 75;
    var paddleX = (canvas.width - paddleWidth) / 2;

    var rightPressed = false;
    var leftPressed = false;

    var brickRowCount = 5;
    var brickColumnCount = 3;
    var brickWidth = 75;
    var brickHeight = 20;
    var brickPadding = 10;
    var brickOffsetTop = 30;
    var brickOffsetLeft = 30;

    var animFrameId;
    var score = 0;
    var currentScore = 0;
    var highScore = 0;
    var lives = 3;
    var pause = true;
    var gameWon = false;
    var gameLost = false;

    var bricks = [];

    for (var c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (var r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }

    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    document.addEventListener("mousemove", mouseMoveHandler, false);
    gameSpeedSlider.addEventListener("input", adjustGameSpeed);

    function keyDownHandler(e) {
        if (e.keyCode == 39) {
            rightPressed = true;
        }
        else if (e.keyCode == 37) {
            leftPressed = true;
        }
    }

    function keyUpHandler(e) {
        if (e.keyCode == 39) {
            rightPressed = false;
        }
        else if (e.keyCode == 37) {
            leftPressed = false;
        }
    }

    function mouseMoveHandler(e) {
        let relativeX = e.clientX - canvas.offsetLeft;
        if (relativeX > 0 && relativeX < canvas.width) {
            paddleX = relativeX - paddleWidth / 2;
        }
    }

    function collisionDetection() {
        for (var c = 0; c < brickColumnCount; c++) {
            for (var r = 0; r < brickRowCount; r++) {
                var b = bricks[c][r];
                if (b.status == 1) {
                    if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                        dy = -dy;
                        b.status = 0;
                        score++;
                        if (score == brickRowCount * brickColumnCount) {
                            displayWin();
                            gameWon = true;
                            pause = true;
                            window.cancelAnimationFrame(animFrameId);
                        }
                    }
                }
            }
        }
    }

    function drawBall() {
        ctx.beginPath();
        ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = secondaryColor;
        ctx.fill();
        ctx.closePath();
    }

    function drawPaddle() {
        ctx.beginPath();
        ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
        ctx.fillStyle = fourthColor;
        ctx.fill();
        ctx.closePath();
    }

    function drawBricks() {
        for (var c = 0; c < brickColumnCount; c++) {
            for (var r = 0; r < brickRowCount; r++) {
                if (bricks[c][r].status == 1) {
                    var brickX = (r * (brickWidth + brickPadding)) + brickOffsetLeft;
                    var brickY = (c * (brickHeight + brickPadding)) + brickOffsetTop;
                    bricks[c][r].x = brickX;
                    bricks[c][r].y = brickY;
                    ctx.beginPath();
                    ctx.rect(brickX, brickY, brickWidth, brickHeight);
                    ctx.fillStyle = fourthColor;
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }
    }

    function drawScore() {
        ctx.font = "16px Arial";
        ctx.fillStyle = fourthColor;
        ctx.fillText("Score: " + score, 60, 20);
    }

    function drawLives() {
        ctx.font = "16px Arial";
        ctx.fillStyle = fourthColor;
        ctx.fillText("Lives: " + lives, canvas.width - 65, 20);
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBricks();
        drawBall();
        drawPaddle();
        drawScore();
        drawHighScore();
        drawLives();
        collisionDetection();

        if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
            dx = -dx;
        }
        if (y + dy < ballRadius) {
            dy = -dy;
        }
        else if (y + dy > canvas.height - ballRadius) {
            if (x > paddleX && x < paddleX + paddleWidth) {
                dy = -dy;
            }
            else {
                lives--;
                if (lives <= 0) {
                    displayLoss();
                    gameLost = true;
                    pause = true;
                    window.cancelAnimationFrame(animFrameId);
                }
                else {
                    x = canvas.width / 2;
                    y = canvas.height - 30;
                    paddleX = (canvas.width - paddleWidth) / 2;
                }
            }
        }

        if (rightPressed && paddleX < canvas.width - paddleWidth) {
            paddleX += 7;
        }
        else if (leftPressed && paddleX > 0) {
            paddleX -= 7;
        }

        //TODO: adjust speed
        x += dx;
        y += dy;

        //TODO: pause game check
        if (!pause) {
            animFrameId = requestAnimationFrame(draw);
        }
        else {
            window.cancelAnimationFrame(animFrameId);
        }
    }     

    //Drawing a high score
    function drawHighScore() {
        ctx.font = "16px Arial";
        ctx.fillStyle = "black";
        ctx.fillText("High Score: " + highScore, canvas.width / 2, 20);
    }

    // draw the menu screen, including labels and button
    function drawStartMenu() {
        
        setShadow();
        
        // draw the menu header
        ctx.beginPath();
        let menuWidth = canvas.width - 2*startMenuBorder;
        let menuHeight = canvas.height - 2*startMenuBorder;
        ctx.rect(startMenuBorder, startMenuBorder, menuWidth, menuHeight);
        ctx.fillStyle = secondaryColor;
        ctx.fill();
        ctx.closePath();

        ctx.font = "40px Arial";
        ctx.fillStyle = thirdColor;
        ctx.fillText("Breakout Game!", canvas.width / 2, 90);

        // start game button area
        ctx.beginPath();
        ctx.rect(startButtonX, startButtonY, startButtonWidth, startButtonHeight);
        ctx.fillStyle = mainColor;
        ctx.fill();
        ctx.closePath();

        resetShadow();

        ctx.font = "20px Arial";
        ctx.fillStyle = "black";
        ctx.fillText("Start Game", startButtonX + startButtonWidth / 2, startButtonY + 30);

        // event listener for clicking start
        // need to add it here because the menu should be able to come back after 
        // we remove the it later
        canvas.addEventListener("click", startGameClick);           
    }

    //function used to set shadow properties
    function setShadow() {
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = -3;
        ctx.shadowOffsetY = -3;
        ctx.shadowColor = "black";
    };

    //function used to reset shadow properties to 'normal'
    function resetShadow() {
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    };

    //function to clear the menu when we want to start the game
    function clearMenu() {
        //remove event listener for menu, 
        //we don't want to trigger the start game click event during a game
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.removeEventListener("click", startGameClick); 
    }

    //function to start the game
    //this should check to see if the player clicked the button
    //i.e., did the user click in the bounds of where the button is drawn
    //if so, we want to trigger the draw(); function to start our game
    function startGameClick(e) {
        let relX = e.clientX - canvas.offsetLeft;
        let relY = e.clientY - canvas.offsetTop;

        let buttonXStart = startButtonX;
        let buttonYStart = startButtonY;
        let buttonXEnd = buttonXStart + startButtonWidth;
        let buttonYEnd = buttonYStart + startButtonHeight;

        if (relX >= buttonXStart && relX <= buttonXEnd && relY >= buttonYStart && relY <= buttonYEnd) {
            pause = false;
            clearMenu();
            draw();
        }
    };

    //function to handle game speed adjustments when we move our slider
    function adjustGameSpeed() {
        let speed = gameSpeedSlider.value;
        gameSpeedLabel.innerText = "Game Speed: " + speed;            
        dx = (dx / dx) * speed * 2
        dy = (dy / dy) * speed * 2                 
    };

    //function to toggle the play/paused game state
    function togglePauseGame() {
        if (!(gameLost || gameWon)) {  
            pause = !pause;
            if (!pause) {
                draw();
            }
        }
    };

    pauseButton.addEventListener("click", togglePauseGame);

    function displayWin() {
        setShadow();

        ctx.font = "40px Arial";
        ctx.fillStyle = thirdColor;
        ctx.fillText("You Win!", canvas.width / 2, 140);
        ctx.fillText("Congratulations!", canvas.width / 2, 200);

        resetShadow();
    }

    function displayLoss() {
        setShadow();

        ctx.font = "40px Arial";
        ctx.fillStyle = thirdColor;
        ctx.fillText("Sorry! Game Over!", canvas.width / 2, 140);

        resetShadow();
    }

    //function to clear the board state and start a new game (no high score accumulation)
    function startNewGame() {
        resetBoard();
        currentScore = 0;
        highScore = 0;
        lives = 3;
        pause = true;
        draw();
    };

    newGameButton.addEventListener("click", startNewGame);
    reloadButton.addEventListener("click", () => document.location.reload());

    //function to reset the board and continue playing (accumulate high score)
    //should make sure we didn't lose before accumulating high score
    function continuePlaying() {
        if (gameWon) {
            currentScore += score;
            if (currentScore > highScore) {
                highScore = currentScore;
            }
            resetBoard();
            draw();
        }
        if (gameLost) {
            lives = 3;
            currentScore = 0;
            resetBoard();
            draw();

        }
    };

    continueButton.addEventListener("click", continuePlaying);

    //function to reset starting game info
    function resetBoard() {
        gameWon = false;
        gameLost = false;

        bricks = [];
        for (var c = 0; c < brickColumnCount; c++) {
            bricks[c] = [];
            for (var r = 0; r < brickRowCount; r++) {
                bricks[c][r] = { x: 0, y: 0, status: 1 };
            }
        }

        paddleX = (canvas.width - paddleWidth) / 2;
        score = 0;

        x = canvas.width / 2;
        y = canvas.height - 30;
        dx = Math.abs(dx);
        dy = -1 * Math.abs(dy);
    };

    //draw the menu.
    //we don't want to immediately draw... only when we click start game            
    
    
    drawStartMenu();
    // draw();

};//end window.onload function