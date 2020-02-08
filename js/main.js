const blockSize = 16;
const canvasSize = 800;
const directions = {38: 'UP', 40: 'DOWN', 37: 'LEFT', 39: 'RIGHT'};
const oppositeDirections = {'DOWN': 'UP', 'LEFT': 'RIGHT', 'RIGHT': 'LEFT', 'UP': 'DOWN'};

const first = (items) => {
    items = [...items];

    if (items.length === 0) {
        return null;
    }

    return {...items[0]};
}

const updateDirection = (event, currentDirection, isChanginDirection) => {
    const selectedDirection = directions[event.keyCode];
    const opposite = oppositeDirections[currentDirection] === selectedDirection;

    if (isChanginDirection) {
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
    startGame();
}

const renderRectanble = (id, x, y, width, height, fillColor, strokeCollor) => {
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

const renderGameBoard = () => renderRectanble('#snake-game', 0, 0, canvasSize, canvasSize, '#f7fafc', '#718096')

const renderBoundaries = ({left, top, right, bottom}) => {
    right = right - left;
    bottom = bottom - top;

    renderRectanble('#snake-game', left, top, right, bottom, '#f7fafc', '#4a5568')
}

const renderSnake = (snake) => {
    snake.forEach((segment, index) => renderRectanble('#snake-game', segment.x, segment.y, blockSize, blockSize, '#4c51bf', '#a3bffa'));
}

const renderFood = (food) => {
    if (!food.visible) {
        return food = null;
    }

    renderCircle('#snake-game', food.x, food.y, '#feB2B2', '#9b2c2c');
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

        console.log('was in snake');
        return createFood(food, boundaries, snake);
    }

    setTimeout(() => food.visible = false, duration * 1000);

    return food;
}

const startGame = () => {
    let food;
    let currentDirection = 'LEFT';
    let isChanginDirection = false;
    let snake = [{x: 400, y: 400},];
    let boundaries = {top: 0, right: canvasSize, bottom: canvasSize, left: 0};

    document.addEventListener(
        'keydown', 
        (event) => [currentDirection, isChanginDirection] = updateDirection(event, currentDirection, isChanginDirection)
    );

    let game = setInterval(() => {
        isChanginDirection = false;
        renderGameBoard();
        food = createFood(food, boundaries, snake);
        snake = moveSnake(snake, currentDirection);
        renderBoundaries(boundaries);
        renderFood(food);
        renderSnake(snake);
    }, 100);
}

document.addEventListener('DOMContentLoaded', bootGame);
