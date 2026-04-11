const Hangman = (() => {
  function createOverlay(showOverlay) {
    const words = ['javascript','terminal','portfolio','nathan','developer'];
    const word = words[Math.floor(Math.random()*words.length)];
    let guesses = [];
    let wrong = 0;

    const el = document.createElement('div');
    el.innerHTML = `<h2>Hangman</h2><p>Guess the hidden word.</p>`;
    
    // Create hangman figure container
    const figureContainer = document.createElement('div');
    figureContainer.style.display = 'flex';
    figureContainer.style.justifyContent = 'center';
    figureContainer.style.marginBottom = '20px';
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '150');
    svg.setAttribute('height', '200');
    svg.setAttribute('style', 'border: 1px solid #999; background-color: #f9f9f9;');
    
    // Gallows
    const gallows = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    // Vertical pole
    const vertical = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    vertical.setAttribute('x1', '20'); vertical.setAttribute('y1', '180');
    vertical.setAttribute('x2', '20'); vertical.setAttribute('y2', '20');
    vertical.setAttribute('stroke', '#333'); vertical.setAttribute('stroke-width', '3');
    
    // Horizontal beam
    const horizontal = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    horizontal.setAttribute('x1', '20'); horizontal.setAttribute('y1', '20');
    horizontal.setAttribute('x2', '110'); horizontal.setAttribute('y2', '20');
    horizontal.setAttribute('stroke', '#333'); vertical.setAttribute('stroke-width', '3');
    
    // Rope
    const rope = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    rope.setAttribute('x1', '110'); rope.setAttribute('y1', '20');
    rope.setAttribute('x2', '110'); rope.setAttribute('y2', '50');
    rope.setAttribute('stroke', '#333'); rope.setAttribute('stroke-width', '2');
    
    gallows.appendChild(vertical);
    gallows.appendChild(horizontal);
    gallows.appendChild(rope);
    svg.appendChild(gallows);
    
    // Hangman parts (shown based on wrong count)
    const head = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    head.setAttribute('cx', '110'); head.setAttribute('cy', '60');
    head.setAttribute('r', '10'); head.setAttribute('stroke', '#000');
    head.setAttribute('stroke-width', '2'); head.setAttribute('fill', 'none');
    
    const body = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    body.setAttribute('x1', '110'); body.setAttribute('y1', '70');
    body.setAttribute('x2', '110'); body.setAttribute('y2', '110');
    body.setAttribute('stroke', '#000'); body.setAttribute('stroke-width', '2');
    
    const leftArm = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    leftArm.setAttribute('x1', '110'); leftArm.setAttribute('y1', '80');
    leftArm.setAttribute('x2', '90'); leftArm.setAttribute('y2', '95');
    leftArm.setAttribute('stroke', '#000'); leftArm.setAttribute('stroke-width', '2');
    
    const rightArm = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    rightArm.setAttribute('x1', '110'); rightArm.setAttribute('y1', '80');
    rightArm.setAttribute('x2', '130'); rightArm.setAttribute('y2', '95');
    rightArm.setAttribute('stroke', '#000'); rightArm.setAttribute('stroke-width', '2');
    
    const leftLeg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    leftLeg.setAttribute('x1', '110'); leftLeg.setAttribute('y1', '110');
    leftLeg.setAttribute('x2', '95'); leftLeg.setAttribute('y2', '135');
    leftLeg.setAttribute('stroke', '#000'); leftLeg.setAttribute('stroke-width', '2');
    
    const rightLeg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    rightLeg.setAttribute('x1', '110'); rightLeg.setAttribute('y1', '110');
    rightLeg.setAttribute('x2', '125'); rightLeg.setAttribute('y2', '135');
    rightLeg.setAttribute('stroke', '#000'); rightLeg.setAttribute('stroke-width', '2');
    
    const parts = [head, body, leftArm, rightArm, leftLeg, rightLeg];
    
    function updateHangman() {
      // Remove all body parts first
      parts.forEach(part => {
        if (svg.contains(part)) svg.removeChild(part);
      });
      
      // Add parts based on wrong count
      if (wrong >= 1) svg.appendChild(head);
      if (wrong >= 2) svg.appendChild(body);
      if (wrong >= 3) svg.appendChild(leftArm);
      if (wrong >= 4) svg.appendChild(rightArm);
      if (wrong >= 5) svg.appendChild(leftLeg);
      if (wrong >= 6) svg.appendChild(rightLeg);
    }
    
    svg.appendChild(gallows);
    figureContainer.appendChild(svg);
    
    const wordDiv=document.createElement('div');
    wordDiv.style.letterSpacing='3px';
    wordDiv.style.fontSize='1.5em';
    const input=document.createElement('input');
    input.maxLength=1; input.style.marginTop='10px';
    const msg=document.createElement('div'); msg.style.marginTop='10px';
    updateWord();

    input.addEventListener('keydown',(e)=>{
      if (e.key==='Enter'){
        const ch=input.value.toLowerCase();
        input.value='';
        if (!ch.match(/[a-z]/i)) return;
        if (guesses.includes(ch)) return;
        guesses.push(ch);
        if (!word.includes(ch)) wrong++;
        updateWord();
      }
    });

    function updateWord(){
      updateHangman();
      const display=word.split('').map(l=>guesses.includes(l)?l:'_').join(' ');
      wordDiv.textContent=display;
      if (!display.includes('_')) {
        msg.textContent='You win!';
        input.disabled=true;
        addPlayAgainButton();
      } else if (wrong>=6) {
        msg.textContent=`You lost! Word was "${word}".`;
        input.disabled=true;
        addPlayAgainButton();
      } else {
        msg.textContent=`Wrong: ${wrong}/6`;
      }
    }

    function addPlayAgainButton() {
      const playAgainBtn = document.createElement('button');
      playAgainBtn.textContent = 'Play Again';
      playAgainBtn.style.marginTop = '10px';
      playAgainBtn.style.padding = '8px 16px';
      playAgainBtn.style.cursor = 'pointer';
      playAgainBtn.style.backgroundColor = '#4CAF50';
      playAgainBtn.style.color = 'white';
      playAgainBtn.style.border = 'none';
      playAgainBtn.style.borderRadius = '4px';
      playAgainBtn.addEventListener('click', () => {
        // Close current overlay and start new game
        const overlay = document.getElementById('overlay');
        if (overlay) overlay.classList.add('hidden');
        setTimeout(() => Hangman.createOverlay(showOverlay), 100);
      });
      el.appendChild(playAgainBtn);
    }

    el.appendChild(figureContainer);
    el.appendChild(wordDiv);
    el.appendChild(input);
    el.appendChild(msg);
    showOverlay(el);
    input.focus();
  }
  return { createOverlay };
})();
