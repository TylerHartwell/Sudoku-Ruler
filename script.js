import { generateBoxes } from "./board.js"
const grid = document.querySelector(".grid")

let allCandidates
let isSet = false
let candidatesOn = false
clearGrid()
document.body.addEventListener("click", e => {
  if (e.target.classList.contains("toggle-candidates-btn")) {
    toggleCandidates()
  }
  if (e.target.classList.contains("square-number")) {
    if (!isSet || e.target.contentEditable) {
      enterNumber(e)
    }
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

  clearWrong()
  if (e.target.classList.contains("square-number")) {
    const currentPlace = Number(e.target.parentElement.dataset.place)
    if (/[1-9]/.test(e.key) && !e.repeat) {
      if (!checkValidPlacement(e.key, e.target.parentElement)) {
        e.target.classList.add("wrong")
        e.target.innerText = e.key
        return
      }

      e.target.innerText = e.key
      removeSeenCandidates(e.target.parentElement)
      if (!isSet) movePlaceBy(1)
    } else if (e.key === "0" || e.key === "Backspace" || e.key === "Delete") {
      e.target.innerText = ""
      removeSeenCandidates(e.target.parentElement)
      if (!isSet) movePlaceBy(1)
    } else if (e.key === "ArrowLeft") {
      movePlaceBy(-1)
    } else if (e.key === "ArrowUp") {
      movePlaceBy(-9)
    } else if (e.key === "ArrowDown") {
      movePlaceBy(9)
    } else {
      movePlaceBy(1)
    }

    function movePlaceBy(numPlaces) {
      clearWrong()
      const nextPlace = (currentPlace + numPlaces + 81) % 81 || 81
      const selector = `.square[data-place="${nextPlace.toString()}"] .square-number`
      const nextEl = grid.querySelector(selector)
      nextEl.focus()
    }
  }
})

function clearWrong() {
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

function enterNumber(e) {
  clearWrong()
  e.target.focus()
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
