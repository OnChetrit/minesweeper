'use strict'

function onLevelClicked(index) {
    gSRestart.play();
    clearInterval(gTimerInterval);
    gCurrLevel = gLevels[index];
    initGame();

    var elLevels = document.querySelectorAll('.levels');
    for (var i = 0; i < elLevels.length; i++) {
        if (elLevels[i].classList.contains('levelSelected')) {
            elLevels[i].classList.remove('levelSelected')
        }
    }
    elLevels[index].classList.add('levelSelected');
}

function onHintClick(elHint) {
    gGame.isHint = true;
    elHint.classList.add('disappear-effect');
    elHint.classList.add('hint-remove');
}

function restartButton() {
    gSRestart.play();
    playGame();
}

function cellClicked(elCell, i, j) {
    var cell = gBoard[i][j];
    if (gGame.isFirstClick) {
        gGame.isOn = true;
        renderMines(gBoard, i, j);
        setMinesNegsCount(gBoard);
        startTime();
        gGame.isFirstClick = false;
    }
    if (!gGame.isOn) return
    if (cell.isMarked) return;
    if (cell.isShown) return;

    if (gGame.isHint && gGame.hintsCount) {
        getHintCells(i, j);
        gGame.isHint = false
        gGame.hintsCount--;
        return;
    }
    gSCell.play();

    //render cell
    var cellContent = cell.isMine ? gMine : cell.mineAroundCount;
    renderCell(i, j, cellContent);

    cell.isShown = true;
    gGame.shownCount++;

    //check lose
    if (cell.isMine) {
        gMinesExposed.push({ i, j })
        checkLoss(i, j);
        return;
    }

    if (!cell.mineAroundCount) {
        // open negs cells
        openNegsCells(gBoard, i, j)
    }

    // check checkVictory

    checkVictory();

}
// recursion opening for empty cells
function openNegsCells(board, row, col) {
    //if click on open number - check if flags and bombs the same.. if true open negs
    if (!gGame.isOn) return
    if (board[row][col].mineAroundCount) return
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = col - 1; j <= col + 1; j++) {
            if (j < 0 || j >= board[0].length) continue;
            if (i === row && j === col) continue;
            var currCell = board[i][j];
            if (!currCell.isMarked && !currCell.isShown && !currCell.isMine) {
                gSCells.play();
                currCell.isShown = true;
                gGame.shownCount++;
                renderCell(i, j, currCell.mineAroundCount);
                openNegsCells(board, i, j);
            }
        }
    }
}

function cellMarked(elCell, i, j) {
    // capture flag on cell if is hidden
    if (!gGame.isOn) return
    var cell = gBoard[i][j];
    if (cell.isShown) return;
    if (!cell.isMarked) {
        cell.isMarked = true;
        renderCell(i, j, gFlag);
        gGame.markedCount++;
        gSFlag.play();
    } else {
        gSPopFlag.play();
        renderCell(i, j, '');
        cell.isMarked = false;
        gGame.markedCount--;
    }

    document.querySelector('.mines').innerText = gCurrLevel.MINES - gGame.markedCount;
}
// scroll click number for one cell
function openNegsCell(board, row, col) {
    if (!gGame.isOn) return
    if (board[row][col].isMarked) return
    if (!board[row][col].isShown) return
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = col - 1; j <= col + 1; j++) {
            if (j < 0 || j >= board[0].length) continue;
            if (i === row && j === col) continue;
            var currCell = board[i][j];
            if (!currCell.isMarked && !currCell.isShown) {
                var cellContent = currCell.isMine ? gMine : currCell.mineAroundCount;
                renderCell(i, j, cellContent);
                if (cellContent === gMine) {
                    checkLoss(i, j);
                }
                gSCells.play();
                currCell.isShown = true;
                gGame.shownCount++;
                if (currCell.mineAroundCount === 0) openNegsCells(board, i, j)
            }
        }
    }
    checkVictory();
}

function onScrollClick(elCell, row, col) {
    var countFlags = 0;
    var countMines = 0;
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue;
        for (var j = col - 1; j <= col + 1; j++) {
            if (i === row && j === col) continue;
            if (j < 0 || j >= gBoard[i].length) continue;
            var currCell = gBoard[i][j];
            if (currCell.isMarked) {
                countFlags++
            }
        }
    }
    if (gBoard[row][col].mineAroundCount === countFlags) {
        openNegsCell(gBoard, row, col);
    }
}
// mouse events -- DONE
function whichMouseButton(elCell, ev, i, j) {
    ev.stopPropagation()
    switch (ev.button) {
        case 0:
            cellClicked(elCell, i, j);
            break;
        case 1:
            onScrollClick(elCell, i, j);
            break;
        case 2:
            cellMarked(elCell, i, j);
            break;
        default:
            break;
    }
}

function rightClick(ev) {
    ev.preventDefault();
}