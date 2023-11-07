import { boardData, createBoardHTML, resetBoardData } from "./board.js"
import { createRulesHTML, rulesArr } from "./rules.js"

createBoardHTML()
createRulesHTML()

let allEntryEls = Array.from(document.querySelectorAll(".entry"))
let allCandidateEls = Array.from(document.querySelectorAll(".candidate"))
let allPadNumEls = Array.from(document.querySelectorAll(".pad-number"))
let allUnitSquaresEls = getAllUnitSquaresEls()

document.body.addEventListener("click", e => {
  clearAnyWrong()
  if (e.shiftKey) {
    if (e.target.classList.contains("candidate")) {
      const candidateEl = e.target
      getCandidateObj(candidateEl).eliminated = true
      refreshCandidateDisplay(candidateEl)
    }
  }

  if (e.target.classList.contains("try-next-btn")) {
    tryNextSolve(e.target.parentElement)
  }

  if (e.target.classList.contains("toggle-candidates-btn")) {
    toggleCandidates()
  }
  if (e.target.classList.contains("entry")) {
    focusTarget(e.target)
  }
  if (e.target.classList.contains("clear-grid-btn")) {
    if (confirm("clear all?")) {
      clearBoard()
    }
  }
  if (e.target.classList.contains("input-grid-string-btn")) {
    inputGridString()
  }
  if (e.target.classList.contains("set-grid-btn")) {
    setGrid()
  }
  if (e.target.classList.contains("pad-number")) {
    toggleHighlight(e.target)
  }
})

document.body.addEventListener("keyup", e => {
  if (e.key === "Shift") {
    allEntryEls.forEach(el => {
      el.classList.remove("no-pointer")
    })
  }
})

document.body.addEventListener("keydown", e => {
  if (e.shiftKey && !e.repeat) {
    allEntryEls.forEach(el => {
      el.classList.add("no-pointer")
    })
    return
  }

  if (e.target.classList.contains("entry")) {
    e.preventDefault()
    clearAnyWrong()

    const entryEl = e.target
    const entryObj = getEntryObj(entryEl)

    if (!entryObj.isLocked) {
      const previousValue = entryObj.shownValue
      if (/[1-9]/.test(e.key) && !e.repeat) {
        if (previousValue == e.key) {
          return
        }

        if (previousValue) {
          removeEntryValue(entryObj, entryEl)
          updateCandidateEliminationOfPeers(
            previousValue,
            entryEl.parentElement
          )
        }

        // unhighlightEls([e.target])

        if (!checkLocallyValidPlacement(e.key, entryEl.parentElement, false)) {
          entryEl.textContent = e.key
          entryEl.classList.add("wrong")
          return
        }
        inputCharacter(e.key)
        updateCandidateEliminationOfPeers(e.key, entryEl.parentElement)
        refreshEntryEl(entryEl)

        if (
          document.querySelector(`.pad${e.key}`).classList.contains("highlight")
        ) {
          highlightEls([entryEl])
        }
        // refreshAllHighlights()

        if (!boardData.isSet) movePlaceBy(1)
        return
      }

      if (
        e.key === "0" ||
        e.key === "Backspace" ||
        e.key === "Delete" ||
        e.key === "."
      ) {
        if (previousValue) {
          removeEntryValue(entryObj, entryEl)
          eliminateCandidatesOf(entryEl, false)
          updateCandidateEliminationOfPeers(
            previousValue,
            entryEl.parentElement
          )
          //unhighlightEls([entryEl])
        }

        if (!boardData.isSet) movePlaceBy(1)
        return
      }
    }

    if (e.key === "ArrowUp" || e.key === "w") {
      movePlaceBy(-9)
      return
    }
    if (e.key === "ArrowLeft" || e.key === "a") {
      movePlaceBy(-1)
      return
    }

    if (e.key === "ArrowDown" || e.key === "s") {
      movePlaceBy(9)
      return
    }
    if (e.key === "ArrowRight" || e.key === "d" || e.key === " ") {
      movePlaceBy(1)
      return
    }
  }
})

// function tryNextSolve(ruleItem) {
//   console.log("try next solve")
//   rulesArr[[...ruleItem.parentElement.children].indexOf(ruleItem)](
//     allUnitSquaresEls,
//     focusTarget,
//     inputCharacter
//   )
// }

// function refreshAllHighlights() {
//   allPadNumEls.forEach(padNumber => {
//     refreshHighlightsOf(padNumber)
//   })
// }

// function refreshHighlightsOf(padNumber) {
//   const padNumIsHighlighted = padNumber.classList.contains("highlight")
//   const number = padNumber.textContent
//   const matchingEntryEls = allEntryEls.filter(entryEl => {
//     return getEntryObj(entryEl).shownValue === number
//   })
//   const matchingCandidateEls = allCandidateEls.filter(candidateEl => {
//     return getCandidateObj(candidateEl).number === number
//   })
//   const matchingEls = [...matchingCandidateEls, ...matchingEntryEls]

//   matchingEls.forEach(el => {
//     padNumIsHighlighted ? highlightEls([el]) : unhighlightEls([el])
//   })
// }

// function toggleHighlight(target) {
//   if (!target.classList.contains("highlight")) {
//     unhighlightEls(allPadNumEls)
//     highlightEls([target])
//   } else {
//     unhighlightEls([target])
//   }

//   refreshAllHighlights()
// }

// function highlightEls(elArr) {
//   elArr.forEach(el => {
//     el.classList.add("highlight")
//   })
// }

// function unhighlightEls(elArr) {
//   elArr.forEach(el => {
//     el.classList.remove("highlight")
//   })
// }

// function inputGridString() {
//   const gridStringInput = document.querySelector(".grid-string")
//   const gridString = gridStringInput.value
//   if (gridString.length != 81) {
//     console.log("not 81")
//     gridStringInput.value = ""
//     return
//   }

//   gridString.split("").forEach((character, index) => {
//     setTimeout(() => {
//       const squareNumberFocus = document.querySelector(
//         `.square[data-square-id='${(index + 1).toString()}'] .entry`
//       )

//       focusTarget(squareNumberFocus)

//       inputCharacter(character)
//       if (index + 1 == 81) setGrid()
//     }, 10 * (index + 1))
//   })
//   gridStringInput.value = ""
// }

// function setGrid() {
//   if (boardData.isSet) return
//   allEntryEls.forEach(entryEl => {
//     if (entryObj.shownValue != "") {
//       entryObj.isLocked = true
//       refreshEntryEl(entryEl)
//     }
//   })
//   boardData.isSet = true
// }

// function clearBoard() {
//   resetBoardData()
//   unhighlightEls(allPadNumEls)
// }

////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

function removeEntryValue(entryObj, entryEl) {
  entryObj.shownValue = ""
  entryEl.textContent = entryObj.shownValue
}

function inputCharacter(character) {
  if (/[1-9]/.test(character)) {
    getEntryObj(document.activeElement).shownValue = character
    updateCandidateEliminationOfPeers(
      character,
      document.activeElement.parentElement
    )
  }
}

function updateCandidateEliminationOfPeers(number, squareEl) {
  const squareElPeers = getSquareElPeersOf(squareEl)
  squareElPeers.forEach(squareElPeer => {
    if (squareElPeer.dataset.squareId === squareEl.dataset.squareId) {
      Array.from(squareEl.querySelectorAll(".candidate")).forEach(
        candidateEl => {
          updateCandidateElimination(candidateEl)
          refreshCandidateDisplay(candidateEl)
        }
      )
    } else {
      const matchingCandidateEl = squareElPeer.querySelector(
        `.candidate[data-number="${number}"]`
      )
      updateCandidateElimination(matchingCandidateEl)
      refreshCandidateDisplay(matchingCandidateEl)
    }
  })
}

function eliminateCandidatesOf(entryEl, eliminate = true) {
  const squareCandidatesObjs = getSquareCandidateObjsOf(entryEl)
  squareCandidatesObjs.forEach(squareCandidateObj => {
    squareCandidateObj.eliminated = eliminate
  })
}

function updateCandidateElimination(candidateEl) {
  getCandidateObj(candidateEl).eliminated = !checkLocallyValidPlacement(
    candidateEl.dataset.number,
    candidateEl.parentElement,
    true
  )
}

function checkLocallyValidPlacement(number, squareEl, includeSelf = true) {
  const squareElPeers = getSquareElPeersOf(squareEl)
  const entryEl = squareEl.querySelector(".entry")
  const entryObj = getEntryObj(entryEl)
  if (entryObj.shownValue) {
    return false
  }

  if (isAlreadyIn(number, squareElPeers, squareEl, includeSelf)) {
    return false
  }

  return true
}

function isAlreadyIn(number, squareElPeers, squareEl, includeSelf) {
  let entryElPeers = squareElPeers.map(squareElPeer => {
    return squareElPeer.querySelector(".entry")
  })
  let isIn = false
  for (const entryElPeer of entryElPeers) {
    if (!includeSelf && entryElPeer.parentElement == squareEl) {
      continue
    }
    if (getEntryObj(entryElPeer).shownValue == number) {
      isIn = true
      return isIn
    }
  }

  return isIn
}

function refreshEntryEl(entryEl) {
  const entryObj = getEntryObj(entryEl)
  entryEl.contentEditable = !entryObj.isLocked
  entryEl.classList.toggle("set", entryObj.isLocked)
  entryEl.textContent = entryObj.shownValue
}

function getEntryObj(entryEl) {
  const boxN = entryEl.dataset.boxN
  const squareN = entryEl.dataset.squareN
  const entryBox = boardData.allBoxes.find(box => box.boxId == boxN)
  const entrySquare = entryBox.boxSquares.find(
    square => square.squareId == squareN
  )
  const entryObj = entrySquare.entry
  return entryObj
}

function getSquareElPeersOf(squareEl) {
  const rowSquares = Array.from(
    document.querySelectorAll(`.square[data-row-n='${squareEl.dataset.rowN}']`)
  )
  const colSquares = Array.from(
    document.querySelectorAll(`.square[data-col-n='${squareEl.dataset.colN}']`)
  )
  const boxSquares = Array.from(
    document.querySelectorAll(`.square[data-box-n='${squareEl.dataset.boxN}']`)
  )

  const squaresSeenBy = Array.from(
    new Set([...rowSquares, ...colSquares, ...boxSquares])
  )
  return squaresSeenBy
}

function getAllUnitSquaresEls() {
  let allUnitSquaresEls = []
  for (let i = 1; i <= 9; i++) {
    allUnitSquaresEls.push(
      Array.from(document.querySelectorAll(`.square[data-row-n="${i}"]`))
    )
    allUnitSquaresEls.push(
      Array.from(document.querySelectorAll(`.square[data-col-n="${i}"]`))
    )
    allUnitSquaresEls.push(
      Array.from(document.querySelectorAll(`.square[data-box-n="${i}"]`))
    )
  }
  return allUnitSquaresEls
}

function getSquareCandidateObjsOf(entryEl) {
  const boxN = entryEl.dataset.boxN
  const squareN = entryEl.dataset.squareN

  const entryBox = boardData.allBoxes.find(box => box.boxId == boxN)
  const entrySquare = entryBox.boxSquares.find(
    square => square.squareId == squareN
  )

  const squareCandidatesObjs = entrySquare.squareCandidates

  return squareCandidatesObjs
}

function getCandidateObj(candidateEl) {
  const boxN = candidateEl.dataset.boxN
  const squareN = candidateEl.dataset.squareN
  const number = candidateEl.dataset.number
  const candidateBox = boardData.allBoxes.find(box => box.boxId == boxN)
  const candidateSquare = candidateBox.boxSquares.find(
    square => square.squareId == squareN
  )
  const candidateObj = candidateSquare.squareCandidates.find(
    candidate => candidate.number == number
  )
  return candidateObj
}

function refreshCandidateDisplay(candidateEl) {
  const candidateObj = getCandidateObj(candidateEl)
  candidateEl.classList.toggle(
    "hidden",
    candidateObj.eliminated || !boardData.candidatesOn
  )
  candidateEl.classList.toggle("highlight", candidateObj.isHighlighted)
}

function refreshAllCandidatesDisplay() {
  allCandidateEls.forEach(candidateEl => {
    refreshCandidateDisplay(candidateEl)
  })
}

function toggleCandidates() {
  boardData.candidatesOn = !boardData.candidatesOn
  refreshAllCandidatesDisplay()
}

const focusTarget = target => {
  target.focus()
}

function movePlaceBy(numPlaces) {
  const currentFocusedEl = document.activeElement
  const currentSquareN = Number(currentFocusedEl.dataset.squareN)
  const nextSquareN = (currentSquareN + numPlaces + 81) % 81 || 81
  const selector = `.square[data-square-id="${nextSquareN.toString()}"] .entry`
  const nextEl = document.querySelector(selector)
  focusTarget(nextEl)
}

function clearAnyWrong() {
  const wrongEntryEl = document.querySelector(".wrong")
  if (wrongEntryEl) {
    wrongEntryEl.classList.remove("wrong")
    wrongEntryEl.textContent = ""
  }
}
