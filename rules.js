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
              console.log("matches first object row")
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
              console.log("matches first object col")
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
              console.log("matches first object box")
              break
            }
          }
        }
        if (!peerUnitType) continue
        console.log(peerUnitType)
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
            console.log(candidateObjArr)
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

export const rulesArr = [nakedSingle, intersectionRemoval]
