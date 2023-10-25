import { generateBoxes } from "./board.js"

const grid = document.querySelector(".grid")

let isSet = false
let candidatesOn = false
let allCandidates
clearGrid()

document.body.addEventListener("click", e => {
  clearAnyWrong()
  if (e.target.classList.contains("toggle-candidates-btn")) {
    toggleCandidates()
  }
  if (e.target.classList.contains("square-number")) {
    focusTarget(e.target)
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

  clearAnyWrong()
  if (!e.target.classList.contains("square-number")) return

  const currentPlace = Number(e.target.parentElement.dataset.place)

  if (e.target.contentEditable === "true") {
    if (/[1-9]/.test(e.key) && !e.repeat) {
      if (!checkLocallyValidPlacement(e.key, e.target.parentElement)) {
        e.target.classList.add("wrong")
        e.target.innerText = e.key
        return
      }

      if (e.target.innerText) {
        const recandidate = e.target.innerText
        changeSeenCandidates(e.target, recandidate, true)
      }

      e.target.innerText = e.key
      changeSeenCandidates(e.target, e.key, false)

      if (!isSet) movePlaceBy(currentPlace, 1)
      return
    }

    if (e.key === "0" || e.key === "Backspace" || e.key === "Delete") {
      if (e.target.innerText) {
        console.log(e.target.innerText)
        const recandidate = e.target.innerText
        e.target.innerText = ""
        changeSeenCandidates(e.target, recandidate, true)
      }

      if (!isSet) movePlaceBy(currentPlace, 1)
      return
    }
  }

  if (e.key === "ArrowLeft") {
    movePlaceBy(currentPlace, -1)
    return
  }
  if (e.key === "ArrowUp") {
    movePlaceBy(currentPlace, -9)
    return
  }
  if (e.key === "ArrowDown") {
    movePlaceBy(currentPlace, 9)
    return
  }
  if (e.key === "ArrowRight" || e.key === " ") {
    movePlaceBy(currentPlace, 1)
    return
  }
})

function changeSeenCandidates(squareNumEl, candidateNumber, inclusion) {
  console.log("changeSeenCandidates")
  const squareEl = squareNumEl.parentElement
  allCandidates.forEach(candidate => {
    if (
      candidate.parentElement.dataset.place === squareEl.dataset.place ||
      (candidate.dataset.number === candidateNumber &&
        (candidate.parentElement.dataset.rowN === squareEl.dataset.rowN ||
          candidate.parentElement.dataset.colN === squareEl.dataset.colN ||
          candidate.parentElement.dataset.boxN === squareEl.dataset.boxN))
    ) {
      if (inclusion) {
        candidate.innerText = candidate.dataset.number
      } else {
        candidate.innerText = ""
      }
    }
  })

  refreshCandidates()
}

function refreshCandidates() {
  console.log("refreshCandidates")
  if (candidatesOn) {
    showCandidates()
  }
}

function toggleCandidates() {
  console.log("toggleCandidates")
  clearAnyWrong()
  candidatesOn ? hideCandidates() : showCandidates()
}

//check all candidates of the removed digit that are in the same row or column as removed digit
// function checkCandidate(){

//   checkLocallyValidPlacement(removedNumber, )
// }

function showCandidates() {
  console.log("showCandidates")
  allCandidates.forEach(candidate => {
    if (
      candidate.innerText != "" &&
      candidate.parentElement.querySelector(".square-number").textContent === ""
    ) {
      candidate.classList.remove("hidden")
    } else {
      candidate.classList.add("hidden")
    }
  })
  candidatesOn = true
}

function hideCandidates() {
  console.log("hideCandidates")
  allCandidates.forEach(candidate => {
    if (candidate.innerText != "") {
      candidate.classList.add("hidden")
    }
  })
  candidatesOn = false
}

function movePlaceBy(currentPlace, numPlaces) {
  const nextPlace = (currentPlace + numPlaces + 81) % 81 || 81
  const selector = `.square[data-place="${nextPlace.toString()}"] .square-number`
  const nextEl = grid.querySelector(selector)
  focusTarget(nextEl)
}

function clearAnyWrong() {
  const el = document.querySelector(".wrong")
  if (el) {
    el.classList.remove("wrong")
    el.textContent = ""
  }
}

function checkLocallyValidPlacement(keyString, squareEl) {
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

function focusTarget(target) {
  clearAnyWrong()
  target.focus()
}

function clearGrid() {
  isSet = false
  candidatesOn = false
  grid.innerHTML = ""
  generateBoxes(grid)
  allCandidates = Array.from(document.querySelectorAll(".candidate"))
}
