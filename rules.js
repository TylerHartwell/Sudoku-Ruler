export function generateRuleItems() {
  const listEl = document.querySelector(".rules-list")
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

const nakedSingle = (allUnitsSquares, focusTarget, inputCharacter) => {
  console.log("try naked single")
  let unitCount = 0
  for (const unit of allUnitsSquares) {
    unitCount++
    let instanceCount = 0
    let solutionSquareNumber = null
    for (let i = 1; i <= 9; i++) {
      for (const square of unit) {
        if (!square.textContent) continue
        if (square.querySelector(`.candidate[data-number="${i}"`).textContent) {
          instanceCount++
          solutionSquareNumber = square.querySelector(".square-number")
        }
      }
      if (instanceCount === 1) {
        console.log("only one " + i)
        focusTarget(solutionSquareNumber)

        inputCharacter(i.toString())
        return true
      }
      instanceCount = 0
    }
    if (unitCount == allUnitsSquares.length) {
      console.log("nothing")
      return false
    }
  }
}

export const rulesArr = [nakedSingle]
