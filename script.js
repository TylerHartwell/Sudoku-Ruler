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
    if (/[1-9]/.test(e.key) && !e.repeat) {
      if (!checkValidPlacement(e.key, e.target.parentElement)) {
        e.target.classList.add("wrong")
        e.target.innerText = e.key
        return
      }

      e.target.innerText = e.key
      removeSeenCandidates(e.target.parentElement)
      if (!isSet) movePlaceBy(currentPlace, 1)
      return
    }

    if (e.key === "0" || e.key === "Backspace" || e.key === "Delete") {
      e.target.innerText = ""
      removeSeenCandidates(e.target.parentElement)
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

function checkValidPlacement(keyString, squareEl) {
  const rowSquares = Array.from(
    document.querySelectorAll(
      `.square[data-row-n='${squareEl.dataset.rowN}'] .square-number`
    )
  )
  const colSquares = Array.from(
    document.querySelectorAll(
      `.square[data-col-n='${squareEl.dataset.colN}'] .square-number`
    )
  )
  const boxSquares = Array.from(
    document.querySelectorAll(
      `.square[data-box-n='${squareEl.dataset.boxN}'] .square-number`
    )
  )
  if (
    isAlreadyIn(keyString, rowSquares, squareEl) ||
    isAlreadyIn(keyString, colSquares, squareEl) ||
    isAlreadyIn(keyString, boxSquares, squareEl)
  ) {
    return false
  }

  return true
}

function isAlreadyIn(keyString, squaresGroup, squareEl) {
  let isIn = false
  for (const square of squaresGroup) {
    if (square.textContent == keyString && square.parentElement != squareEl) {
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
  // if (!isSet || target.contentEditable) {
  clearAnyWrong()
  target.focus()
  // }
}

function removeSeenCandidates(squareEl) {
  const squareNumber = squareEl.querySelector(".square-number").innerText
  allCandidates.forEach(candidate => {
    if (
      candidate.parentElement.dataset.place === squareEl.dataset.place ||
      (candidate.dataset.number === squareNumber &&
        (candidate.parentElement.dataset.rowN === squareEl.dataset.rowN ||
          candidate.parentElement.dataset.colN === squareEl.dataset.colN ||
          candidate.parentElement.dataset.boxN === squareEl.dataset.boxN))
    ) {
      candidate.classList.add("hidden")
      candidate.innerText = ""
    } else {
      candidate.innerText = candidate.dataset.number
    }
  })
}

function toggleCandidates() {
  candidatesOn ? hideCandidates() : showCandidates()
}

function showCandidates() {
  allCandidates.forEach(candidate => {
    if (candidate.innerText != "") {
      candidate.classList.remove("hidden")
    }
  })
  candidatesOn = true
}

function hideCandidates() {
  allCandidates.forEach(candidate => {
    if (candidate.innerText != "") {
      candidate.classList.add("hidden")
    }
  })
  candidatesOn = false
}

function clearGrid() {
  isSet = false
  candidatesOn = false
  grid.innerHTML = ""
  generateBoxes(grid)
  allCandidates = Array.from(document.querySelectorAll(".candidate"))
}
