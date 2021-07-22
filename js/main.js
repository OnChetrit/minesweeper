'use strict'

var gMine = '<img src="img/mine.png">';
var gFlag = '<img src="img/flag.png">';
var gSCell = new Audio('sound/cell.mp3');
var gSCells = new Audio('sound/cells.wav');
var gSLose = new Audio('sound/lose.mp3');
var gSWin = new Audio('sound/win.mp3');
var gSFlag = new Audio('sound/flag.mp3');
var gSPopFlag = new Audio('sound/pop-flag.mp3');
var gStartTime;
var gTimerInterval;
var gBoard;
var gGame;
var gLevels = [
    {
        difficulty: 'easy',
        MINES: 6,
        SIZE: 6,
        bestScore: 0
    },
    {
        difficulty: 'medium',
        MINES: 10,
        SIZE: 8,
        bestScore: 0
    },
    {
        difficulty: 'hard',
        MINES: 15,
        SIZE: 10,
        bestScore: 0
    }
]
var gCurrLevel = gLevels[0];

function initGame() {
    // clearInterval(gTimerInterval);
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secPassed: 0,
        lives: 3
    }
    gBoard = buildBoard(gCurrLevel);
    renderBoard(gBoard);
    console.log(gBoard);
    renderButtons();
    document.querySelector('.mines').innerText = gCurrLevel.MINES;
    document.querySelector('.timer').innerText = gGame.secPassed;
    document.querySelector('.restart-button').innerText = '🙂';
}
// board
function buildBoard(level) {
    var size = level.SIZE; // get level Size
    var board = [];
    for (var i = 0; i < size; i++) {
        board.push([]);
        for (var j = 0; j < size; j++) {
            var cell = {
                mineAroundCount: null,
                isShown: false,
                isMine: false,
                isMarked: false
            }
            board[i][j] = cell;
        }
    }

    return board;
}

function randomMines(board, row, col) {
    var mines = gCurrLevel.MINES; // get level Size
    var numOfMines = 0;
    while (numOfMines < mines) {
        var i = getRandomIntInclusive(0, board.length - 1); // row
        var j = getRandomIntInclusive(0, board.length - 1); // column
        if (i !== row && j !== col) {
            if (!board[i][j].isMine) {
                board[i][j].isMine = true;
                // gGame.mines.push({ i, j });
                numOfMines++;
            }
        }
    }
    return board;
}
//--------- counting negs ---------//
function countNegs(board, pos) {
    var countMines = 0;
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (i === pos.i && j === pos.j) continue;
            if (j < 0 || j >= board[i].length) continue;
            var currCell = board[i][j];
            if (currCell.isMine) {
                countMines++
            }
        }
    }
    return countMines;
}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            var currCell = board[i][j];
            if (!currCell.isMine) {
                countNegs(board, { i, j });
                currCell.mineAroundCount = countNegs(board, { i, j });
            }
        }
    }
}

// function restartGame() {
//     clearInterval(gTimerInterval);
//     initGame();
// }

function victory() {
    gGame.isOn = false;
    document.querySelector('.restart-button').innerText = '😎';
    gSWin.play();
    clearInterval(gTimerInterval);
}

function gameOver() {
    clearInterval(gTimerInterval);
    console.log(gBoard);
    for (var i = 0; i < gCurrLevel.SIZE; i++) {
        for (var j = 0; j < gCurrLevel.SIZE; j++) {
            if (gBoard[i][j].isMine)
                renderCell(i, j, gMine);
        }
    }
    gGame.isOn = false;
    document.querySelector('.restart-button').innerText = '😵';
    gSLose.play();
}
// timer -- DONE
function startTime() {
    gStartTime = Date.now();
    var elTimer = document.querySelector('.timer');
    gTimerInterval = setInterval(function () {
        gGame.secPassed = Math.floor((Date.now() - gStartTime) / 1000);
        elTimer.innerText = gGame.secPassed;
    }, 50);
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
