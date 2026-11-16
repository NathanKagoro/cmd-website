// 2048 inside the terminal overlay, like the other games.
// The engine and renderer live in games/2048/ (shared with the standalone
// /2048 page) and are loaded on first use so index.html needs no changes.
const TwoThousandFortyEight = (() => {
  const SCRIPTS = ['games/2048/engine.js', 'games/2048/ui.js'];
  let loading = null;

  function baseUrl() {
    const me = document.querySelector('script[src$="games/2048.js"]');
    return me ? me.src.replace(/games\/2048\.js(\?.*)?$/, '') : '';
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error('Failed to load ' + src));
      document.head.appendChild(s);
    });
  }

  function ensureLoaded() {
    if (window.Game2048Engine && window.Game2048UI) return Promise.resolve();
    if (!loading) {
      const base = baseUrl();
      loading = SCRIPTS.reduce((p, src) => p.then(() => loadScript(base + src)), Promise.resolve())
        .catch((err) => { loading = null; throw err; });
    }
    return loading;
  }

  function createOverlay(showOverlay) {
    const el = document.createElement('div');
    el.textContent = 'Loading 2048...';
    showOverlay(el);
    return ensureLoaded().then(() => {
      if (!el.isConnected) return; // overlay was closed while loading
      el.textContent = '';
      window.Game2048UI.mount(el, { embedded: true });
    }).catch(() => {
      el.textContent = 'Could not load 2048. Check your connection and try again.';
    });
  }

  return { createOverlay };
})();
