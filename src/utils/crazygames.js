export const initCrazyGames = () => {
  // Safe helper to initialize or start gameplay with CrazyGames
  if (window.CrazyGames && window.CrazyGames.SDK) {
    try {
      window.CrazyGames.SDK.game.gameplayStart();
      console.log('CrazyGames SDK gameplay started');
    } catch (e) {
      console.warn('CrazyGames SDK init error:', e);
    }
  }
};

export const crazyGamesGameplayStart = () => {
  if (window.CrazyGames && window.CrazyGames.SDK) {
    try {
      window.CrazyGames.SDK.game.gameplayStart();
    } catch (e) {
      console.warn('CrazyGames SDK gameplayStart error:', e);
    }
  }
};

export const crazyGamesGameplayStop = () => {
  if (window.CrazyGames && window.CrazyGames.SDK) {
    try {
      window.CrazyGames.SDK.game.gameplayStop();
    } catch (e) {
      console.warn('CrazyGames SDK gameplayStop error:', e);
    }
  }
};
