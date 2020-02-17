const storage = 'snake-game:previous-score';
const blockSize = 16;
const canvasSize = 800;
const boundariesReductionSize = 113;
const directions = {38: 'UP', 40: 'DOWN', 37: 'LEFT', 39: 'RIGHT'};
const oppositeDirections = {'DOWN': 'UP', 'LEFT': 'RIGHT', 'RIGHT': 'LEFT', 'UP': 'DOWN'};

const saveScore = (score) => localStorage.setItem(storage, score);

const getPreviousScore = () => localStorage.getItem(storage);

const playAgainButton = () => document.querySelector('.play');

const first = (items) => {
    items = [...items];

    if (items.length === 0) {
        return null;
    }

    return {...items[0]};
}

const updateDirection = (event, currentDirection, isChangingDirection) => {
    const selectedDirection = directions[event.keyCode];
    const opposite = oppositeDirections[currentDirection] === selectedDirection;

    if (isChangingDirection) {
        return [currentDirection, false];
    }

    if (! selectedDirection) {
        return [currentDirection, false];
    }

    if (opposite) {
        return [currentDirection, false];
    }

    return [selectedDirection, true];
}

const bootGame = () => {
    const button = playAgainButton();

    button.addEventListener('click', (event) => {
        button.classList.add('hidden');

        startGame();
    });

    startGame();
}

const renderRectangle = (id, x, y, width, height, fillColor, strokeCollor) => {
    const canvas = document.querySelector(id);
    const context = canvas.getContext('2d');

    context.beginPath();
    context.lineWidth = 1;
    context.fillStyle = fillColor;
    context.strokeStyle = strokeCollor;
    context.fillRect(x, y, width, height);
    context.rect(x, y, width, height);
    context.stroke();
}

const renderCircle = (id, x, y, fillColor, strokeCollor) => {
    const canvas = document.querySelector(id);
    const context = canvas.getContext('2d');

    const radius = blockSize / 2;

    context.beginPath();
    context.lineWidth = 1;
    context.fillStyle = fillColor;
    context.strokeStyle = strokeCollor;
    context.arc(x + radius, y + radius, radius, 0, 2 * Math.PI);
    context.fill();
    context.stroke();
}

const renderGameBoard = () => renderRectangle('#snake-game', 0, 0, canvasSize, canvasSize, '#f7fafc', '#718096');

const renderBoundaries = ({left, top, right, bottom}) => {
    right = right - left;
    bottom = bottom - top;

    renderRectangle('#snake-game', left, top, right, bottom, 'transparent', '#4a5568')
}

const renderSnake = (snake) => {
    snake.forEach((segment, index) => renderRectangle('#snake-game', segment.x, segment.y, blockSize, blockSize, '#4c51bf', '#a3bffa'));
}

const renderFood = (food) => {
    if (!food.visible) {
        return food = null;
    }

    renderCircle('#snake-game', food.x, food.y, '#feB2B2', '#9b2c2c');
}

const renderScore = (score) => {
    const scoreBoard = document.querySelector('#current-score');
    const scoreClass = score > getPreviousScore() ? 'gt-previous' : 'lt-previous';

    scoreBoard.innerHTML = `<span class='${scoreClass}'>Score: ${score}</span>`;
}

const moveSnake = (snake, currentDirection) => {
    const snakeHead = first(snake);
    const snakeTail = [...snake];

    snakeTail.pop();

    if (currentDirection === 'UP') {
        snakeHead.y -= blockSize;
    }

    if (currentDirection === 'DOWN') {
        snakeHead.y += blockSize;
    }

    if (currentDirection === 'LEFT') {
        snakeHead.x -= blockSize;
    }

    if (currentDirection === 'RIGHT') {
        snakeHead.x += blockSize;
    }

    return [snakeHead, ...snakeTail];
}

const generateRandomPoint = (min, max) => {
    const range = Math.floor(
        ((max - min) / blockSize) - 1
    );

    const minRange = Math.floor(min / blockSize)

    return Math.floor(Math.random() * range + minRange) * blockSize;
}

const createFood = (food, boundaries, snake) => {
    if (food && food.visible) {
        return food;
    }

    const isOnSnake = ({x, y}, sanke) => snake.some(segment => segment.x === x && segment.y === y);

    const x = generateRandomPoint(boundaries.left, boundaries.right);
    const y = generateRandomPoint(boundaries.top, boundaries.bottom);
    const duration = Math.floor(Math.random() * (10 - 4) + 4);

    food = {x, y, visible: true};

    if(isOnSnake(food, snake)) {
        food = null;

        return createFood(food, boundaries, snake);
    }

    setTimeout(() => food.visible = false, duration * 1000);

    return food;
}

const updateIfFoodWasEaten = (snake, food, score) => {
    if (!food) {
        return [snake, food, score];
    }

    if (!food.visible) {
        return [snake, food, score];
    }

    const snakeHead = first(snake);

    if (snakeHead.x === food.x && snakeHead.y === food.y) {
        food = null;
        score += 1;
        snake = [snakeHead, ...snake]
    }

    return [snake, food, score];
}

const removeBoundaryReductionPenalty = (boundary) => boundary - (boundary % blockSize);

const updateIfBoundaryWasHit = (snake, boundaries, currentDirection) => {
    const snakeHead = first(moveSnake(snake, currentDirection));
    let collisionDetected = false;

    if (snakeHead.y < removeBoundaryReductionPenalty(boundaries.top)) {
        boundaries.bottom -= boundariesReductionSize;
        collisionDetected = true;
    }

    if (snakeHead.y > removeBoundaryReductionPenalty(boundaries.bottom)) {
        boundaries.top += boundariesReductionSize;
        collisionDetected = true;
    }
    if (snakeHead.x < removeBoundaryReductionPenalty(boundaries.left)) {
        boundaries.right -= boundariesReductionSize;
        collisionDetected = true;
    }
    if (snakeHead.x > removeBoundaryReductionPenalty(boundaries.right)) {
        boundaries.left += boundariesReductionSize;
        collisionDetected = true;
    }

    if (collisionDetected) {
        currentDirection = oppositeDirections[currentDirection];

        snake = snake.reverse();
    }

    return [snake, boundaries, currentDirection];
}

const updateIfFoodOutsideBoundaries = (food, boundaries) => {
    if (!food) {
        return;
    }

    const outsideTop = food.y < removeBoundaryReductionPenalty(boundaries.top)
    const outsideBottom = food.y > removeBoundaryReductionPenalty(boundaries.bottom);
    const outsideLeft = food.x < removeBoundaryReductionPenalty(boundaries.left);
    const outsideRight = food.x > removeBoundaryReductionPenalty(boundaries.right);

    if (outsideTop || outsideBottom || outsideLeft || outsideRight) {
        return null;
    }

    return food;
}

const snakeHitSelf = (snake, currentDirection) => {
    const snakeHead = first(moveSnake(snake, currentDirection));
    const snakeTail = [...snake].slice(1);

    return snakeTail.some(segment => segment.x === snakeHead.x && segment.y === snakeHead.y);
}

const areBoundariesReducible = (boundaries) => {
    const hasHorizontalSpace = boundaries.left < boundaries.right - boundaries.left;
    const hasVerticalSpace = boundaries.top < boundaries.bottom - boundaries.top;

    return hasHorizontalSpace && hasVerticalSpace;
}

const checkIfGameHasEnded = (game, {snake, boundaries, currentDirection, currentScore}) => {
    let gameHasEnded = false;

    if (snakeHitSelf(snake, currentDirection)) {
        gameHasEnded = true;
    }

    if (! areBoundariesReducible(boundaries)) {
        gameHasEnded = true;
    }

    if (gameHasEnded) {
        clearInterval(game);
        saveScore(currentScore);
        playAgainButton().classList.remove('hidden'); 
    }
}

const startGame = () => {
    let food;
    let currentScore = 0;
    let currentDirection = 'LEFT';
    let isChangingDirection = false;
    let snake = [{x: 400, y: 400},];
    let boundaries = {top: 0, right: canvasSize, bottom: canvasSize, left: 0};

    document.addEventListener(
        'keydown', 
        (event) => [currentDirection, isChangingDirection] = updateDirection(event, currentDirection, isChangingDirection)
    );

    let game = setInterval(() => {
        isChangingDirection = false;
        renderGameBoard();
        [snake, boundaries, currentDirection] = updateIfBoundaryWasHit(snake, boundaries, currentDirection);
        [snake, food, currentScore] = updateIfFoodWasEaten(snake, food, currentScore);
        food = updateIfFoodOutsideBoundaries(food, boundaries);
        checkIfGameHasEnded(game, {snake, boundaries, currentDirection, currentScore});
        food = createFood(food, boundaries, snake);
        snake = moveSnake(snake, currentDirection);
        renderBoundaries(boundaries);
        renderFood(food);
        renderSnake(snake);
        renderScore(currentScore);
    }, 100);
}

document.addEventListener('DOMContentLoaded', bootGame);
