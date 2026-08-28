
// دریافت عنصر نمایشگر
const display = document.getElementById('display');

// متغیر حالت: عبارت فعلی که کاربر در حال ساخت آن است
let currentExpression = '';

// به‌روزرسانی نمایشگر
function updateDisplay() {
    display.textContent = currentExpression || '0';
}

// پاک کردن همه چیز
function clearAll() {
    currentExpression = '';
    updateDisplay();
}

// افزودن یک کاراکتر به عبارت
function appendToExpression(char) {
    // جلوگیری از صفرهای تکراری در ابتدای عدد
    if (char === '.' && currentExpression === '') {
        currentExpression = '0.';
    } else if (currentExpression === '0' && char !== '.' && !isOperator(char)) {
        currentExpression = char;
    } else {
        currentExpression += char;
    }
    updateDisplay();
}

// بررسی اینکه کاراکتر عملگر است یا نه
function isOperator(char) {
    return ['+', '-', '*', '/', '%', '^'].includes(char);
}

// تابع اصلی محاسبه عبارت
function calculate(expression) {
    // حذف فاصله‌ها
    expression = expression.replace(/\s+/g, '');

    // بررسی پرانتزهای متوازن
    if (!areParenthesesBalanced(expression)) {
        throw new Error('پرانتز نامتوازن');
    }

    // تبدیل عبارت به آرایه‌ای از توکن‌ها
    const tokens = tokenize(expression);

    // ارزیابی توکن‌ها با پارسر نزولی بازگشتی
    const result = parseExpression(tokens);

    // اگر توکن اضافه‌ای باقی مانده باشد، خطا می‌دهیم
    if (tokens.length > 0) {
        throw new Error('عبارت نامعتبر');
    }

    return result;
}

// بررسی توازن پرانتزها
function areParenthesesBalanced(expr) {
    let count = 0;
    for (const char of expr) {
        if (char === '(') count++;
        if (char === ')') count--;
        if (count < 0) return false;
    }
    return count === 0;
}

// تبدیل رشته عبارت به آرایه توکن‌ها
function tokenize(expr) {
    const tokens = [];
    let i = 0;
    while (i < expr.length) {
        const char = expr[i];

        // عدد (اعشاری یا صحیح)
        if (/[0-9.]/.test(char)) {
            let num = '';
            while (i < expr.length && /[0-9.]/.test(expr[i])) {
                num += expr[i];
                i++;
            }
            // اگر بیش از یک نقطه در عدد بود خطا
            if ((num.match(/\./g) || []).length > 1) {
                throw new Error('عدد نامعتبر');
            }
            tokens.push(parseFloat(num));
            continue;
        }

        // عملگر یا پرانتز
        if (['+', '-', '*', '/', '%', '^', '(', ')'].includes(char)) {
            tokens.push(char);
            i++;
            continue;
        }

        // کاراکتر نامعتبر
        throw new Error('کاراکتر نامعتبر: ' + char);
    }
    return tokens;
}

// توابع پارسر نزولی بازگشتی (Recursive Descent Parser)

// سطح اول: جمع و تفریق (کمترین اولویت)
function parseExpression(tokens) {
    let left = parseTerm(tokens);
    while (tokens.length > 0 && (tokens[0] === '+' || tokens[0] === '-')) {
        const op = tokens.shift();
        const right = parseTerm(tokens);
        left = (op === '+') ? left + right : left - right;
    }
    return left;
}

// سطح دوم: ضرب، تقسیم، درصد و توان (اولویت بالاتر)
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
                if (right === 0) throw new Error('تقسیم بر صفر');
                left /= right;
                break;
            case '%':
                left = (left * right) / 100; // درصد به این معنی که left درصد right را حساب می‌کند
                break;
            case '^':
                left = Math.pow(left, right);
                break;
        }
    }
    return left;
}

// سطح سوم: اعداد، پرانتز و علامت منفی یکانی
function parseFactor(tokens) {
    if (tokens.length === 0) throw new Error('عبارت ناقص');

    // علامت منفی یکانی
    if (tokens[0] === '-') {
        tokens.shift();
        return -parseFactor(tokens);
    }
    // علامت مثبت یکانی (اختیاری)
    if (tokens[0] === '+') {
        tokens.shift();
        return parseFactor(tokens);
    }

    // پرانتز
    if (tokens[0] === '(') {
        tokens.shift(); // حذف '('
        const result = parseExpression(tokens);
        if (tokens[0] !== ')') throw new Error('پرانتز بسته نشده');
        tokens.shift(); // حذف ')'
        return result;
    }

    // عدد
    if (typeof tokens[0] === 'number') {
        return tokens.shift();
    }

    throw new Error('عبارت نامعتبر');
}

// مدیریت کلیک روی دکمه‌ها
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
                // اگر آخرین کاراکتر عملگر بود، به‌جای آن عملگر جدید را بگذار
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
                    display.textContent = 'خطا';
                    currentExpression = '';
                }
                break;
        }
    });
});

// پشتیبانی از صفحه کلید (اختیاری)
document.addEventListener('keydown', (e) => {
    const key = e.key;
    if (/[0-9.]/.test(key)) {
        appendToExpression(key);
    } else if (['+', '-', '*', '/', '%', '^', '(', ')'].includes(key)) {
        // برای عملگرها همان رفتار دکمه‌ها را انجام می‌دهیم
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
            display.textContent = 'خطا';
            currentExpression = '';
        }
    } else if (key === 'Backspace') {
        currentExpression = currentExpression.slice(0, -1);
        updateDisplay();
    } else if (key === 'Escape') {
        clearAll();
    }
});

// شروع با نمایش 0
updateDisplay();
