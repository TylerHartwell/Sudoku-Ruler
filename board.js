export const boardData = {
  isSet: false,
  candidatesOn: false,
  allBoxes: generateBoxes(),
  allEntries: [],
  createBoardHTML: () => {
    const boardEl = document.querySelector(".board")

    boardData.allBoxes.forEach(box => {
      const boxEl = document.createElement("div")
      boxEl.classList.add("box")
      boxEl.dataset.boxId = box.boxId
      boardEl.appendChild(boxEl)

      box.boxSquares.forEach(square => {
        const squareEl = document.createElement("div")
        squareEl.classList.add("square")
        squareEl.dataset.rowN = square.rowN
        squareEl.dataset.colN = square.colN
        squareEl.dataset.boxN = square.boxN
        squareEl.dataset.squareId = square.squareId
        boxEl.appendChild(squareEl)

        const entryEl = document.createElement("div")
        entryEl.classList.add("entry")
        entryEl.dataset.boxN = square.boxN
        entryEl.dataset.squareN = square.squareId
        entryEl.textContent = square.entry.value
        entryEl.contentEditable = true
        entryEl.tabIndex = -1
        squareEl.appendChild(entryEl)

        square.squareCandidates.forEach(candidate => {
          const candidateEl = document.createElement("div")
          candidateEl.classList.add("candidate")
          candidateEl.dataset.number = candidate.number
          candidateEl.dataset.boxN = square.boxN
          candidateEl.dataset.squareN = square.squareId
          candidateEl.style.gridArea = `c${candidate.number}`
          candidateEl.textContent = candidate.number
          squareEl.appendChild(candidateEl)
        })
      })
    })
  }
}

function generateBoxes() {
  let allBoxes = []
  for (let b = 1; b <= 9; b++) {
    const box = {
      boxId: b,
      boxSquares: generateSquares(b)
    }
    allBoxes.push(box)
  }
  return allBoxes
}

function generateSquares(b) {
  let boxSquares = []
  for (let s = 1; s <= 9; s++) {
    const rowN = Math.round(
      Math.floor((b - 1) / 3) * 3 + Math.floor((s - 1) / 3) + 1
    )
    const colN = Math.round(((b - 1) % 3) * 3 + ((s - 1) % 3) + 1)
    const squareId = (rowN - 1) * 9 + colN
    const square = {
      rowN: rowN,
      colN: colN,
      boxN: b,
      squareId: squareId,
      isHighlighted: false,
      entry: {
        squareN: squareId,
        solution: "0",
        value: "0",
        isHighlighted: false
      },
      squareCandidates: generateCandidates(squareId)
    }
    boxSquares.push(square)
  }
  return boxSquares
}

function generateCandidates(squareId) {
  let squareCandidates = []
  for (let c = 1; c <= 9; c++) {
    const candidate = {
      squareN: squareId,
      number: c.toString(),
      isHighlighted: false,
      isShown: false
    }
    squareCandidates.push(candidate)
  }
  return squareCandidates
}
