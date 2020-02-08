const canvasSize = 800;

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

const startGame = () => {
    let boundaries = {top: 0, right: canvasSize, bottom: canvasSize, left: 0};

    let game = setInterval(() => {
        renderGameBoard();
        renderBoundaries(boundaries);
    }, 100);
}

document.addEventListener('DOMContentLoaded', bootGame);
