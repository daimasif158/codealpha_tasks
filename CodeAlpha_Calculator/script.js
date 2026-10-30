/**
 * Professional Calculator Web Application
 * Written in Vanilla JavaScript (ES6+)
 * 
 * Features:
 * - Safe mathematical calculations (Strictly no eval())
 * - High-precision floating point management
 * - Full physical keyboard integration with visual tactile feedback
 * - Context-aware percentage, sign toggling, and chaining operations
 * - Error handling (e.g., division by zero)
 * - Auto-scaling display typography
 */

class ProfessionalCalculator {
  constructor(previousOperandEl, currentOperandEl, activeOperatorEl) {
    this.previousOperandEl = previousOperandEl;
    this.currentOperandEl = currentOperandEl;
    this.activeOperatorEl = activeOperatorEl;

    // Internal state variables
    this.currentOperand = '0';
    this.previousOperand = '';
    this.operation = null;
    this.shouldResetScreen = false;
    this.isErrorState = false;

    this.clearAll();
  }

  /**
   * Resets calculator to its default pristine state (AC)
   */
  clearAll() {
    this.currentOperand = '0';
    this.previousOperand = '';
    this.operation = null;
    this.shouldResetScreen = false;
    this.isErrorState = false;
    this.updateDisplay();
  }

  /**
   * Deletes the last entered character (DEL)
   */
  deleteDigit() {
    if (this.isErrorState) {
      this.clearAll();
      return;
    }

    if (this.shouldResetScreen) {
      this.currentOperand = '0';
      this.shouldResetScreen = false;
      this.updateDisplay();
      return;
    }

    // If single digit or negative single digit, reset to '0'
    if (this.currentOperand.length === 1 || 
       (this.currentOperand.length === 2 && this.currentOperand.startsWith('-'))) {
      this.currentOperand = '0';
    } else {
      this.currentOperand = this.currentOperand.slice(0, -1);
    }

    this.updateDisplay();
  }

  /**
   * Appends a number digit (0-9) to the current operand
   * @param {string} number 
   */
  appendNumber(number) {
    if (this.isErrorState) {
      this.clearAll();
    }

    if (this.shouldResetScreen) {
      this.currentOperand = '';
      this.shouldResetScreen = false;
    }

    // Avoid multiple leading zeros
    if (this.currentOperand === '0' && number === '0') return;
    if (this.currentOperand === '0' && number !== '.') {
      this.currentOperand = number;
    } else {
      // Limit maximum input length to prevent UI overflow
      if (this.currentOperand.replace(/[^0-9]/g, '').length >= 16) return;
      this.currentOperand += number;
    }

    this.updateDisplay();
  }

  /**
   * Appends a decimal point, strictly preventing duplicates
   */
  appendDecimal() {
    if (this.isErrorState) {
      this.clearAll();
    }

    if (this.shouldResetScreen) {
      this.currentOperand = '0';
      this.shouldResetScreen = false;
    }

    // Prevent duplicate decimals
    if (this.currentOperand.includes('.')) return;

    if (this.currentOperand === '' || this.currentOperand === '-') {
      this.currentOperand += '0.';
    } else {
      this.currentOperand += '.';
    }

    this.updateDisplay();
  }

  /**
   * Toggles positive / negative sign (±)
   */
  toggleSign() {
    if (this.isErrorState || this.currentOperand === '0') return;

    if (this.currentOperand.startsWith('-')) {
      this.currentOperand = this.currentOperand.slice(1);
    } else {
      this.currentOperand = '-' + this.currentOperand;
    }

    this.updateDisplay();
  }

  /**
   * Calculates percentages with standard financial/scientific calculator behavior
   */
  applyPercentage() {
    if (this.isErrorState) return;

    const current = parseFloat(this.currentOperand);
    if (isNaN(current)) return;

    // If we have an existing operation like 100 + 10%, calculate 10% of 100 (= 10)
    if (this.operation && this.previousOperand) {
      const prev = parseFloat(this.previousOperand);
      if (!isNaN(prev)) {
        if (this.operation === '+' || this.operation === '−' || this.operation === '-') {
          const percentVal = (prev * current) / 100;
          this.currentOperand = this.formatSafeNumber(percentVal);
        } else {
          // For multiplication or division: 200 * 5% -> 200 * 0.05
          const percentVal = current / 100;
          this.currentOperand = this.formatSafeNumber(percentVal);
        }
        this.updateDisplay();
        return;
      }
    }

    // Default standalone percentage: 50% = 0.5
    const result = current / 100;
    this.currentOperand = this.formatSafeNumber(result);
    this.updateDisplay();
  }

  /**
   * Sets or updates the active mathematical operation
   * @param {string} operator 
   */
  chooseOperation(operator) {
    if (this.isErrorState) return;

    // Normalizing display operator symbols
    const normalizedOp = this.normalizeOperator(operator);

    // If user clicked operator without entering second number, just switch operator
    if (this.operation !== null && this.shouldResetScreen) {
      this.operation = normalizedOp;
      this.updateDisplay();
      return;
    }

    // If there is already an operation pending, compute intermediate result first
    if (this.previousOperand !== '' && this.operation !== null) {
      this.compute(false);
    }

    this.operation = normalizedOp;
    this.previousOperand = this.currentOperand;
    this.shouldResetScreen = true;
    this.updateDisplay();
  }

  /**
   * Normalizes incoming operator strings to standard display characters
   * @param {string} op 
   * @returns {string}
   */
  normalizeOperator(op) {
    switch (op) {
      case '/':
      case '÷':
        return '÷';
      case '*':
      case 'x':
      case 'X':
      case '×':
        return '×';
      case '-':
      case '−':
        return '−';
      case '+':
        return '+';
      default:
        return op;
    }
  }

  /**
   * Safely calculates the arithmetic expression without using eval()
   * @param {boolean} isFinalCalculation Whether this was triggered by '='
   */
  compute(isFinalCalculation = true) {
    if (this.isErrorState || this.operation === null || this.previousOperand === '') {
      return;
    }

    const prev = parseFloat(this.previousOperand);
    const curr = parseFloat(this.currentOperand);

    if (isNaN(prev) || isNaN(curr)) {
      return;
    }

    let computationResult;

    switch (this.operation) {
      case '+':
        computationResult = prev + curr;
        break;
      case '−':
      case '-':
        computationResult = prev - curr;
        break;
      case '×':
      case '*':
        computationResult = prev * curr;
        break;
      case '÷':
      case '/':
        // Division by Zero check
        if (curr === 0) {
          this.triggerError('Cannot divide by 0');
          return;
        }
        computationResult = prev / curr;
        break;
      default:
        return;
    }

    // Handle potential overflow or NaN results gracefully
    if (!isFinite(computationResult)) {
      this.triggerError('Numeric Overflow');
      return;
    }

    const formattedResult = this.formatSafeNumber(computationResult);

    if (isFinalCalculation) {
      this.previousOperand = `${this.formatDisplayNumber(this.previousOperand)} ${this.operation} ${this.formatDisplayNumber(this.currentOperand)} =`;
      this.operation = null;
    } else {
      this.previousOperand = formattedResult;
    }

    this.currentOperand = formattedResult;
    this.shouldResetScreen = true;
    this.updateDisplay();
  }

  /**
   * Rounds floating-point numbers to eliminate floating artifacts (e.g. 0.1 + 0.2 = 0.3)
   * @param {number} num 
   * @returns {string}
   */
  formatSafeNumber(num) {
    if (Number.isInteger(num)) {
      return num.toString();
    }

    // Fix floating point imprecision up to 12 decimal places
    const rounded = Math.round((num + Number.EPSILON) * 1e12) / 1e12;
    
    // Check if exponent representation is more appropriate
    if (Math.abs(rounded) >= 1e15 || (Math.abs(rounded) > 0 && Math.abs(rounded) < 1e-6)) {
      return rounded.toExponential(6).replace(/\+/, '');
    }

    return rounded.toString();
  }

  /**
   * Formats a raw number string for user display with thousands grouping
   * @param {string} numberStr 
   * @returns {string}
   */
  formatDisplayNumber(numberStr) {
    if (!numberStr) return '';
    if (numberStr.includes('e') || numberStr.includes('E')) {
      return numberStr; // Don't format scientific notation with locale commas
    }

    const isNegative = numberStr.startsWith('-');
    const cleanNumber = isNegative ? numberStr.slice(1) : numberStr;

    const parts = cleanNumber.split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];

    let formattedInteger = '';
    if (integerPart !== '') {
      const parsedInt = parseFloat(integerPart);
      if (isNaN(parsedInt)) {
        formattedInteger = integerPart;
      } else {
        formattedInteger = parsedInt.toLocaleString('en-US');
      }
    }

    let finalDisplay = isNegative ? `-${formattedInteger}` : formattedInteger;

    if (decimalPart !== undefined) {
      finalDisplay += `.${decimalPart}`;
    }

    return finalDisplay;
  }

  /**
   * Triggers an error state with a friendly custom message
   * @param {string} message 
   */
  triggerError(message) {
    this.isErrorState = true;
    this.previousOperand = '';
    this.operation = null;
    this.currentOperand = message;
    this.updateDisplay();
  }

  /**
   * Refreshes the DOM display and updates dynamic font scaling
   */
  updateDisplay() {
    if (this.isErrorState) {
      this.currentOperandEl.innerText = this.currentOperand;
      this.currentOperandEl.className = 'current-value text-error';
      this.previousOperandEl.innerText = '';
      this.activeOperatorEl.innerText = '';
      this.highlightActiveOperator(null);
      return;
    }

    // Format current input
    const displayValue = this.formatDisplayNumber(this.currentOperand);
    this.currentOperandEl.innerText = displayValue || '0';

    // Dynamic Font Scaling according to length
    const valueLength = displayValue.length;
    this.currentOperandEl.className = 'current-value';
    if (valueLength > 14) {
      this.currentOperandEl.classList.add('text-small');
    } else if (valueLength > 9) {
      this.currentOperandEl.classList.add('text-medium');
    }

    // Update previous expression and active operator indicator
    if (this.operation != null) {
      this.previousOperandEl.innerText = `${this.formatDisplayNumber(this.previousOperand)} ${this.operation}`;
      this.activeOperatorEl.innerText = this.operation;
      this.highlightActiveOperator(this.operation);
    } else {
      this.previousOperandEl.innerText = this.previousOperand;
      this.activeOperatorEl.innerText = '';
      this.highlightActiveOperator(null);
    }
  }

  /**
   * Visually highlights the active operator button on the keypad
   * @param {string|null} op 
   */
  highlightActiveOperator(op) {
    const operatorButtons = document.querySelectorAll('.btn-operator');
    operatorButtons.forEach(btn => {
      if (op && btn.getAttribute('data-operator') === op) {
        btn.classList.add('is-active-op');
      } else {
        btn.classList.remove('is-active-op');
      }
    });
  }
}

/* ==========================================================================
   DOM Initialization & Event Bindings
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const previousOperandEl = document.getElementById('previous-operand');
  const currentOperandEl = document.getElementById('current-operand');
  const activeOperatorEl = document.getElementById('active-operator');

  const calculator = new ProfessionalCalculator(
    previousOperandEl,
    currentOperandEl,
    activeOperatorEl
  );

  // Map of physical keyboard keys to calculator button elements for visual feedback
  const keyToButtonSelector = {
    '0': '[data-number="0"]',
    '1': '[data-number="1"]',
    '2': '[data-number="2"]',
    '3': '[data-number="3"]',
    '4': '[data-number="4"]',
    '5': '[data-number="5"]',
    '6': '[data-number="6"]',
    '7': '[data-number="7"]',
    '8': '[data-number="8"]',
    '9': '[data-number="9"]',
    '.': '[data-action="decimal"]',
    ',': '[data-action="decimal"]',
    '+': '[data-operator="+"]',
    '-': '[data-operator="−"]',
    '*': '[data-operator="×"]',
    'x': '[data-operator="×"]',
    'X': '[data-operator="×"]',
    '/': '[data-operator="÷"]',
    '%': '[data-action="percent"]',
    '=': '[data-action="calculate"]',
    'Enter': '[data-action="calculate"]',
    'Backspace': '[data-action="delete"]',
    'Escape': '[data-action="clear"]',
    'Delete': '[data-action="clear"]'
  };

  /**
   * Applies temporary visual press animation to the button matching the keypress
   * @param {string} key 
   */
  function flashButton(key) {
    const selector = keyToButtonSelector[key];
    if (!selector) return;

    const btn = document.querySelector(selector);
    if (btn) {
      btn.classList.add('keyboard-active');
      setTimeout(() => {
        btn.classList.remove('keyboard-active');
      }, 140);
    }
  }

  // Handle Keypad Clicks via Event Delegation
  const keypad = document.querySelector('.calculator-keypad');
  keypad.addEventListener('click', (event) => {
    const target = event.target.closest('button');
    if (!target) return;

    // Handle number clicks
    if (target.dataset.number !== undefined) {
      calculator.appendNumber(target.dataset.number);
      return;
    }

    // Handle operator clicks
    if (target.dataset.operator !== undefined) {
      calculator.chooseOperation(target.dataset.operator);
      return;
    }

    // Handle actions (clear, delete, decimal, calculate, etc.)
    const action = target.dataset.action;
    switch (action) {
      case 'clear':
        calculator.clearAll();
        break;
      case 'delete':
        calculator.deleteDigit();
        break;
      case 'decimal':
        calculator.appendDecimal();
        break;
      case 'negate':
        calculator.toggleSign();
        break;
      case 'percent':
        calculator.applyPercentage();
        break;
      case 'calculate':
        calculator.compute(true);
        break;
      default:
        break;
    }
  });

  // Handle Physical Keyboard Input
  window.addEventListener('keydown', (event) => {
    const { key } = event;

    // Digits 0-9
    if (/^[0-9]$/.test(key)) {
      flashButton(key);
      calculator.appendNumber(key);
      return;
    }

    // Decimal point
    if (key === '.' || key === ',') {
      flashButton('.');
      calculator.appendDecimal();
      return;
    }

    // Arithmetic operators
    if (key === '+' || key === '-' || key === '*' || key === '/') {
      event.preventDefault(); // Prevent browser quick-search with '/'
      flashButton(key);
      calculator.chooseOperation(key);
      return;
    }

    // Percentage (%)
    if (key === '%') {
      flashButton('%');
      calculator.applyPercentage();
      return;
    }

    // Equals / Enter
    if (key === 'Enter' || key === '=') {
      event.preventDefault(); // Prevent triggering focused button submit
      flashButton(key);
      calculator.compute(true);
      return;
    }

    // Backspace (DEL)
    if (key === 'Backspace') {
      event.preventDefault();
      flashButton('Backspace');
      calculator.deleteDigit();
      return;
    }

    // Escape / Delete (AC)
    if (key === 'Escape' || key === 'Delete' || key.toLowerCase() === 'c') {
      event.preventDefault();
      flashButton('Escape');
      calculator.clearAll();
      return;
    }

    // Sign toggle via 'F9', 'n', 'N', or '_'
    if (key === 'F9' || key.toLowerCase() === 'n' || key === '_') {
      event.preventDefault();
      calculator.toggleSign();
      return;
    }
  });
});
