
  // =========================
  // PART 3A – DOM + CONSTANTS
  // =========================

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');

  const answerInput     = document.getElementById('answerInput');
  const scoreSpan       = document.getElementById('scoreSpan');
  const livesSpan       = document.getElementById('livesSpan');
  const levelSpan       = document.getElementById('levelSpan');
  const multiplierSpan  = document.getElementById('multiplierSpan');
  const modeLabel       = document.getElementById('modeLabel');
  const difficultySelect= document.getElementById('difficultySelect');
  const levelBanner     = document.getElementById('levelBanner');
  const highScoresList  = document.getElementById('highScoresList');
  const messageEl       = document.getElementById('message');

  // Buttons
  const resetBtn        = document.getElementById('resetBtn');
  const modeHelpBtn     = document.getElementById('modeHelpBtn');

  // Mode buttons
  const b2dBtn          = document.getElementById('b2dBtn');
  const d2bBtn          = document.getElementById('d2bBtn');
  const mixedBinDenBtn  = document.getElementById('mixedBinDenBtn');
  const addModeBtn      = document.getElementById('addModeBtn');
  const subModeBtn      = document.getElementById('subModeBtn');
  const mixedArithBtn   = document.getElementById('mixedArithBtn');
  const h2dBtn          = document.getElementById('h2dBtn');
  const d2hBtn          = document.getElementById('d2hBtn');
  const b2hBtn          = document.getElementById('b2hBtn');
  const h2bBtn          = document.getElementById('h2bBtn');
  const mixedHexBtn     = document.getElementById('mixedHexBtn');
  const masterModeBtn   = document.getElementById('masterModeBtn');

  // Help buttons
  const binDenHelpBtn   = document.getElementById('binDenHelpBtn');
  const arithHelpBtn    = document.getElementById('arithHelpBtn');
  const hexHelpBtn      = document.getElementById('hexHelpBtn');

  // Overlays
  const modeHelpOverlay   = document.getElementById('modeHelpOverlay');
  const binDenHelpOverlay = document.getElementById('binDenHelpOverlay');
  const arithHelpOverlay  = document.getElementById('arithHelpOverlay');
  const hexHelpOverlay    = document.getElementById('hexHelpOverlay');
  const gameOverOverlay   = document.getElementById('gameOverOverlay');
  const gameOverTitle     = document.getElementById('gameOverTitle');
  const gameOverMedal     = document.getElementById('gameOverMedal');
  const gameOverStats     = document.getElementById('gameOverStats');

  const MODES = {
    B2D: 'b2d',
    D2B: 'd2b',
    MIXED_BIN_DEN: 'mixedBinDen',
    ADD: 'add',
    SUB: 'sub',
    MIXED_ARITH: 'mixedArith',
    H2D: 'h2d',
    D2H: 'd2h',
    B2H: 'b2h',
    H2B: 'h2b',
    MIXED_HEX: 'mixedHex',
    MASTER: 'master'
  };

  const modeMeta = {
    [MODES.B2D]:         { label: 'Binary → Denary',       group: 'Binary ↔ Denary' },
    [MODES.D2B]:         { label: 'Denary → Binary',       group: 'Binary ↔ Denary' },
    [MODES.MIXED_BIN_DEN]: { label: 'Mixed Bin/Den',       group: 'Binary ↔ Denary' },

    [MODES.ADD]:         { label: 'Binary Addition',       group: 'Arithmetic (Binary)' },
    [MODES.SUB]:         { label: 'Binary Subtraction',    group: 'Arithmetic (Binary)' },
    [MODES.MIXED_ARITH]: { label: 'Mixed + / −',           group: 'Arithmetic (Binary)' },

    [MODES.H2D]:         { label: 'Hex → Denary',          group: 'Hexadecimal' },
    [MODES.D2H]:         { label: 'Denary → Hex',          group: 'Hexadecimal' },
    [MODES.B2H]:         { label: 'Binary → Hex',          group: 'Hexadecimal' },
    [MODES.H2B]:         { label: 'Hex → Binary',          group: 'Hexadecimal' },
    [MODES.MIXED_HEX]:   { label: 'Mixed Hex',             group: 'Hexadecimal' },

    [MODES.MASTER]:      { label: 'Master Mode (All Skills)', group: 'Special' }
  };

  const MASTER_POOL = [
    MODES.B2D, MODES.D2B, MODES.MIXED_BIN_DEN,
    MODES.ADD, MODES.SUB, MODES.MIXED_ARITH,
    MODES.H2D, MODES.D2H, MODES.B2H, MODES.H2B, MODES.MIXED_HEX
  ];

  const STORAGE_KEY = 'ccc_highscores_v5';

  let highScores = {};
  let mode          = MODES.B2D;
  let score         = 0;
  let lives         = 3;
  let baseLevel     = 1;
  let level         = 1;
  let multiplier    = 1;
  let spawnInterval = 9000;    // ms
  let lastSpawn     = 0;
  let lastTime      = 0;
  let paused        = false;

  const problems = [];
  const laneCount = 3;
  const laneWidth = canvas.width / laneCount;

  const levelTitles = {
    1: 'BOOT SEQUENCE',
    2: 'UPLINK ESTABLISHED',
    3: 'DATA SURGE',
    4: 'SYSTEM OVERCLOCK',
    5: 'QUANTUM MODE',
    6: 'MACHINE MIND',
    7: 'CYBER ELITE',
    8: 'DIGITAL DEMIGOD',
    9: 'VIRAL VELOCITY',
    10: 'CYBERLEGEND'
  };

  // =========================
  // PART 3B – HELPERS & LEVEL
  // =========================

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function toBinary(n) {
    return n.toString(2);
  }

  function toHex(n) {
    return n.toString(16).toUpperCase();
  }

  function padLeft(str, length, ch='0') {
    str = String(str);
    while (str.length < length) str = ch + str;
    return str;
  }

  function getMultiplier(lv) {
    if (lv >= 10) return 8;
    if (lv >= 8)  return 6;
    if (lv >= 6)  return 4;
    if (lv >= 4)  return 3;
    if (lv >= 3)  return 2;
    if (lv >= 2)  return 1.5;
    return 1;
  }

  function getLevelTitle(lv) {
    if (levelTitles[lv]) return levelTitles[lv];
    if (lv > 10) return 'CYBERLEGEND';
    return 'BOOT SEQUENCE';
  }

  function setMessage(text, good=false) {
    messageEl.textContent = text;
    messageEl.className = good ? 'good' : (text ? 'bad' : '');
  }

  function showLevelBanner(lv) {
    const title = getLevelTitle(lv);
    levelBanner.textContent = `SYSTEM UPGRADE: LEVEL ${lv} – ${title}`;
    levelBanner.classList.add('show');
    setTimeout(() => levelBanner.classList.remove('show'), 1100);
  }

  function getTier(level) {
    if (level >= 10) return { name: 'CyberLegend', className: 'medal-legend' };
    if (level >= 8)  return { name: 'Diamond',    className: 'medal-diamond' };
    if (level >= 6)  return { name: 'Platinum',   className: 'medal-platinum' };
    if (level >= 4)  return { name: 'Gold',       className: 'medal-gold' };
    if (level >= 2)  return { name: 'Silver',     className: 'medal-silver' };
    return { name: 'Bronze', className: 'medal-bronze' };
  }

  function loadHighScores() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) highScores = JSON.parse(stored);
    } catch (e) {
      highScores = {};
    }
    Object.keys(MODES).forEach(key => {
      const m = MODES[key];
      if (typeof highScores[m] !== 'number') highScores[m] = 0;
    });
  }

  function saveHighScores() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(highScores));
    } catch (e) {
      // ignore
    }
  }

  function updateHighScoresList() {
    const groups = {};
    Object.values(modeMeta).forEach(meta => {
      if (!groups[meta.group]) groups[meta.group] = [];
    });

    Object.entries(modeMeta).forEach(([key, meta]) => {
      groups[meta.group].push({
        label: meta.label,
        score: highScores[key] || 0
      });
    });

    let html = '';
    Object.entries(groups).forEach(([groupName, items]) => {
      html += `<div class="hs-groupTitle">${groupName}</div>`;
      items.forEach(item => {
        html += `<div class="hs-line"><span>${item.label}</span><span>${item.score}</span></div>`;
      });
    });
    highScoresList.innerHTML = html;
  }

  // =========================
  // PART 3C – PROBLEM GENERATION
  // =========================

  function generateProblem() {
    const lane  = randomInt(0, laneCount - 1);
    const bits  = Math.min(3 + Math.floor((level - 1) / 2), 8);
    const maxVal= Math.pow(2, bits) - 1;
    const hexMax= Math.min(15 + level * 16, 255);

    let activeMode = mode;
    if (mode === MODES.MASTER) {
      activeMode = MASTER_POOL[randomInt(0, MASTER_POOL.length - 1)];
    }

    let expr   = '';
    let answer = '';
    let type   = 'binary';

    switch (activeMode) {

      // --- Binary ↔ Denary ---
      case MODES.B2D: {
        const val = randomInt(0, maxVal);
        const bin = padLeft(toBinary(val), bits);
        expr   = `${bin} → ? in Denary`;
        answer = String(val);
        type   = 'denary';
        break;
      }

      case MODES.D2B: {
        const val = randomInt(0, maxVal);
        expr   = `${val} → ? in Binary`;
        answer = toBinary(val);
        type   = 'binary';
        break;
      }

      case MODES.MIXED_BIN_DEN: {
        if (Math.random() < 0.5) {
          const val = randomInt(0, maxVal);
          const bin = padLeft(toBinary(val), bits);
          expr   = `${bin} → ? in Denary`;
          answer = String(val);
          type   = 'denary';
        } else {
          const val = randomInt(0, maxVal);
          expr   = `${val} → ? in Binary`;
          answer = toBinary(val);
          type   = 'binary';
        }
        break;
      }

      // --- Hexadecimal ---
      case MODES.H2D: {
        const val = randomInt(0, hexMax);
        const hex = toHex(val);
        expr   = `${hex} → ? in Denary`;
        answer = String(val);
        type   = 'denary';
        break;
      }

      case MODES.D2H: {
        const val = randomInt(0, hexMax);
        expr   = `${val} → ? in Hex`;
        answer = toHex(val);
        type   = 'hex';
        break;
      }

      case MODES.B2H: {
        const val = randomInt(0, hexMax);
        const bin = toBinary(val);
        expr   = `${bin} → ? in Hex`;
        answer = toHex(val);
        type   = 'hex';
        break;
      }

      case MODES.H2B: {
        const val = randomInt(0, hexMax);
        const hex = toHex(val);
        expr   = `${hex} → ? in Binary`;
        answer = toBinary(val);
        type   = 'binary';
        break;
      }

      case MODES.MIXED_HEX: {
        const val    = randomInt(0, hexMax);
        const choice = randomInt(0, 3);
        const hex    = toHex(val);
        const bin    = toBinary(val);
        if (choice === 0) {
          expr   = `${hex} → ? in Denary`;
          answer = String(val);
          type   = 'denary';
        } else if (choice === 1) {
          expr   = `${val} → ? in Hex`;
          answer = hex;
          type   = 'hex';
        } else if (choice === 2) {
          expr   = `${bin} → ? in Hex`;
          answer = hex;
          type   = 'hex';
        } else {
          expr   = `${hex} → ? in Binary`;
          answer = bin;
          type   = 'binary';
        }
        break;
      }

      // --- Binary arithmetic ---
      case MODES.ADD:
      case MODES.SUB:
      case MODES.MIXED_ARITH:
      default: {
        let op;
        if (activeMode === MODES.ADD) op = '+';
        else if (activeMode === MODES.SUB) op = '−';
        else op = Math.random() < 0.5 ? '+' : '−';

        const bitsArith = bits;
        const maxArith  = Math.pow(2, bitsArith) - 1;

        let a, b, result;

        if (op === '+') {
          a = randomInt(0, Math.floor(maxArith / 2));
          b = randomInt(0, Math.floor(maxArith / 2));
          result = a + b;
        } else {
          a = randomInt(Math.floor(maxArith / 2), maxArith);
          b = randomInt(0, a);
          result = a - b;
        }

        const aBin = padLeft(toBinary(a), bitsArith);
        const bBin = padLeft(toBinary(b), bitsArith);
        const rBin = toBinary(result);

        expr   = `${aBin} ${op} ${bBin}`;
        answer = rBin;
        type   = 'binary';
        break;
      }
    }

    problems.push({
      lane,
      y: -40,
      speed: 25 + level * 7,
      expr,
      answer,
      type
    });
  }

  // =========================
  // PART 3D – UPDATE & DRAW
  // =========================

  function update(dt) {
    if (paused) return;

    const now = performance.now();
    if (now - lastSpawn > spawnInterval && problems.length === 0) {
      generateProblem();
      lastSpawn = now;
    }

    // Move problems
    problems.forEach(p => {
      p.y += p.speed * dt;
    });

    // Missed problems
    for (let i = problems.length - 1; i >= 0; i--) {
      if (problems[i].y > canvas.height - 70) {
        problems.splice(i, 1);
        lives--;
        livesSpan.textContent = lives;
        setMessage('Missed one! Life lost.', false);
        if (lives <= 0) {
          gameOver();
          return;
        }
      }
    }

    // Level from score
    const prevLevel = level;
    level = baseLevel + Math.floor(score / 5);
    if (level < baseLevel) level = baseLevel;

    if (level !== prevLevel) {
      showLevelBanner(level);
    }

    multiplier    = getMultiplier(level);
    spawnInterval = Math.max(3500, 9000 - (level - 1) * 600);

    levelSpan.textContent      = String(level);
    multiplierSpan.textContent = '×' + multiplier;
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Lanes
    ctx.strokeStyle = '#222b4a';
    ctx.lineWidth = 1;
    for (let i = 1; i < laneCount; i++) {
      const x = i * laneWidth;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Problems
    for (const p of problems) {
      const x = p.lane * laneWidth;
      const y = p.y;
      const w = laneWidth - 10;
      const h = 42;

      ctx.fillStyle = '#151e3b';
      ctx.strokeStyle = '#3af2a3';
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x + 5, y, w, h, 8);
      } else {
        ctx.rect(x + 5, y, w, h);
      }
      ctx.fill();
      ctx.stroke();

      const styles = getComputedStyle(document.documentElement);
      let textColour = '#f5f5f5';
      if (p.type === 'binary') textColour = styles.getPropertyValue('--binary-colour') || '#7fffb0';
      if (p.type === 'denary') textColour = styles.getPropertyValue('--denary-colour') || '#7fb3ff';
      if (p.type === 'hex')    textColour = styles.getPropertyValue('--hex-colour') || '#d29bff';

      ctx.fillStyle   = textColour;
      ctx.font        = '16px system-ui';
      ctx.textAlign   = 'center';
      ctx.textBaseline= 'middle';
      ctx.fillText(p.expr, x + laneWidth / 2, y + h / 2);
    }

    // Danger line
    ctx.strokeStyle = '#ff6b81';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 60);
    ctx.lineTo(canvas.width, canvas.height - 60);
    ctx.stroke();
  }

  function gameLoop(timestamp) {
    const dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    update(dt);
    draw();
    requestAnimationFrame(gameLoop);
  }

  // =========================
  // PART 3E – ANSWERS, MODES, EVENTS
  // =========================

  function normaliseAnswer(str, type) {
    if (type === 'hex') {
      str = str.toUpperCase();
      str = str.replace(/^0+/, '') || '0';
      return str;
    } else {
      str = str.replace(/^0+/, '') || '0';
      return str;
    }
  }

  function checkAnswer() {
    const raw = answerInput.value.trim();
    if (!raw) return;

    if (!problems.length) {
      setMessage('No falling question yet — wait for the next one.', false);
      return;
    }

    // Use the lowest block (largest y)
    let target = problems[0];
    for (const p of problems) {
      if (p.y > target.y) target = p;
    }

    const type = target.type;

    // Validation by type
    if (type === 'binary' && !/^[01]+$/.test(raw)) {
      setMessage('This one needs a BINARY answer (0s and 1s only).', false);
      return;
    }
    if (type === 'denary' && !/^[0-9]+$/.test(raw)) {
      setMessage('This one needs a DENARY answer (digits 0–9).', false);
      return;
    }
    if (type === 'hex' && !/^[0-9a-fA-F]+$/.test(raw)) {
      setMessage('This one needs a HEX answer (0–9, A–F).', false);
      return;
    }

    const given  = normaliseAnswer(raw, type);
    const actual = normaliseAnswer(String(target.answer), type);

    if (given === actual) {
      const points = Math.round(1 * multiplier);
      score += points;
      scoreSpan.textContent = score;

      const key = mode;
      if (score > (highScores[key] || 0)) {
        highScores[key] = score;
        saveHighScores();
        updateHighScoresList();
      }

      const idx = problems.indexOf(target);
      if (idx !== -1) problems.splice(idx, 1);

      setMessage(`✅ Correct! +${points} point${points !== 1 ? 's' : ''}.`, true);
      answerInput.value = '';
    } else {
      setMessage('❌ Not quite. Check your working and try again.', false);
    }
  }

  function gameOver() {
    paused = true;
    setMessage('Game over!', false);
    showGameOverOverlay();
  }

  function showGameOverOverlay() {
    const tier = getTier(level);
    gameOverTitle.textContent = 'Run complete';
    gameOverMedal.textContent = `You reached LEVEL ${level} – ${tier.name}`;
    gameOverMedal.className   = tier.className;
    gameOverStats.textContent = `Final score: ${score} · Mode: ${modeMeta[mode].label}`;
    gameOverOverlay.classList.remove('hidden');
  }

  function closeGameOver() {
    gameOverOverlay.classList.add('hidden');
    resetGame();
  }

  function resetGame() {
    paused        = false;
    score         = 0;
    lives         = 3;
    baseLevel     = parseInt(difficultySelect.value, 10) || 1;
    level         = baseLevel;
    multiplier    = getMultiplier(level);
    spawnInterval = 9000;
    problems.length = 0;
    lastSpawn     = performance.now();

    scoreSpan.textContent      = score;
    livesSpan.textContent      = lives;
    levelSpan.textContent      = String(level);
    multiplierSpan.textContent = '×' + multiplier;
    setMessage('');
    answerInput.value = '';
    gameOverOverlay.classList.add('hidden');
    showLevelBanner(level);
  }

  function clearActiveModeButtons() {
    [
      b2dBtn, d2bBtn, mixedBinDenBtn,
      addModeBtn, subModeBtn, mixedArithBtn,
      h2dBtn, d2hBtn, b2hBtn, h2bBtn, mixedHexBtn,
      masterModeBtn
    ].forEach(btn => { if (btn) btn.classList.remove('active'); });
  }

  function setMode(newMode) {
    mode = newMode;
    clearActiveModeButtons();

    switch (mode) {
      case MODES.B2D:           b2dBtn.classList.add('active'); break;
      case MODES.D2B:           d2bBtn.classList.add('active'); break;
      case MODES.MIXED_BIN_DEN: mixedBinDenBtn.classList.add('active'); break;

      case MODES.ADD:           addModeBtn.classList.add('active'); break;
      case MODES.SUB:           subModeBtn.classList.add('active'); break;
      case MODES.MIXED_ARITH:   mixedArithBtn.classList.add('active'); break;

      case MODES.H2D:           h2dBtn.classList.add('active'); break;
      case MODES.D2H:           d2hBtn.classList.add('active'); break;
      case MODES.B2H:           b2hBtn.classList.add('active'); break;
      case MODES.H2B:           h2bBtn.classList.add('active'); break;
      case MODES.MIXED_HEX:     mixedHexBtn.classList.add('active'); break;

      case MODES.MASTER:        masterModeBtn.classList.add('active'); break;
    }

    modeLabel.textContent = modeMeta[mode].label;
    resetGame();
  }

  // --- Overlay helpers needed by onclick in HTML ---

  function openModeHelp()  { modeHelpOverlay.classList.remove('hidden'); }
  function closeModeHelp() { modeHelpOverlay.classList.add('hidden'); }

  function openBinDenHelp()  { binDenHelpOverlay.classList.remove('hidden'); }
  function closeBinDenHelp() { binDenHelpOverlay.classList.add('hidden'); }

  function openArithHelp()  { arithHelpOverlay.classList.remove('hidden'); }
  function closeArithHelp() { arithHelpOverlay.classList.add('hidden'); }

  function openHexHelp()  { hexHelpOverlay.classList.remove('hidden'); }
  function closeHexHelp() { hexHelpOverlay.classList.add('hidden'); }

  // =========================
  // PART 3F – EVENT LISTENERS + INIT
  // =========================

  function attachEvents() {
    // Answer submit
    answerInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        checkAnswer();
      }
    });

    // Reset
    resetBtn.addEventListener('click', () => {
      resetGame();
      answerInput.focus();
    });

    // Mode guide
    modeHelpBtn.addEventListener('click', openModeHelp);

    // Help buttons
    binDenHelpBtn.addEventListener('click', openBinDenHelp);
    arithHelpBtn.addEventListener('click', openArithHelp);
    hexHelpBtn.addEventListener('click', openHexHelp);

    // Rules floating panel toggle
    if (rulesToggleBtn) {
      rulesToggleBtn.addEventListener('click', () => {
        const body = document.body;
        const isOn = body.classList.toggle('rules-floating');
        rulesToggleBtn.textContent = isOn ? 'Hide Rules' : 'Show Rules';
      });
    }

    // Mode buttons
    b2dBtn.addEventListener('click', () => setMode(MODES.B2D));
    d2bBtn.addEventListener('click', () => setMode(MODES.D2B));
    mixedBinDenBtn.addEventListener('click', () => setMode(MODES.MIXED_BIN_DEN));

    addModeBtn.addEventListener('click', () => setMode(MODES.ADD));
    subModeBtn.addEventListener('click', () => setMode(MODES.SUB));
    mixedArithBtn.addEventListener('click', () => setMode(MODES.MIXED_ARITH));

    h2dBtn.addEventListener('click', () => setMode(MODES.H2D));
    d2hBtn.addEventListener('click', () => setMode(MODES.D2H));
    b2hBtn.addEventListener('click', () => setMode(MODES.B2H));
    h2bBtn.addEventListener('click', () => setMode(MODES.H2B));
    mixedHexBtn.addEventListener('click', () => setMode(MODES.MIXED_HEX));

    masterModeBtn.addEventListener('click', () => setMode(MODES.MASTER));

    // Difficulty change resets the run
    difficultySelect.addEventListener('change', () => {
      resetGame();
      answerInput.focus();
    });

    // Allow clicking on overlay background to close (optional UX)
    modeHelpOverlay.addEventListener('click', e => {
      if (e.target === modeHelpOverlay) closeModeHelp();
    });
    binDenHelpOverlay.addEventListener('click', e => {
      if (e.target === binDenHelpOverlay) closeBinDenHelp();
    });
    arithHelpOverlay.addEventListener('click', e => {
      if (e.target === arithHelpOverlay) closeArithHelp();
    });
    hexHelpOverlay.addEventListener('click', e => {
      if (e.target === hexHelpOverlay) closeHexHelp();
    });
    gameOverOverlay.addEventListener('click', e => {
      if (e.target === gameOverOverlay) closeGameOver();
    });
  }

  function init() {
    loadHighScores();
    updateHighScoresList();
    setMode(MODES.B2D);        // default
    clearActiveModeButtons();
    b2dBtn.classList.add('active');
    modeLabel.textContent = modeMeta[MODES.B2D].label;
    resetGame();
    attachEvents();
    answerInput.focus();
    requestAnimationFrame(ts => {
      lastTime = ts;
      gameLoop(ts);
    });
  }

  init();
  