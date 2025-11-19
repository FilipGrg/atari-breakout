
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");


const STATE_START = "start";
const STATE_PLAYING = "playing";
const STATE_GAME_OVER = "gameover";

let gameState = STATE_START;


const brickRowCount = 5;
const brickColumnCount = 10;
const brickPaddingX = 30;    
const brickPaddingY = 15;   
const brickOffsetTop = 80;   
const brickOffsetLeft = 40;  

let brickWidth;
let brickHeight = 20;


const brickRowColors = [
    "rgb(153,51,0)",    
    "rgb(255,0,0)",     
    "rgb(255,153,204)", 
    "rgb(0,255,0)",     
    "rgb(255,255,153)"  
];


let bricks = [];


const ballSize = 10;
let ballX, ballY, ballDX, ballDY;
const ballSpeed = 4;


let paddleWidth = 80;
let paddleHeight = 12;
let paddleX;
const paddleY = canvas.height - 40;
const paddleSpeed = 7;


let rightPressed = false;
let leftPressed = false;


let score = 0;
let highScore = 0;



function init() {
    
    brickWidth = (canvas.width - 2 * brickOffsetLeft
        - (brickColumnCount - 1) * brickPaddingX) / brickColumnCount;

    
    brickWidth = Math.floor(brickWidth);

    loadHighScore();
    resetGameObjects();
    createBricks();
    registerEventListeners();

    requestAnimationFrame(gameLoop);
}

function resetGameObjects() {
    paddleX = (canvas.width - paddleWidth) / 2;

    ballX = canvas.width / 2 - ballSize / 2;
    ballY = paddleY - ballSize - 2;

    
    const dir = Math.random() < 0.5 ? -1 : 1;
    ballDX = dir * ballSpeed;
    ballDY = -ballSpeed;
}

function createBricks() {
    bricks = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[r] = [];
        for (let c = 0; c < brickColumnCount; c++) {
            const x = brickOffsetLeft + c * (brickWidth + brickPaddingX);
            const y = brickOffsetTop + r * (brickHeight + brickPaddingY);
            bricks[r][c] = {
                x: x,
                y: y,
                status: 1,          
                color: brickRowColors[r]
            };
        }
    }
}



function registerEventListeners() {
    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);
}

function keyDownHandler(e) {
    if (e.code === "ArrowRight" || e.code === "KeyD") {
        rightPressed = true;
    } else if (e.code === "ArrowLeft" || e.code === "KeyA") {
        leftPressed = true;
    } else if (e.code === "Space") {
        
        if (gameState === STATE_START) {
            gameState = STATE_PLAYING;
        } else if (gameState === STATE_GAME_OVER) {
            
            score = 0;
            createBricks();
            resetGameObjects();
            gameState = STATE_PLAYING;
        }
    }
}

function keyUpHandler(e) {
    if (e.code === "ArrowRight" || e.code === "KeyD") {
        rightPressed = false;
    } else if (e.code === "ArrowLeft" || e.code === "KeyA") {
        leftPressed = false;
    }
}


function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    if (gameState !== STATE_PLAYING) return;

   
    if (rightPressed) {
        paddleX += paddleSpeed;
        if (paddleX + paddleWidth > canvas.width) {
            paddleX = canvas.width - paddleWidth;
        }
    } else if (leftPressed) {
        paddleX -= paddleSpeed;
        if (paddleX < 0) {
            paddleX = 0;
        }
    }

   
    ballX += ballDX;
    ballY += ballDY;

    
    if (ballX <= 0) {
        ballX = 0;
        ballDX = -ballDX;
    } else if (ballX + ballSize >= canvas.width) {
        ballX = canvas.width - ballSize;
        ballDX = -ballDX;
    }

    
    if (ballY <= 0) {
        ballY = 0;
        ballDY = -ballDY;
    }

    
    if (
        ballY + ballSize >= paddleY &&
        ballY + ballSize <= paddleY + paddleHeight &&
        ballX + ballSize >= paddleX &&
        ballX <= paddleX + paddleWidth
    ) {
        ballY = paddleY - ballSize; 
        ballDY = -Math.abs(ballDY); 

        
        const hitPoint = (ballX + ballSize / 2) - (paddleX + paddleWidth / 2);
        const normalised = hitPoint / (paddleWidth / 2);
        ballDX = normalised * ballSpeed;
    }

   
    brickCollisionCheck();

   
    if (ballY > canvas.height) {
        gameOver();
    }
}


function brickCollisionCheck() {
    for (let r = 0; r < brickRowCount; r++) {
        for (let c = 0; c < brickColumnCount; c++) {
            const b = bricks[r][c];
            if (b.status === 1) {
                if (
                    ballX < b.x + brickWidth &&
                    ballX + ballSize > b.x &&
                    ballY < b.y + brickHeight &&
                    ballY + ballSize > b.y
                ) {
                    
                    b.status = 0;
                    score += 1;
                    updateHighScore();

                    
                    ballDY = -ballDY;

                    return; 
                }
            }
        }
    }
}


function draw() {
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

  
    ctx.fillStyle = "rgb(200,200,200)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawBricks();
    drawPaddle();
    drawBall();
    drawScore();

    if (gameState === STATE_START) {
        drawStartScreenText();
    } else if (gameState === STATE_GAME_OVER) {
        drawGameOverText();
    }
}

function drawBricks() {
    for (let r = 0; r < brickRowCount; r++) {
        for (let c = 0; c < brickColumnCount; c++) {
            const b = bricks[r][c];
            if (b.status === 1) {
                
                ctx.fillStyle = b.color;
                ctx.fillRect(b.x, b.y, brickWidth, brickHeight);

              
                ctx.fillStyle = "rgba(255,255,255,0.35)";
                ctx.fillRect(b.x + 2, b.y + 2, brickWidth - 4, brickHeight / 2 - 2);

                
                ctx.strokeStyle = "rgba(0,0,0,0.6)";
                ctx.strokeRect(b.x, b.y, brickWidth, brickHeight);
            }
        }
    }
}

function drawPaddle() {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(paddleX, paddleY, paddleWidth, paddleHeight);
}

function drawBall() {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(ballX, ballY, ballSize, ballSize);
}

function drawScore() {
    ctx.fillStyle = "#000000";
    ctx.font = "16px Verdana, Helvetica, Arial, sans-serif";
    ctx.textBaseline = "top";

   
    ctx.textAlign = "left";
    ctx.fillText("Bodovi: " + score, 20, 20);

   
    ctx.textAlign = "right";
    ctx.fillText("Rekord: " + highScore, canvas.width - 100, 20);
}

function drawStartScreenText() {
    ctx.fillStyle = "#000000";
    ctx.font = "bold 36px Verdana, Helvetica, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

   
    ctx.fillText("BREAKOUT", canvas.width / 2, canvas.height / 2 - 10);

    ctx.font = "italic bold 18px Verdana, Helvetica, Arial, sans-serif";
    ctx.fillText("Press SPACE to begin", canvas.width / 2, canvas.height / 2 + 20);
}

function drawGameOverText() {
    ctx.fillStyle = "yellow";
    ctx.font = "bold 40px Verdana, Helvetica, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    
    ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 10);

    ctx.font = "italic 20px Verdana, Helvetica, Arial, sans-serif";
    ctx.fillText("Pritisni SPACE za novu igru", canvas.width / 2, canvas.height / 2 + 25);
}



function loadHighScore() {
    const value = localStorage.getItem("breakoutHighScore");
    if (value !== null) {
        highScore = parseInt(value, 10) || 0;
    } else {
        highScore = 0;
    }
}

function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem("breakoutHighScore", String(highScore));
    }
}

function gameOver() {
    gameState = STATE_GAME_OVER;
}


init();
