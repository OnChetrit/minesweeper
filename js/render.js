'use strict';

function renderBoard(board) {
  var strHTML = '';
  for (var i = 0; i < board.length; i++) {
    strHTML += '<tr>\n';
    for (var j = 0; j < board[0].length; j++) {
      var backgroundColor = (i + j) % 2 === 0 ? 'dark' : 'bright';
      var className = (i + j) % 2 === 0 ? 'dark' : 'bright';
      strHTML += `<td><div data-i="${i}" data-j="${j}"
            oncontextmenu="handleContextMenuClick(event,${i},${j})"
            onclick="handleClick(event,${i},${j})"
            ondblclick="handleDoubleClick(event,${i},${j})"
            class="cell ${className}"></div></td>`;
    }
    strHTML += '</tr>\n';
  }
  var elBoard = document.querySelector('.board');
  elBoard.innerHTML = strHTML;
}

function renderMines(board, row, col) {
  var mines = gCurrLevel.MINES; // get level Size
  var numOfMines = 0;
  while (numOfMines < mines) {
    var i = getRandomIntInclusive(0, board.length - 1); // row
    var j = getRandomIntInclusive(0, board.length - 1); // column
    if (i !== row && j !== col) {
      if (!board[i][j].isMine) {
        board[i][j].isMine = true;
        numOfMines++;
      }
    }
  }
  return board;
}

function renderButtons() {
  var strHTML = '';
  var elBtns = document.querySelector('.level-buttons');
  for (var i = 0; i < gLevels.length; i++) {
    var level = gLevels[i].difficulty;
    var levelSelected = i === 0 ? 'levelSelected' : '';
    strHTML += `<button class="levels ${levelSelected} ${level} "
    onclick = "onLevelClicked(${i})" > ${level}</button > `;
  }
  elBtns.innerHTML = strHTML;
}

function renderLives() {
  var strHTML = '';

  for (var i = gGame.lives; i < 3; i++) {
    strHTML += `<img class="live live${i}" src="img/red-heart.svg">`;
  }
  document.querySelector('.lives').innerHTML = strHTML;
}

function renderHints() {
  var strHTML = '';

  for (var i = gGame.hintsCount; i > 0; i--) {
    strHTML += `<button class="transparent-button"
                    onclick="onHintClick(this)"
                    >
                    <img class="hint hint${i}"
                        src="img/hint.svg">
                    </button>`;
  }
  document.querySelector('.hint-contain').innerHTML = strHTML;
}

function renderScores() {
  var keys = ['easy', 'medium', 'hard', 'expert', 'insane'];
  for (var i = 0; i < keys.length; i++) {
    var score = keys[i] + 'Score';
    if (!localStorage[score]) {
      localStorage.setItem(score, '');
    }
    document.querySelector(`.${keys[i]}-score`).innerHTML = +localStorage[score];
  }
}

function renderCell(i, j, value) {
  var value = value ? value : '';
  var elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"]`);
  elCell.innerHTML = value;

  if (gBoard[i][j].isMine && !gBoard[i][j].isMarked) {
    elCell.classList.add(`show-mine`);
  }
  var classColor;
  if (value)
    switch (value % 8) {
      case 0:
        classColor = 'color-brown';
        break;
      case 1:
        classColor = 'color-blue';
        break;
      case 2:
        classColor = 'color-green';
        break;
      case 3:
        classColor = 'color-red';
        break;
      case 4:
        classColor = 'color-purple';
        break;
      case 5:
        classColor = 'color-turkiz';
        break;
      case 6:
        classColor = 'color-orange';
        break;
      case 7:
        classColor = 'color-pink';
        break;

      default:
        break;
    }
  elCell.classList.add(`${classColor}`);

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
  if (gBoard[i][j].isShown) {
    elCell.classList.add('shown');
  }
}
