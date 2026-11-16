const RPS = (() => {
  function createOverlay(showOverlay) {
    const el = document.createElement('div');
    el.innerHTML = `<h2>Rock Paper Scissors</h2><p>Choose your move:</p>`;
    const options = ['rock','paper','scissors'];
    const container = document.createElement('div');
    container.style.display='flex'; container.style.justifyContent='center'; container.style.gap='10px';
    options.forEach(o=>{
      const b=document.createElement('button');
      b.textContent=o;
      b.style.padding='10px';
      b.style.cursor='pointer';
      b.addEventListener('click',()=>play(o));
      container.appendChild(b);
    });
    const result=document.createElement('div');
    result.style.marginTop='10px';
    result.style.textAlign='center';
    el.appendChild(container);
    el.appendChild(result);

    function play(player) {
      const comp=options[Math.floor(Math.random()*3)];
      let outcome='';
      if (player===comp) outcome='Draw.';
      else if ((player==='rock'&&comp==='scissors')||(player==='paper'&&comp==='rock')||(player==='scissors'&&comp==='paper'))
        outcome='You win.';
      else outcome='You lose.';
      result.textContent=`You: ${player} | Computer: ${comp} -> ${outcome}`;
      
      // Add play again button
      addPlayAgainButton();
    }

    function addPlayAgainButton() {
      // Remove existing play again button if it exists
      const existingBtn = el.querySelector('.play-again-btn');
      if (existingBtn) existingBtn.remove();
      
      const playAgainBtn = document.createElement('button');
      playAgainBtn.textContent = 'Play Again';
      playAgainBtn.className = 'play-again-btn';
      playAgainBtn.style.marginTop = '10px';
      playAgainBtn.style.padding = '8px 16px';
      playAgainBtn.style.cursor = 'pointer';
      playAgainBtn.style.backgroundColor = '#4CAF50';
      playAgainBtn.style.color = 'white';
      playAgainBtn.style.border = 'none';
      playAgainBtn.style.borderRadius = '4px';
      playAgainBtn.addEventListener('click', () => {
        // Reset the game
        result.textContent = '';
        const existingBtn = el.querySelector('.play-again-btn');
        if (existingBtn) existingBtn.remove();
      });
      el.appendChild(playAgainBtn);
    }

    showOverlay(el);
  }
  return { createOverlay };
})();
