document.addEventListener('DOMContentLoaded', () => {
  const roundLabel = document.getElementById('currentRoundLabel');
  const questionBox = document.getElementById('questionBox');
  const answerBoard = document.getElementById('answerBoard');
  const teamScores = document.getElementById('teamScores');
  const timerDisplay = document.getElementById('timerDisplay');
  const roundNav = document.getElementById('roundNav');
  const totalPointsDisplay = document.getElementById('totalPointsDisplay');
  const revealBanner = document.getElementById('revealBanner');
  const winnerBox = document.getElementById('winnerBox');
  const nextRoundBtn = document.getElementById('nextRoundBtn');
  const resetGameBtn = document.getElementById('resetGameBtn');
  const winnerBtn = document.getElementById('winnerBtn');
  const timerStartBtn = document.getElementById('timerStartBtn');
  const timerPauseBtn = document.getElementById('timerPauseBtn');
  const timerResetBtn = document.getElementById('timerResetBtn');

  let state = getState();
  let flashRow = null;
  let bannerTimer = null;

  function resetBoardReveals() {
    flashRow = null;
    if (bannerTimer) {
      window.clearTimeout(bannerTimer);
      bannerTimer = null;
    }
    revealBanner.classList.remove('show');
    const currentReveals = state.revealed || {};
    if (Object.keys(currentReveals).length > 0) {
      setState({ revealed: {} });
      state = getState();
    }
  }

  function formatTime(totalSeconds) {
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  function showRevealBanner() {
    revealBanner.classList.remove('show');
    void revealBanner.offsetWidth;
    revealBanner.classList.add('show');
    if (bannerTimer) {
      window.clearTimeout(bannerTimer);
    }
    bannerTimer = window.setTimeout(() => {
      revealBanner.classList.remove('show');
    }, 900);
  }

  function getPointValue(index) {
    return 30 - index * 5;
  }

  function getRevealedPoints(question, revealed) {
    return question.answers.reduce((total, answer, idx) => {
      return revealed[idx] ? total + getPointValue(idx) : total;
    }, 0);
  }

  function render() {
    state = getState();
    const currentQuestion = missionQuestions[state.questionIndex] || missionQuestions[0];
    const revealedPoints = getRevealedPoints(currentQuestion, state.revealed || {});
    roundLabel.textContent = `Round ${state.round}`;
    questionBox.textContent = currentQuestion.prompt;
    timerDisplay.textContent = formatTime(state.timer);
    totalPointsDisplay.textContent = revealedPoints;
    winnerBox.textContent = state.winner ? `Winner: ${state.winner}` : 'No winner declared';

    roundNav.innerHTML = '';
    missionQuestions.forEach((item, index) => {
      const btn = document.createElement('button');
      btn.className = `round-pill${state.questionIndex === index ? ' active' : ''}`;
      btn.textContent = `Round ${index + 1}`;
      btn.addEventListener('click', () => {
        setRound(index + 1);
        render();
      });
      roundNav.appendChild(btn);
    });

    answerBoard.innerHTML = '';
    currentQuestion.answers.forEach((answer, idx) => {
      const pointValue = getPointValue(idx);
      const card = document.createElement('div');
      const isRevealed = Boolean(state.revealed[idx]);
      card.className = `answer-card${isRevealed ? ' revealed' : ''}${flashRow === idx ? ' flash' : ''}`;
      card.innerHTML = `
        <div class="row-number">${idx + 1}</div>
        <div class="row-bar">
          <span class="row-answer">${isRevealed ? answer : ''}</span>
        </div>
        <div class="row-points">${isRevealed ? pointValue : ''}</div>
        <button class="reveal-btn">${isRevealed ? 'Revealed' : 'Reveal'}</button>
      `;
      card.querySelector('.reveal-btn').addEventListener('click', () => {
        if (state.revealed[idx]) {
          render();
          return;
        }

        const nextRevealed = { ...state.revealed, [idx]: true };
        setState({ revealed: nextRevealed });
        flashRow = idx;
        showRevealBanner();
        render();
        window.setTimeout(() => {
          if (flashRow === idx) {
            flashRow = null;
            render();
          }
        }, 1000);
      });
      answerBoard.appendChild(card);
    });

    teamScores.innerHTML = '';
    teams.forEach((team) => {
      const displayName = `${team} Crew`;
      const scoreCard = document.createElement('div');
      scoreCard.className = 'team-score-card';
      scoreCard.innerHTML = `
        <div class="team-topline">
          <div class="team-name">${displayName}</div>
          <div class="score-pill">${state.scores[team]}</div>
        </div>
        <div class="strike-row">
          ${Array.from({ length: 3 }, (_, index) => `<span class="strike-slot${index < state.strikes[team] ? ' active' : ''}">X</span>`).join('')}
        </div>
        <div class="score-controls">
          <button data-team="${team}" data-action="plus10" class="score-btn">+10</button>
          <button data-team="${team}" data-action="plus25" class="score-btn">+25</button>
          <button data-team="${team}" data-action="plus50" class="score-btn">+50</button>
        </div>
        <div class="strike-controls">
          <button data-team="${team}" data-action="strike-plus" class="strike-btn">Add Strike</button>
          <button data-team="${team}" data-action="strike-clear" class="strike-btn clear">Clear Strikes</button>
        </div>
      `;
      scoreCard.querySelectorAll('button').forEach((button) => {
        button.addEventListener('click', () => {
          const scores = { ...state.scores };
          const strikes = { ...state.strikes };
          if (button.dataset.action === 'plus10') {
            scores[team] += 10;
          } else if (button.dataset.action === 'plus25') {
            scores[team] += 25;
          } else if (button.dataset.action === 'plus50') {
            scores[team] += 50;
          } else if (button.dataset.action === 'strike-plus') {
            strikes[team] = Math.min(3, strikes[team] + 1);
          } else if (button.dataset.action === 'strike-clear') {
            strikes[team] = 0;
          }
          setState({ scores, strikes });
          render();
        });
      });
      teamScores.appendChild(scoreCard);
    });
  }

  nextRoundBtn.addEventListener('click', () => {
    const nextRound = state.round < missionQuestions.length ? state.round + 1 : 1;
    resetBoardReveals();
    setRound(nextRound);
    render();
  });

  resetGameBtn.addEventListener('click', () => {
    resetBoardReveals();
    resetGameState();
    render();
  });

  winnerBtn.addEventListener('click', () => {
    const topTeam = [...teams].sort((a, b) => state.scores[b] - state.scores[a])[0];
    setState({ winner: topTeam });
    render();
  });

  timerStartBtn.addEventListener('click', () => {
    const nextState = { ...state, timerRunning: true };
    setState(nextState);
    render();
  });

  timerPauseBtn.addEventListener('click', () => {
    const nextState = { ...state, timerRunning: false };
    setState(nextState);
    render();
  });

  timerResetBtn.addEventListener('click', () => {
    setState({ timer: 120, timerRunning: false });
    render();
  });

  setInterval(() => {
    const current = getState();
    if (current.timerRunning && current.timer > 0) {
      setState({ timer: current.timer - 1 });
      render();
    }
  }, 1000);

  resetBoardReveals();
  render();
});
