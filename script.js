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

  if (e.target.isContentEditable && /[1-9]/.test(e.key) && !e.repeat) {
    e.target.innerText = e.key
    const nextPlace = Number(e.target.parentElement.dataset.place) + 1
    if (nextPlace == 82) {
      e.target.blur()
      return
    }
    function focusNextSquareNumber() {
      e.target.removeEventListener("blur", focusNextSquareNumber)
      const selector = `.square[data-place="${nextPlace.toString()}"] .square-number`
      grid.querySelector(selector).focus()
    }

    e.target.addEventListener("blur", focusNextSquareNumber)
    e.target.blur()
  }
})

function enterNumber(e) {
  if (!e.target.innerText) {
    e.target.contentEditable = true
    e.target.focus()
  } else {
    e.target.contentEditable = false
  }
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
