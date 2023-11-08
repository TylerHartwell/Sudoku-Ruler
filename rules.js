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

const nakedSingle = (
  allUnitsSquaresEls,
  getCandidateObj,
  getEntryObj,
  handleNewEntry
) => {
  console.log("try naked single")
  let unitCount = 0
  for (const unitSquareEls of allUnitsSquaresEls) {
    unitCount++
    let instanceCount = 0
    let solutionEntryEl = null
    for (let i = 1; i <= 9; i++) {
      for (const squareEl of unitSquareEls) {
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
    if (unitCount == allUnitsSquaresEls.length) {
      console.log("nothing")
      return false
    }
  }
}

const intersectionRemoval = () => {}

export const rulesArr = [nakedSingle, intersectionRemoval]
