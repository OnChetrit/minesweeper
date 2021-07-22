'use strict'

//--------- click options ---------//
function onLevelClicked(index) {
    gSRestart.play();
    clearInterval(gTimerInterval);
    gCurrLevel = gLevels[index];
    initGame();
}

function cellClicked(elCell, i, j) {
    var cell = gBoard[i][j];
    if (gGame.firstClick) {
        gGame.isOn = true;
        renderMines(gBoard, i, j);
        setMinesNegsCount(gBoard);
        startTime();
        gGame.firstClick = false;
    }
    if (!gGame.isOn) return
    if (cell.isMarked) return;
    if (cell.isShown) return;

    if (!cell.numOfMines) gSCell.play();

    cell.isShown = true;
    gGame.shownCount++;

    //render cell
    var cellContent = cell.isMine ? gMine : cell.mineAroundCount;
    renderCell(i, j, cellContent);

    //check lose
    if (cell.isMine) {
        gameOver();
    } else if (cell.mineAroundCount === 0) {
        // open negs cells
        openNegsCells(gBoard, i, j)
    }

    // check victory
    if (gGame.markedCount + gGame.shownCount === gCurrLevel.SIZE ** 2) {
        victory();
    }
}

function openNegsCells(board, row, col) {
    //if click on open number - check if flags and bombs the same.. if true open negs
    // alert('scroll click')
    if (!gGame.isOn) return
    if (board[row][col].mineAroundCount) return
    for (var i = row - 1; i <= row + 1; i++) {
        if (i < 0 || i >= board.length) continue;
        for (var j = col - 1; j <= col + 1; j++) {
            if (j < 0 || j >= board[0].length) continue;
            if (i === row && j === col) continue;
            var currCell = board[i][j];
            if (!currCell.isMarked && !currCell.isShown && !currCell.isMine) {
                renderCell(i, j, currCell.mineAroundCount);
                gSCells.play();
                currCell.isShown = true;
                gGame.shownCount++;
                openNegsCells(board, i, j);
            }
        }
    }
}

function cellMarked(elCell, i, j) {
    // capture flag on cell if is hidden
    // alert('right click')
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
// mouse events -- DONE
function whichMouseButton(elCell, ev, i, j) {
    ev.stopPropagation()
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

function rightClick(ev) {
    ev.preventDefault();
}