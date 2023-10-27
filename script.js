import { generateBoxes } from "./board.js"

const grid = document.querySelector(".grid")

let isSet = false
let candidatesOn = false
let allCandidates
clearGrid()

document.body.addEventListener("click", e => {
  clearAnyWrong()
  if (e.target.classList.contains("toggle-candidates-btn")) {
    toggleCandidates()
  }
  if (e.target.classList.contains("square-number")) {
    focusTarget(e.target)
  }
  if (e.target.classList.contains("clear-grid-btn")) {
    if (confirm("clear all?")) {
      clearGrid()
    }
  }
  if (e.target.classList.contains("input-grid-string-btn")) {
    inputGridString()
  }
  if (e.target.classList.contains("set-grid-btn")) {
    setGrid()
  }
  if (e.target.classList.contains("pad-number")) {
    toggleElHighlightOf(e.target)
  }
})

document.body.addEventListener("keydown", e => {
  if (e.target.classList.contains("square-number")) {
    e.preventDefault()

    if (e.target.contentEditable === "true") {
      const previousValue = e.target.textContent
      if (/[1-9]/.test(e.key) && !e.repeat) {
        if (previousValue == e.key) {
          return
        }

        inputCharacter(e.key)

        if (previousValue) {
          checkCandidates(previousValue, e.target.parentElement)
        }
        if (!checkLocallyValidPlacement(e.key, e.target.parentElement, false)) {
          e.target.classList.add("wrong")
          return
        }

        checkCandidates(e.key, e.target.parentElement)
        refreshCandidates()

        if (!isSet) movePlaceBy(1)
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
        }

        if (!isSet) movePlaceBy(1)
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

function toggleElHighlightOf(target) {
  const isHighlighted = target.classList.contains("highlight")
  const number = target.textContent
  const candidates = Array.from(
    document.querySelectorAll(`.candidate[data-number="${number}"]`)
  )
  const els = [target, ...candidates]

  els.forEach(el => {
    if (isHighlighted) {
      el.classList.remove("highlight")
    } else {
      el.classList.add("highlight")
    }
  })
}

function inputCharacter(character) {
  if (/[1-9]/.test(character)) {
    document.activeElement.textContent = character
    checkCandidates(character, document.activeElement.parentElement)
    refreshCandidates()
  }
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
        `.square[data-place='${(index + 1).toString()}'] .square-number`
      )

      focusTarget(squareNumberFocus)

      inputCharacter(character)
    }, 10 * (index + 1))
  })
  gridStringInput.value = ""
}

function refreshCandidates() {
  if (candidatesOn) {
    showCandidates()
  } else {
    hideCandidates()
  }
}

function toggleCandidates() {
  clearAnyWrong()
  candidatesOn ? hideCandidates() : showCandidates()
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
      candidate.parentElement
    )
  ) {
    candidate.textContent = candidate.dataset.number
  } else {
    candidate.textContent = ""
  }
}

function showCandidates() {
  allCandidates.forEach(candidate => {
    if (
      candidate.textContent == "" ||
      candidate.parentElement.querySelector(".square-number").textContent
    ) {
      candidate.classList.add("hidden")
    } else {
      candidate.classList.remove("hidden")
    }
  })
  candidatesOn = true
}

function hideCandidates() {
  allCandidates.forEach(candidate => {
    candidate.classList.add("hidden")
  })
  candidatesOn = false
}

function movePlaceBy(numPlaces) {
  const currentFocusedEl = document.activeElement
  const currentPlace = Number(currentFocusedEl.parentElement.dataset.place)
  const nextPlace = (currentPlace + numPlaces + 81) % 81 || 81
  const selector = `.square[data-place="${nextPlace.toString()}"] .square-number`
  const nextEl = grid.querySelector(selector)
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
    return square.querySelector(".square-number")
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
  if (isSet) return
  Array.from(document.querySelectorAll(".square-number")).forEach(
    squareNumber => {
      if (squareNumber.textContent != "") {
        squareNumber.contentEditable = false
        squareNumber.classList.add("set")
      }
    }
  )
  isSet = true
}

function focusTarget(target) {
  clearAnyWrong()
  target.focus()
}

function clearGrid() {
  isSet = false
  candidatesOn = false
  grid.innerHTML = ""
  generateBoxes(grid)
  allCandidates = Array.from(document.querySelectorAll(".candidate"))
}
