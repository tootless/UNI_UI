let expression = "";
let isEnabled = true;
let ans = 0;
let hasCalculated = false;

const binaryOperators = ["+", "-", "*", "/", "^"];
const allowedSymbols = ["+", "-", "*", "/", "^", "%", "(", ")", "!"];
const allowedFunctions = ["Ans", "sqrt"];

const expressionText = document.getElementById("expression-text");
const result = document.getElementById("result");
const typedCursor = document.getElementById("typed-cursor");

//display functions
function updateDisplay() {
    expressionText.textContent = expression;

    typedCursor.style.display = isEnabled ? "inline-block" : "none";
}

function clearDisplay() {
    isEnabled = true;
    expression = "";
    hasCalculated = false;

    result.textContent = "0";

    updateDisplay();
}

function disableDisplay() {
    isEnabled = false;
    expression = "";
    hasCalculated = false;

    result.textContent = "";

    updateDisplay();
}

//input
function appendToDisplay(value) {
    if (!isEnabled) return;

    value = String(value);

    if (hasCalculated) {
        if (binaryOperators.includes(value) || value === "^2" || value === "%" ||value === "!") {
            expression = "Ans";
        } 
        else {
            expression = "";
        }

        hasCalculated = false;
    }

    expression += value;
    updateDisplay();
}

function appendFunction(name) {
    if (!isEnabled) return;

    if (hasCalculated) {
        expression = name + "(Ans)";
    } 
    else {
        expression += name + "(";
    }

    hasCalculated = false;
    updateDisplay();
}

function deleteLast() {
    if (!isEnabled) return;

    if (hasCalculated) {
        expression = "";
        hasCalculated = false;
    } else {
        expression = expression.slice(0, -1);
    }

    updateDisplay();
}

//expression split into tokens, 
//then can validate tokens individually
function createTokens(input) {
    const tokens = [];
    let number = "";

    for (let i = 0; i < input.length; i++) {
        const character = input[i];

        //make number
        if (character === " ") {
            continue;
        }
        if (character >= "0" && character <= "9" || character === ".") {
            number += character;
        }
        //make token after save number
        else {
            if (number !== "") {
                if (
                    number === "." ||
                    number.split(".").length > 2
                ) {
                    throw new Error("Invalid number");
                }

                tokens.push(number);
                number = "";
            }

            if (input.startsWith("Ans", i)) {
                tokens.push("Ans");
                i += 2;
            }
            else if (input.startsWith("sqrt", i)) {
                tokens.push("sqrt");
                i += 3;
            }
            else if (allowedSymbols.includes(character)) {
                tokens.push(character);
            }
            else {
                throw new Error("Negalimas: " + character);
            }
        }
    }

    if (number !== "") {
        if (number === "." || number.split(".").length > 2) {
            throw new Error("Nevalidu");
        }
        tokens.push(number);
    }

    return tokens;
}

function calculateFactorial(number) {
    if (number < 0 || !Number.isInteger(number)) {
        throw new Error("Per mazas skaicius");
    }
    if (number > 170) {
        throw new Error("Overflow");
    }

    let answer = 1;
    for (let i = 1; i <= number; i++) {
        answer *= i;
    }

    return answer;
}

function calculateExpression(input) {
    const tokens = createTokens(input);

    if (tokens.length === 0) {
        throw new Error("Tuscia");
    }

    let position = 0;

    function readValue() {
        let sign = 1;

        while (tokens[position] === "-" ||tokens[position] === "+") 
            {
            if (tokens[position] === "-") {
                sign *= -1;
            }

            position++;
        }

        let value;
        const token = tokens[position];

        if (token === undefined) {
            throw new Error("Neuzbaigta");
        }

        if (!isNaN(token)) {
            value = Number(token);
            position++;
        }

        else if (token === "Ans") {
            value = ans;
            position++;
        }

        else if (token === "sqrt") {
            position++;

            value = readValue();

            if (token === "sqrt") {
                if (value < 0) {
                    throw new Error("Saknis is neigiamo skaiciaus");
                }

                value = Math.sqrt(value);
            }
        }

        // () check
        else if (token === "(") {
            position++;

            value = readExpression();

            if (tokens[position] !== ")") {
                throw new Error("() Error");
            }

            position++;
        }

        else {
            throw new Error("Invalid");
        }

        value *= sign;

        // % and !
        while (tokens[position] === "%" || tokens[position] === "!")
            {
            if (tokens[position] === "%") {
                value = value / 100;
            }

            else {
                value = calculateFactorial(value);
            }

            position++;
        }

        return value;
    }

    //calculate from left to right
    function readExpression() {
        let answer = readValue();

        while (position < tokens.length && tokens[position] !== ")")
            {
            const operator = tokens[position];

            if (!binaryOperators.includes(operator)) {
                throw new Error("Error");
            }

            position++;

            const nextNumber = readValue();

            switch (operator) {
                case "+":
                    answer += nextNumber;
                    break;

                case "-":
                    answer -= nextNumber;
                    break;

                case "*":
                    answer *= nextNumber;
                    break;

                case "/":
                    if (nextNumber === 0) {
                        throw new Error("Dalyba is 0");
                    }

                    answer /= nextNumber;
                    break;

                case "^":
                    answer = Math.pow(answer, nextNumber);
                    break;
            }

            if (!Number.isFinite(answer)) {
                throw new Error("Undefined/Per didelis");
            }
        }

        return answer;
    }

    const answer = readExpression();

    if (position !== tokens.length) {
        throw new Error("Error");
    }

    if (!Number.isFinite(answer)) {
        throw new Error("Undefined/Per didelis");
    }

    return answer;
}

function calculate() {
    if (!isEnabled || expression.trim() === "") {
        return;
    }

    try {
        const answer = calculateExpression(expression);

        ans = answer;

        result.textContent = answer;
        hasCalculated = true;
    }

    catch (error) {
        result.textContent = error.message;
        hasCalculated = false;
    }

    updateDisplay();
}