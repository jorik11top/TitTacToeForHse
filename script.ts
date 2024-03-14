enum Player {
    Human = 'X',
    Bot = 'O'
}

type Board = (Player | null)[];
let currentMode: 'vsBot' | 'vsPlayer' ;
const winningCombos: number[][] = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

let currentPlayer: Player = Player.Human;
let board: Board = [];
for (let i = 0; i < 9; i++) {
    board.push(null);
}
let gameOver: boolean = false;

const resultDisplay = document.getElementById('result') as HTMLDivElement;
const gameContainer = document.getElementById('gameContainer') as HTMLDivElement;
resultDisplay.innerText = "Результат: ";
function startGameWithBot() {
    currentMode = 'vsBot';

    startGame(handleClickWithBot);
}

function startGameWithPlayer() {
    currentMode = 'vsPlayer';
    startGame(handleClick);
}

function startGame(clickHandler: (event: MouseEvent) => void) {
    const boardElement = document.getElementById('board') as HTMLDivElement;
    boardElement.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = String(i);
        cell.addEventListener('click', clickHandler);
        boardElement.appendChild(cell);
    }
    render();
}

function handleClickWithBot(event: MouseEvent) {
    const index = parseInt((event.target as HTMLDivElement).dataset.index);
    if (board[index] === null && !gameOver && currentPlayer === Player.Human) {
        board[index] = currentPlayer;
        if (checkWinner()) {
            gameOver = true;
            resultDisplay.innerText += `${currentPlayer} выиграл!`;
        } else if (board.every(cell => cell !== null)) {
            gameOver = true;
            resultDisplay.innerText += 'Ничья!';
        } else {
            currentPlayer = Player.Bot;
            setTimeout(botMove, 500);
        }
        render();
    }
}

function handleClick(event: MouseEvent) {
    const index = parseInt((event.target as HTMLDivElement).dataset.index);
    if (board[index] === null && !gameOver) {
        board[index] = currentPlayer;
        if (checkWinner()) {
            gameOver = true;
            resultDisplay.innerText += `${currentPlayer} выиграл!`;
        } else if (board.every(cell => cell !== null)) {
            gameOver = true;
            resultDisplay.innerText += 'Ничья!';
        } else {
            currentPlayer = currentPlayer === Player.Human ? Player.Bot : Player.Human;
        }
        render();
    }
}

function botMove() {
    let bestScore = -Infinity;
    let move;
    for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
            board[i] = Player.Bot;
            const score = minimax(board, 0, false);
            board[i] = null;
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }
    board[move] = Player.Bot;
    if (checkWinner()) {
        gameOver = true;
        resultDisplay.innerText += `${currentPlayer} выиграл!`;
    } else if (board.every(cell => cell !== null)) {
        gameOver = true;
        resultDisplay.innerText += 'Ничья!';
    } else {
        currentPlayer = currentPlayer === Player.Human ? Player.Bot : Player.Human;
    }
    render();
}

function minimax(board: Board, depth: number, isMaximizing: boolean): number {
    if (checkWinner()) {
        return isMaximizing ? -10 + depth : 10 - depth;
    } else if (board.every(cell => cell !== null)) {
        return 0;
    }

    const player = isMaximizing ? Player.Bot : Player.Human;
    let bestScore = isMaximizing ? -Infinity : Infinity;

    for (let i = 0; i < board.length; i++) {
        if (board[i] === null) {
            board[i] = player;
            const score = minimax(board, depth + 1, !isMaximizing);
            board[i] = null;
            bestScore = isMaximizing ? Math.max(score, bestScore) : Math.min(score, bestScore);
        }
    }

    return bestScore;
}

function checkWinner(): boolean {
    for (const combo of winningCombos) {
        const [a, b, c] = combo;
        if (board[a] !== null && board[a] === board[b] && board[a] === board[c]) {
            return true;
        }
    }
    return false;
}

function render() {
    const cells = document.querySelectorAll('.cell') as NodeListOf<HTMLDivElement>;
    cells.forEach((cell, index) => {
        cell.innerText = board[index] || '';
    });
}

function restartGame(clickHandler: (event: MouseEvent) => void) {
    board = [];
    for (let i = 0; i < 9; i++) {
        board.push(null);
    }
    gameOver = false;
    resultDisplay.innerText = "Результат: ";
    currentPlayer = Player.Human;
    if (currentMode === 'vsBot') {
        startGameWithBot();
    } else {
        startGameWithPlayer();
    }
    updateCurrentMode()
}

function changeMode() {
    gameContainer.classList.add('hidden');
    document.querySelector('.menu')?.classList.remove('hidden');
    if (currentMode === 'vsBot') {
        restartGame(handleClickWithBot); // Передаем правильный обработчик клика в зависимости от режима игры
    } else {
        restartGame(handleClick);
    }
}
function updateCurrentMode() {
    const currentModeElement = document.getElementById('currentMode') as HTMLDivElement;
    currentModeElement.innerText = currentMode === 'vsBot' ? 'Игра с ботом' : 'Игра с игроком';
}
document.getElementById('vsBot')?.addEventListener('click', () => {
    gameContainer.classList.remove('hidden');
    document.querySelector('.menu')?.classList.add('hidden');
    currentMode = 'vsBot';
    startGameWithBot();
    updateCurrentMode();
});

document.getElementById('vsPlayer')?.addEventListener('click', () => {
    gameContainer.classList.remove('hidden');
    document.querySelector('.menu')?.classList.add('hidden');
    currentMode = 'vsPlayer';
    startGameWithPlayer();
    updateCurrentMode();
});

document.getElementById('restart')?.addEventListener('click', () => {
    if (currentMode === 'vsBot') {
        restartGame(handleClickWithBot); // Передаем правильный обработчик клика в зависимости от режима игры
    } else {
        restartGame(handleClick);
    }
});
document.getElementById('changeMode')?.addEventListener('click', changeMode);