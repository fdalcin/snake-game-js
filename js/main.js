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

const renderGameBoard = () => renderRectanble('#snake-game', 0, 0, canvasSize, canvasSize, '#f7fafc', '#718096')

const renderBoundaries = ({left, top, right, bottom}) => {
    right = right - left;
    bottom = bottom - top;

    renderRectanble('#snake-game', left, top, right, bottom, '#f7fafc', '#4a5568')
}

const renderSnake = (snake) => {
    snake.forEach((segment, index) => renderRectanble('#snake-game', segment.x, segment.y, blockSize, blockSize, '#4c51bf', '#a3bffa'));
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

const startGame = () => {
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
        snake = moveSnake(snake, currentDirection);
        renderBoundaries(boundaries);
        renderSnake(snake);
    }, 100);
}

document.addEventListener('DOMContentLoaded', bootGame);
