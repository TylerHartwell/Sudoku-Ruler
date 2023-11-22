import { boardData, createBoardHTML, resetBoardData } from "./board.js"
import { createRulesHTML, rulesArr, assignAllUnits } from "./rules.js"

createBoardHTML()
assignAllUnits()
createRulesHTML()

let allEntryEls = Array.from(document.querySelectorAll(".entry"))
let allCandidateEls = Array.from(document.querySelectorAll(".candidate"))
let allPadNumEls = Array.from(document.querySelectorAll(".pad-number"))

window.onload = () => {
  scaleFont()
}
window.onresize = () => {
  scaleFont()
}

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
    tryNextRule(e.target.parentElement)
  }
  if (e.target.classList.contains("toggle-candidates-btn")) {
    toggleCandidates()
    refreshAllCandidatesDisplay()
  }
  if (e.target.classList.contains("entry")) {
    focusTarget(e.target)
  }
  if (e.target.classList.contains("clear-all-btn")) {
    if (confirm("clear all?")) {
      resetAll()
    }
  }
  if (e.target.classList.contains("input-grid-string-btn")) {
    inputGridString()
  }
  if (e.target.classList.contains("set-puzzle-btn")) {
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
      if (isDeleting(e.key) || (/[1-9]/.test(e.key) && !e.repeat)) {
        if (previousValue == e.key) {
          return
        }
        if (previousValue) {
          removeEntryValue(entryObj)
          updateCandidateEliminationOfPeers(
            previousValue,
            entryEl.parentElement
          )
          refreshEntryEl(entryEl)
          unhighlightEls([entryEl])
        }
        if (/[1-9]/.test(e.key) && !e.repeat) {
          if (!isLocallyValidPlacement(e.key, entryEl.parentElement, false)) {
            entryEl.textContent = e.key
            entryEl.classList.add("wrong")
            return
          }
          handleNewEntry(entryEl, e.key)
          if (tryAutoSolves()) {
            return true
          }
        }
      }
      if (!boardData.isSet && e.key !== "Shift") movePlaceBy(1)
      return
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

function tryNextRule(ruleListItemEl) {
  console.log("\n")
  console.log("try next solve")
  const ruleSuccessful = rulesArr[
    [...ruleListItemEl.parentElement.children].indexOf(ruleListItemEl)
  ](getCandidateObj, getEntryObj, handleNewEntry, refreshCandidateDisplay)
  if (ruleSuccessful) {
    if (tryAutoSolves()) {
      return true
    }
  }
  return false
}

function tryAutoSolves() {
  if (boardData.isSet) {
    console.log("TRY AUTO")
    const ruleList = document.querySelector(".rules-list")
    const children = [...ruleList.children]
    for (const child of children) {
      if (child.querySelector("input").checked) {
        if (tryNextRule(child)) return true
      }
    }
    return false
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

function isDeleting(key) {
  return key === "0" || key === "Backspace" || key === "Delete" || key === "."
}

function inputGridString() {
  const gridStringInputEl = document.querySelector(".grid-string")
  const gridString = gridStringInputEl.value
  if (gridString.length != 81) {
    console.log("not 81")
    gridStringInputEl.value = ""
    return
  }
  gridString.split("").forEach((character, index) => {
    setTimeout(() => {
      const entryEl = document.querySelector(
        `.square[data-square-id='${(index + 1).toString()}'] .entry`
      )
      handleNewEntry(entryEl, character)
      if (index + 1 == 81) setGrid()
    }, 10 * (index + 1))
  })
  gridStringInputEl.value = ""
}

function handleNewEntry(entryEl, character) {
  focusTarget(entryEl)
  inputCharacter(character)
  refreshEntryEl(entryEl)
  if (/[1-9]/.test(character)) {
    updateCandidateEliminationOfPeers(character, entryEl.parentElement)
    if (
      document.querySelector(`.pad${character}`).classList.contains("highlight")
    ) {
      highlightEls([entryEl])
    }
  }
}

function setGrid() {
  if (boardData.isSet) return
  allEntryEls.forEach(entryEl => {
    const entryObj = getEntryObj(entryEl)
    if (entryObj.shownValue != "") {
      entryObj.isLocked = true
      refreshEntryEl(entryEl)
    }
  })
  document.querySelector(".grid-string").classList.add("hidden")
  document.querySelector(".input-grid-string-btn").classList.add("hidden")
  document.querySelector(".set-puzzle-btn").classList.add("hidden")
  boardData.isSet = true
  tryAutoSolves()
}

function resetAll() {
  resetBoardData()
  unhighlightEls(allPadNumEls)
  unhighlightEls(allEntryEls)
  unhighlightEls(allCandidateEls)
  allEntryEls.forEach(entryEl => {
    refreshEntryEl(entryEl)
  })
  refreshAllCandidatesDisplay()
  document.querySelector(".grid-string").classList.remove("hidden")
  document.querySelector(".input-grid-string-btn").classList.remove("hidden")
  document.querySelector(".set-puzzle-btn").classList.remove("hidden")
}

function inputCharacter(character) {
  if (/[1-9]/.test(character)) {
    getEntryObj(document.activeElement).shownValue = character
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
/////////////// Change Data Only

function removeEntryValue(entryObj) {
  entryObj.shownValue = ""
}

function updateCandidateElimination(candidateEl) {
  getCandidateObj(candidateEl).eliminated = !isLocallyValidPlacement(
    candidateEl.dataset.number,
    candidateEl.parentElement,
    true
  )
}

function isLocallyValidPlacement(number, squareEl, includeSelf = true) {
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

function toggleCandidates() {
  boardData.candidatesOn = !boardData.candidatesOn
}

////////////////////// Change DOM Only

function scaleFont() {
  let squareEl = document.querySelector(".square")
  let scaledFontSize = squareEl.offsetWidth * 1
  divs[i].style.fontSize = scaledFontSize + "px"
}

function refreshAllCandidatesDisplay() {
  allCandidateEls.forEach(candidateEl => {
    refreshCandidateDisplay(candidateEl)
  })
}

function refreshCandidateDisplay(candidateEl) {
  const candidateObj = getCandidateObj(candidateEl)
  candidateEl.classList.toggle(
    "hidden",
    candidateObj.eliminated || !boardData.candidatesOn
  )
}

function refreshEntryEl(entryEl) {
  const entryObj = getEntryObj(entryEl)
  entryEl.contentEditable = !entryObj.isLocked
  entryEl.classList.toggle("set", entryObj.isLocked)
  entryEl.textContent = entryObj.shownValue
}

function highlightEls(elArr) {
  elArr.forEach(el => {
    el.classList.add("highlight")
  })
}

function unhighlightEls(elArr) {
  elArr.forEach(el => {
    el.classList.remove("highlight")
  })
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

function refreshHighlightsOf(padNumEl) {
  const isPadNumElHighlighted = padNumEl.classList.contains("highlight")
  const number = padNumEl.textContent
  const matchingEntryEls = allEntryEls.filter(entryEl => {
    return getEntryObj(entryEl).shownValue === number
  })
  const matchingCandidateEls = allCandidateEls.filter(candidateEl => {
    return getCandidateObj(candidateEl).number === number
  })
  const matchingEls = [...matchingCandidateEls, ...matchingEntryEls]
  matchingEls.forEach(matchingEl => {
    isPadNumElHighlighted
      ? highlightEls([matchingEl])
      : unhighlightEls([matchingEl])
  })
}

function toggleHighlight(padNumEl) {
  const previouslyHighlightedPadNumEl = document.querySelector(
    ".pad-number.highlight"
  )
  if (previouslyHighlightedPadNumEl) {
    unhighlightEls([previouslyHighlightedPadNumEl])
    refreshHighlightsOf(previouslyHighlightedPadNumEl)
  }
  if (previouslyHighlightedPadNumEl != padNumEl) {
    highlightEls([padNumEl])
    refreshHighlightsOf(padNumEl)
  }
}

//TODO
//Fix layout for desktop
//test if already workable for mobile
//properly style
//hide button/fields per context
// name/describe rules better
//reorganize functions
