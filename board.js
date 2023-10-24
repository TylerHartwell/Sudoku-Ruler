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
  const b = parseInt(box.dataset.boxID)
  for (let s = 1; s <= 9; s++) {
    const square = document.createElement("div")
    const rowN = Math.round(
      Math.floor((b - 1) / 3) * 3 + Math.floor((s - 1) / 3) + 1
    )
    const colN = Math.round(((b - 1) % 3) * 3 + ((s - 1) % 3) + 1)

    square.classList.add("square")
    square.dataset.rowN = rowN
    square.dataset.colN = colN
    square.dataset.boxN = b
    square.dataset.place = (rowN - 1) * 9 + colN

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
  for (let c = 1; c <= 9; c++) {
    const candidate = document.createElement("div")
    candidate.classList.add(...["candidate", "hidden"])
    candidate.style.gridArea = `c${c}`
    candidate.dataset.number = `${c}`
    candidate.innerText = `${c}`
    square.appendChild(candidate)
  }
}
