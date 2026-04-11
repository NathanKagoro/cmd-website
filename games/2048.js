const TwoThousandFortyEight = (() => {
  function createOverlay(showOverlay) {
    const el = document.createElement('div');
    el.style.textAlign = 'center';
    el.innerHTML = `<h2>2048</h2><p>Select difficulty:</p>`;
    
    const container = document.createElement('div');
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.gap = '15px';
    container.style.flexWrap = 'wrap';
    
    const difficulties = [
      { name: 'Easy', value: 'easy' },
      { name: 'Challenging', value: 'medium' },
      { name: 'Extreme', value: 'hard' }
    ];
    
    difficulties.forEach(d => {
      const btn = document.createElement('button');
      btn.textContent = d.name;
      btn.style.padding = '10px 20px';
      btn.style.cursor = 'pointer';
      btn.style.fontSize = '16px';
      btn.addEventListener('click', () => startGame(d.value));
      container.appendChild(btn);
    });
    
    el.appendChild(container);
    
    function startGame(difficulty) {
      sessionStorage.loggedInUser = 'Guest';
      sessionStorage.gamemode = difficulty;
      window.location.href = '/2048/game/2048 game.html';
    }
    
    showOverlay(el);
  }
  
  return { createOverlay };
})();
