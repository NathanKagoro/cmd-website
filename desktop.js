const Desktop = (() => {
  let desktopEl = null;

  function openProjectsFolder(showOverlay, projects, openProjectPath) {
    const container = document.createElement('div');
    container.style.maxWidth = '920px';
    container.style.margin = '20px auto';
    container.style.padding = '16px';
    container.style.border = '1px solid #00ff66';
    container.style.background = 'rgba(0,0,0,0.75)';

    const title = document.createElement('h2');
    title.textContent = 'Projects Folder';
    title.style.marginTop = '0';
    container.appendChild(title);

    const buttonWrap = document.createElement('div');
    buttonWrap.style.display = 'flex';
    buttonWrap.style.flexWrap = 'wrap';
    buttonWrap.style.gap = '12px';

    projects.forEach((project) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = `Open ${project.name}`;
      button.style.padding = '10px 14px';
      button.style.border = '1px solid #00ff66';
      button.style.background = 'transparent';
      button.style.color = '#00ff66';
      button.style.cursor = 'pointer';
      button.style.fontFamily = 'inherit';
      button.addEventListener('click', () => openProjectPath(project.entryPath));
      buttonWrap.appendChild(button);
    });

    container.appendChild(buttonWrap);

    showOverlay(container);
  }

  function create(showOverlay, commands, projects = [], openProjectPath = () => {}, onExit = () => {}) {
    if (desktopEl) return;

    desktopEl = document.createElement('div');
    desktopEl.id = 'desktop';
    desktopEl.style.position = 'fixed';
    desktopEl.style.inset = '0';
    desktopEl.style.background = 'url("assets/desktop-bg.jpg") center/cover';
    desktopEl.style.zIndex = '999';
    desktopEl.style.color = 'white';
    desktopEl.style.fontFamily = 'sans-serif';

    const iconsDiv = document.createElement('nav');
    iconsDiv.id = 'desktop-icons';
    iconsDiv.setAttribute('aria-label', 'Desktop');
    desktopEl.appendChild(iconsDiv);

    const icons = [
      { name: 'Resume', icon: 'assets/resume-icon.png', action: () => commands.resume() },
      {
        name: 'Projects',
        icon: 'assets/folder-icon.png',
        action: () => openProjectsFolder(showOverlay, projects, openProjectPath)
      },
      { name: 'Tic Tac Toe', icon: 'assets/games-icon.png', action: () => commands.play('tictactoe') },
      { name: 'RPS', icon: 'assets/games-icon.png', action: () => commands.play('rps') },
      { name: 'Hangman', icon: 'assets/games-icon.png', action: () => commands.play('hangman') },
      { name: '2048', icon: 'assets/games-icon.png', action: () => commands.play('2048') },
      {
        name: 'CMD',
        icon: 'assets/cmd-icon.png',
        action: () => {
          Desktop.exit();
          onExit();
        }
      }
    ];

    // Real buttons so icons work with keyboard and touch.
    icons.forEach(i => {
      const iconEl = document.createElement('button');
      iconEl.type = 'button';
      iconEl.className = 'desktop-icon';
      iconEl.innerHTML = `<img src="${i.icon}" alt=""><span>${i.name}</span>`;
      iconEl.addEventListener('click', i.action);
      iconsDiv.appendChild(iconEl);
    });

    document.body.appendChild(desktopEl);
    const firstIcon = iconsDiv.querySelector('button');
    if (firstIcon) firstIcon.focus();
  }

  function exit() {
    if (desktopEl) {
      desktopEl.remove();
      desktopEl = null;
    }
  }

  return { create, exit };
})();
