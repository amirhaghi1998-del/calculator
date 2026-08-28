// Get display element
const display = document.getElementById('display');

// State variable: current expression user is building
let currentExpression = '';

// Update display
function updateDisplay() {
    display.textContent = currentExpression || '0';
}

// Clear all
function clearAll() {
    currentExpression = '';
    updateDisplay();
}

// Append a character to expression
function appendToExpression(char) {
    // Prevent repeated zeros at beginning of number
    if (char === '.' && currentExpression === '') {
        currentExpression = '0.';
    } else if (currentExpression === '0' && char !== '.' && !isOperator(char)) {
        currentExpression = char;
    } else {
        currentExpression += char;
    }
    updateDisplay();
}

// Check if character is operator
function isOperator(char) {
    return ['+', '-', '*', '/', '%', '^'].includes(char);
}

// Main calculation function
function calculate(expression) {
    // Remove spaces
    expression = expression.replace(/\s+/g, '');

    // Check balanced parentheses
    if (!areParenthesesBalanced(expression)) {
        throw new Error('Unbalanced parentheses');
    }

    // Convert expression to array of tokens
    const tokens = tokenize(expression);

    // Evaluate tokens with recursive descent parser
    const result = parseExpression(tokens);

    // If extra tokens remain, throw error
    if (tokens.length > 0) {
        throw new Error('Invalid expression');
    }

    return result;
}

// Check parentheses balance
function areParenthesesBalanced(expr) {
    let count = 0;
    for (const char of expr) {
        if (char === '(') count++;
        if (char === ')') count--;
        if (count < 0) return false;
    }
    return count === 0;
}

// Convert expression string to token array
function tokenize(expr) {
    const tokens = [];
    let i = 0;
    while (i < expr.length) {
        const char = expr[i];

        // Number (decimal or integer)
        if (/[0-9.]/.test(char)) {
            let num = '';
            while (i < expr.length && /[0-9.]/.test(expr[i])) {
                num += expr[i];
                i++;
            }
            // Error if more than one dot in number
            if ((num.match(/\./g) || []).length > 1) {
                throw new Error('Invalid number');
            }
            tokens.push(parseFloat(num));
            continue;
        }

        // Operator or parenthesis
        if (['+', '-', '*', '/', '%', '^', '(', ')'].includes(char)) {
            tokens.push(char);
            i++;
            continue;
        }

        // Invalid character
        throw new Error('Invalid character: ' + char);
    }
    return tokens;
}

// Recursive Descent Parser functions

// Level 1: Addition and subtraction (lowest precedence)
function parseExpression(tokens) {
    let left = parseTerm(tokens);
    while (tokens.length > 0 && (tokens[0] === '+' || tokens[0] === '-')) {
        const op = tokens.shift();
        const right = parseTerm(tokens);
        left = (op === '+') ? left + right : left - right;
    }
    return left;
}

// Level 2: Multiplication, division, percent, and power (higher precedence)
function parseTerm(tokens) {
    let left = parseFactor(tokens);
    while (tokens.length > 0 && ['*', '/', '%', '^'].includes(tokens[0])) {
        const op = tokens.shift();
        const right = parseFactor(tokens);
        switch (op) {
            case '*':
                left *= right;
                break;
            case '/':
                if (right === 0) throw new Error('Division by zero');
                left /= right;
                break;
            case '%':
                left = (left * right) / 100; // Percent meaning left percent of right
                break;
            case '^':
                left = Math.pow(left, right);
                break;
        }
    }
    return left;
}

// Level 3: Numbers, parentheses, and unary minus
function parseFactor(tokens) {
    if (tokens.length === 0) throw new Error('Incomplete expression');

    // Unary minus
    if (tokens[0] === '-') {
        tokens.shift();
        return -parseFactor(tokens);
    }
    // Unary plus (optional)
    if (tokens[0] === '+') {
        tokens.shift();
        return parseFactor(tokens);
    }

    // Parentheses
    if (tokens[0] === '(') {
        tokens.shift(); // Remove '('
        const result = parseExpression(tokens);
        if (tokens[0] !== ')') throw new Error('Unclosed parenthesis');
        tokens.shift(); // Remove ')'
        return result;
    }

    // Number
    if (typeof tokens[0] === 'number') {
        return tokens.shift();
    }

    throw new Error('Invalid expression');
}

// Handle button clicks
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', () => {
        const action = button.dataset.action;
        const value = button.dataset.value;

        switch (action) {
            case 'clear':
                clearAll();
                break;
            case 'number':
                appendToExpression(value);
                break;
            case 'operator':
                // If last character is operator, replace it with new operator
                if (currentExpression.length > 0 && isOperator(currentExpression[currentExpression.length - 1])) {
                    currentExpression = currentExpression.slice(0, -1) + value;
                } else {
                    currentExpression += value;
                }
                updateDisplay();
                break;
            case 'equals':
                try {
                    const result = calculate(currentExpression);
                    currentExpression = String(result);
                    updateDisplay();
                } catch (error) {
                    display.textContent = 'Error';
                    currentExpression = '';
                }
                break;
        }
    });
});

// Keyboard support (optional)
document.addEventListener('keydown', (e) => {
    const key = e.key;
    if (/[0-9.]/.test(key)) {
        appendToExpression(key);
    } else if (['+', '-', '*', '/', '%', '^', '(', ')'].includes(key)) {
        // For operators, do the same as button behavior
        if (currentExpression.length > 0 && isOperator(currentExpression[currentExpression.length - 1])) {
            currentExpression = currentExpression.slice(0, -1) + key;
        } else {
            currentExpression += key;
        }
        updateDisplay();
    } else if (key === 'Enter' || key === '=') {
        try {
            const result = calculate(currentExpression);
            currentExpression = String(result);
            updateDisplay();
        } catch (error) {
            display.textContent = 'Error';
            currentExpression = '';
        }
    } else if (key === 'Backspace') {
        currentExpression = currentExpression.slice(0, -1);
        updateDisplay();
    } else if (key === 'Escape') {
        clearAll();
    }
});

// Start with displaying 0
updateDisplay();
