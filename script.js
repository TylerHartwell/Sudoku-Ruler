import { generateBoxes } from "./board.js"

window.onload = () => {
  const grid = document.querySelector(".grid")

  generateBoxes(grid)
}
