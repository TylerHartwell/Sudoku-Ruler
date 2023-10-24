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
    if (!isSet) {
      enterNumber(e)
    }
  }
  if (e.target.classList.contains("clear-grid-btn")) {
    if (confirm("clear all?")) {
      clearGrid()
    }
  }
})

document.body.addEventListener("keydown", e => {
  e.preventDefault()

  if (e.target.classList.contains("square-number")) {
    const currentPlace = Number(e.target.parentElement.dataset.place)
    if (/[1-9]/.test(e.key) && !e.repeat) {
      e.target.innerText = e.key
      removeSeenCandidates(e.target.parentElement)
      movePlaceBy(1)
    }
    if (e.key === "ArrowLeft") {
      movePlaceBy(-1)
    } else if (e.key === "ArrowUp") {
      movePlaceBy(-9)
    } else if (e.key === "ArrowDown") {
      movePlaceBy(9)
    } else {
      movePlaceBy(1)
    }

    function movePlaceBy(numPlaces) {
      const nextPlace = (currentPlace + numPlaces + 81) % 81 || 81
      const selector = `.square[data-place="${nextPlace.toString()}"] .square-number`
      const nextEl = grid.querySelector(selector)
      nextEl.focus()
    }
  }
})

function enterNumber(e) {
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
