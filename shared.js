const STORAGE_KEY = 'starbase-flight-feud-state';

function getState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : createDefaultState();
  } catch (error) {
    return createDefaultState();
  }
}

function createDefaultState() {
  return {
    round: 1,
    questionIndex: 0,
    timer: 60,
    timerRunning: false,
    scores: Object.fromEntries(teams.map((team) => [team, 0])),
    strikes: Object.fromEntries(teams.map((team) => [team, 0])),
    revealed: {},
    winner: '',
    studentAnswer: '',
    missionTitle: 'Flight Feud',
    missionSubtitle: 'Metric Measurement Mission'
  };
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function setState(patch) {
  const state = getState();
  const nextState = { ...state, ...patch };
  saveState(nextState);
  return nextState;
}

function setRound(roundNumber) {
  const state = getState();
  const questionIndex = Math.max(0, Math.min(roundNumber - 1, missionQuestions.length - 1));
  const nextState = {
    ...state,
    round: roundNumber,
    questionIndex,
    winner: '',
    timer: 60,
    timerRunning: false,
    revealed: {}
  };
  saveState(nextState);
  return nextState;
}

function resetGameState() {
  const fresh = createDefaultState();
  saveState(fresh);
  return fresh;
}
