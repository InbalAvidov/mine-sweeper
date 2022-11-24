'use strict'
const MINE = '💣'
const EMPTY = ''
var gTimeInterval
var gBoard
var gLevel
var gFirstClick
var gCountMines
var gLives
var gElLives
var gHint
var seconds
var gEmptyCells
var numOfClicks
var gLocateMines = false
var gMegaHint = false



function initGame(size, mines) {
    gLevel = {
        size,
        mines
    }
    reset()
    gBoard = buildBoard()
    renderBoard(gBoard)
}

function reset() {
    clearInterval(gTimeInterval)
    resetFeaturs()
}

function resetFeaturs() {
    gCountMines = 0
    gFirstClick = false
    gHint = false
    numOfClicks = 3
    const elHint = document.querySelectorAll(".hint")
    elHint.forEach((Element) => { Element.hidden = false })
    const elSafe = document.querySelectorAll(".safe")
    const elclickNums = document.querySelector(".clickNum")
    elclickNums.innerText = numOfClicks
    elSafe.forEach((Element) => { Element.hidden = false })
    const elButton = document.querySelector(".DIY")
    elButton.style.backgroundColor = "lightseagreen"
    gLocateMines = false
    gElLives = document.querySelector(".lives")
    if (gLevel.mines === 2) {
        gLives = 2
        gElLives.innerText = '🖤🖤'
    } else {
        gLives = 3
        gElLives.innerText = '🖤🖤🖤'

    }
    gTimeInterval = ''
    const elTimer = document.querySelector(".time")
    elTimer.innerText = ''
    const elGameMode = document.querySelector(".gameMode")
    elGameMode.innerText = '😁'
}

function renderBoard(board) {
    var strHTML = ''
    const elTable = document.querySelector("tbody")
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board.length; j++) {
            var cell = ''
            strHTML += `<td data-i="${i}" data-j="${j}"class="cell" onclick="cellClicked(this,${i},${j})" oncontextmenu="cellMarked(event,this,${i},${j})">${cell}</td>`
        }
        strHTML += '</tr>'
    }
    elTable.innerHTML = strHTML

}

function cellClicked(elCell, i, j) {
    if (gLocateMines) {
        locateMines(elCell, i, j)
        return
    }
    if (!gFirstClick) addMines(i, j)
    if (!gTimeInterval) timer()
    if (gMegaHint) {
        megaHint(elCell, i, j)
        return
    }
    if (gHint) {
        hint(i, j)
        return
    }
    var str
    if (gBoard[i][j].isMarked) return
    if (gBoard[i][j].isMine) {
        str = MINE
        gLives--
        if (gLives === 2) gElLives.innerText = '🖤🖤'
        if (gLives === 1) gElLives.innerText = '🖤'
        if (gLives === 0) gameOver()
    }
    else {
        str = gBoard[i][j].minesAroundCount
        if (str === 0) {
            str = EMPTY
            expandShown(gBoard, i, j)
        }
    }
    gBoard[i][j].isShown = true
    elCell.classList.add("isShown")
    elCell.innerText = str
    checkGameOver()
}

function addMines(i, j) {
    gFirstClick = true
    if (gCountMines >= gLevel.mines) return
    else {
        const randPos = {
            posI: getRandomInt(0, gLevel.size),
            posJ: getRandomInt(0, gLevel.size)
        }
        if (randPos.posI === i && randPos.posJ === j) {
            addMines(i, j)
            return
        }

        if (gCountMines > 1) {
            if (gBoard[randPos.posI][randPos.posJ].isMine) {
                addMines(i, j)
                return
            }

        }
        gBoard[randPos.posI][randPos.posJ].isMine = true
        gCountMines++
        addMines(i, j)
    }
    gBoard = setMinesNegsCount(gBoard)

}

function setMinesNegsCount(board) {
    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board.length; j++) {
            const pos = { i, j }
            if (board[i][j].isMine) continue
            board[i][j].minesAroundCount = countMines(pos, board)
        }
    }
    return board
}

function countMines(pos, board) {
    var minesAround = 0
    for (var i = pos.i - 1; i <= pos.i + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = pos.j - 1; j <= pos.j + 1; j++) {
            if (i === pos.i && j === pos.j) continue
            if (j < 0 || j >= board[i].length) continue
            if (board[i][j].isMine) minesAround++
        }
    }
    return minesAround
}

function cellMarked(ev, elCell, i, j) {
    ev.preventDefault()
    if (gBoard[i][j].isShown && !gBoard[i][j].isMine) return
    if (gBoard[i][j].isMarked) {
        elCell.innerText = ''
        elCell.classList.remove("isShown")
        gBoard[i][j].isMarked = false
    }
    else {
        gBoard[i][j].isMarked = true
        elCell.classList.add("isShown")
        elCell.innerText = '🚩'
    }
    checkGameOver()
}

function timer() {
    const elTimer = document.querySelector(".time")
    var start = Date.now()
    gTimeInterval = setInterval(() => {
        seconds = (Date.now() - start) / 1000
        elTimer.innerText = seconds.toFixed(2)
    }, 1)
}

function gameOver() {
    clearInterval(gTimeInterval)
    const elGameMode = document.querySelector(".gameMode")
    elGameMode.innerText = '😵'
    gElLives.innerText = '❌'
    for (var i = 0; i < gLevel.size; i++) {
        for (var j = 0; j < gLevel.size; j++) {
            if (gBoard[i][j].isMine) {
                const elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"] `)
                elCell.innerText = MINE
            }
        }
    }
}

function checkGameOver() {
    var checkCell = 0
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            const cell = gBoard[i][j]
            if ((cell.isMarked && cell.isMine) || (cell.isMine === false && cell.isShown)) {
                checkCell++
            }
        }
    }
    if (checkCell === gLevel.size ** 2) {
        clearInterval(gTimeInterval)
        const elGameMode = document.querySelector(".gameMode")
        elGameMode.innerText = '😎'
        if (seconds) bestScore(seconds)
    }

}

function expandShown(board, posI, posJ) {
    for (var i = posI - 1; i <= posI + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = posJ - 1; j <= posJ + 1; j++) {
            const elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"] `)
            if (i === posI && j === posJ) if (!gHint) continue
            if (j < 0 || j >= board[i].length) continue

            if (board[i][j].minesAroundCount === 0) elCell.innerText = ''
            else elCell.innerText = board[i][j].minesAroundCount

            elCell.classList.add("isShown")
            if (gHint && !board[i][j].isShown) {
                board[i][j].isHint = true
                if (board[i][j].isMine) elCell.innerText = MINE
            }
            else board[i][j].isShown = true
        }
    }
}

function hideNegs(board, posI, posJ) {
    for (var i = posI - 1; i <= posI + 1; i++) {
        if (i < 0 || i >= board.length) continue

        for (var j = posJ - 1; j <= posJ + 1; j++) {
            const elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"] `)
            if (j < 0 || j >= board[i].length) continue
            if (board[i][j].isHint) {
                elCell.innerText = ''
                elCell.classList.remove("isShown")
                board[i][j].isHint = false

            }
        }
    }
}

function changeHint(button) {
    if (!gFirstClick) return
    button.hidden = true
    gHint = true
}

function hint(i, j) {
    expandShown(gBoard, i, j)
    setTimeout(() => { hideNegs(gBoard, i, j) }, 2000)
    gHint = false
}

function bestScore(seconds) {
    const elBest = document.querySelector(".best")
    var minTime = Infinity
    if (+seconds < minTime) minTime = seconds
    elBest.innerText = seconds
}

function safeClick(elSafe) {
    if (!gFirstClick) return
    const clicks = document.querySelector(".clickNum")
    numOfClicks--
    if (numOfClicks >= 0) {
        clicks.innerText = numOfClicks
        console.log('numOfClicks:', numOfClicks)
        var i = getRandomInt(0, gBoard.length)
        var j = getRandomInt(0, gBoard.length)
        const currCell = gBoard[i][j]
        if (currCell.isShown || currCell.isMine) {
            safeClick()
            return
        }
        const elCell = document.querySelector(`[data-i="${i}"][data-j="${j}"] `)
        elCell.classList.add("safe-click")
        setTimeout(() => { elCell.classList.remove("safe-click") }, 1000)
        console.log('return');
        return

    } else return

}

function changeLocateMines(elButton) {
    elButton.style.backgroundColor = "rgb(0, 88, 143)"
    gLocateMines = true
}

function locateMines(elCell, i, j) {
    if (gFirstClick) return
    else {
        gBoard[i][j].isMine = true
        gCountMines++
        console.log(gCountMines);

        if (gCountMines >= gLevel.mines) {
            gFirstClick = true
            gLocateMines = false
            const elButton = document.querySelector(".DIY")
            elButton.style.backgroundColor="lightseagreen"

        }


    }
    gBoard = setMinesNegsCount(gBoard)
}

function changeMegaHint(elButton) {
    if (!gFirstClick) return
    elButton.style.backgroundColor = "rgb(0, 88, 143)"
    gMegaHint = true
}
function megaHint(elCell, i, j) {
    console.log('hi');
    elCell.classList.add("mega")
    const elCells = document.querySelectorAll(".mega")
    console.log(elCells);
    if (elCells.length === 2) {
        gMegaHint = false
        const idxIStart = (elCells[0].dataset.i < elCells[1].dataset.i) ? elCells[0].dataset.i : elCells[1].dataset.i
        const idxIEnd = (elCells[0].dataset.i > elCells[1].dataset.i) ? elCells[0].dataset.i : elCells[1].dataset.i
        const idxJStart = (elCells[0].dataset.j < elCells[1].dataset.j) ? elCells[0].dataset.j : elCells[1].dataset.j
        const idxJEnd = (elCells[0].dataset.j > elCells[1].dataset.j) ? elCells[0].dataset.j : elCells[1].dataset.j
        console.log(idxIStart, idxJStart, idxIEnd, idxJEnd);
        for (var i = idxIStart; i <= idxIEnd; i++) {
            for (var j = idxJStart; j <= idxJEnd; j++) {
                const cellToCover = document.querySelector(`[data-i="${i}"][data-j="${j}"] `)
                cellToCover.style.backgroundColor = "lightseagreen"
                cellToCover.classList.add("mega")
                if (gBoard[i][j].minesAroundCount === 0) cellToCover.innerText = EMPTY
                else if (gBoard[i][j].isMine) cellToCover.innerText = MINE
                else cellToCover.innerText = gBoard[i][j].minesAroundCount
            }
        }
        setTimeout(() => { hideMegaHint() }, 2500)
    }

}
function hideMegaHint() {
    const elCovers = document.querySelectorAll(".mega")
    elCovers.forEach((Element) => {
        Element.style.backgroundColor = "rgb(197, 191, 191)"
        Element.innerHTML = EMPTY
    })

}