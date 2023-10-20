import { generateBoxes } from "./board.js"
const grid = document.querySelector(".grid")

let isSet = false
generateBoxes(grid)
document.body.addEventListener("click", e => {
  if (e.target.classList.contains("toggle-candidates-btn")) {
    toggleCandidates()
  }
  // if (e.target.classList.contains("square-number")) {
  //   if (!isSet) {
  //     enterNumber(e)
  //   }
  // }
  if (e.target.classList.contains("clear-grid-btn")) {
    if (confirm("clear all?")) {
      clearGrid()
    }
  }
})

function enterNumber(e) {
  // if (!e.target.innerText) {
  //   e.target.contentEditable = true
  // } else {
  //   e.target.contentEditable = false
  // }
  // e.target.innerText = "h"
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
