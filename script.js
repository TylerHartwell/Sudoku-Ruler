import { boardData } from "./board.js"
import { generateRuleItems, rulesArr } from "./rules.js"

boardData.createBoardHTML()

let allCandidates
let allSquareNumbers
let allPadNumbers
let allUnitsSquares = []
allCandidates = Array.from(document.querySelectorAll(".candidate"))
allSquareNumbers = Array.from(document.querySelectorAll(".entry"))
allPadNumbers = Array.from(document.querySelectorAll(".pad-number"))
// clearBoard()

const focusTarget = target => {
  clearAnyWrong()
  target.focus()
}

const inputCharacter = character => {
  if (/[1-9]/.test(character)) {
    document.activeElement.textContent = character
    checkCandidates(character, document.activeElement.parentElement)
    refreshCandidates()
    refreshAllHighlights()
  }
}

function tryNextSolve(ruleItem) {
  console.log("try next solve")
  rulesArr[[...ruleItem.parentElement.children].indexOf(ruleItem)](
    allUnitsSquares,
    focusTarget,
    inputCharacter
  )
}

document.body.addEventListener("click", e => {
  clearAnyWrong()
  if (e.shiftKey) {
    if (e.target.classList.contains("candidate")) {
      e.target.textContent = ""
      refreshCandidates()
    }
  }

  if (e.target.classList.contains("try-next-btn")) {
    tryNextSolve(e.target.parentElement)
  }

  if (e.target.classList.contains("toggle-candidates-btn")) {
    toggleCandidates()
  }
  if (e.target.classList.contains("entry")) {
    focusTarget(e.target)
  }
  if (e.target.classList.contains("clear-grid-btn")) {
    if (confirm("clear all?")) {
      clearBoard()
    }
  }
  if (e.target.classList.contains("input-grid-string-btn")) {
    inputGridString()
  }
  if (e.target.classList.contains("set-grid-btn")) {
    setGrid()
  }
  if (e.target.classList.contains("pad-number")) {
    toggleHighlight(e.target)
  }
})

document.body.addEventListener("keyup", e => {
  if (e.key === "Shift") {
    allSquareNumbers.forEach(el => {
      el.classList.remove("no-pointer")
    })
  }
})

document.body.addEventListener("keydown", e => {
  if (e.shiftKey && !e.repeat) {
    allSquareNumbers.forEach(el => {
      el.classList.add("no-pointer")
    })
    return
  }

  if (e.target.classList.contains("entry")) {
    e.preventDefault()
    clearAnyWrong()

    if (e.target.contentEditable === "true") {
      const previousValue = e.target.textContent
      if (/[1-9]/.test(e.key) && !e.repeat) {
        if (previousValue == e.key) {
          return
        }
        unhighlightEls([e.target])
        document.activeElement.textContent = e.key

        if (previousValue) {
          checkCandidates(previousValue, e.target.parentElement)
          refreshCandidates()
        }
        if (!checkLocallyValidPlacement(e.key, e.target.parentElement, false)) {
          e.target.classList.add("wrong")
          return
        }
        if (
          document.querySelector(`.pad${e.key}`).classList.contains("highlight")
        ) {
          highlightEls([e.target])
        }

        checkCandidates(e.key, e.target.parentElement)
        refreshCandidates()

        refreshAllHighlights()

        if (!boardData.isSet) movePlaceBy(1)
        return
      }

      if (
        e.key === "0" ||
        e.key === "Backspace" ||
        e.key === "Delete" ||
        e.key === "."
      ) {
        if (previousValue) {
          e.target.textContent = ""
          checkCandidates(previousValue, e.target.parentElement)
          refreshCandidates()
          unhighlightEls([e.target])
        }

        if (!boardData.isSet) movePlaceBy(1)
        return
      }
    }

    if (e.key === "ArrowUp" || e.key === "w") {
      movePlaceBy(-9)
      return
    }
    if (e.key === "ArrowLeft" || e.key === "a") {
      movePlaceBy(-1)
      return
    }

    if (e.key === "ArrowDown" || e.key === "s") {
      movePlaceBy(9)
      return
    }
    if (e.key === "ArrowRight" || e.key === "d" || e.key === " ") {
      movePlaceBy(1)
      return
    }
  }
})

function refreshAllHighlights() {
  allPadNumbers.forEach(padNumber => {
    refreshHighlightsOf(padNumber)
  })
}

function refreshHighlightsOf(padNumber) {
  const isHighlighted = padNumber.classList.contains("highlight")
  const number = padNumber.textContent
  const squareNumbers = allSquareNumbers.filter(el => {
    return el.textContent === number
  })
  const candidates = allCandidates.filter(el => el.dataset.number === number)
  const els = [...candidates, ...squareNumbers]

  els.forEach(el => {
    isHighlighted ? highlightEls([el]) : unhighlightEls([el])
  })
}

function toggleHighlight(target) {
  if (!target.classList.contains("highlight")) {
    unhighlightEls(allPadNumbers)
    highlightEls([target])
  } else {
    unhighlightEls([target])
  }

  refreshAllHighlights()
}

function highlightEls(elArr) {
  elArr.forEach(el => {
    el.classList.add("highlight")
  })
}
function unhighlightEls(elArr) {
  elArr.forEach(el => {
    el.classList.remove("highlight")
  })
}

function inputGridString() {
  const gridStringInput = document.querySelector(".grid-string")
  const gridString = gridStringInput.value
  if (gridString.length != 81) {
    console.log("not 81")
    gridStringInput.value = ""
    return
  }

  gridString.split("").forEach((character, index) => {
    setTimeout(() => {
      const squareNumberFocus = document.querySelector(
        `.square[data-place='${(index + 1).toString()}'] .entry`
      )

      focusTarget(squareNumberFocus)

      inputCharacter(character)
      if (index + 1 == 81) setGrid()
    }, 10 * (index + 1))
  })
  gridStringInput.value = ""
}

function refreshCandidates() {
  if (boardData.candidatesOn) {
    showCandidates()
  } else {
    hideCandidates()
  }
}

function toggleCandidates() {
  clearAnyWrong()
  boardData.candidatesOn ? hideCandidates() : showCandidates()
}

function getSquaresSeenBy(squareEl) {
  const rowSquares = Array.from(
    document.querySelectorAll(`.square[data-row-n='${squareEl.dataset.rowN}']`)
  )
  const colSquares = Array.from(
    document.querySelectorAll(`.square[data-col-n='${squareEl.dataset.colN}']`)
  )
  const boxSquares = Array.from(
    document.querySelectorAll(`.square[data-box-n='${squareEl.dataset.boxN}']`)
  )

  const squaresSeenBy = Array.from(
    new Set([...rowSquares, ...colSquares, ...boxSquares])
  )
  return squaresSeenBy
}

function checkCandidates(number, squareEl) {
  const squaresToCheck = getSquaresSeenBy(squareEl)

  squaresToCheck.forEach(square => {
    if (square.dataset.place === squareEl.dataset.place) {
      Array.from(square.querySelectorAll(".candidate")).forEach(candidate => {
        setTextOfCandidate(candidate)
      })
    } else {
      const matchingCandidate = square.querySelector(
        `.candidate[data-number="${number}"]`
      )
      setTextOfCandidate(matchingCandidate)
    }
  })
}

function setTextOfCandidate(candidate) {
  if (
    checkLocallyValidPlacement(
      candidate.dataset.number,
      candidate.parentElement,
      false
    )
  ) {
    candidate.textContent = candidate.dataset.number
  } else {
    candidate.textContent = ""
  }
}

function showCandidates() {
  allCandidates.forEach(candidate => {
    if (candidate.parentElement.querySelector(".entry").textContent) {
      candidate.textContent = ""
    }

    if (candidate.textContent == "") {
      candidate.classList.add("hidden")
    } else {
      candidate.classList.remove("hidden")
    }
  })
  boardData.candidatesOn = true
}

function hideCandidates() {
  allCandidates.forEach(candidate => {
    candidate.classList.add("hidden")
  })
  boardData.candidatesOn = false
}

function movePlaceBy(numPlaces) {
  const currentFocusedEl = document.activeElement
  const currentPlace = Number(currentFocusedEl.dataset.squareN)
  const nextPlace = (currentPlace + numPlaces + 81) % 81 || 81
  const selector = `.square[data-square-id="${nextPlace.toString()}"] .entry`
  const nextEl = document.querySelector(selector)
  focusTarget(nextEl)
}

function clearAnyWrong() {
  const el = document.querySelector(".wrong")
  if (el) {
    el.classList.remove("wrong")
    el.textContent = ""
    refreshCandidates()
  }
}

function checkLocallyValidPlacement(keyString, squareEl, includeSelf = true) {
  const localSquares = getSquaresSeenBy(squareEl)

  if (isAlreadyIn(keyString, localSquares, squareEl, includeSelf)) {
    return false
  }

  return true
}

function isAlreadyIn(keyString, squaresGroup, squareEl, includeSelf) {
  let squareNumbersGroup = squaresGroup.map(square => {
    return square.querySelector(".entry")
  })
  let isIn = false
  for (const squareNumberEl of squareNumbersGroup) {
    if (!includeSelf && squareNumberEl.parentElement == squareEl) {
      continue
    }
    if (squareNumberEl.textContent == keyString) {
      isIn = true
      return isIn
    }
  }

  return isIn
}

function setGrid() {
  if (boardData.isSet) return
  allSquareNumbers.forEach(squareNumber => {
    if (squareNumber.textContent != "") {
      squareNumber.contentEditable = false
      squareNumber.classList.add("set")
    }
  })
  boardData.isSet = true
}

function clearBoard() {
  boardData.isSet = false
  boardData.candidatesOn = false
  // grid.innerHTML = ""
  // generateBoxes(grid)
  generateRuleItems()
  allCandidates = Array.from(document.querySelectorAll(".candidate"))
  allSquareNumbers = Array.from(document.querySelectorAll(".entry"))
  allPadNumbers = Array.from(document.querySelectorAll(".pad-number"))
  getAllUnitsSquares()

  unhighlightEls(allPadNumbers)
}

function getAllUnitsSquares() {
  for (let i = 1; i <= 9; i++) {
    allUnitsSquares.push(
      Array.from(document.querySelectorAll(`.square[data-row-n="${i}"]`))
    )
    allUnitsSquares.push(
      Array.from(document.querySelectorAll(`.square[data-col-n="${i}"]`))
    )
    allUnitsSquares.push(
      Array.from(document.querySelectorAll(`.square[data-box-n="${i}"]`))
    )
  }
}
