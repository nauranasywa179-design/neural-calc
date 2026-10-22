
const display = document.getElementById("display");
const expressionDisplay = document.getElementById("expression");
const angleModeDisplay = document.getElementById("angleMode");
const modeMetric = document.getElementById("modeMetric");
const terminalLog = document.getElementById("terminalLog");

const buttons = document.querySelectorAll(".btn");

let expression = "";
let angleMode = "DEG";
let justCalculated = false;

// Memperbarui layar kalkulator
function updateDisplay() {
    display.value = expression || "0";
    angleModeDisplay.textContent = angleMode;

    if (modeMetric) {
        modeMetric.textContent =
            angleMode === "DEG" ? "DEGREE" : "RADIAN";
    }
}

// Menampilkan pesan aktivitas di terminal
function log(message, type = "OK") {
    const line = document.createElement("p");
    const label = document.createElement("span");

    label.textContent = `[${type}] `;
    line.appendChild(label);
    line.appendChild(document.createTextNode(message));

    terminalLog.appendChild(line);

    while (terminalLog.children.length > 5) {
        terminalLog.removeChild(terminalLog.firstChild);
    }
}

// Memasukkan angka, operator, atau tanda kurung
function addValue(value) {
    if (justCalculated) {
        if (/^[0-9.(]$/.test(value) || value === "pi") {
            expression = "";
        }
        justCalculated = false;
    }

    if (value === "pi") {
        expression += String(Math.PI);
    } else if (value === ".") {
        const currentNumber = expression.split(/[+\-*/()]/).pop();

        if (currentNumber.includes(".")) return;

        expression += currentNumber === "" ? "0." : ".";
    } else {
        expression += value;
    }

    updateDisplay();
}

// Menghapus satu karakter
function deleteValue() {
    expression = expression.slice(0, -1);
    justCalculated = false;
    updateDisplay();
    log("Last character deleted.");
}

// Reset kalkulator
function clearDisplay() {
    expression = "";
    justCalculated = false;

    updateDisplay();
    expressionDisplay.textContent = "AWAITING_INPUT";

    log("Calculator reset.");
}

// Menghitung ekspresi matematika
function calculate() {
    if (!expression.trim()) {
        log("Enter a calculation first.", "WARN");
        return;
    }

    try {
        // Hanya izinkan karakter matematika dasar
        if (!/^[0-9+\-*/().\s]+$/.test(expression)) {
            throw new Error("Invalid expression");
        }

        const originalExpression = expression;

        // Mengevaluasi ekspresi matematika
        const result = Function(
            '"use strict"; return (' + expression + ')'
        )();

        if (typeof result !== "number" || !Number.isFinite(result)) {
            throw new Error("Invalid result");
        }

        expression = String(Number(result.toPrecision(12)));

        updateDisplay();
        expressionDisplay.textContent = originalExpression + " =";
        justCalculated = true;

        log("Calculation completed: " + expression);
    } catch (error) {
        expression = "";
        display.value = "Error";
        expressionDisplay.textContent = "INVALID_EXPRESSION";
        justCalculated = true;

        log("Invalid expression. Check your input.", "ERROR");
    }
}

// Konversi derajat menjadi radian
function toRadians(number) {
    return angleMode === "DEG"
        ? number * Math.PI / 180
        : number;
}

// Fungsi ilmiah
function scientificFunction(type) {
    if (!expression.trim()) {
        log("Enter a number before using a function.", "WARN");
        return;
    }

    const number = Number(expression);

    if (!Number.isFinite(number)) {
        log("Invalid number.", "ERROR");
        return;
    }

    let result;

    switch (type) {
        case "sin":
            result = Math.sin(toRadians(number));
            break;

        case "cos":
            result = Math.cos(toRadians(number));
            break;

        case "tan":
            result = Math.tan(toRadians(number));
            break;

        case "sqrt":
            result = Math.sqrt(number);
            break;

        case "square":
            result = number ** 2;
            break;

        case "percent":
            result = number / 100;
            break;

        default:
            log("Function not found.", "ERROR");
            return;
    }

    if (!Number.isFinite(result)) {
        display.value = "Error";
        expressionDisplay.textContent = "INVALID_RESULT";
        expression = "";
        justCalculated = true;

        log("Function produced an invalid result.", "ERROR");
        return;
    }

    expressionDisplay.textContent =
        type.toUpperCase() + "(" + number + ") =";

    expression = String(Number(result.toPrecision(12)));
    updateDisplay();
    justCalculated = true;

    log(type.toUpperCase() + " executed successfully.");
}

// Mengubah mode DEG / RAD
function toggleAngleMode() {
    angleMode = angleMode === "DEG" ? "RAD" : "DEG";

    updateDisplay();
    log("Angle mode changed to " + angleMode + ".");
}

// Event untuk setiap tombol kalkulator
buttons.forEach(function(button) {
    button.addEventListener("click", function() {
        const action = button.dataset.action;
        const value = button.dataset.value;

        if (action === "clear") {
            clearDisplay();
        } else if (action === "delete") {
            deleteValue();
        } else if (action === "calculate") {
            calculate();
        } else if (action === "scientific") {
            scientificFunction(value);
        } else if (action === "angle") {
            toggleAngleMode();
        } else if (value !== undefined) {
            addValue(value);
            log("Input received: " + value);
        }
    });
});

// Dukungan keyboard
document.addEventListener("keydown", function(event) {
    // Jangan memproses shortcut saat tombol lain sedang difokuskan
    if (event.ctrlKey || event.altKey || event.metaKey) return;

    const key = event.key;

    if (/^[0-9.]$/.test(key)) {
        addValue(key);
    } else if (["+", "-", "*", "/", "(", ")"].includes(key)) {
        addValue(key);
    } else if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculate();
    } else if (key === "Backspace") {
        deleteValue();
    } else if (key === "Escape") {
        clearDisplay();
    }
});

// Inisialisasi
updateDisplay();
log("NEURAL math engine initialized.");
log("JavaScript event handlers connected.");
