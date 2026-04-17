// Nathan OS Terminal - Main logic
(() => {
  const output = document.getElementById('output');
  const input = document.getElementById('command-input');
  const terminal = document.getElementById('terminal');
  const overlay = document.getElementById('overlay');
  const overlayBody = document.getElementById('overlay-body');
  const overlayClose = document.getElementById('overlay-close');

  const AudioEngine = (() => {
    let ctx;
    function ensure() {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      return ctx;
    }
    function beep(freq=880, duration=0.03) {
      const c = ensure();
      const o = c.createOscillator();
      const g = c.createGain();
      o.type = 'square';
      o.frequency.value = freq;
      g.gain.value = 0.02;
      o.connect(g); g.connect(c.destination);
      o.start(); o.stop(c.currentTime + duration);
    }
    return { key:()=>beep(1200,0.01), enter:()=>beep(600,0.05) };
  })();

  const history = [];
  let historyIndex = -1;

  function appendLine(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    output.appendChild(div);
    const spacer = document.createElement('div');
    spacer.style.height = '10px';
    output.appendChild(spacer);
    terminal.scrollTop = terminal.scrollHeight;
  }

  function appendRaw(text) {
    const div = document.createElement('div');
    div.textContent = text;
    output.appendChild(div);
    const spacer = document.createElement('div');
    spacer.style.height = '5px';
    output.appendChild(spacer);
    terminal.scrollTop = terminal.scrollHeight;
  }

  function setInputDisabled(dis) {
    input.disabled = dis;
    if (!dis) input.focus();
  }

  overlayClose.addEventListener('click', () => {
    overlay.classList.add('hidden');
    overlayBody.innerHTML = '';
  });

  function showOverlay(contentEl) {
    overlayBody.innerHTML = '';
    overlayBody.appendChild(contentEl);
    overlay.classList.remove('hidden');
    overlay.style.zIndex = 1001; // always above desktop
  }

  function withLoading(fn, ms=500) {
    const spinner = document.createElement('div');
    spinner.innerHTML = 'Loading <span class="spinner"></span>';
    output.appendChild(spinner);
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

  const PROJECTS = [
    {
      alias: 'laki',
      name: 'Laki Associates Website',
      entryPath: '/laki',
      files: [
        { name: 'website (/laki)', path: '/laki' }
      ]
    },
    {
      alias: 'mmm',
      name: 'MMM-Dashboard',
      entryPath: '/mmm',
      files: [
        { name: 'dashboard (/mmm)', path: '/mmm' }
      ]
    },
    {
      alias: 'stock',
      name: 'Stock Exchange',
      entryPath: '/stock',
      files: [
        { name: 'stock exchange (/stock)', path: '/stock' }
      ]
    }
  ];

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
  }

  function enterDesktopView(syncRoute = true) {
    if (syncRoute) setWindowsRoute();
    Desktop.create(showOverlay, commands, PROJECTS, openProjectPath, setTerminalRoute);
  }

  async function runUpdateAnimation() {
    return new Promise((resolve) => {
      const screen=document.createElement('div');
      screen.style.position='fixed';
      screen.style.inset='0';
      screen.style.background='black';
      screen.style.color='#00ff66';
      screen.style.display='flex';
      screen.style.flexDirection='column';
      screen.style.justifyContent='center';
      screen.style.alignItems='center';
      screen.style.zIndex='998';
      screen.style.fontFamily='Consolas, monospace';
      const msg=document.createElement('div');
      msg.textContent='Updating system...';
      const bar=document.createElement('div');
      bar.style.width='300px';
      bar.style.height='10px';
      bar.style.border='1px solid #00ff66';
      const fill=document.createElement('div');
      fill.style.height='100%';
      fill.style.background='#00ff66';
      bar.appendChild(fill);
      screen.appendChild(msg);
      screen.appendChild(bar);
      document.body.appendChild(screen);

      let progress=0;
      const interval=setInterval(()=>{
        progress+=3;
        fill.style.width=progress+'%';
        if(progress>=100){
          clearInterval(interval);
          setTimeout(()=>{
            document.body.removeChild(screen);
            resolve();
          },700);
        }
      },80);
    });
  }

  // Commands
  const commands = {
    commands: async () => {
      return `Available commands:
- resume : Display your CV
- links : Show LinkedIn and GitHub
- about : About Nathan
- projects : Open project list or open one directly
    - laki : Open Laki Associates Website
    - mmm : Open MMM-Dashboard
  - stock : Open Stock Exchange
- play : Choose a game to play
- datetime : Show current date and time
- clear : Clear the screen
- update : type this after trying out other os features for a special surprise
- commands : Show this list`;
    },

    links: async () => {
      return `<a href="https://www.linkedin.com/in/nathan-kagoro-06ba31270/" target="_blank">linkedin</a>
<a href="https://github.com/NathanKagoro" target="_blank">GitHub</a>`;
    },

    about: async () => {
      return `Nathan Kagoro - Software Developer & Data Enthusiast
Focused on analytics, AI tooling, and full-stack solutions.`;
    },

    resume: async () => {
      const el = document.createElement('div');
      el.style.width = '100%';
      el.style.height = '100%';
      el.style.display = 'flex';
      el.style.justifyContent = 'center';
      el.style.alignItems = 'center';
      el.innerHTML = `
        <iframe src="assets/resume.pdf" style="width:90%; height:95vh; border:none;"></iframe>
      `;
      showOverlay(el);
      return null;
    },

    projects: async (arg) => {
      if (!arg) {
        const names = PROJECTS.map((project) => `- ${project.alias} : ${project.name}`).join('\n');
        return `Projects available:\n${names}\n\nUse: projects <alias> or projects "project name"`;
      }

      const project = findProjectByName(arg);
      if (!project) {
        return `Project "${arg}" not found. Run projects to list available aliases.`;
      }

      return openProject(project);
    },

    laki: async () => openProject(findProjectByName('laki')),

    mmm: async () => openProject(findProjectByName('mmm')),

    stock: async () => openProject(findProjectByName('stock')),

    datetime: async () => {
      const d = new Date();
      return `${d.toDateString()} ${d.toLocaleTimeString()}`;
    },

    play: async (arg) => {
      if (!arg) {
        return `Available games:
- play tictactoe
- play rps
- play hangman
- play 2048`;
      }
      const game = arg.toLowerCase();
      if (game === 'tictactoe') TicTacToe.createOverlay(showOverlay);
      else if (game === 'rps') RPS.createOverlay(showOverlay);
      else if (game === 'hangman') Hangman.createOverlay(showOverlay);
      else if (game === '2048') TwoThousandFortyEight.createOverlay(showOverlay);
      else return `Game "${arg}" not found.`;
      return null;
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

  async function handleCommand(raw) {
    if (!raw) return;
    appendRaw(`C:\\NathanOS> ${raw}`);
    history.push(raw);
    historyIndex = history.length;

    const trimmed = raw.trim();
    const firstSpace = trimmed.indexOf(' ');
    const cmd = (firstSpace === -1 ? trimmed : trimmed.slice(0, firstSpace)).toLowerCase();
    const arg = firstSpace === -1 ? null : trimmed.slice(firstSpace + 1).trim();
    const fn = commands[cmd];

    AudioEngine.enter();

    if (!fn) {
      appendRaw(`'${cmd}' is not recognized as an internal command.`);
      return;
    }

    await withLoading(async () => {
      const r = await fn(arg);
      if (r) appendLine(r);
    });
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
      if (historyIndex > 0) input.value = history[--historyIndex];
      e.preventDefault();
      return;
    }
    if (e.key === 'ArrowDown') {
      if (historyIndex < history.length - 1) input.value = history[++historyIndex];
      else input.value = '';
      e.preventDefault();
      return;
    }
    if (e.key === 'Enter') {
      const cmd = input.value;
      input.value = '';
      handleCommand(cmd);
      e.preventDefault();
    }
    if (e.key.length === 1) AudioEngine.key();
  });

  terminal.addEventListener('click', () => input.focus());

  // Intro text
  const intro = `Nathan OS [Build 1.0.5]
© Nathan Kagoro. All rights reserved.
This is a portfolio site built to mimic classic operating system experiences.

Site built for Laptops and PCs. For the best experience, please use a desktop device in landscape orientation with a screen width of at least 600px.
System initializing...
Boot complete.

Type "commands" to begin.
`;

  function typeIntro(text, speed=20, done=()=>{}) {
    setInputDisabled(true);
    const div = document.createElement('div');
    output.appendChild(div);
    let i = 0;
    (function step() {
      if (i < text.length) {
        div.textContent += text[i++];
        if (Math.random() > 0.6) AudioEngine.key();
        setTimeout(step, speed);
      } else {
        appendRaw('');
        setInputDisabled(false);
        done();
      }
    })();
  }

  window.addEventListener('popstate', () => {
    if (isWindowsRoute()) enterDesktopView(false);
    else Desktop.exit();
  });

  typeIntro(intro, 20, () => {
    if (isWindowsRoute()) enterDesktopView(false);
  });
})();
