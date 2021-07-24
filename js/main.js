'use strict'

var gMine = '<img src="img/mine.png">';
var gFlag = '<img src="img/flag.png">';
var gLives = '❤️'
var gSCell = new Audio('sound/cell.mp3');
var gSCells = new Audio('sound/cells.wav');
var gSLose = new Audio('sound/lose.mp3');
var gSWin = new Audio('sound/win.mp3');
var gSFlag = new Audio('sound/flag.mp3');
var gSPopFlag = new Audio('sound/pop-flag.mp3');
var gSRestart = new Audio('sound/restart.mp3');
var gSWrong = new Audio('sound/wrong.mp3');
var gMinesExposed;
var gStartTime;
var gTimerInterval;
var gBoard;
var gGame;
var gLevels = [
    {
        difficulty: 'easy',
        MINES: 5,
        SIZE: 6,
        // bestScore: Infinity
    },
    {
        difficulty: 'medium',
        MINES: 10,
        SIZE: 8,
        // bestScore: Infinity
    },
    {
        difficulty: 'hard',
        MINES: 15,
        SIZE: 10,
        // bestScore: Infinity
    }
]
var gCurrLevel = gLevels[0];

function initGame() {
    renderButtons();
    playGame();
}

function playGame() {
    clearInterval(gTimerInterval);
    gGame = {
        isOn: true,
        shownCount: 0,
        markedCount: 0,
        secPassed: 0,
        hintsCount: 3,
        lives: 0,
        isFirstClick: true,
        isHint: false
    }
    gBoard = buildBoard(gCurrLevel);
    renderScores();
    renderLives();
    renderHints();
    renderBoard(gBoard);
    gMinesExposed = [];
    document.querySelector('.mines').innerText = gCurrLevel.MINES;
    document.querySelector('.timer').innerText = gGame.secPassed;
    document.querySelector('.restart-button').innerText = '🙂';
}

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

function getHintCells(row, col) {
    var hintsCells = [];
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = col - 1; j <= col + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue;
            var currCell = gBoard[i][j];
            if (!currCell.isMarked && !currCell.isShown) {
                hintsCells.push({ row: i, col: j })
            }
        }
    }
    showHintCells(hintsCells);
}

function showHintCells(hintsCells) {
    for (var i = 0; i < hintsCells.length; i++) {
        var row = hintsCells[i].row;
        var col = hintsCells[i].col;
        var elCell = document.querySelector(`[data-i="${row}"][data-j="${col}"]`);
        var currCell = gBoard[row][col];
        elCell.classList.add('show-hint');
        if (currCell.isMine) {
            elCell.innerHTML = gMine;
        }
        else {
            currCell.mineAroundCount = currCell.mineAroundCount ? currCell.mineAroundCount : '';
            elCell.innerHTML = currCell.mineAroundCount;
        }
    }
    setTimeout(function () { hideHintCells(hintsCells) }, 1000)
}

function hideHintCells(hintsCells) {
    for (var i = 0; i < hintsCells.length; i++) {
        var row = hintsCells[i].row;
        var col = hintsCells[i].col;
        var elCell = document.querySelector(`[data-i="${row}"][data-j="${col}"]`);
        elCell.classList.remove('show-hint');
        elCell.innerHTML = '';
    }
}

function checkVictory() {
    if (gGame.markedCount + gGame.shownCount === gCurrLevel.SIZE ** 2
        && gGame.isMarked === gCurrLevel.MINES ||
        gGame.shownCount + gCurrLevel.MINES - gGame.lives === gCurrLevel.SIZE ** 2) {

        gGame.isOn = false;
        document.querySelector('.restart-button').innerText = '😎';
        gSWin.play();
        clearInterval(gTimerInterval);
        if (gCurrLevel.difficulty === 'easy')
            if (gGame.secPassed < +localStorage.easyScore || !localStorage.easyScore) {
                localStorage.setItem('easyScore', `${gGame.secsPassed}`);
                localStorage.easyScore = gGame.secPassed;
                renderScores();
                setTimeout(triggerModal, 1000);
            }

        if (gCurrLevel.difficulty === 'medium')
            if (gGame.secPassed < +localStorage.mediumScore || !localStorage.mediumScore) {
                localStorage.setItem('mediumScore', `${gGame.secsPassed}`);
                localStorage.mediumScore = gGame.secPassed;
                renderScores();
                setTimeout(triggerModal, 1000);
            }

        if (gCurrLevel.difficulty === 'hard')
            if (gGame.secPassed < +localStorage.hardScore || !localStorage.hardScore) {
                localStorage.setItem('hardScore', `${gGame.secsPassed}`);
                localStorage.hardScore = gGame.secPassed;
                renderScores();
                setTimeout(triggerModal, 1000);
            }
    }
}

function checkLoss(i, j) {
    if (gGame.lives < 2) {
        gBoard[i][j].isMarked = true;
        gGame.markedCount++
        removeLives();
        gGame.lives++;
        gSWrong.play();
    } else {
        removeLives();
        gGame.lives++;
        gameOver();
    }
    document.querySelector('.mines').innerText = gCurrLevel.MINES - gGame.markedCount;
}

function removeLives() {
    var currLives = gGame.lives;
    var live = document.querySelector(`.live${currLives}`);
    live.classList.add('disappear-effect');
}

function triggerModal() {
    var modal = document.querySelector('.modal');
    if (!modal.classList.contains('modal-effect')) {
        modal.classList.add('modal-display');
        setTimeout(function () { modal.classList.add('modal-effect') }, 500)
    } else {
        modal.classList.remove('modal-effect');
        setTimeout(function () { modal.classList.remove('modal-display') }, 1000)
    }
}

function gameOver() {
    clearInterval(gTimerInterval);
    for (var i = 0; i < gCurrLevel.SIZE; i++) {
        for (var j = 0; j < gCurrLevel.SIZE; j++) {
            if (gBoard[i][j].isMine && !gBoard[i][j].isMarked)
                renderCell(i, j, gMine);
        }
    }
    gGame.isOn = false;
    document.querySelector('.restart-button').innerText = '😵';
    gSLose.play();
}

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
