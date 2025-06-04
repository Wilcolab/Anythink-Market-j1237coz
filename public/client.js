/**
 * client.js - Calculator logic
 *
 * Handles all calculator operations, UI state, and history for the web calculator.
 *
 * Features:
 * - Supports addition (+), subtraction (-), multiplication (*), division (/)
 * - Advanced operations: square root (√), exponentiation (xʸ), percentage (%), reciprocal (1/x)
 * - All operations work via both button clicks and keyboard input (with visual feedback)
 * - Calculation history panel (last 10 calculations)
 * - Improved error handling with descriptive messages
 * - Responsive and accessible UI
 * - Communicates with the backend via REST API for calculations
 * - PWA support for offline use
 *
 * Usage:
 * - Used by public/index.html for all calculator logic
 */

'use strict';

var value = 0;

var states = {
    "start": 0,
    "operand1": 1,
    "operator": 2,
    "operand2": 3,
    "complete": 4
};

var state = states.start;

var operand1 = 0;
var operand2 = 0;
var operation = null;

// History feature
var history = [];

function addToHistory(expr, result) {
    if (history.length >= 10) history.shift(); // Keep last 10
    history.push({ expr, result });
    renderHistory();
}

function renderHistory() {
    var list = document.getElementById('history-list');
    if (!list) return;
    list.innerHTML = '';
    for (var i = history.length - 1; i >= 0; i--) {
        var item = document.createElement('li');
        item.textContent = history[i].expr + ' = ' + history[i].result;
        list.appendChild(item);
    }
}

function calculate(operand1, operand2, operation) {
    var uri = location.origin + "/arithmetic";
    var expr = '';
    switch (operation) {
        case '+':
            uri += "?operation=add";
            expr = operand1 + ' + ' + operand2;
            break;
        case '-':
            uri += "?operation=subtract";
            expr = operand1 + ' - ' + operand2;
            break;
        case '*':
            uri += "?operation=multiply";
            expr = operand1 + ' × ' + operand2;
            break;
        case '/':
            uri += "?operation=divide";
            expr = operand1 + ' ÷ ' + operand2;
            break;
        case 'sqrt':
            uri += "?operation=sqrt";
            expr = '√' + operand1;
            break;
        case 'power':
            uri += "?operation=power";
            expr = operand1 + ' ^ ' + operand2;
            break;
        case 'percent':
            uri += "?operation=percent";
            expr = operand1 + ' % of ' + operand2;
            break;
        case 'reciprocal':
            uri += "?operation=reciprocal";
            expr = '1/(' + operand1 + ')';
            break;
        default:
            setError();
            return;
    }
    uri += "&operand1=" + encodeURIComponent(operand1);
    if (operand2 !== null && operand2 !== undefined) {
        uri += "&operand2=" + encodeURIComponent(operand2);
    }
    setLoading(true);
    var http = new XMLHttpRequest();
    http.open("GET", uri, true);
    http.onload = function () {
        setLoading(false);
        if (http.status == 200) {
            var response = JSON.parse(http.responseText);
            setValue(response.result);
            addToHistory(expr, response.result);
        } else {
            try {
                var response = JSON.parse(http.responseText);
                setError(response.error);
            } catch {
                setError();
            }
        }
    };
    http.send(null);
}

function clearPressed() {
    setValue(0);

    operand1 = 0;
    operand2 = 0;
    operation = null;
    state = states.start;
}

function clearEntryPressed() {
    setValue(0);
    state = (state == states.operand2) ? states.operator : states.start;
}

function numberPressed(n) {
    var value = getValue();

    if (state == states.start || state == states.complete) {
        value = n;
        state = (n == '0' ? states.start : states.operand1);
    } else if (state == states.operator) {
        value = n;
        state = (n == '0' ? states.operator : states.operand2);
    } else if (value.replace(/[-\.]/g, '').length < 8) {
        value += n;
    }

    value += "";

    setValue(value);
}

function decimalPressed() {
    if (state == states.start || state == states.complete) {
        setValue('0.');
        state = states.operand1;
    } else if (state == states.operator) {
        setValue('0.');
        state = states.operand2;
    } else if (!getValue().toString().includes('.')) {
        setValue(getValue() + '.');
    }
}

function signPressed() {
    var value = getValue();

    if (value != 0) {
        setValue(-1 * value);
    }
}

function operationPressed(op) {
    if (state === states.operand2) {
        // If user presses an operator after entering operand2, calculate first
        operand2 = getValue();
        calculate(operand1, operand2, operation);
        operand1 = value; // use the result as the new operand1
    } else {
        operand1 = getValue();
    }
    operation = op;
    state = states.operator;
}

function equalPressed() {
    if (state === states.operator) {
        // If user presses = right after operator, use operand1 as operand2
        operand2 = operand1;
    } else if (state === states.operand2) {
        operand2 = getValue();
    } else if (state === states.complete) {
        operand1 = getValue();
    }
    state = states.complete;
    calculate(operand1, operand2, operation);
}

function sqrtPressed() {
    operand1 = getValue();
    operation = 'sqrt';
    state = states.complete;
    calculate(operand1, null, operation);
}

function powerPressed() {
    operand1 = getValue();
    operation = 'power';
    state = states.operator;
}

function percentPressed() {
    operand2 = getValue();
    operation = 'percent';
    state = states.complete;
    calculate(operand1, operand2, operation);
}

function reciprocalPressed() {
    operand1 = getValue();
    operation = 'reciprocal';
    state = states.complete;
    calculate(operand1, null, operation);
}

// Keyboard support for all calculator operations
// Supports: 0-9, ., +, -, *, /, =, Enter, C/c (clear)
document.addEventListener('keydown', (event) => {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
    let key = event.key;
    let btn = null;
    if (key >= '0' && key <= '9') {
        numberPressed(key);
        btn = document.querySelector(`.btn:not([disabled]):not([tabindex='-1']):contains('${key}')`);
        event.preventDefault();
    } else if (key === '.') {
        decimalPressed();
        btn = document.querySelector(`.btn:not([disabled]):not([tabindex='-1']):contains('.')`);
        event.preventDefault();
    } else if (["+", "-", "*", "/"].includes(key)) {
        operationPressed(key);
        btn = document.querySelector(`.btn:not([disabled]):not([tabindex='-1']):contains('${key === '*' ? 'x' : key === '/' ? '÷' : key}')`);
        event.preventDefault();
    } else if (key === '=' || key === 'Enter') {
        equalPressed();
        btn = document.querySelector(`.btn:not([disabled]):not([tabindex='-1']):contains('=')`);
        event.preventDefault();
    } else if (key.toLowerCase() === 'c') {
        clearPressed();
        btn = document.querySelector(`.btn:not([disabled]):not([tabindex='-1']):contains('C')`);
        event.preventDefault();
    }
    // Keyboard accessibility: highlight the button
    if (btn) {
        btn.classList.add('key-active');
        setTimeout(() => btn.classList.remove('key-active'), 150);
    }
});

function getValue() {
    return value;
}

function setValue(n) {
    value = n;
    var displayValue = value;

    if (displayValue > 99999999) {
        displayValue = displayValue.toExponential(4);
    } else if (displayValue < -99999999) {
        displayValue = displayValue.toExponential(4);
    } else if (displayValue > 0 && displayValue < 0.0000001) {
        displayValue = displayValue.toExponential(4);
    } else if (displayValue < 0 && displayValue > -0.0000001) {
        displayValue = displayValue.toExponential(3);
    }

    var chars = displayValue.toString().split("");
    var html = "";

    for (var c of chars) {
        if (c == '-') {
            html += "<span class=\"resultchar negative\">" + c + "</span>";
        } else if (c == '.') {
            html += "<span class=\"resultchar decimal\">" + c + "</span>";
        } else if (c == 'e') {
            html += "<span class=\"resultchar exponent\">e</span>";
        } else if (c != '+') {
            html += "<span class=\"resultchar digit" + c + "\">" + c + "</span>";
        }
    }

    document.getElementById("result").innerHTML = html;
}

function setError(msg) {
    document.getElementById("result").innerHTML = msg ? msg : "ERROR";
    // Optionally, highlight the error visually
    document.getElementById("result").style.color = '#c00';
    setTimeout(() => {
        document.getElementById("result").style.color = '';
    }, 2000);
}

function setLoading(loading) {
    if (loading) {
        document.getElementById("loading").style.visibility = "visible";
    } else {
        document.getElementById("loading").style.visibility = "hidden";
    }

    var buttons = document.querySelectorAll("BUTTON");

    for (var i = 0; i < buttons.length; i++) {
        buttons[i].disabled = loading;
    }
}
