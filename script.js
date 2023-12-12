import { boardData, createBoardHTML, resetBoardData } from "./board.js"
import { createRulesHTML, rulesArr, assignAllUnits } from "./rules.js"

createBoardHTML()
assignAllUnits()
createRulesHTML()

const modeSwitchOuter = document.querySelector(".mode-switch-outer")
const modeSwitchInner = document.querySelector(".mode-switch-inner")
const solutionModeBtn = document.querySelector(".solution-mode-btn")
const candidateModeBtn = document.querySelector(".candidate-mode-btn")
const setPuzzleBtn = document.querySelector(".set-puzzle-btn")
const gridStringEl = document.querySelector(".grid-string")
const inputGridStringBtn = document.querySelector(".input-grid-string-btn")
const clearAllBtn = document.querySelector(".clear-all-btn")
const toggleCandidatesBtn = document.querySelector(".toggle-candidates-btn")
const allSquareEls = Array.from(document.querySelectorAll(".square"))
const allEntryEls = Array.from(document.querySelectorAll(".entry"))
const allCandidateEls = Array.from(document.querySelectorAll(".candidate"))
const allPadNumEls = Array.from(document.querySelectorAll(".pad-number"))
const allTryNextBtns = Array.from(document.querySelectorAll(".try-next-btn"))
const allCheckboxes = Array.from(document.querySelectorAll(".checkbox"))

let pointerDownTarget = null
let lastPointerType = "mouse"
let lastSelectedPadNum = null
let currentlySelectedEntryEl = null

window.onload = () => {
  scaleFont()
}
window.onresize = () => {
  scaleFont()
}

document.body.addEventListener("pointerdown", e => {
  e.preventDefault()
  pointerDownTarget = e.target
  lastPointerType = e.pointerType
  if (
    lastPointerType != "mouse" &&
    pointerDownTarget.classList.contains("entry")
  ) {
    e.preventDefault()
    pointerDownTarget.contentEditable = false
  }
})

document.body.addEventListener("pointerup", e => {
  e.preventDefault()
  clearAnyWrong()

  if (e.target != pointerDownTarget) return

  if (boardData.isCandidateMode) {
    if (allCandidateEls.includes(e.target)) {
      const candidateEl = e.target
      getCandidateObj(candidateEl).eliminated = true
      refreshCandidateDisplay(candidateEl)
      tryAutoSolves()
      return
    }
  }

  if (allTryNextBtns.includes(e.target)) {
    const btnEl = e.target
    const isSuccess = tryNextRule(btnEl.parentElement)
    const ruleOutcome = isSuccess ? "success" : "fail"
    btnEl.classList.add(ruleOutcome)
    setTimeout(() => {
      btnEl.classList.remove(ruleOutcome)
    }, 300)
    if (isSuccess) tryAutoSolves()
    return
  }

  if (e.target == toggleCandidatesBtn) {
    toggleCandidates()
    refreshAllCandidatesDisplay()
    return
  }

  ///&& lastPointerType == "mouse"
  if (allEntryEls.includes(e.target)) {
    if (currentlySelectedEntryEl == e.target) {
      if (lastSelectedPadNum) {
        const number = allPadNumEls.indexOf(lastSelectedPadNum) + 1
        const value = number.toString()
        handleEntryInputAttempt(value, currentlySelectedEntryEl)
      }
      blurAnyFocus()
      return
    }
    currentlySelectedEntryEl = e.target
    const blurHandler = e => {
      currentlySelectedEntryEl = null
    }
    currentlySelectedEntryEl.addEventListener("blur", blurHandler, {
      once: true
    })
    focusTarget(e.target)
    return
  }

  if (e.target == clearAllBtn) {
    if (confirm("clear all?")) {
      resetAll()
    }
    return
  }

  if (e.target == gridStringEl) {
    focusTarget(e.target)
    return
  }
  if (e.target == inputGridStringBtn) {
    inputGridString()
    return
  }

  if (e.target == setPuzzleBtn) {
    setGrid()
    return
  }

  if (allPadNumEls.includes(e.target)) {
    if (currentlySelectedEntryEl) {
      const number = allPadNumEls.indexOf(e.target) + 1
      const value = number.toString()
      if (boardData.isCandidateMode) {
        const boxN = currentlySelectedEntryEl.dataset.boxN
        const squareN = currentlySelectedEntryEl.dataset.squareN
        const candidateBox = boardData.allBoxes.find(box => box.boxId == boxN)
        const candidateSquare = candidateBox.boxSquares.find(
          square => square.squareId == squareN
        )
        const candidateObj = candidateSquare.squareCandidates.find(
          candidate => candidate.number == value
        )
        const squareEl = currentlySelectedEntryEl.parentElement
        if (candidateObj.eliminated) {
          if (isLocallyValidPlacement(value, squareEl)) {
            candidateObj.eliminated = false
          }
        } else {
          candidateObj.eliminated = true
        }
        const candidateEl = squareEl.querySelector(`[data-number="${value}"`)
        refreshCandidateDisplay(candidateEl)
        tryAutoSolves()
        blurAnyFocus()
        return
      }
      handleEntryInputAttempt(value, currentlySelectedEntryEl)
      if (boardData.isSet) blurAnyFocus()
      return
    }
    handlePadNumHighlight(e.target)
    return
  }

  if (e.target == modeSwitchOuter) {
    switchMode()
    return
  }
  if (e.target == solutionModeBtn) {
    if (boardData.isCandidateMode) {
      switchMode()
    }
    return
  }
  if (e.target == candidateModeBtn) {
    if (!boardData.isCandidateMode) {
      switchMode()
    }
    return
  }
  blurAnyFocus()
})

function handlePadNumHighlight(padNumEl) {
  if (padNumEl == lastSelectedPadNum) {
    lastSelectedPadNum = null
    toggleHighlight(padNumEl)
  } else {
    if (lastSelectedPadNum) {
      unhighlightEls([lastSelectedPadNum])
      refreshHighlightsOf(lastSelectedPadNum)
    }
    lastSelectedPadNum = padNumEl
    highlightEls([padNumEl])
    refreshHighlightsOf(padNumEl)
  }
}

allPadNumEls.forEach(el => {
  el.addEventListener("mouseenter", e => {
    if (el == lastSelectedPadNum) return
    toggleHighlight(e.target)
  })
})
allPadNumEls.forEach(el => {
  el.addEventListener("mouseout", e => {
    if (lastSelectedPadNum) {
      if (el == lastSelectedPadNum) return
      toggleHighlight(lastSelectedPadNum)
    } else {
      unhighlightEls([el])
      refreshHighlightsOf(el)
    }
  })
})

document.body.addEventListener("keyup", e => {
  if (lastPointerType != "mouse") return
  if (e.key === "Shift" && e.target !== gridStringEl) {
    switchMode()
  }
})

document.body.addEventListener("keydown", e => {
  if (e.target == gridStringEl) {
    return
  }
  e.preventDefault()
  if (e.repeat) {
    return
  }
  if (lastPointerType != "mouse") return

  clearAnyWrong()
  if (e.key == "Escape") {
    blurAnyFocus()
    return
  }
  if (e.key === "Shift") {
    switchMode()
    return
  }
  const shiftKeyPressed = e.getModifierState("Shift")
  const inputValue = shiftKeyPressed
    ? getUnshiftedNumericValue(e.code) || getUnshiftedNumericValue(e.key)
    : e.key
  if (e.target.classList.contains("entry")) {
    if (handleFocusMovementByKey(inputValue)) return
    if (boardData.isCandidateMode) return
    handleEntryInputAttempt(inputValue, e.target)
    if (boardData.isSet) blurAnyFocus()
    return
  }
  if (/[1-9]/.test(inputValue)) {
    handlePadNumHighlight(allPadNumEls[Number(inputValue) - 1])
  }
  handleFocusMovementByKey(inputValue)
})

function getUnshiftedNumericValue(codeOrKey) {
  const shiftedValues = {
    Digit1: "1",
    Digit2: "2",
    Digit3: "3",
    Digit4: "4",
    Digit5: "5",
    Digit6: "6",
    Digit7: "7",
    Digit8: "8",
    Digit9: "9",
    Digit0: "0",
    Numpad1: "1",
    Numpad2: "2",
    Numpad3: "3",
    Numpad4: "4",
    Numpad5: "5",
    Numpad6: "6",
    Numpad7: "7",
    Numpad8: "8",
    Numpad9: "9",
    Numpad0: "0"
  }
  return shiftedValues[codeOrKey] || codeOrKey
}

function handleEntryInputAttempt(value, entryEl) {
  const entryObj = getEntryObj(entryEl)
  if (!entryObj.isLocked) {
    const previousValue = entryObj.shownValue
    if (previousValue) {
      removeEntryValue(entryObj)
      updateCandidateEliminationOfPeers(previousValue, entryEl.parentElement)
      refreshEntryEl(entryEl)
      unhighlightEls([entryEl])
    }
    if (previousValue == value) {
      return
    }
    if (/[1-9]/.test(value)) {
      if (!isLocallyValidPlacement(value, entryEl.parentElement, false)) {
        entryEl.textContent = value
        entryEl.classList.add("wrong")
        return
      }
      handleNewEntry(entryEl, value)
      if (boardData.isSet) {
        tryAutoSolves()
      }
    }
    if (!boardData.isSet && !boardData.isCandidateMode) {
      movePlaceBy(1)
      return
    }
  }
}

allCheckboxes.forEach(el => {
  el.addEventListener("change", toggleAutoSolve)
})

function switchMode() {
  boardData.isCandidateMode = !boardData.isCandidateMode
  allowPointingThroughEntries(boardData.isCandidateMode)
  modeSwitchOuter.classList.toggle(
    "candidate-mode-on",
    boardData.isCandidateMode
  )
  modeSwitchInner.classList.toggle(
    "candidate-mode-on",
    boardData.isCandidateMode
  )
  solutionModeBtn.classList.toggle(
    "candidate-mode-on",
    boardData.isCandidateMode
  )
  candidateModeBtn.classList.toggle(
    "candidate-mode-on",
    boardData.isCandidateMode
  )
}

function toggleAutoSolve(e) {
  const btnEl = e.target.parentElement.querySelector(".try-next-btn")
  if (e.target.checked) {
    btnEl.disabled = true
    btnEl.textContent = "Auto"
    tryAutoSolves()
  } else {
    btnEl.disabled = false
    btnEl.textContent = "Try Next"
  }
}

function handleFocusMovementByKey(key) {
  if (key === "ArrowUp" || key === "w") {
    movePlace("up")
    return true
  }
  if (key === "ArrowLeft" || key === "a") {
    movePlace("left")
    return true
  }
  if (key === "ArrowDown" || key === "s") {
    movePlace("down")
    return true
  }
  if (key === "ArrowRight" || key === "d") {
    movePlace("right")
    return true
  }
  return false
}

function allowPointingThroughEntries(isAllowed) {
  allEntryEls.forEach(el => {
    el.classList.toggle("no-pointer", isAllowed)
  })
}

function tryNextRule(ruleListItemEl) {
  const ruleOutcome = rulesArr[
    [...ruleListItemEl.parentElement.children].indexOf(ruleListItemEl)
  ](getCandidateObj, getEntryObj, handleNewEntry, refreshCandidateDisplay)
  return ruleOutcome
}

function tryAutoSolves(hasSuccessfulRecursion = false) {
  let isSuccessfulCall = false
  const ruleList = document.querySelector(".rules-list")
  const children = [...ruleList.children]
  for (const child of children) {
    if (child.querySelector(".checkbox").checked) {
      if (tryNextRule(child)) {
        isSuccessfulCall = true
        break
      }
    }
  }
  if (isSuccessfulCall) {
    tryAutoSolves(true)
  } else {
    blurAnyFocus()
    return hasSuccessfulRecursion
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////

// function isDeleting(key) {
//   return (
//     key === "0" ||
//     key === "Backspace" ||
//     key === "Delete" ||
//     key === "." ||
//     key === " "
//   )
// }

function inputGridString() {
  const gridStringInputEl = document.querySelector(".grid-string")
  const gridString = gridStringInputEl.value
  if (gridString.length != 81) {
    gridStringInputEl.value = ""
    return
  }
  const isMaintainingCandidateMode = boardData.candidatesOn
  resetBoardData()
  unhighlightEls(allEntryEls)
  allEntryEls.forEach(entryEl => {
    refreshEntryEl(entryEl)
  })
  boardData.candidatesOn = isMaintainingCandidateMode
  refreshAllCandidatesDisplay()
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
    if (allPadNumEls[Number(character) - 1].classList.contains("highlight")) {
      highlightEls([entryEl])
    }
  }
}

function setGrid() {
  if (boardData.isSet) return
  blurAnyFocus()
  allEntryEls.forEach(entryEl => {
    const entryObj = getEntryObj(entryEl)
    if (entryObj.shownValue != "") {
      entryObj.isLocked = true
      refreshEntryEl(entryEl)
    }
  })
  gridStringEl.classList.add("hidden")
  inputGridStringBtn.classList.add("hidden")
  setPuzzleBtn.classList.add("hidden")
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
  gridStringEl.classList.remove("hidden")
  inputGridStringBtn.classList.remove("hidden")
  setPuzzleBtn.classList.remove("hidden")
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
  let squareSize = allSquareEls[0].offsetWidth
  for (let i = 0; i < allSquareEls.length; i++) {
    allSquareEls[i].style.fontSize = squareSize * 1 + "px"
  }
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

function blurAnyFocus() {
  const focusedElement = document.activeElement
  if (focusedElement) {
    focusedElement.blur()
    currentlySelectedEntryEl = null
  }
}

const focusTarget = target => {
  target.focus()
  currentlySelectedEntryEl = target.classList.contains("entry") ? target : null
}

function movePlace(direction) {
  const currentFocusedEl =
    document.activeElement == document.body || !document.activeElement
      ? null
      : document.activeElement
  if (!currentFocusedEl) {
    focusCenter()
    return
  }
  const currentSquareN = Number(currentFocusedEl.dataset.squareN)
  let nextSquareN
  switch (direction) {
    case "right":
      if (currentSquareN % 9 == 0) {
        nextSquareN = currentSquareN - 8
      } else {
        nextSquareN = currentSquareN + 1
      }
      break
    case "left":
      if ((currentSquareN - 1) % 9 == 0) {
        nextSquareN = currentSquareN + 8
      } else {
        nextSquareN = currentSquareN - 1
      }
      break
    case "down":
      if (currentSquareN + 9 > 81) {
        nextSquareN = currentSquareN - 72
      } else {
        nextSquareN = currentSquareN + 9
      }
      break
    case "up":
      if (currentSquareN - 9 < 1) {
        nextSquareN = currentSquareN + 72
      } else {
        nextSquareN = currentSquareN - 9
      }
      break
  }
  const selector = `.square[data-square-id="${nextSquareN.toString()}"] .entry`
  const nextEl = document.querySelector(selector)
  focusTarget(nextEl)
}

function movePlaceBy(numPlaces) {
  const currentFocusedEl =
    document.activeElement == document.body || !document.activeElement
      ? null
      : document.activeElement
  if (!currentFocusedEl) {
    focusCenter()
    return
  }
  const currentSquareN = Number(currentFocusedEl.dataset.squareN)
  const nextSquareN = (currentSquareN + numPlaces + 81) % 81 || 81
  const selector = `.square[data-square-id="${nextSquareN.toString()}"] .entry`
  const nextEl = document.querySelector(selector)
  focusTarget(nextEl)
}

function focusCenter() {
  focusTarget(allEntryEls[40])
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
