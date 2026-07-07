document.addEventListener('DOMContentLoaded', () => {
  const roundLabel = document.getElementById('currentRoundLabel');
  const questionBox = document.getElementById('questionBox');
  const answerBoard = document.getElementById('answerBoard');
  const teamScores = document.getElementById('teamScores');
  const timerDisplay = document.getElementById('timerDisplay');
  const roundNav = document.getElementById('roundNav');
  const winnerBox = document.getElementById('winnerBox');
  const nextRoundBtn = document.getElementById('nextRoundBtn');
  const resetGameBtn = document.getElementById('resetGameBtn');
  const winnerBtn = document.getElementById('winnerBtn');
  const timerStartBtn = document.getElementById('timerStartBtn');
  const timerPauseBtn = document.getElementById('timerPauseBtn');
  const timerResetBtn = document.getElementById('timerResetBtn');

  let state = getState();

  function render() {
    state = getState();
    const currentQuestion = missionQuestions[state.questionIndex] || missionQuestions[0];
    roundLabel.textContent = `Round ${state.round}`;
    questionBox.textContent = currentQuestion.prompt;
    timerDisplay.textContent = state.timer;
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
      const card = document.createElement('div');
      card.className = `answer-card${state.revealed[idx] ? ' revealed' : ''}`;
      card.innerHTML = `<div class="answer-index">${idx + 1}</div><div class="answer-text">${answer}</div><button class="reveal-btn">${state.revealed[idx] ? 'Revealed' : 'Reveal Answer'}</button>`;
      card.querySelector('.reveal-btn').addEventListener('click', () => {
        const nextRevealed = { ...state.revealed, [idx]: true };
        setState({ revealed: nextRevealed });
        render();
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
          <div class="strike-meter">${Array.from({ length: 3 }, (_, index) => `<span class="strike-dot${index < state.strikes[team] ? ' active' : ''}"></span>`).join('')}</div>
        </div>
        <div class="score-controls">
          <button data-team="${team}" data-action="minus" class="score-btn">−</button>
          <span class="score-number">${state.scores[team]}</span>
          <button data-team="${team}" data-action="plus" class="score-btn">+</button>
        </div>
        <div class="strike-controls">
          <button data-team="${team}" data-action="strike-minus" class="strike-btn">Strike −</button>
          <button data-team="${team}" data-action="strike-plus" class="strike-btn">Strike +</button>
        </div>
      `;
      scoreCard.querySelectorAll('button').forEach((button) => {
        button.addEventListener('click', () => {
          const scores = { ...state.scores };
          const strikes = { ...state.strikes };
          if (button.dataset.action === 'plus') {
            scores[team] += 1;
          } else if (button.dataset.action === 'minus') {
            scores[team] = Math.max(0, scores[team] - 1);
          } else if (button.dataset.action === 'strike-plus') {
            strikes[team] = Math.min(3, strikes[team] + 1);
          } else if (button.dataset.action === 'strike-minus') {
            strikes[team] = Math.max(0, strikes[team] - 1);
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
    setRound(nextRound);
    render();
  });

  resetGameBtn.addEventListener('click', () => {
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
    setState({ timer: 60, timerRunning: false });
    render();
  });

  setInterval(() => {
    const current = getState();
    if (current.timerRunning && current.timer > 0) {
      setState({ timer: current.timer - 1 });
      render();
    }
  }, 1000);

  render();
});
