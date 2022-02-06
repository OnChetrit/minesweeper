'use strict'

var gMine = '<img src="img/mine.png">';
var gFlag = '<img src="img/flag.png">';
var gLives = '<img src="img/red-heart.svg">'

var gSCell = new Audio('sound/cell.mp3');
var gSCells = new Audio('sound/cells.wav');
var gSLose = new Audio('sound/lose.mp3');
var gSWin = new Audio('sound/win.mp3');
var gSFlag = new Audio('sound/flag.mp3');
var gSPopFlag = new Audio('sound/pop-flag.mp3');
var gSRestart = new Audio('sound/restart.mp3');
var gSWrong = new Audio('sound/wrong.mp3');
var gSTrophy = new Audio('sound/trophy.mp3');
var gSClick = new Audio('sound/click.mp3');
var gIsWin = false;
var gMinesExposed;
var gStartTime;
var gTimerInterval;
var gBoard;
var gGame;
var gLevels = [
    {
        difficulty: 'easy',
        MINES: 15,
        SIZE: 10,
    },
    {
        difficulty: 'medium',
        MINES: 20,
        SIZE: 12,
    },
    {
        difficulty: 'hard',
        MINES: 30,
        SIZE: 15,
    },
    {
        difficulty: 'expert',
        MINES: 45,
        SIZE: 17,
    },
    {
        difficulty: 'insane',
        MINES: 60,
        SIZE: 20,
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
        isHint: false,
        hintClicked: false
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
    gGame.hintClicked = true;
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
    toggleHintCells(hintsCells);
}

function toggleHintCells(hintsCells, isShow = true) {
    for (var i = 0; i < hintsCells.length; i++) {
        var row = hintsCells[i].row;
        var col = hintsCells[i].col;
        var elCell = document.querySelector(`[data-i="${row}"][data-j="${col}"]`);
        var currCell = gBoard[row][col];
        // var method = isShow ? 'add' : 'remove'
        elCell.classList.toggle('show-hint');
        if (isShow) {
            if (currCell.isMine) {
                elCell.innerHTML = gMine;
            }
            else {
                currCell.mineAroundCount = currCell.mineAroundCount ? currCell.mineAroundCount : '';
                elCell.innerHTML = currCell.mineAroundCount;
            }
        } else elCell.innerHTML = '';
    }
    if (isShow) setTimeout(function () { toggleHintCells(hintsCells, false) }, 1000)
    else gGame.hintClicked = false;

}

function checkVictory() {
    if (gGame.markedCount + gGame.shownCount === gCurrLevel.SIZE ** 2
        && gGame.isMarked === gCurrLevel.MINES ||
        gGame.shownCount + gCurrLevel.MINES - gGame.lives === gCurrLevel.SIZE ** 2) {

        gGame.isOn = false;
        document.querySelector('.restart-button').innerText = '😎';
        gSWin.play();
        gIsWin = true;
        clearInterval(gTimerInterval);
        var key = gCurrLevel.difficulty + 'Score';
        if (gGame.secPassed < +localStorage[key] || !localStorage[key]) {
            localStorage.setItem(key, gGame.secsPassed);
            localStorage[key] = gGame.secPassed;
            renderScores();
            document.querySelector('.new-score').innerText = 'New Score !'
            setTimeout(triggerModal, 500);
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
        gSTrophy.play();
        modal.classList.add('modal-display');
        setTimeout(function () { modal.classList.add('modal-effect') }, 200);
        if (gIsWin) return
        document.querySelector('.new-score').innerText = '';
        gIsWin = false;
    } else {
        gSClick.play();
        modal.classList.remove('modal-effect');
        setTimeout(function () { modal.classList.remove('modal-display') }, 600);
        setTimeout(function () { document.querySelector('.new-score').innerText = ''; }, 600);

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
