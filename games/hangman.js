const Hangman = (() => {
  const WORDS = [
    // short
    'api', 'bug', 'css', 'git', 'sql', 'npm', 'ram', 'cli', 'cpu', 'dom',
    // medium
    'nathan', 'array', 'cache', 'class', 'debug', 'deploy', 'docker', 'fetch',
    'github', 'linux', 'loop', 'model', 'node', 'pixel', 'query', 'react',
    'regex', 'route', 'shell', 'stack', 'token', 'vector', 'python', 'pandas',
    'branch', 'commit', 'server', 'syntax', 'kernel', 'cursor',
    // long
    'terminal', 'portfolio', 'developer', 'javascript', 'dashboard', 'analytics',
    'database', 'frontend', 'backend', 'function', 'algorithm', 'variable',
    'compiler', 'keyboard', 'netlify', 'pipeline', 'recursion', 'framework',
    'typescript', 'notebook', 'regression', 'container'
  ];
  const MAX_WRONG = 6;
  const SVG_NS = 'http://www.w3.org/2000/svg';

  function line(x1, y1, x2, y2, width = 3) {
    const l = document.createElementNS(SVG_NS, 'line');
    l.setAttribute('x1', x1); l.setAttribute('y1', y1);
    l.setAttribute('x2', x2); l.setAttribute('y2', y2);
    l.setAttribute('stroke', 'currentColor');
    l.setAttribute('stroke-width', width);
    l.setAttribute('stroke-linecap', 'round');
    return l;
  }

  function createOverlay(showOverlay) {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    const guesses = [];
    let wrong = 0;
    let over = false;

    const el = document.createElement('div');
    el.className = 'hangman';
    el.innerHTML = `<h2>Hangman</h2><p>Guess the hidden word — type letters or tap them below.</p>`;

    // Gallows + figure (green-on-black to match the terminal)
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 150 200');
    svg.setAttribute('width', '150');
    svg.setAttribute('height', '200');
    svg.setAttribute('role', 'img');
    svg.style.color = 'var(--green, #00ff66)';
    svg.style.border = '1px solid var(--green-dim, #00a845)';

    svg.appendChild(line(10, 190, 80, 190));   // base
    svg.appendChild(line(20, 190, 20, 20));    // vertical pole
    svg.appendChild(line(20, 20, 110, 20));    // horizontal beam (was missing its stroke-width)
    svg.appendChild(line(110, 20, 110, 50, 2)); // rope

    const head = document.createElementNS(SVG_NS, 'circle');
    head.setAttribute('cx', '110'); head.setAttribute('cy', '60'); head.setAttribute('r', '10');
    head.setAttribute('stroke', 'currentColor'); head.setAttribute('stroke-width', '2');
    head.setAttribute('fill', 'none');
    const parts = [
      head,
      line(110, 70, 110, 110, 2),  // body
      line(110, 80, 90, 95, 2),    // left arm
      line(110, 80, 130, 95, 2),   // right arm
      line(110, 110, 95, 135, 2),  // left leg
      line(110, 110, 125, 135, 2)  // right leg
    ];
    parts.forEach((p) => { p.style.display = 'none'; svg.appendChild(p); });

    const wordDiv = document.createElement('div');
    wordDiv.className = 'hm-word';
    wordDiv.setAttribute('aria-label', 'Word');

    const status = document.createElement('div');
    status.className = 'hm-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');

    const guessed = document.createElement('div');
    guessed.className = 'hm-guessed';

    const keys = document.createElement('div');
    keys.className = 'hm-keys';
    keys.setAttribute('aria-label', 'Letters');
    const keyButtons = {};
    'abcdefghijklmnopqrstuvwxyz'.split('').forEach((ch) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'hm-key';
      b.textContent = ch;
      b.setAttribute('aria-label', `Letter ${ch.toUpperCase()}`);
      b.addEventListener('click', () => guess(ch));
      keys.appendChild(b);
      keyButtons[ch] = b;
    });

    const actions = document.createElement('div');
    actions.style.marginTop = '14px';

    function guess(ch) {
      if (over) return;
      if (guesses.includes(ch)) {
        status.textContent = `You already tried "${ch.toUpperCase()}".`;
        status.classList.remove('flash');
        void status.offsetWidth; // restart animation
        status.classList.add('flash');
        return;
      }
      guesses.push(ch);
      const hit = word.includes(ch);
      if (!hit) wrong++;
      const b = keyButtons[ch];
      b.disabled = true;
      b.classList.add(hit ? 'hit' : 'miss');
      b.setAttribute('aria-label', `Letter ${ch.toUpperCase()}, ${hit ? 'in the word' : 'not in the word'}`);
      render(hit ? `Yes — "${ch.toUpperCase()}" is in the word.` : `No "${ch.toUpperCase()}".`);
    }

    function render(note) {
      parts.forEach((p, i) => { p.style.display = wrong > i ? '' : 'none'; });
      svg.setAttribute('aria-label', `Hangman: ${wrong} of ${MAX_WRONG} wrong guesses`);
      const display = word.split('').map((l) => (guesses.includes(l) ? l : '_')).join(' ');
      wordDiv.textContent = display;
      guessed.textContent = guesses.length ? `Guessed: ${guesses.map((g) => g.toUpperCase()).join(' ')}` : 'Guessed: —';
      if (!display.includes('_')) {
        status.textContent = 'You win!';
        end();
      } else if (wrong >= MAX_WRONG) {
        status.textContent = `You lost! Word was "${word}".`;
        wordDiv.textContent = word.split('').join(' ');
        end();
      } else {
        status.textContent = `${note ? note + ' ' : ''}Wrong: ${wrong}/${MAX_WRONG}`;
      }
    }

    function end() {
      over = true;
      Object.values(keyButtons).forEach((b) => { b.disabled = true; });
      const playAgainBtn = document.createElement('button');
      playAgainBtn.type = 'button';
      playAgainBtn.textContent = 'Play Again';
      playAgainBtn.addEventListener('click', () => createOverlay(showOverlay));
      actions.appendChild(playAgainBtn);
      playAgainBtn.focus();
    }

    // Letters are accepted as typed, no Enter needed.
    function onKey(e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Enter' && over) { createOverlay(showOverlay); e.preventDefault(); return; }
      if (/^[a-z]$/i.test(e.key)) {
        e.preventDefault();
        guess(e.key.toLowerCase());
      }
    }
    document.addEventListener('keydown', onKey);

    const figure = document.createElement('div');
    figure.style.display = 'flex';
    figure.style.justifyContent = 'center';
    figure.appendChild(svg);

    el.appendChild(figure);
    el.appendChild(wordDiv);
    el.appendChild(status);
    el.appendChild(guessed);
    el.appendChild(keys);
    el.appendChild(actions);
    render();

    // onClose removes the keyboard listener when the overlay closes or is replaced.
    showOverlay(el, { label: 'Hangman', onClose: () => document.removeEventListener('keydown', onKey) });
  }
  return { createOverlay };
})();
