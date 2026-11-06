let expression = "";
let isEnabled = true;
let ans = 0;
let hasCalculated = false;

const expressionText = document.getElementById("expression-text");
const result = document.getElementById("result");
//ans needs
const operators = [
    "+","-","*","/",
    "sqrt","root","x²","^"
];

function updateDisplay() {
    expressionText.textContent = expression;
}

//ON/AC button
function clearDisplay() {
    if (!isEnabled) {
        isEnabled = true;
    }

    expression = "";
    hasCalculated = false;

    expressionText.textContent = "";
    result.textContent = "0";
}

//OFF button
function disableDisplay() {
    isEnabled = false;

    expression = "";
    hasCalculated = false;

    expressionText.textContent = "";
    result.textContent = "";
}

//input
function appendToDisplay(value) {
    if (!isEnabled) return;

    if (hasCalculated) {
        if (operators.includes(value)) {
            expression = "Ans";
        } else {
            expression = "";
        }

        hasCalculated = false;
    }

    expression += String(value);
    updateDisplay();
}

function calculate() {
    if (!isEnabled) return;
    if (expression.trim() === "") return;

    try {
        let calculation = expression.replace(/Ans/g,`(${ans})`); //append ans if exists

        const answer = Function('"use strict"; return (' + calculation + ')')();

        if (!Number.isFinite(answer)) {
            result.textContent = "Error";
            return;
        }

        ans = answer;
        result.textContent = answer;

        hasCalculated = true;

    } catch {
        result.textContent = "Error";
    }
}