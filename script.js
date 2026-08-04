/* ==========================================================================
   NUMBER SYSTEM - Basic Theory and Decimal Conversions
   Vanilla JavaScript Controller (20-Slide Navigation & Solver Engines)
   ========================================================================== */

(function () {
  'use strict';

  const state = {
    currentSlide: 1,
    totalSlides: 20,
    isAnimating: false,
    atmPin: '',
    registerBits: [1, 0, 1, 1, 0, 0, 1, 1], // Bit 7 to Bit 0
    quizIndex: 0,
    quizScore: 0,
    quizAnswers: new Array(10).fill(null),
    tickerNumbers: [4095, 97, 45, 125, 255, 179, 365, 512],
    tickerIdx: 0,
    conceptDigit: 7,
    conceptNumbers: [458, 101, 755, 255, 128],
    conceptNumIdx: 0
  };

  // 10-Question Classroom Quiz Data
  const quizData = [
    {
      q: "Question 1: What is the Base (Radix) of the Hexadecimal Number System?",
      options: ["A) 2", "B) 8", "C) 10", "D) 16"],
      correct: 3,
      explain: "Correct! Hexadecimal (Base 16) uses 16 distinct symbols: digits 0-9 and letters A-F."
    },
    {
      q: "Question 2: Which bit carries the highest positional weight in an 8-bit Binary Byte?",
      options: ["A) LSB", "B) MSB", "C) Nibble", "D) Parity Bit"],
      correct: 1,
      explain: "Correct! MSB (Most Significant Bit) is the leftmost bit with weight 2⁷ = 128."
    },
    {
      q: "Question 3: What is the Hexadecimal equivalent of decimal remainder 14?",
      options: ["A) C", "B) D", "C) E", "D) F"],
      correct: 2,
      explain: "Correct! In Hexadecimal: 10=A, 11=B, 12=C, 13=D, 14=E, 15=F."
    },
    {
      q: "Question 4: How many bits make up 1 Nibble?",
      options: ["A) 2 Bits", "B) 4 Bits", "C) 8 Bits", "D) 16 Bits"],
      correct: 1,
      explain: "Correct! 1 Nibble = 4 Bits (Half a Byte). Exactly 1 Hex digit equals 1 Nibble."
    },
    {
      q: "Question 5: What is the binary equivalent of decimal number (45)₁₀?",
      options: ["A) 101001₂", "B) 101101₂", "C) 110101₂", "D) 111001₂"],
      correct: 1,
      explain: "Correct! 45 ÷ 2 yields remainders 1,0,1,1,0,1 read bottom-to-top -> 101101₂."
    },
    {
      q: "Question 6: In the Octal system, which of the following digits is INVALID?",
      options: ["A) 0", "B) 5", "C) 7", "D) 8"],
      correct: 3,
      explain: "Correct! Octal (Base 8) strictly uses digits 0 to 7. Digits 8 and 9 are invalid."
    },
    {
      q: "Question 7: What does a transistor state of '0' represent in computer hardware logic?",
      options: ["A) High Voltage 5V", "B) Low Voltage 0V / OFF", "C) 1 Byte", "D) Parity Bit"],
      correct: 1,
      explain: "Correct! Binary 0 represents Low Voltage (0V) or OFF state."
    },
    {
      q: "Question 8: What is the Octal equivalent of decimal number (365)₁₀?",
      options: ["A) 455₈", "B) 555₈", "C) 655₈", "D) 755₈"],
      correct: 1,
      explain: "Correct! 365 ÷ 8 gives remainders 5, 5, 5 -> 555₈."
    },
    {
      q: "Question 9: What is the Hexadecimal equivalent of decimal number (255)₁₀?",
      options: ["A) E1₁₆", "B) FE₁₆", "C) FF₁₆", "D) F0₁₆"],
      correct: 2,
      explain: "Correct! 255 ÷ 16 yields quotient 15 (F) and remainder 15 (F) -> FF₁₆."
    },
    {
      q: "Question 10: In what direction must division remainders be read to get the final converted answer?",
      options: ["A) Top (LSB) to Bottom (MSB)", "B) Bottom (MSB) to Top (LSB)", "C) Left to Right", "D) Any order"],
      correct: 1,
      explain: "Correct! Always read remainders from Last (MSB/Bottom) to First (LSB/Top)."
    }
  ];

  // Dynamic Division Solvers Engine State
  const bin45State = { step: 0, steps: [], num: 45 };
  const oct365State = { step: 0, steps: [], num: 365 };
  const hex255State = { step: 0, steps: [], num: 255 };

  // Timer reference for auto-play solvers
  let autoPlayTimer = null;
  let tickerTimer = null;

  function init() {
    initNavigation();
    initSolversData();
    initQuiz();
    initKeyboardShortcuts();
    initCoverTicker();
    updateRegisterCalc();
    updateUI();
  }

  // --------------------------------------------------------------------------
  // Slide 4: Basic Concepts Real Interactive Animation API
  // --------------------------------------------------------------------------
  function stepDigit(dir) {
    state.conceptDigit = (state.conceptDigit + dir + 10) % 10;
    const el = document.getElementById('concept-digit-val');
    if (el) {
      el.textContent = state.conceptDigit;
      el.style.animation = 'none';
      void el.offsetWidth;
      el.style.animation = 'digitPop 0.3s ease';
    }
  }

  function combineNumberAnimation() {
    state.conceptNumIdx = (state.conceptNumIdx + 1) % state.conceptNumbers.length;
    const numStr = String(state.conceptNumbers[state.conceptNumIdx]).padStart(3, '0');
    
    const chipH = document.querySelector('.chip-h');
    const chipT = document.querySelector('.chip-t');
    const chipO = document.querySelector('.chip-o');
    const resVal = document.getElementById('combine-result-val');

    if (chipH) chipH.textContent = numStr[0];
    if (chipT) chipT.textContent = numStr[1];
    if (chipO) chipO.textContent = numStr[2];
    if (resVal) resVal.textContent = state.conceptNumbers[state.conceptNumIdx];
  }

  function setConceptBase(baseVal) {
    const btnList = document.querySelectorAll('.radix-pill');
    btnList.forEach(b => b.classList.remove('active-radix'));
    
    const activeBtn = Array.from(btnList).find(b => b.textContent.includes(baseVal));
    if (activeBtn) activeBtn.classList.add('active-radix');

    const visual = document.getElementById('concept-radix-visual');
    const pvCalc = document.getElementById('concept-pv-calc');

    if (baseVal === 2) {
      if (visual) visual.textContent = 'Base 2 {0, 1}';
      if (pvCalc) pvCalc.innerHTML = `1 × 2<sup>2</sup> = <strong>4</strong>`;
    } else if (baseVal === 8) {
      if (visual) visual.textContent = 'Base 8 {0..7}';
      if (pvCalc) pvCalc.innerHTML = `5 × 8<sup>1</sup> = <strong>40</strong>`;
    } else if (baseVal === 10) {
      if (visual) visual.textContent = 'Base 10 {0..9}';
      if (pvCalc) pvCalc.innerHTML = `4 × 10<sup>2</sup> = <strong>400</strong>`;
    } else if (baseVal === 16) {
      if (visual) visual.textContent = 'Base 16 {0..F}';
      if (pvCalc) pvCalc.innerHTML = `2 × 16<sup>1</sup> = <strong>32</strong>`;
    }
  }

  // --------------------------------------------------------------------------
  // Front Page Live Converting Ticker Loop
  // --------------------------------------------------------------------------
  function initCoverTicker() {
    updateTickerDisplay();
    tickerTimer = setInterval(() => {
      state.tickerIdx = (state.tickerIdx + 1) % state.tickerNumbers.length;
      updateTickerDisplay();
    }, 2200);
  }

  function updateTickerDisplay() {
    const num = state.tickerNumbers[state.tickerIdx];
    const decEl = document.getElementById('ticker-dec');
    const binEl = document.getElementById('ticker-bin');
    const octEl = document.getElementById('ticker-oct');
    const hexEl = document.getElementById('ticker-hex');

    if (decEl) decEl.textContent = num;
    if (binEl) binEl.textContent = num.toString(2) + '₂';
    if (octEl) octEl.textContent = num.toString(8) + '₈';
    if (hexEl) hexEl.textContent = num.toString(16).toUpperCase() + '₁₆';
  }

  // --------------------------------------------------------------------------
  // Navigation System
  // --------------------------------------------------------------------------
  function initNavigation() {
    const slides = document.querySelectorAll('.slide');
    state.totalSlides = slides.length;

    const btnFS = document.getElementById('btn-fullscreen');
    if (btnFS) {
      btnFS.addEventListener('click', () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
      });
    }
  }

  function handleNext() {
    const activeSlide = document.querySelector('.slide.active');
    if (!activeSlide) return;

    const unrevealed = activeSlide.querySelectorAll('.reveal-step:not(.revealed)');
    if (unrevealed.length > 0) {
      unrevealed[0].classList.add('revealed');
      return;
    }

    if (state.currentSlide < state.totalSlides) {
      goToSlide(state.currentSlide + 1);
    }
  }

  function handlePrev() {
    if (state.currentSlide > 1) {
      goToSlide(state.currentSlide - 1);
    }
  }

  function goToSlide(slideNum) {
    if (slideNum < 1 || slideNum > state.totalSlides || state.isAnimating) return;

    state.isAnimating = true;

    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }

    const currentSlideEl = document.querySelector('.slide.active');
    const targetSlideEl = document.querySelector(`.slide[data-slide-num="${slideNum}"]`);

    if (currentSlideEl) currentSlideEl.classList.remove('active');
    if (targetSlideEl) {
      targetSlideEl.classList.add('active');
      if (slideNum === 1) {
        targetSlideEl.querySelectorAll('.reveal-step').forEach(el => el.classList.add('revealed'));
      }
    }

    state.currentSlide = slideNum;
    updateUI();

    setTimeout(() => {
      state.isAnimating = false;
    }, 400);
  }

  function updateUI() {}

  function initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Home') {
        e.preventDefault();
        goToSlide(1);
      } else if (e.key === 'End') {
        e.preventDefault();
        goToSlide(state.totalSlides);
      }
    });
  }

  // --------------------------------------------------------------------------
  // CLASSROOM STOPPING RULE DIVISION ALGORITHM ENGINE
  // Continues division while dividend >= base.
  // When quotient < base, division STOPS! That final quotient IS the MSB!
  // Hexadecimal A-F mapping applies ONLY to single-digit values 10..15!
  // --------------------------------------------------------------------------
  function buildDivSteps(num, base) {
    const steps = [];
    let dividend = num;
    let stepCount = 1;

    // Helper for single hex digit (0-15) mapping
    const getHexSymbol = (val) => {
      if (base === 16 && val >= 10 && val <= 15) {
        return String.fromCharCode(55 + val); // 10->A, 11->B, 12->C, 13->D, 14->E, 15->F
      }
      return val.toString();
    };

    // If initial number is already smaller than base
    if (dividend < base) {
      const hexSymbol = getHexSymbol(dividend);
      steps.push({
        step: 1,
        dividend: dividend,
        divisor: base,
        quotient: dividend,
        remainder: dividend,
        hexCharRem: hexSymbol,
        hexCharQuot: hexSymbol,
        isFinalStep: true
      });
      return steps;
    }

    while (dividend >= base) {
      const quotient = Math.floor(dividend / base);
      const remainder = dividend % base;

      const hexCharRem = getHexSymbol(remainder);
      // Quotient gets hex symbol A-F ONLY IF it is a single digit 10..15!
      const hexCharQuot = getHexSymbol(quotient);
      const isFinalStep = (quotient < base);

      steps.push({
        step: stepCount,
        dividend: dividend,
        divisor: base,
        quotient: quotient,
        remainder: remainder,
        hexCharRem: hexCharRem,
        hexCharQuot: hexCharQuot,
        isFinalStep: isFinalStep
      });

      dividend = quotient;
      stepCount++;
    }
    return steps;
  }

  function initSolversData() {
    bin45State.steps = buildDivSteps(bin45State.num, 2);
    oct365State.steps = buildDivSteps(oct365State.num, 8);
    hex255State.steps = buildDivSteps(hex255State.num, 16);
  }

  function loadCustomNumber(type) {
    if (autoPlayTimer) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }

    let inputElId = '';
    let stateObj = null;
    let targetNumId = '';
    let tbodyId = '';
    let ansTextId = '';
    let prefixId = '';
    let baseVal = 2;

    if (type === 'bin') {
      inputElId = 'bin-user-input';
      stateObj = bin45State;
      targetNumId = 's12-target-num';
      tbodyId = 's12-tbody';
      ansTextId = 's12-ans-text';
      prefixId = 's12';
      baseVal = 2;
    } else if (type === 'oct') {
      inputElId = 'oct-user-input';
      stateObj = oct365State;
      targetNumId = 's15-target-num';
      tbodyId = 's15-tbody';
      ansTextId = 's15-ans-text';
      prefixId = 's15';
      baseVal = 8;
    } else if (type === 'hex') {
      inputElId = 'hex-user-input';
      stateObj = hex255State;
      targetNumId = 's17-target-num';
      tbodyId = 's17-tbody';
      ansTextId = 's17-ans-text';
      prefixId = 's17';
      baseVal = 16;
    }

    const inputEl = document.getElementById(inputElId);
    if (!inputEl) return;

    let val = parseInt(inputEl.value, 10);
    if (isNaN(val) || val <= 0) val = 45;
    if (val > 99999) val = 99999;
    inputEl.value = val;

    stateObj.num = val;
    stateObj.steps = buildDivSteps(val, baseVal);
    stateObj.step = 0;

    const targetNumEl = document.getElementById(targetNumId);
    if (targetNumEl) targetNumEl.textContent = val;

    resetSolver(stateObj, tbodyId, ansTextId, `Result: (${val})₁₀ = ?`, prefixId, val, baseVal);
  }

  function setPreset(type, numVal) {
    let inputElId = '';
    if (type === 'bin') inputElId = 'bin-user-input';
    else if (type === 'oct') inputElId = 'oct-user-input';
    else if (type === 'hex') inputElId = 'hex-user-input';

    const inputEl = document.getElementById(inputElId);
    if (inputEl) {
      inputEl.value = numVal;
      loadCustomNumber(type);
    }
  }

  // --------------------------------------------------------------------------
  // EXACT CLASSROOM STOPPING RULE SOLVER ENGINE (CLEAN HEXADECIMAL FORMATTING)
  // --------------------------------------------------------------------------
  function stepSolver(stateObj, tbodyId, ansTextId, base, formatAns, prefixId) {
    const container = document.getElementById(tbodyId);
    if (!container) return;

    // STEP 0: SETUP ROW (Line 1 in Photo: Divisor = Base, Number = N, Remainder = BLANK)
    if (stateObj.step === 0) {
      container.innerHTML = '';

      const line1 = document.createElement('div');
      line1.className = 'tbar-row tbar-row-setup reveal-step revealed active-solver-row';
      line1.innerHTML = `
        <div class="tbar-cell cell-divisor">
          <span class="divisor-pointer-tag">Divisor ➔</span>
          <span class="num-divisor">${base}</span>
        </div>
        <div class="tbar-cell cell-quotient">${stateObj.num}</div>
        <div class="tbar-cell cell-remainder">
          <span class="blank-rem-dash">—</span>
        </div>
      `;
      container.appendChild(line1);
      stateObj.step = 1;
      return;
    }

    const currentStepIdx = stateObj.step - 1;
    if (currentStepIdx >= stateObj.steps.length) return;

    const currentData = stateObj.steps[currentStepIdx];
    const isFirstDivisionStep = (currentStepIdx === 0);
    const isFinalDivisionStep = currentData.isFinalStep;

    container.querySelectorAll('.tbar-row').forEach(r => r.classList.remove('active-solver-row'));

    let remDisplay = currentData.remainder;
    if (base === 16 && currentData.remainder >= 10 && currentData.remainder <= 15) {
      remDisplay = `<span class="morph-letter">${currentData.hexCharRem}</span> <span class="dec-hint">(${currentData.remainder})</span>`;
    }

    let quotDisplay = currentData.quotient;
    if (base === 16 && isFinalDivisionStep && currentData.quotient >= 10 && currentData.quotient <= 15) {
      quotDisplay = `<span class="morph-letter">${currentData.hexCharQuot}</span> <span class="dec-hint">(${currentData.quotient})</span>`;
    }

    const row = document.createElement('div');
    row.className = 'tbar-row reveal-step revealed active-solver-row';

    let remCellHtml = '';
    let quotCellHtml = `${quotDisplay}`;

    if (isFirstDivisionStep) {
      // Line 2 in Photo: First division step -> Remainder is encircled green with pointer labeled "LSB"
      remCellHtml = `
        <span class="encircled-rem circle-green">${currentData.hexCharRem}</span>
        <span class="lsb-badge-inline glow-green ml-2">← LSB</span>
      `;
      if (base === 16 && currentData.remainder >= 10) {
        remCellHtml = `
          <span class="encircled-rem circle-green">${currentData.hexCharRem}</span>
          <span class="dec-hint ml-1">(${currentData.remainder})</span>
          <span class="lsb-badge-inline glow-green ml-2">← LSB</span>
        `;
      }
    } else {
      remCellHtml = `<span>${remDisplay}</span>`;
    }

    // Last Line in Photo: When quotient < base -> Division STOPS!
    // The middle quotient is encircled RED with pointer pointing DOWN labeled "MSB"!
    if (isFinalDivisionStep) {
      let qEncVal = currentData.hexCharQuot;
      let qHint = (base === 16 && currentData.quotient >= 10) ? `<span class="dec-hint">(${currentData.quotient})</span>` : '';

      quotCellHtml = `
        <div class="msb-quotient-wrapper">
          <div class="msb-quotient-flex">
            <span class="encircled-rem circle-red">${qEncVal}</span>
            ${qHint}
          </div>
          <span class="msb-badge-inline glow-red msb-pointer-down">↓ MSB</span>
        </div>
      `;
    }

    row.innerHTML = `
      <div class="tbar-cell cell-divisor">${currentData.divisor}</div>
      <div class="tbar-cell cell-quotient">${quotCellHtml}</div>
      <div class="tbar-cell cell-remainder">${remCellHtml}</div>
    `;

    container.appendChild(row);
    stateObj.step++;

    if (prefixId) {
      const divNum = document.getElementById(`${prefixId}-div-num`);
      const divQuot = document.getElementById(`${prefixId}-div-quot`);
      const divRem = document.getElementById(`${prefixId}-div-rem`);
      const carryText = document.getElementById(`${prefixId}-carry-text`);

      if (divNum) divNum.textContent = currentData.dividend;
      if (divQuot) divQuot.textContent = currentData.quotient;
      if (divRem) {
        let remText = `Remainder: ${currentData.remainder}`;
        if (base === 16 && currentData.remainder >= 10) {
          remText = `Remainder: ${currentData.hexCharRem} (${currentData.remainder})`;
        }
        if (isFirstDivisionStep) {
          remText += ' (LSB)';
        }
        divRem.textContent = remText;
      }

      if (carryText) {
        if (!isFinalDivisionStep) {
          carryText.textContent = `↓ Quotient ${currentData.quotient} carries over as new dividend for next step ↓`;
        } else {
          carryText.textContent = `✓ Quotient ${currentData.quotient} is less than base ${base}! Division STOPS. Final Quotient = MSB (${currentData.hexCharQuot}) ↑`;
        }
      }
    }

    // When final step is rendered, format final answer reading MSB (final quotient) + remainders in reverse!
    if (isFinalDivisionStep) {
      const ansText = document.getElementById(ansTextId);
      if (ansText) {
        let finalDigits = [];
        // Final Quotient is MSB
        finalDigits.push(currentData.hexCharQuot);
        // Remainders in reverse
        for (let i = stateObj.steps.length - 1; i >= 0; i--) {
          finalDigits.push(stateObj.steps[i].hexCharRem);
        }
        const finalValStr = finalDigits.join('');
        ansText.innerHTML = formatAns(finalValStr);
      }
    }
  }

  function resetSolver(stateObj, tbodyId, ansTextId, defaultAnsText, prefixId, initDividend, baseVal) {
    stateObj.step = 0;
    const container = document.getElementById(tbodyId);
    if (container) container.innerHTML = '';
    const ansText = document.getElementById(ansTextId);
    if (ansText) ansText.innerHTML = defaultAnsText;

    if (prefixId) {
      const divNum = document.getElementById(`${prefixId}-div-num`);
      const divQuot = document.getElementById(`${prefixId}-div-quot`);
      const divRem = document.getElementById(`${prefixId}-div-rem`);
      const carryText = document.getElementById(`${prefixId}-carry-text`);

      if (divNum) divNum.textContent = initDividend;
      if (divQuot) divQuot.textContent = '?';
      if (divRem) divRem.textContent = 'Remainder: ?';
      if (carryText) carryText.textContent = `Click Next Division Step to start dividing ${initDividend} by ${baseVal || 2}`;
    }

    // Auto-initialize Step 0 Setup Row!
    stepSolver(stateObj, tbodyId, ansTextId, baseVal, val => `Result: (${initDividend})₁₀ = <strong>${val}</strong>`, prefixId);
  }

  function playSolver(stateObj, stepFunc) {
    if (autoPlayTimer) clearInterval(autoPlayTimer);
    autoPlayTimer = setInterval(() => {
      if (stateObj.step <= stateObj.steps.length) {
        stepFunc();
      } else {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    }, 800);
  }

  // --------------------------------------------------------------------------
  // Interactive Widgets (ATM & 8-Bit Register Flipper)
  // --------------------------------------------------------------------------
  function pressAtm(digit) {
    if (state.atmPin.length < 4) {
      state.atmPin += digit;
      updateAtmDisplay();
    }
  }

  function clearAtm() {
    state.atmPin = '';
    updateAtmDisplay();
  }

  function updateAtmDisplay() {
    const disp = document.getElementById('atm-pin-display');
    if (!disp) return;
    if (state.atmPin.length === 0) {
      disp.textContent = '▪ ▪ ▪ ▪';
      disp.style.color = '#38bdf8';
    } else {
      let mask = '';
      for (let i = 0; i < state.atmPin.length; i++) {
        mask += state.atmPin[i] + ' ';
      }
      for (let i = state.atmPin.length; i < 4; i++) {
        mask += '▪ ';
      }
      disp.textContent = mask.trim();
      disp.style.color = '#22c55e';
    }
  }

  function flipBit(bitIndex) {
    const idx = 7 - bitIndex;
    state.registerBits[idx] = state.registerBits[idx] === 1 ? 0 : 1;
    
    const bitValEl = document.getElementById(`bit-val-${bitIndex}`);
    const chipEl = bitValEl ? bitValEl.closest('.chip') : null;

    if (bitValEl) {
      bitValEl.textContent = state.registerBits[idx];
    }

    if (chipEl) {
      if (state.registerBits[idx] === 1) {
        chipEl.classList.add('active-bit');
      } else {
        chipEl.classList.remove('active-bit');
      }
    }

    updateRegisterCalc();
  }

  function updateRegisterCalc() {
    const weights = [128, 64, 32, 16, 8, 4, 2, 1];
    let total = 0;
    let sumParts = [];

    for (let i = 0; i < 8; i++) {
      const bitVal = state.registerBits[i];
      const weight = weights[i];
      if (bitVal === 1) {
        total += weight;
        sumParts.push(weight);
      } else {
        sumParts.push(0);
      }
    }

    const calcOutput = document.getElementById('register-calc-output');
    if (calcOutput) {
      calcOutput.innerHTML = `Calculated Total: ${sumParts.join(' + ')} = <strong>${total}<sub>10</sub></strong>`;
    }
  }

  // --------------------------------------------------------------------------
  // 10-Question Interactive Quiz Engine Implementation
  // --------------------------------------------------------------------------
  function initQuiz() {
    renderQuizQuestion();
  }

  function renderQuizQuestion() {
    const qData = quizData[state.quizIndex];
    if (!qData) return;

    const qTitle = document.getElementById('quiz-question-title');
    const qProgress = document.getElementById('quiz-progress-text');
    const qScore = document.getElementById('quiz-score-text');

    if (qTitle) qTitle.textContent = qData.q;
    if (qProgress) qProgress.textContent = `Question ${state.quizIndex + 1} of ${quizData.length}`;
    if (qScore) qScore.textContent = `Score: ${state.quizScore} / ${quizData.length}`;

    const optContainer = document.getElementById('quiz-options-container');
    if (optContainer) {
      optContainer.innerHTML = '';
      const prevAnswered = state.quizAnswers[state.quizIndex];

      qData.options.forEach((optText, idx) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-btn';
        btn.textContent = optText;

        if (prevAnswered !== null) {
          btn.disabled = true;
          if (idx === qData.correct) {
            btn.classList.add('correct');
          } else if (idx === prevAnswered) {
            btn.classList.add('incorrect');
          }
        } else {
          btn.onclick = () => selectQuizAnswer(idx);
        }

        optContainer.appendChild(btn);
      });
    }

    const explainBox = document.getElementById('quiz-explain-box');
    if (explainBox) {
      if (state.quizAnswers[state.quizIndex] !== null) {
        explainBox.innerHTML = `<strong>Explanation:</strong> ${qData.explain}`;
        explainBox.classList.remove('hidden');
      } else {
        explainBox.classList.add('hidden');
      }
    }

    const btnPrev = document.getElementById('quiz-prev-btn');
    const btnNext = document.getElementById('quiz-next-btn');

    if (btnPrev) btnPrev.disabled = (state.quizIndex === 0);
    if (btnNext) {
      if (state.quizIndex === quizData.length - 1) {
        btnNext.textContent = 'Finish Quiz ✔';
      } else {
        btnNext.textContent = 'Next Question →';
      }
    }
  }

  function selectQuizAnswer(selectedIndex) {
    if (state.quizAnswers[state.quizIndex] !== null) return;

    state.quizAnswers[state.quizIndex] = selectedIndex;
    const qData = quizData[state.quizIndex];

    if (selectedIndex === qData.correct) {
      state.quizScore++;
    }

    renderQuizQuestion();
  }

  function nextQuizQ() {
    if (state.quizIndex < quizData.length - 1) {
      state.quizIndex++;
      renderQuizQuestion();
    } else {
      alert(`Quiz Completed! Final Score: ${state.quizScore} out of ${quizData.length}`);
    }
  }

  function prevQuizQ() {
    if (state.quizIndex > 0) {
      state.quizIndex--;
      renderQuizQuestion();
    }
  }

  function resetQuiz() {
    state.quizIndex = 0;
    state.quizScore = 0;
    state.quizAnswers.fill(null);
    renderQuizQuestion();
  }

  // --------------------------------------------------------------------------
  // Public App Namespace API
  // --------------------------------------------------------------------------
  window.App = {
    next: handleNext,
    prev: handlePrev,
    jump: (num) => goToSlide(parseInt(num, 10)),

    // Custom Number Input API
    loadCustomNumber: loadCustomNumber,
    setPreset: setPreset,

    // Slide 4 Basic Concepts API
    stepDigit: stepDigit,
    combineNumberAnimation: combineNumberAnimation,
    setConceptBase: setConceptBase,
    
    toggleSwitch: (checked) => {
      const bulb = document.getElementById('s7-bulb');
      const status = document.getElementById('s7-status-text');
      const wireLeft = document.getElementById('wire-left');
      const wireRight = document.getElementById('wire-right');

      if (checked) {
        if (bulb) {
          bulb.classList.add('active');
          bulb.style.filter = 'drop-shadow(0 0 35px #87CEFA) drop-shadow(0 0 55px #38bdf8)';
          bulb.style.transform = 'scale(1.22)';
        }
        if (wireLeft) wireLeft.classList.add('sparking');
        if (wireRight) wireRight.classList.add('sparking');
        if (status) status.innerText = 'State: 1 (ON / 5 Volts Current Flowing)';
      } else {
        if (bulb) {
          bulb.classList.remove('active');
          bulb.style.filter = 'none';
          bulb.style.transform = 'scale(1)';
        }
        if (wireLeft) wireLeft.classList.remove('sparking');
        if (wireRight) wireRight.classList.remove('sparking');
        if (status) status.innerText = 'State: 0 (OFF / 0 Volts)';
      }
    },

    // ATM & Register Flipper API
    pressAtm: pressAtm,
    clearAtm: clearAtm,
    flipBit: flipBit,

    // Quiz Engine API
    nextQuizQ: nextQuizQ,
    prevQuizQ: prevQuizQ,
    resetQuiz: resetQuiz,

    // Dynamic Solvers API (Decimal -> Binary, Octal, Hexadecimal)
    stepBin45: () => stepSolver(bin45State, 's12-tbody', 's12-ans-text', 2, val => `Result: (${bin45State.num})₁₀ = <strong>${val}₂</strong>`, 's12'),
    playBin45: () => playSolver(bin45State, window.App.stepBin45),
    resetBin45: () => resetSolver(bin45State, 's12-tbody', 's12-ans-text', `Result: (${bin45State.num})₁₀ = ?`, 's12', bin45State.num, 2),

    stepOct365: () => stepSolver(oct365State, 's15-tbody', 's15-ans-text', 8, val => `Result: (${oct365State.num})₁₀ = <strong>${val}₈</strong>`, 's15'),
    playOct365: () => playSolver(oct365State, window.App.stepOct365),
    resetOct365: () => resetSolver(oct365State, 's15-tbody', 's15-ans-text', `Result: (${oct365State.num})₁₀ = ?`, 's15', oct365State.num, 8),

    stepHex255: () => stepSolver(hex255State, 's17-tbody', 's17-ans-text', 16, val => `Result: (${hex255State.num})₁₀ = <strong>${val}₁₆</strong>`, 's17'),
    playHex255: () => playSolver(hex255State, window.App.stepHex255),
    resetHex255: () => resetSolver(hex255State, 's17-tbody', 's17-ans-text', `Result: (${hex255State.num})₁₀ = ?`, 's17', hex255State.num, 16)
  };

  // Initialize on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
