import { generateBoxes } from "./board.js"
const grid = document.querySelector(".grid")

let isSet = false
generateBoxes(grid)
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

function toggleCandidates() {
  Array.from(document.querySelectorAll(".candidate")).forEach(candidate => {
    if (candidate.parentElement) candidate.classList.toggle("hidden")
  })
}

function clearGrid() {
  isSet = false
  grid.innerHTML = ""
  generateBoxes(grid)
}
