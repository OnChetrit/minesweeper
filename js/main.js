'use strict'

var gStartTime;
var gTimerInterval;
var gBoard;
var gMine = '<img src="/img/bomb.png">';
var gFlag = '<img src="/img/flag.png">'

var gCurrLevel = 'easy';
var gLevels = [
    {
        difficulty: 'easy',
        MINES: 5,
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

var gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secPassed: 0
}

function initGame() {
    document.querySelector('.restart-button').innerText = '🙂';
    document.querySelector('.timer').innerText = 0;
    gGame = {
        isOn: false,
        shownCount: 0,
        markedCount: 0,
        secPassed: 0
    }
    gBoard = buildBoard(gCurrLevel);
    renderBoard(gBoard);
    renderButtons();
}
// board
function buildBoard(level) {
    for (var x = 0; x < gLevels.length; x++) {
        if (gLevels[x].difficulty === level) {
            var size = gLevels[x].SIZE; // get level Size
            var mines = gLevels[x].MINES; // get level Size
        }
    }
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
    x = 0;
    while (x < mines) {
        i = getRandomIntInclusive(0, size - 1); // row
        j = getRandomIntInclusive(0, size - 1); // column
        if (!board[i][j].isMine) {
            board[i][j].isMine = true;
            x++;
        }
    }
    return board;
}

function renderBoard(board) {
    var strHTML = '<tbody>'
    // var mine = '<img src="/img/bomb.png">';
    // var content;
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {
            var currCell = board[i][j]
            if (!currCell.isMine) {
                currCell.mineAroundCount = setMinesNegsCount(board, { i, j });
            }
            var className = ((i + j) % 2 === 0) ? 'dark' : 'bright'
            strHTML += `<td><button data-i="${i}" data-j="${j}"
            onmouseup="whichMouseButton(this,event,${i},${j})"
            class="cell hide ${className}"></button></td>`
        }
        strHTML += '</tr>\n'
    }
    strHTML += '</tbody>';
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}
// counting negs
function setMinesNegsCount(board, pos) {
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
// buttons function render
function renderButtons() {
    var strHTML = '';
    var elBtns = document.querySelector('.level-buttons')
    for (var i = 0; i < gLevels.length; i++) {
        var level = gLevels[i].difficulty;
        strHTML += `<button class="levels ${level}" onclick="onLevelClicked(this)" >
        ${level}</button>`
    }
    elBtns.innerHTML = strHTML;
}

function onLevelClicked(elBtn) {
    clearInterval(gTimerInterval);
    gCurrLevel = elBtn.innerText;
    initGame();
}
// cells click options
function cellClicked(elCell, i, j) {
    //if number, show it. if nothing open all negs. if bomb game over
    if (!gGame.secPassed) {
        gGame.isOn = true;
        startTime();
    }
    if (!gGame.isOn) return

    var cell = gBoard[i][j];
    if (cell.isShown) return;
    if (cell.isMarked) return;

    cell.isShown = true;

    if (cell.isMine) {
        gameOver();
    } else if (cell.mineAroundCount === 0) {
        // open negs cells
        openNegsCells(elCell, i, j)
    }

    var cellContent = cell.isMine ? gMine : cell.mineAroundCount;
    renderCell(i, j, cellContent);
}

function renderCell(i, j, value) {
    var value = value ? value : '';

    var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
    elCell.innerHTML = value;
    if (!gBoard[i][j].isMarked) {
        if (value === gFlag) {
        } else {
            elCell.classList.remove('hide');
            if ((i + j) % 2 === 0) {
                elCell.classList.add('show-bright');
            } else {
                elCell.classList.add('show-dark');
            }
        }
    }
}

function openNegsCells(cellI, cellJ) {
    //if click on open number - check if flags and bombs the same.. if true open negs
    // alert('scroll click')
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[0].length) continue;
            if (i === cellI && j === cellJ) continue;
            var currCell = gBoard[i][j];
            if (currCell.isMarked) continue;
            if (currCell.isShown) continue;
            renderCell(i, j, currCell.mineAroundCount)
        }
    }
}

function cellMarked(elCell, i, j) {
    // capture flag on cell if is hidden
    // alert('right click')
    var cell = gBoard[i][j];
    if (cell.isShown) return;
    if (!cell.isMarked) {
        cell.isMarked = true;
        renderCell(i, j, gFlag);
    } else {
        renderCell(i, j, '');
        cell.isMarked = false;
    }
}
// game done options
function restartGame() {
    clearInterval(gTimerInterval);
    initGame();
    gGame.isOn = false;
}

function victory() {
    gGame.isOn = false;
    document.querySelector('restart-button').innerText = '😎';
    clearInterval(gStartTime);
}

function gameOver() {
    gGame.isOn = false;
    alert('GAME OVER');
    document.querySelector('.restart-button').innerText = '😵';
    clearInterval(gTimerInterval);
}
// mouse events -- DONE
function whichMouseButton(elCell, ev, i, j) {
    switch (ev.button) {
        case 0:
            cellClicked(elCell, i, j);
            break;
        case 1:
            openNegsCells(elCell, i, j);
            break;
        case 2:
            cellMarked(elCell, i, j);
            break;
        default:
            break;
    }
}
// timer -- DONE
function startTime() {
    gStartTime = Date.now();
    var elTimer = document.querySelector('.timer');
    gTimerInterval = setInterval(function () {
        gGame.secPassed = Math.floor((Date.now() - gStartTime) / 1000);
        elTimer.innerText = gGame.secPassed;
    }, 100);
}

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
