'use strict'

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (var j = 0; j < board[0].length; j++) {
            var className = ((i + j) % 2 === 0) ? 'dark' : 'bright'
            strHTML += `<td><div data-i="${i}" data-j="${j}"
            oncontextmenu="rightClick(event)"
            onmousedown="whichMouseButton(this,event,${i},${j})"
            class="cell ${className}"></div></td>`
        }
        strHTML += '</tr>\n'
    }
    var elBoard = document.querySelector('.board');
    elBoard.innerHTML = strHTML;
}

function renderButtons() {
    var strHTML = '';
    var elBtns = document.querySelector('.level-buttons')
    for (var i = 0; i < gLevels.length; i++) {
        var level = gLevels[i].difficulty;
        strHTML += `<input for type="radio" name="levels" value="${level}
        "class="levels ${level}" onclick="onLevelClicked(${i})">`
    }

    // strHTML += `<button "class="levels ${level}"
    // onclick="onLevelClicked(${i})">${level}</button>`
    elBtns.innerHTML = strHTML;
}

function renderCell(i, j, value) {
    var value = value ? value : '';
    var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
    elCell.innerHTML = value;
    if (!gBoard[i][j].isMarked) {
        if (value !== gFlag) {
            elCell.classList.remove('hide');
            if ((i + j) % 2 === 0) {
                elCell.classList.add('show-dark');
            } else {
                elCell.classList.add('show-bright');
            }
        }
    }
}
