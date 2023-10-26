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
  if (e.target.classList.contains("set-grid-btn")) {
    setGrid()
  }
})

document.body.addEventListener("keydown", e => {
  e.preventDefault()

  clearAnyWrong()
  if (!e.target.classList.contains("square-number")) return

  const currentPlace = Number(e.target.parentElement.dataset.place)

  if (e.target.contentEditable === "true") {
    const previousValue = e.target.textContent
    if (/[1-9]/.test(e.key) && !e.repeat) {
      if (previousValue == e.key) {
        return
      }

      e.target.textContent = e.key

      if (!checkLocallyValidPlacement(e.key, e.target.parentElement, false)) {
        e.target.classList.add("wrong")
        return
      }

      if (previousValue) {
        checkCandidates(previousValue, e.target.parentElement)
      }
      checkCandidates(e.key, e.target.parentElement)
      refreshCandidates()

      if (!isSet) movePlaceBy(currentPlace, 1)
      return
    }

    if (e.key === "0" || e.key === "Backspace" || e.key === "Delete") {
      if (previousValue) {
        e.target.textContent = ""
        checkCandidates(previousValue, e.target.parentElement)
        refreshCandidates()
      }

      if (!isSet) movePlaceBy(currentPlace, 1)
      return
    }
  }

  if (e.key === "ArrowLeft") {
    movePlaceBy(currentPlace, -1)
    return
  }
  if (e.key === "ArrowUp") {
    movePlaceBy(currentPlace, -9)
    return
  }
  if (e.key === "ArrowDown") {
    movePlaceBy(currentPlace, 9)
    return
  }
  if (e.key === "ArrowRight" || e.key === " ") {
    movePlaceBy(currentPlace, 1)
    return
  }
})

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

function movePlaceBy(currentPlace, numPlaces) {
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
