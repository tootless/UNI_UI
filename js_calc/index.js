let expression = "";
let isEnabled = true;
let ans = 0;
let hasCalculated = false;

const binaryOperators = ["+", "-", "*", "/", "^"];
const allowedSymbols = ["+", "-", "*", "/", "^", "%", "(", ")", "!"];
const allowedFunctions = ["Ans", "√"];

const expressionText = document.getElementById("expression-text");
const result = document.getElementById("result");
const typedCursor = document.getElementById("typed-cursor");

//display functions
function updateDisplay() {
    if (isEnabled) {
        expressionText.textContent = expression;
    } else {
        expressionText.textContent = "Paspausk ON/AC";
    }

    //blinking cursor hidden when off is presseddd
    typedCursor.style.display = isEnabled ? "inline-block" : "none";
}

function clearDisplay() {
    isEnabled = true;
    expression = "";
    hasCalculated = false;

    result.classList.remove("error-message");
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
            else if (input.startsWith("√", i)) {
                tokens.push("√");
            }
            else if (allowedSymbols.includes(character)) {
                tokens.push(character);
            }
            else {
                throw new Error("Negalimas char: " + character);
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

    //nums, ans, ()
    function readPrimary() {
        const token = tokens[position];

        if (token === undefined) {
            throw new Error("Neuzbaigta");
        }

        let value;

        if (!isNaN(token)) {
            value = Number(token);
            position++;
        }

        else if (token === "Ans") {
            value = ans;
            position++;
        }

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

        return value;
    }

    // !, %
    function readPostfix() {
        let value = readPrimary();

        while (tokens[position] === "!" || tokens[position] === "%") {
            if (tokens[position] === "!") {
                value = calculateFactorial(value);
            }

            else {
                value /= 100;
            }

            position++;
        }

        return value;
    }

    // sqrt
    function readPowerBase() {
        if (tokens[position] === "√") {
            position++;
            const value = readUnary();

            if (value < 0) {
                throw new Error("Saknis is neigiamo skaiciaus");
            }

            return Math.sqrt(value);
        }

        return readPostfix();
    }

    // ^
    function readPower() {
        const base = readPowerBase();

        if (tokens[position] === "^") {
            position++;

            const exponent = readUnary();
            return Math.pow(base, exponent);
        }

        return base;
    }

    // signs
    function readUnary() {
        if (tokens[position] === "-") {
            position++;
            return -readUnary();
        }

        if (tokens[position] === "+") {
            position++;
            return readUnary();
        }

        return readPower();
    }

    // *, /
    function readTerm() {
        let value = readUnary();

        while (
            tokens[position] === "*" ||
            tokens[position] === "/"
        ) {
            const operator = tokens[position];
            position++;

            const nextValue = readUnary();

            if (operator === "*") {
                value *= nextValue;
            }

            else {
                if (nextValue === 0) {
                    throw new Error("Dalyba is 0");
                }

                value /= nextValue;
            }

            if (!Number.isFinite(value)) {
                throw new Error("Undefined/Per didelis");
            }
        }

        return value;
    }

    // +, -
    function readExpression() {
        let value = readTerm();

        while (
            tokens[position] === "+" ||
            tokens[position] === "-"
        ) {
            const operator = tokens[position];
            position++;

            const nextValue = readTerm();

            if (operator === "+") {
                value += nextValue;
            }

            else {
                value -= nextValue;
            }

            if (!Number.isFinite(value)) {
                throw new Error("Undefined/Per didelis");
            }
        }

        return value;
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

    //reset error styling
    result.classList.remove("error-message");

    try {
        const answer = calculateExpression(expression);

        ans = answer;

        result.textContent = answer;
        hasCalculated = true;
    }

    catch (error) {
        result.textContent = error.message;
        result.classList.add("error-message");
        hasCalculated = false;
    }

    updateDisplay();
}