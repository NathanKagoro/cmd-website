const TicTacToe = (() => {
  function createOverlay(showOverlay) {
    const el = document.createElement('div');
    el.innerHTML = `<h2>Tic Tac Toe</h2><div id="ttt-board" style="display:grid;grid-template-columns:repeat(3,80px);gap:5px;justify-content:center;"></div>`;
    const boardEl = el.querySelector('#ttt-board');
    const cells = Array(9).fill(null).map((_,i)=>{
      const c=document.createElement('div');
      c.textContent='';
      c.style.border='1px solid #00ff66';
      c.style.height='80px';
      c.style.display='flex';
      c.style.alignItems='center';
      c.style.justifyContent='center';
      c.style.fontSize='2em';
      c.style.cursor='pointer';
      c.dataset.i=i;
      boardEl.appendChild(c);
      return c;
    });
    let board = Array(9).fill(null);
    const human = Math.random() < 0.5 ? 'X':'O';
    const ai = human==='X'?'O':'X';
    let current = 'X';
    const status = document.createElement('div');
    status.textContent = `You are ${human}`;
    status.style.textAlign='center';
    status.style.marginTop='10px';
    el.appendChild(status);

    function checkWin(b,p) {
      const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
      return lines.some(l => l.every(i => b[i]===p));
    }

    function emptyIndices(b) {
      return b.map((v,i)=>v?null:i).filter(v=>v!==null);
    }

    function aiMove() {
      const avail = emptyIndices(board);
      // try to win
      for (let i of avail) {
        const copy=[...board]; copy[i]=ai;
        if (checkWin(copy,ai)) return i;
      }
      // try to block
      for (let i of avail) {
        const copy=[...board]; copy[i]=human;
        if (checkWin(copy,human)) return i;
      }
      // else random
      return avail[Math.floor(Math.random()*avail.length)];
    }

    function move(i,p) {
      if (board[i]) return;
      board[i]=p;
      cells[i].textContent=p;
      if (checkWin(board,p)) {
        status.textContent = `${p==='X'?'X':'O'} wins!`;
        boardEl.querySelectorAll('div').forEach(c=>c.style.pointerEvents='none');
        addPlayAgainButton();
        return;
      }
      if (board.every(Boolean)) {
        status.textContent = 'Draw!';
        addPlayAgainButton();
        return;
      }
      current = current==='X'?'O':'X';
      if (current===ai) {
        setTimeout(()=> {
          const moveIdx=aiMove();
          move(moveIdx,ai);
        },400);
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
        setTimeout(() => TicTacToe.createOverlay(showOverlay), 100);
      });
      el.appendChild(playAgainBtn);
    }

    cells.forEach(c=>{
      c.addEventListener('click',()=>{
        if (current!==human) return;
        move(+c.dataset.i,human);
      });
    });

    showOverlay(el);
    // AI first move
    if (ai==='X') {
      const moveIdx=aiMove();
      move(moveIdx,ai);
    }
  }
  return { createOverlay };
})();
