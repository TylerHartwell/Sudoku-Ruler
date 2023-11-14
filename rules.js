import { boardData } from "./board.js"

let allUnits

export function createRulesHTML() {
  const listEl = document.querySelector(".rules-list")
  listEl.innerHTML = ""
  rulesArr.forEach((rule, index) => {
    const tryNextBtn = document.createElement("button")
    tryNextBtn.classList.add("try-next-btn")
    tryNextBtn.textContent = "Try Next"

    const autoCheckbox = document.createElement("input")
    autoCheckbox.type = "checkbox"
    autoCheckbox.id = "checkbox" + index + 1

    const checkboxLabel = document.createElement("label")
    checkboxLabel.htmlFor = "checkbox" + index + 1
    checkboxLabel.textContent = "Auto Solve:"

    const li = document.createElement("li")
    li.classList.add("rule-item")
    li.id = "rule" + index + 1
    li.textContent = rule.name
    li.appendChild(tryNextBtn)
    li.appendChild(checkboxLabel)
    li.appendChild(autoCheckbox)

    listEl.appendChild(li)
  })
}

export function assignAllUnits() {
  let allUnitsConstruct = []
  for (let i = 1; i <= 9; i++) {
    allUnitsConstruct.push(
      Array.from(document.querySelectorAll(`.square[data-row-n="${i}"]`))
    )
    allUnitsConstruct.push(
      Array.from(document.querySelectorAll(`.square[data-col-n="${i}"]`))
    )
    allUnitsConstruct.push(
      Array.from(document.querySelectorAll(`.square[data-box-n="${i}"]`))
    )
  }
  allUnits = allUnitsConstruct
}

const loneSingle = (
  getCandidateObj,
  getEntryObj,
  handleNewEntry,
  refreshCandidateDisplay
) => {
  console.log("try lone singles")
  for (const square of boardData.allSquares) {
    let candidatateCount = 0
    let candidateNumber
    for (const squareCandidate of square.squareCandidates) {
      if (!squareCandidate.eliminated) {
        candidatateCount++
        if (candidatateCount > 1) break
        candidateNumber = squareCandidate.number
      }
    }
    if (candidatateCount > 1 || candidatateCount == 0) continue
    const entryEl = document.querySelector(
      `.entry[data-square-n="${square.squareId}"]`
    )
    handleNewEntry(entryEl, candidateNumber)
    console.log("lone single of ", candidateNumber)
    return true
  }
  console.log("no lone singles")
  return false
}

const nakedSingle = (
  getCandidateObj,
  getEntryObj,
  handleNewEntry,
  refreshCandidateDisplay
) => {
  console.log("try naked single")
  for (const unit of allUnits) {
    const unitIndex = allUnits.indexOf(unit)
    let instanceCount = 0
    let solutionEntryEl = null
    for (let i = 1; i <= 9; i++) {
      for (const squareEl of unit) {
        if (instanceCount > 1) break
        if (getEntryObj(squareEl.querySelector(".entry")).shownValue) continue
        if (
          !getCandidateObj(
            squareEl.querySelector(`.candidate[data-number="${i}"`)
          ).eliminated
        ) {
          instanceCount++
          solutionEntryEl = squareEl.querySelector(".entry")
        }
      }
      if (instanceCount === 1) {
        console.log("only one " + i)
        handleNewEntry(solutionEntryEl, i.toString())
        return true
      }
      instanceCount = 0
    }
    if (unitIndex == allUnits.length - 1) {
      console.log("nothing")
      return false
    }
  }
}

const intersectionRemoval = (
  getCandidateObj,
  getEntryObj,
  handleNewEntry,
  refreshCandidateDisplay
) => {
  console.log("try intersection removal")
  for (const unit of allUnits) {
    //////////
    const unitIndex = allUnits.indexOf(unit)
    for (let i = 1; i <= 9; i++) {
      ///////////
      const candidateObjArr = []
      for (const squareEl of unit) {
        /////////////
        const candidateObj = getCandidateObj(
          squareEl.querySelector(`.candidate[data-number="${i}"`)
        )
        if (!candidateObj.eliminated) {
          candidateObjArr.push(candidateObj)
          if (candidateObjArr.length > 3) break
        }
      }
      if (candidateObjArr.length > 1 && candidateObjArr.length < 4) {
        const unitTypes = ["row", "col", "box"]
        let currentUnitType = unitTypes[unitIndex % 3]
        let rowNOfFirst = candidateObjArr[0].rowN
        let colNOfFirst = candidateObjArr[0].colN
        let boxNOfFirst = candidateObjArr[0].boxN
        let peerUnitType
        let peerUnitIndex
        let hasPeerUnit = false
        for (const unitType of unitTypes) {
          /////////////
          if (currentUnitType == unitType) continue
          if (unitType == "row") {
            if (
              candidateObjArr.every(candidateObj => {
                return candidateObj.rowN === rowNOfFirst
              })
            ) {
              hasPeerUnit = true
            }
            if (hasPeerUnit) {
              peerUnitIndex = rowNOfFirst - 1
              peerUnitType = unitType
              break
            }
          }
          if (unitType == "col") {
            if (
              candidateObjArr.every(candidateObj => {
                return candidateObj.colN === colNOfFirst
              })
            ) {
              hasPeerUnit = true
            }
            if (hasPeerUnit) {
              peerUnitIndex = colNOfFirst - 1
              peerUnitType = unitType
              break
            }
          }
          if (unitType == "box") {
            if (
              candidateObjArr.every(candidateObj => {
                return candidateObj.boxN === boxNOfFirst
              })
            ) {
              hasPeerUnit = true
            }
            if (hasPeerUnit) {
              peerUnitIndex = boxNOfFirst - 1
              peerUnitType = unitType

              break
            }
          }
        }
        if (!peerUnitType) continue
        if (peerUnitType) {
          const offset = unitTypes.indexOf(peerUnitType)
          const peerUnit = allUnits[peerUnitIndex * 3 + offset]
          let hasElimination = false
          for (const squareEl of peerUnit) {
            /////////////
            const candidateEl = squareEl.querySelector(
              `.candidate[data-number="${i}"`
            )
            const candidateObj = getCandidateObj(candidateEl)
            if (
              !candidateObjArr.includes(candidateObj) &&
              !candidateObj.eliminated
            ) {
              hasElimination = true
              candidateObj.eliminated = true
              refreshCandidateDisplay(candidateEl)
            }
          }
          if (!hasElimination) {
            peerUnitType
            peerUnitIndex
            hasPeerUnit = false
            continue
          } else {
            console.log("intersection eliminated")
            return true
          }
        }
      }
    }
    if (unitIndex == allUnits.length - 1) {
      console.log("nothing")
      return false
    }
  }
}

const nakedPairs = (
  getCandidateObj,
  getEntryObj,
  handleNewEntry,
  refreshCandidateDisplay
) => {
  console.log("try naked pairs")
  let hasElimination = false
  for (const unit of allUnits) {
    const unitIndex = allUnits.indexOf(unit)
    let groupSize = 2
    let groupOfSize = []
    let groupOfAll = []
    for (const squareEl of unit) {
      const boxN = squareEl.dataset.boxN
      const squareId = squareEl.dataset.squareId
      const squareBox = boardData.allBoxes.find(box => box.boxId == boxN)
      const squareObj = squareBox.boxSquares.find(
        square => square.squareId == squareId
      )
      let squareCandidateGroup = []
      for (const squareCandidate of squareObj.squareCandidates) {
        if (!squareCandidate.eliminated) {
          squareCandidateGroup.push(squareCandidate)
        }
      }
      if (squareCandidateGroup.length > 0) {
        groupOfAll.push(squareCandidateGroup)
      }
    }

    groupOfSize = groupOfAll.filter(
      squareCandidateGroup => squareCandidateGroup.length <= groupSize
    )

    if (groupOfSize.length >= groupSize) {
      for (let i = 0; i < groupOfSize.length - 1; i++) {
        for (let j = i + 1; j < groupOfSize.length; j++) {
          if (
            groupOfSize[i][0].number == groupOfSize[j][0].number &&
            groupOfSize[i][1].number == groupOfSize[j][1].number
          ) {
            const firstNumberOfPair = groupOfSize[i][0].number
            const secondNumberOfPair = groupOfSize[i][1].number
            const pair1SquareN = groupOfSize[i][0].squareN
            const pair2SquareN = groupOfSize[j][0].squareN
            if (groupOfSize[i][0].boxN == groupOfSize[j][0].boxN) {
              //eliminate others from box if present
              const unit = allUnits[groupOfSize[i][0].boxN * 3 - 1]
              removeNakedPairCandidatesFrom(unit)
            }
            //eliminate others from unit if present
            const unit = allUnits[unitIndex]
            removeNakedPairCandidatesFrom(unit)

            if (hasElimination) {
              console.log("has elimination")
              return true
            }

            function removeNakedPairCandidatesFrom(unit) {
              for (const squareEl of unit) {
                const boxN = squareEl.dataset.boxN
                const squareId = squareEl.dataset.squareId
                const squareBox = boardData.allBoxes.find(
                  box => box.boxId == boxN
                )
                const squareObj = squareBox.boxSquares.find(
                  square => square.squareId == squareId
                )
                if (
                  squareObj.squareId != pair1SquareN &&
                  squareObj.squareId != pair2SquareN
                ) {
                  if (
                    !squareObj.squareCandidates[firstNumberOfPair - 1]
                      .eliminated
                  ) {
                    hasElimination = true
                    squareObj.squareCandidates[
                      firstNumberOfPair - 1
                    ].eliminated = true
                    refreshCandidateDisplay(
                      document.querySelector(
                        `.candidate[data-number="${firstNumberOfPair}"][data-square-n="${squareId}"]`
                      )
                    )
                  }
                  if (
                    !squareObj.squareCandidates[secondNumberOfPair - 1]
                      .eliminated
                  ) {
                    hasElimination = true
                    squareObj.squareCandidates[
                      secondNumberOfPair - 1
                    ].eliminated = true
                    refreshCandidateDisplay(
                      document.querySelector(
                        `.candidate[data-number="${secondNumberOfPair}"][data-square-n="${squareId}"]`
                      )
                    )
                  }
                }
              }
            }
          }
        }
      }
    }

    if (unitIndex == allUnits.length - 1) {
      console.log("nothing")
      return false
    }
  }
}

export const rulesArr = [
  loneSingle,
  nakedSingle,
  intersectionRemoval,
  nakedPairs
]
