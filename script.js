/* ==========================================================================
   NUMBER SYSTEM - Basic Theory and Decimal Conversions
   Vanilla JavaScript Controller (21-Slide Navigation & Solver Engines)
   ========================================================================== */

(function () {
  'use strict';

  const state = {
    currentSlide: 1,
    totalSlides: 21,
    isAnimating: false,
    atmPin: '',
    registerBits: [1, 0, 1, 1, 0, 0, 1, 1], // Bit 7 to Bit 0
    quizIndex: 0,
    quizScore: 0,
    quizAnswers: new Array(10).fill(null),
    tickerNumbers: [45, 125, 255, 179, 365, 88, 512, 100],
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

  // Division Solvers Engine State
  const bin45State = { step: 0, steps: [] };
  const bin125State = { step: 0, steps: [] };
  const oct365State = { step: 0, steps: [] };
  const hex255State = { step: 0, steps: [] };

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

    // Fullscreen Toggle
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
  // Interactive Division Solvers Data & Logic
  // --------------------------------------------------------------------------
  function buildDivSteps(num, base) {
    const steps = [];
    let dividend = num;
    let stepCount = 1;

    while (dividend > 0) {
      const quotient = Math.floor(dividend / base);
      const remainder = dividend % base;

      let hexChar = remainder;
      if (base === 16 && remainder >= 10) {
        hexChar = String.fromCharCode(55 + remainder);
      }

      steps.push({
        step: stepCount,
        dividend: dividend,
        divisor: base,
        quotient: quotient,
        remainder: remainder,
        hexChar: hexChar
      });

      dividend = quotient;
      stepCount++;
    }
    return steps;
  }

  function initSolversData() {
    bin45State.steps = buildDivSteps(45, 2);
    bin125State.steps = buildDivSteps(125, 2);
    oct365State.steps = buildDivSteps(365, 8);
    hex255State.steps = buildDivSteps(255, 16);
  }

  function stepSolver(stateObj, tbodyId, ansTextId, base, formatAns) {
    if (stateObj.step >= stateObj.steps.length) return;

    const currentData = stateObj.steps[stateObj.step];
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    const row = document.createElement('tr');
    row.className = 'reveal-step revealed';

    let bitTagHtml = '';
    if (base === 2) {
      if (stateObj.step === 0) {
        bitTagHtml = `<td><span class="lsb-badge-inline">LSB</span></td>`;
      } else if (stateObj.step === stateObj.steps.length - 1) {
        bitTagHtml = `<td><span class="msb-badge-inline">MSB</span></td>`;
      } else {
        bitTagHtml = `<td>Bit ${stateObj.step}</td>`;
      }
    }

    let remainderDisplay = currentData.remainder;
    if (base === 16 && currentData.remainder >= 10) {
      remainderDisplay = `<span class="morph-letter">${currentData.hexChar}</span> (${currentData.remainder})`;
    }

    row.innerHTML = `
      <td>${currentData.step}</td>
      <td>${currentData.dividend}</td>
      <td>${currentData.divisor}</td>
      <td>${currentData.quotient}</td>
      <td><strong>${remainderDisplay}</strong></td>
      ${bitTagHtml}
    `;

    tbody.appendChild(row);
    stateObj.step++;

    if (stateObj.step === stateObj.steps.length) {
      const ansText = document.getElementById(ansTextId);
      if (ansText) {
        const finalVal = stateObj.steps.map(s => s.hexChar).reverse().join('');
        ansText.innerHTML = formatAns(finalVal);
      }
    }
  }

  function resetSolver(stateObj, tbodyId, ansTextId, defaultAnsText) {
    stateObj.step = 0;
    const tbody = document.getElementById(tbodyId);
    if (tbody) tbody.innerHTML = '';
    const ansText = document.getElementById(ansTextId);
    if (ansText) ansText.innerHTML = defaultAnsText;
  }

  function playSolver(stateObj, stepFunc) {
    if (autoPlayTimer) clearInterval(autoPlayTimer);
    autoPlayTimer = setInterval(() => {
      if (stateObj.step < stateObj.steps.length) {
        stepFunc();
      } else {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    }, 600);
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

    // Solvers API
    stepBin45: () => stepSolver(bin45State, 's12-tbody', 's12-ans-text', 2, val => `Result: (45)₁₀ = <strong>${val}₂</strong>`),
    playBin45: () => playSolver(bin45State, window.App.stepBin45),
    resetBin45: () => resetSolver(bin45State, 's12-tbody', 's12-ans-text', 'Result: (45)₁₀ = ?'),

    stepBin125: () => stepSolver(bin125State, 's13-tbody', 's13-ans-text', 2, val => `Result: (125)₁₀ = <strong>${val}₂</strong>`),
    playBin125: () => playSolver(bin125State, window.App.stepBin125),
    resetBin125: () => resetSolver(bin125State, 's13-tbody', 's13-ans-text', 'Result: (125)₁₀ = ?'),

    stepOct365: () => stepSolver(oct365State, 's15-tbody', 's15-ans-text', 8, val => `Result: (365)₁₀ = <strong>${val}₈</strong>`),
    playOct365: () => playSolver(oct365State, window.App.stepOct365),
    resetOct365: () => resetSolver(oct365State, 's15-tbody', 's15-ans-text', 'Result: (365)₁₀ = ?'),

    stepHex255: () => stepSolver(hex255State, 's17-tbody', 's17-ans-text', 16, val => `Result: (255)₁₀ = <strong>${val}₁₆</strong>`),
    playHex255: () => playSolver(hex255State, window.App.stepHex255),
    resetHex255: () => resetSolver(hex255State, 's17-tbody', 's17-ans-text', 'Result: (255)₁₀ = ?')
  };

  // Initialize on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
