// Nathan OS Terminal - Main logic
(() => {
  const output = document.getElementById('output');
  const input = document.getElementById('command-input');
  const terminal = document.getElementById('terminal');
  const overlay = document.getElementById('overlay');
  const overlayBody = document.getElementById('overlay-body');
  const overlayClose = document.getElementById('overlay-close');
  const chips = document.getElementById('chips');
  const quickView = document.getElementById('quick-view');

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarsePointer = window.matchMedia('(pointer: coarse)').matches;

  // ---------- Small helpers ----------

  function storageGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function storageSet(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* private mode etc. */ }
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // A command name rendered as a button; clicking runs it like typing it.
  function cmdButton(cmd, label = cmd) {
    return `<button type="button" class="inline-cmd" data-cmd="${escapeHtml(cmd)}">${escapeHtml(label)}</button>`;
  }

  // ---------- Sound (opt-in, remembered) ----------

  const SOUND_KEY = 'nathanos.sound';

  const AudioEngine = (() => {
    let ctx;
    let enabled = storageGet(SOUND_KEY) === 'on';
    function ensure() {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      return ctx;
    }
    function beep(freq = 880, duration = 0.03) {
      if (!enabled) return;
      try {
        const c = ensure();
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = 'square';
        o.frequency.value = freq;
        g.gain.value = 0.02;
        o.connect(g); g.connect(c.destination);
        o.start(); o.stop(c.currentTime + duration);
      } catch (e) { /* audio unavailable */ }
    }
    return {
      key: () => beep(1200, 0.01),
      enter: () => beep(600, 0.05),
      isOn: () => enabled,
      set(on) {
        enabled = on;
        storageSet(SOUND_KEY, on ? 'on' : 'off');
      }
    };
  })();

  // ---------- Output ----------

  const history = [];
  let historyIndex = -1;

  function scrollToBottom() {
    terminal.scrollTop = terminal.scrollHeight;
  }

  function appendLine(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    output.appendChild(div);
    const spacer = document.createElement('div');
    spacer.style.height = '10px';
    output.appendChild(spacer);
    scrollToBottom();
  }

  function appendRaw(text) {
    const div = document.createElement('div');
    div.textContent = text;
    output.appendChild(div);
    const spacer = document.createElement('div');
    spacer.style.height = '5px';
    output.appendChild(spacer);
    scrollToBottom();
  }

  // Where focus goes after a command finishes / an overlay closes:
  // the chip that was tapped, or the input for typed commands.
  let lastTrigger = input;

  function restoreFocus() {
    if (!overlay.classList.contains('hidden')) return;
    if (quickView.classList.contains('open')) return;
    if (document.getElementById('desktop')) return;
    const target = lastTrigger && lastTrigger.isConnected && !lastTrigger.disabled ? lastTrigger : input;
    target.focus({ preventScroll: target !== input });
  }

  function setInputDisabled(dis) {
    input.disabled = dis;
    chips.querySelectorAll('button').forEach((b) => { b.disabled = dis; });
    if (!dis) restoreFocus();
  }

  // ---------- Overlay (modal dialog) ----------

  let overlayCleanup = null;

  function focusableIn(root) {
    return Array.from(root.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select, textarea, iframe, [tabindex]:not([tabindex="-1"])'
    )).filter((el) => el.offsetParent !== null || el === document.activeElement);
  }

  function runOverlayCleanup() {
    if (overlayCleanup) {
      const fn = overlayCleanup;
      overlayCleanup = null;
      try { fn(); } catch (e) { console.error(e); }
    }
  }

  function closeOverlay() {
    if (overlay.classList.contains('hidden')) return;
    runOverlayCleanup();
    overlay.classList.add('hidden');
    overlayBody.innerHTML = '';
    restoreFocus();
  }

  // showOverlay(element, { label, onClose })
  //   label   - accessible name for the dialog
  //   onClose - called when the overlay closes or its content is replaced
  function showOverlay(contentEl, opts = {}) {
    runOverlayCleanup();
    overlayBody.innerHTML = '';
    overlayBody.appendChild(contentEl);
    overlayCleanup = typeof opts.onClose === 'function' ? opts.onClose : null;
    const heading = contentEl.querySelector('h1, h2, h3');
    overlay.setAttribute('aria-label', opts.label || (heading && heading.textContent.trim()) || 'Window');
    overlay.classList.remove('hidden');
    overlay.style.zIndex = 1001; // always above desktop
    overlay.scrollTop = 0;
    // Move focus into the dialog: first control in the content, else Close.
    const first = focusableIn(overlayBody).find((el) => el.tagName !== 'IFRAME');
    (first || overlayClose).focus({ preventScroll: true });
  }

  overlayClose.addEventListener('click', closeOverlay);

  // Clicking the dimmed backdrop (not the content) closes.
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeOverlay();
  });

  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('hidden')) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeOverlay();
        return;
      }
      if (e.key === 'Tab') {
        // Simple focus trap: wrap between first and last focusable element.
        const items = [overlayClose, ...focusableIn(overlayBody)];
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        else if (!overlay.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
      }
      return;
    }
    if (quickView.classList.contains('open') && e.key === 'Escape') {
      closeQuickView();
    }
  });

  // ---------- Quick view (static profile) ----------

  function openQuickView() {
    quickView.classList.add('open');
    quickView.focus();
  }

  function closeQuickView() {
    quickView.classList.remove('open');
    if (location.hash === '#quick-view') {
      window.history.replaceState(null, '', location.pathname + location.search);
    }
    lastTrigger = input;
    restoreFocus();
  }

  document.querySelectorAll('a[href="#quick-view"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      e.preventDefault();
      openQuickView();
    });
  });
  document.getElementById('qv-back').addEventListener('click', closeQuickView);

  // ---------- Loading (deliberate ~500ms for charm) ----------

  function withLoading(fn, ms = 500) {
    const spinner = document.createElement('div');
    spinner.innerHTML = 'Loading <span class="spinner" aria-hidden="true"></span>';
    output.appendChild(spinner);
    scrollToBottom();
    setInputDisabled(true);

    return new Promise((res) => {
      setTimeout(async () => {
        try {
          const result = await fn();
          res(result);
        } finally {
          spinner.remove();
          setInputDisabled(false);
        }
      }, ms);
    });
  }

  // ---------- Projects ----------

  // Each project lives in its own GitHub repo (github.com/NathanKagoro/<repo>).
  // Static projects are on GitHub Pages; the Stock Exchange is built into /stock.
  const PROJECTS = [
    { alias: 'damana', name: 'Damana Consult', category: 'Client & business sites', blurb: 'Management consultancy in Dar es Salaam (live client site)', entryPath: 'https://damanaconsultant.com/', repo: 'damana-consult-website' },
    { alias: 'diplotech', name: 'Diplotech Solutions', category: 'Client & business sites', blurb: 'Consultancy where diplomacy meets technology', entryPath: 'https://nathankagoro.github.io/diplotech-website/', repo: 'diplotech-website' },
    { alias: 'laki', name: 'Laki Associates', category: 'Client & business sites', blurb: 'Demo site for an accounting and audit firm', entryPath: 'https://nathankagoro.github.io/Laki-associates-demo-website/', repo: 'Laki-associates-demo-website' },
    { alias: 'exortium', name: 'Exortium', category: 'Client & business sites', blurb: 'Demo site for a marketing agency', entryPath: 'https://nathankagoro.github.io/exortium-website/', repo: 'exortium-website' },
    { alias: 'swahili', name: 'Swahili Voice IDE', category: 'Products & prototypes', blurb: 'Learn to code in Swahili, right in the browser', entryPath: 'https://nathankagoro.github.io/Swahili-ide/', repo: 'Swahili-ide' },
    { alias: 'mathpath', name: 'MathPath', category: 'Products & prototypes', blurb: 'Maths practice prototype with student and teacher views', entryPath: 'https://nathankagoro.github.io/mathpath-prototype/', repo: 'mathpath-prototype' },
    { alias: 'yuge', name: 'YugeSavers', category: 'Products & prototypes', blurb: 'Discount supermarket app prototype', entryPath: 'https://nathankagoro.github.io/yugesavers-prototype/', repo: 'yugesavers-prototype' },
    { alias: 'stock', name: 'Stock Exchange', category: 'Products & prototypes', blurb: 'Trade a replay of the London market, 2015 to 2025', entryPath: '/stock', repo: 'stock-exchange-simulator' },
    { alias: 'mmm', name: 'MMM Dashboard', category: 'Data & analytics', blurb: 'Which marketing channels move sales: a media-mix model', entryPath: 'https://nathankagoro.github.io/MMM-Dashboard/', repo: 'MMM-Dashboard' },
    { alias: 'traffic', name: 'Dar Traffic Monitoring', category: 'Data & analytics', blurb: 'Traffic data pipeline for East African cities', entryPath: 'https://nathankagoro.github.io/Dar-Traffic-Monitoring/', repo: 'Dar-Traffic-Monitoring' },
    { alias: 'news', name: 'News Detection', category: 'Data & analytics', blurb: 'Media monitoring: a watch-list in, a morning digest out', entryPath: 'https://nathankagoro.github.io/news-detection/', repo: 'news-detection' }
  ];

  const GAMES = ['tictactoe', 'rps', 'hangman', '2048'];

  function sanitizeProjectLookup(value) {
    if (!value) return '';
    return value.trim().replace(/^['\"]|['\"]$/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  }

  function findProjectByName(value) {
    const target = sanitizeProjectLookup(value);
    return PROJECTS.find((project) => {
      const nameMatch = sanitizeProjectLookup(project.name) === target;
      const aliasMatch = sanitizeProjectLookup(project.alias) === target;
      return nameMatch || aliasMatch;
    });
  }

  function openProject(project) {
    if (!project) return 'Project not found.';
    openProjectPath(project.entryPath);
    return `Opening ${project.name}...`;
  }

  function openProjectPath(path) {
    if (!path) return;
    window.location.href = encodeURI(path);
  }

  // ---------- Routes (terminal <-> desktop) ----------

  function normalizePath(pathname) {
    return pathname.replace(/\/+$/, '') || '/';
  }

  function isWindowsRoute() {
    return normalizePath(window.location.pathname) === '/windows';
  }

  function setWindowsRoute() {
    if (!isWindowsRoute()) {
      window.history.pushState({}, '', '/windows');
    }
  }

  function setTerminalRoute() {
    if (isWindowsRoute()) {
      window.history.pushState({}, '', '/');
    }
    lastTrigger = input;
    restoreFocus();
  }

  function enterDesktopView(syncRoute = true) {
    if (syncRoute) setWindowsRoute();
    Desktop.create(showOverlay, commands, PROJECTS, openProjectPath, setTerminalRoute);
  }

  async function runUpdateAnimation() {
    return new Promise((resolve) => {
      const screen = document.createElement('div');
      screen.setAttribute('role', 'status');
      screen.style.position = 'fixed';
      screen.style.inset = '0';
      screen.style.background = 'black';
      screen.style.color = '#00ff66';
      screen.style.display = 'flex';
      screen.style.flexDirection = 'column';
      screen.style.justifyContent = 'center';
      screen.style.alignItems = 'center';
      screen.style.gap = '8px';
      screen.style.zIndex = '998';
      screen.style.fontFamily = 'Consolas, monospace';
      const msg = document.createElement('div');
      msg.textContent = 'Updating system...';
      const bar = document.createElement('div');
      bar.style.width = 'min(300px, 80vw)';
      bar.style.height = '10px';
      bar.style.border = '1px solid #00ff66';
      const fill = document.createElement('div');
      fill.style.height = '100%';
      fill.style.width = '0';
      fill.style.background = '#00ff66';
      bar.appendChild(fill);
      screen.appendChild(msg);
      screen.appendChild(bar);
      document.body.appendChild(screen);

      const finish = (delay) => setTimeout(() => {
        screen.remove();
        resolve();
      }, delay);

      if (reducedMotion) {
        fill.style.width = '100%';
        finish(300);
        return;
      }

      let progress = 0;
      const interval = setInterval(() => {
        progress += 3;
        fill.style.width = Math.min(progress, 100) + '%';
        if (progress >= 100) {
          clearInterval(interval);
          finish(700);
        }
      }, 80);
    });
  }

  // ---------- Commands ----------

  function helpText() {
    const rows = [
      ['about', 'About Nathan'],
      ['projects', `List all ${PROJECTS.length} projects, or open one by typing its name (e.g. ${PROJECTS[0].alias})`],
      ['resume', 'View or download the CV'],
      ['links', 'LinkedIn and GitHub'],
      ['play', 'Play a game: play &lt;game&gt; (alias: games)'],
      ['datetime', 'Show current date and time'],
      ['sound', `Typing sounds on/off (now ${AudioEngine.isOn() ? 'on' : 'off'})`],
      ['clear', 'Clear the screen'],
      ['update', 'Try this after exploring the other OS features for a surprise'],
      ['help', 'Show this list (also: commands, ls, ?)']
    ];
    const items = rows.map(([cmd, desc]) => {
      const name = cmd.trim();
      const indent = cmd.startsWith('  ') ? '&nbsp;&nbsp;' : '';
      return `<dt>${indent}${cmdButton(name)}</dt><dd>${desc}</dd>`;
    }).join('');
    return `Available commands:<dl class="help-table">${items}</dl><span class="dim">Tip: Tab completes, ↑/↓ recalls history, Esc closes windows.</span>`;
  }

  function projectsList() {
    const groups = [];
    PROJECTS.forEach((p) => {
      let g = groups.find((x) => x.name === p.category);
      if (!g) { g = { name: p.category, items: [] }; groups.push(g); }
      g.items.push(p);
    });
    const sections = groups.map((g) => {
      const rows = g.items.map((p) => `<dt>${cmdButton(p.alias)}</dt><dd><strong>${escapeHtml(p.name)}</strong> · ${escapeHtml(p.blurb)}</dd>`).join('');
      return `<div class="project-group">${escapeHtml(g.name)}</div><dl class="help-table">${rows}</dl>`;
    }).join('');
    return `Projects:${sections}<span class="dim">Type a name to open it (or projects &lt;name&gt;). Source code: ${cmdButton('links')}</span>`;
  }

  function gamesList() {
    const rows = GAMES.map((g) => `<dt>${cmdButton(`play ${g}`)}</dt>`).join('');
    return `Available games:<dl class="help-table one-col">${rows}</dl>`;
  }

  const commands = {
    commands: async () => helpText(),

    links: async () => {
      return `<a href="https://www.linkedin.com/in/nathan-kagoro-06ba31270/" target="_blank" rel="noopener">linkedin</a>
<a href="https://github.com/NathanKagoro" target="_blank" rel="noopener">GitHub</a>`;
    },

    about: async () => {
      return `Nathan Kagoro - Software Developer & Data Enthusiast
Focused on analytics, AI tooling, and full-stack solutions.`;
    },

    resume: async () => {
      const el = document.createElement('div');
      el.className = 'resume-view';
      el.innerHTML = `
        <h2 style="margin:0">Resume</h2>
        <div class="resume-actions">
          <a class="chip" href="assets/resume.pdf" download="Nathan-Kagoro-Resume.pdf">Download PDF</a>
          <a class="chip chip-alt" href="assets/resume.pdf" target="_blank" rel="noopener">Open in new tab</a>
        </div>
        <p class="resume-mobile-note">The PDF opens best in your phone's viewer — use the buttons above.</p>
        <iframe class="resume-frame" src="assets/resume.pdf" title="Nathan Kagoro resume (PDF)"></iframe>
      `;
      showOverlay(el, { label: 'Resume' });
      return null;
    },

    projects: async (arg) => {
      if (!arg) return projectsList();

      const project = findProjectByName(arg);
      if (!project) {
        const guess = closest(sanitizeProjectLookup(arg), PROJECTS.map((p) => p.alias));
        const hint = guess ? ` Did you mean ${cmdButton(`projects ${guess}`)}?` : '';
        return `Project "${escapeHtml(arg)}" not found.${hint} Run ${cmdButton('projects')} to list available aliases.`;
      }

      return openProject(project);
    },

    datetime: async () => {
      const d = new Date();
      return `${d.toDateString()} ${d.toLocaleTimeString()}`;
    },

    play: async (arg) => {
      if (!arg) return gamesList();
      const game = arg.toLowerCase();
      if (game === 'tictactoe') TicTacToe.createOverlay(showOverlay);
      else if (game === 'rps') RPS.createOverlay(showOverlay);
      else if (game === 'hangman') Hangman.createOverlay(showOverlay);
      else if (game === '2048') TwoThousandFortyEight.createOverlay(showOverlay);
      else {
        const guess = closest(game, GAMES);
        const hint = guess ? ` Did you mean ${cmdButton(`play ${guess}`)}?` : '';
        return `Game "${escapeHtml(arg)}" not found.${hint}`;
      }
      return null;
    },

    sound: async (arg) => {
      const a = (arg || '').toLowerCase();
      if (a === 'on' || a === 'off') {
        AudioEngine.set(a === 'on');
        if (a === 'on') AudioEngine.enter();
        return `Sound ${a}.`;
      }
      return `Sound is ${AudioEngine.isOn() ? 'on' : 'off'}. Use ${cmdButton('sound on')} or ${cmdButton('sound off')}.`;
    },

    update: async () => {
      await runUpdateAnimation();
      enterDesktopView(true);
      return null;
    },

    clear: async () => {
      output.innerHTML = '';
      return null;
    }
  };

  // Aliases
  commands.help = commands.commands;
  commands.ls = commands.commands;
  commands['?'] = commands.commands;
  commands.games = commands.play;
  // Every project alias also works as a command on its own (e.g. `mathpath`).
  PROJECTS.forEach((p) => {
    if (!commands[p.alias]) commands[p.alias] = async () => openProject(p);
  });

  // Names offered by Tab completion and "did you mean" (no symbol aliases).
  const COMMAND_NAMES = Object.keys(commands).filter((c) => /^[a-z]/.test(c)).sort();

  const ARG_COMPLETIONS = {
    projects: PROJECTS.map((p) => p.alias),
    play: GAMES,
    games: GAMES,
    sound: ['on', 'off']
  };

  // ---------- "Did you mean" ----------

  function editDistance(a, b) {
    const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) dp[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
        // transposition ("hlep" -> "help")
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
          dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + 1);
        }
      }
    }
    return dp[a.length][b.length];
  }

  function closest(word, candidates) {
    if (!word) return null;
    let best = null;
    let bestD = Infinity;
    for (const c of candidates) {
      const d = c.startsWith(word) ? 0.5 : editDistance(word, c);
      if (d < bestD) { bestD = d; best = c; }
    }
    const limit = Math.max(1, Math.min(3, Math.floor(word.length / 2)));
    return bestD <= limit ? best : null;
  }

  // ---------- Running commands ----------

  let busy = false;

  async function handleCommand(raw) {
    if (!raw || !raw.trim()) return;
    if (busy) return;
    appendRaw(`C:\\NathanOS> ${raw}`);
    history.push(raw);
    historyIndex = history.length;

    const trimmed = raw.trim();
    const firstSpace = trimmed.indexOf(' ');
    const cmd = (firstSpace === -1 ? trimmed : trimmed.slice(0, firstSpace)).toLowerCase();
    const arg = firstSpace === -1 ? null : trimmed.slice(firstSpace + 1).trim();
    const fn = Object.prototype.hasOwnProperty.call(commands, cmd) ? commands[cmd] : null;

    AudioEngine.enter();

    if (!fn) {
      const guess = closest(cmd, COMMAND_NAMES);
      const suggestion = guess
        ? ` Did you mean ${cmdButton(arg ? `${guess} ${arg}` : guess, guess)}?`
        : ` Type ${cmdButton('help')} for a list of commands.`;
      appendLine(`'${escapeHtml(cmd)}' is not recognized as an internal command.${suggestion}`);
      return;
    }

    busy = true;
    try {
      await withLoading(async () => {
        const r = await fn(arg);
        if (r) appendLine(r);
      });
    } finally {
      busy = false;
    }
  }

  // Run a command as if typed: used by chips and clickable command names.
  function runCommand(cmd, trigger) {
    if (busy) return;
    finishIntro();
    lastTrigger = trigger || input;
    input.value = '';
    handleCommand(cmd);
  }

  chips.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-cmd]');
    if (!btn) return;
    runCommand(btn.dataset.cmd, coarsePointer ? btn : input);
  });

  output.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-cmd]');
    if (!btn) return;
    e.stopPropagation();
    runCommand(btn.dataset.cmd, coarsePointer ? btn : input);
  });

  // ---------- Tab completion ----------

  function commonPrefix(list) {
    if (!list.length) return '';
    return list.reduce((a, b) => {
      let i = 0;
      while (i < a.length && i < b.length && a[i] === b[i]) i++;
      return a.slice(0, i);
    });
  }

  function complete() {
    const value = input.value.replace(/^\s+/, '');
    const space = value.indexOf(' ');
    let base = '';
    let partial;
    let pool;
    if (space === -1) {
      partial = value.toLowerCase();
      pool = COMMAND_NAMES;
    } else {
      const cmd = value.slice(0, space).toLowerCase();
      pool = ARG_COMPLETIONS[cmd];
      if (!pool) return;
      base = value.slice(0, space) + ' ';
      partial = value.slice(space + 1).trimStart().toLowerCase();
    }
    const matches = pool.filter((c) => c.startsWith(partial));
    if (matches.length === 1) {
      input.value = base + matches[0] + (space === -1 && ARG_COMPLETIONS[matches[0]] ? ' ' : '');
    } else if (matches.length > 1) {
      const prefix = commonPrefix(matches);
      if (prefix.length > partial.length) input.value = base + prefix;
      else appendRaw(matches.join('  '));
    }
  }

  // ---------- Input handling ----------

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
      if (historyIndex > 0) input.value = history[--historyIndex];
      e.preventDefault();
      return;
    }
    if (e.key === 'ArrowDown') {
      if (historyIndex < history.length - 1) input.value = history[++historyIndex];
      else { historyIndex = history.length; input.value = ''; }
      e.preventDefault();
      return;
    }
    if (e.key === 'Tab' && !e.shiftKey && input.value.trim()) {
      // Only hijack Tab when there is something to complete, so keyboard
      // users can still Tab out of an empty prompt to the chips.
      e.preventDefault();
      complete();
      return;
    }
    if (e.key === 'Enter') {
      const cmd = input.value;
      input.value = '';
      lastTrigger = input;
      handleCommand(cmd);
      e.preventDefault();
    }
    if (e.key.length === 1) AudioEngine.key();
  });

  // Tap/click anywhere in the terminal focuses the prompt (but don't steal
  // clicks from links/buttons or interfere with text selection).
  terminal.addEventListener('click', (e) => {
    if (e.target.closest('a, button, input')) return;
    const sel = window.getSelection && window.getSelection();
    if (sel && String(sel).length) return;
    if (!input.disabled) input.focus();
  });

  // ---------- Intro ----------

  const intro = `Nathan OS [Build 1.0.5]
© Nathan Kagoro. All rights reserved.
A portfolio site built to mimic classic operating system experiences.
Boot complete.`;

  let finishIntro = () => {};

  function typeIntro(text, totalMs = 2000, done = () => {}) {
    const div = document.createElement('div');
    output.appendChild(div);
    let i = 0;
    let timer = null;
    let finished = false;
    // Type a few characters per frame so the whole intro takes ~totalMs.
    const tick = 16;
    const perTick = Math.max(1, Math.ceil(text.length / (totalMs / tick)));

    function cleanup() {
      document.removeEventListener('keydown', finishIntro, true);
      document.removeEventListener('pointerdown', finishIntro, true);
    }

    finishIntro = (event) => {
      if (finished) return;
      // Letters still reach the input so typing can start at once, but a
      // Space or Enter used only to skip shouldn't land in the prompt.
      if (event && (event.key === ' ' || event.key === 'Enter')) event.preventDefault();
      finished = true;
      clearTimeout(timer);
      cleanup();
      div.textContent = text;
      appendRaw('');
      done();
    };

    // Any key or tap skips the animation (the key still reaches the input).
    document.addEventListener('keydown', finishIntro, true);
    document.addEventListener('pointerdown', finishIntro, true);

    if (reducedMotion) { finishIntro(); return; }

    (function step() {
      if (finished) return;
      if (i < text.length) {
        div.textContent += text.slice(i, i + perTick);
        i += perTick;
        if (Math.random() > 0.8) AudioEngine.key();
        timer = setTimeout(step, tick);
      } else {
        finishIntro();
      }
    })();
  }

  window.addEventListener('popstate', () => {
    if (isWindowsRoute()) enterDesktopView(false);
    else Desktop.exit();
  });

  // On touch devices don't auto-focus (it would pop the keyboard over the intro).
  if (!coarsePointer) input.focus();

  if (location.hash === '#quick-view') openQuickView();

  typeIntro(intro, 2000, () => {
    if (isWindowsRoute()) enterDesktopView(false);
  });

  // Small public surface for other scripts (e.g. games) that need the overlay
  // or want to run a command.
  window.NathanOS = { showOverlay, closeOverlay, runCommand: (c) => runCommand(c, input) };
})();
