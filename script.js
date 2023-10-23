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

let nextPlace

document.body.addEventListener("keydown", e => {
  e.preventDefault()

  if (e.target.isContentEditable && /[1-9]/.test(e.key) && !e.repeat) {
    e.target.innerText = e.key
    nextPlace = Number(e.target.parentElement.dataset.place) + 1
    if (nextPlace == 82) {
      e.target.blur()
      return
    }
    const selector = `.square[data-place="${nextPlace.toString()}"] .square-number`

    e.target.addEventListener("keyup", e => {
      const currentEl = e.target
      focusNextSquareNumber(currentEl, selector)
    })
  }
})

function focusNextSquareNumber(currentEl, selector) {
  const nextEl = grid.querySelector(selector)
  nextEl.contentEditable = true
  nextEl.focus()
  currentEl.removeEventListener("keyup", focusNextSquareNumber)
}

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
