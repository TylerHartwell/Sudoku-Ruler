import { boardData, createBoardHTML, resetBoardData } from "./board.js"
import { createRulesHTML, rulesArr } from "./rules.js"

createBoardHTML()
createRulesHTML()

let allEntryEls = Array.from(document.querySelectorAll(".entry"))
let allCandidateEls = Array.from(document.querySelectorAll(".candidate"))
let allPadNumEls = Array.from(document.querySelectorAll(".pad-number"))
let allUnitSquaresEls = getAllUnitSquaresEls()

document.body.addEventListener("click", e => {
  clearAnyWrong()
  if (e.shiftKey) {
    if (e.target.classList.contains("candidate")) {
      e.target.textContent = ""
      refreshAllCandidatesDisplay()
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
    allEntryEls.forEach(el => {
      el.classList.remove("no-pointer")
    })
  }
})

document.body.addEventListener("keydown", e => {
  if (e.shiftKey && !e.repeat) {
    allEntryEls.forEach(el => {
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
          refreshAllCandidatesDisplay()
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
        eliminateCandidatesOf(e.target)
        refreshAllCandidatesDisplay()

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
          refreshAllCandidatesDisplay()
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

const focusTarget = target => {
  clearAnyWrong()
  target.focus()
}

const inputCharacter = character => {
  if (/[1-9]/.test(character)) {
    document.activeElement.textContent = character
    checkCandidates(character, document.activeElement.parentElement)
    refreshAllCandidatesDisplay()
    refreshAllHighlights()
  }
}

function tryNextSolve(ruleItem) {
  console.log("try next solve")
  rulesArr[[...ruleItem.parentElement.children].indexOf(ruleItem)](
    allUnitSquaresEls,
    focusTarget,
    inputCharacter
  )
}

function refreshAllHighlights() {
  allPadNumEls.forEach(padNumber => {
    refreshHighlightsOf(padNumber)
  })
}

function refreshHighlightsOf(padNumber) {
  const isHighlighted = padNumber.classList.contains("highlight")
  const number = padNumber.textContent
  const squareNumbers = allEntryEls.filter(el => {
    return el.textContent === number
  })
  const candidates = allCandidateEls.filter(el => el.dataset.number === number)
  const els = [...candidates, ...squareNumbers]

  els.forEach(el => {
    isHighlighted ? highlightEls([el]) : unhighlightEls([el])
  })
}

function toggleHighlight(target) {
  if (!target.classList.contains("highlight")) {
    unhighlightEls(allPadNumEls)
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
        `.square[data-square-id='${(index + 1).toString()}'] .entry`
      )

      focusTarget(squareNumberFocus)

      inputCharacter(character)
      if (index + 1 == 81) setGrid()
    }, 10 * (index + 1))
  })
  gridStringInput.value = ""
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
      Array.from(square.querySelectorAll(".candidate")).forEach(candidateEl => {
        updateCandidateElimination(candidateEl)
      })
    } else {
      const matchingCandidateEl = square.querySelector(
        `.candidate[data-entry="${number}"]`
      )
      updateCandidateElimination(matchingCandidateEl)
    }
  })
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
    refreshAllCandidatesDisplay()
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
  allEntryEls.forEach(squareNumber => {
    if (squareNumber.textContent != "") {
      squareNumber.contentEditable = false
      squareNumber.classList.add("set")
    }
  })
  boardData.isSet = true
}

function clearBoard() {
  resetBoardData()

  unhighlightEls(allPadNumEls)
}

///////////////////////

function eliminateCandidatesOf(entryEl) {
  const squareCandidatesObjs = getSquareCandidatesOf(entryEl)
  squareCandidatesObjs.forEach(squareCandidateObj => {
    squareCandidateObj.eliminated = true
  })
}

function getSquareCandidatesOf(entryEl) {
  const boxN = entryEl.dataset.boxN
  const squareN = entryEl.dataset.squareN

  const entryBox = boardData.allBoxes.find(box => box.boxId == boxN)
  const entrySquare = entryBox.boxSquares.find(
    square => square.squareId == squareN
  )

  const squareCandidatesObjs = entrySquare.squareCandidates

  return squareCandidatesObjs
}

function updateCandidateElimination(candidateEl) {
  if (
    !checkLocallyValidPlacement(
      candidateEl.dataset.number,
      candidateEl.parentElement,
      false
    )
  ) {
    getCandidateObj(candidateEl).eliminated = true
  }
}

function getAllUnitSquaresEls() {
  let allUnitSquaresEls = []
  for (let i = 1; i <= 9; i++) {
    allUnitSquaresEls.push(
      Array.from(document.querySelectorAll(`.square[data-row-n="${i}"]`))
    )
    allUnitSquaresEls.push(
      Array.from(document.querySelectorAll(`.square[data-col-n="${i}"]`))
    )
    allUnitSquaresEls.push(
      Array.from(document.querySelectorAll(`.square[data-box-n="${i}"]`))
    )
  }
  return allUnitSquaresEls
}

function getCandidateObj(candidateEl) {
  const boxN = candidateEl.dataset.boxN
  const squareN = candidateEl.dataset.squareN
  const number = candidateEl.dataset.number
  const candidateBox = boardData.allBoxes.find(box => box.boxId == boxN)
  const candidateSquare = candidateBox.boxSquares.find(
    square => square.squareId == squareN
  )
  const candidateObj = candidateSquare.squareCandidates.find(
    candidate => candidate.number == number
  )
  return candidateObj
}

function refreshCandidateDisplay(candidateEl) {
  const candidateObj = getCandidateObj(candidateEl)

  candidateEl.classList.toggle(
    "hidden",
    candidateObj.eliminated || !boardData.candidatesOn
  )
  candidateEl.classList.toggle("highlight", candidateObj.isHighlighted)
}

function refreshAllCandidatesDisplay() {
  allCandidateEls.forEach(candidateEl => {
    refreshCandidateDisplay(candidateEl)
  })
}

function toggleCandidates() {
  clearAnyWrong()
  boardData.candidatesOn = !boardData.candidatesOn
  refreshAllCandidatesDisplay()
}
