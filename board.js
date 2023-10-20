export function generateBoxes(grid) {
  for (let b = 1; b <= 9; b++) {
    const box = document.createElement("div")
    box.classList.add("threebythree")
    box.dataset.boxID = b
    grid.appendChild(box)
    generateSquares(box)
  }
}

function generateSquares(box) {
  for (let s = 1; s <= 9; s++) {
    const b = box.dataset.boxID
    const square = document.createElement("div")

    square.classList.add("square")
    square.dataset.rowN = ((b - 1) / 3) * 3 + (s - 1) / 3 + 1
    square.dataset.colN = ((s - 1) / 3) * 3 + (b - 1) / 3 + 1
    square.dataset.boxN = b

    const squareNumber = document.createElement("div")
    squareNumber.classList.add(...["square-number"])
    squareNumber.innerText = ""
    squareNumber.contentEditable = true
    square.appendChild(squareNumber)

    box.appendChild(square)
    generateCandidates(square)
  }
}

function generateCandidates(square) {
  for (let c = 0; c < 9; c++) {
    const candidate = document.createElement("div")
    candidate.classList.add(...["candidate", "hidden"])
    candidate.style.gridArea = `c${c + 1}`
    candidate.dataset.number = `${c + 1}`
    candidate.innerText = `${c + 1}`
    square.appendChild(candidate)
  }
}
