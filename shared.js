const STORAGE_KEY = "flight-feud-state";
const TRANSMISSIONS_KEY = "flight-feud-transmissions";

function createDefaultState() {
  return {
    round: 1,
    questionIndex: 0,
    timer: 60,
    timerRunning: false,
    scores: Object.fromEntries(teams.map((team) => [team, 0])),
    strikes: Object.fromEntries(teams.map((team) => [team, 0])),
    revealed: {},
    winner: "",
    selectedTeam: teams[0]
  };
}

function getState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    return saved
      ? JSON.parse(saved)
      : createDefaultState();
  } catch (error) {
    console.error("Unable to load game state:", error);
    return createDefaultState();
  }
}

function saveState(state) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );
}

function setState(patch) {
  const current = getState();

  const next = {
    ...current,
    ...patch
  };

  saveState(next);
  return next;
}

function setRound(roundNumber) {
  const questionIndex = Math.max(
    0,
    Math.min(
      roundNumber - 1,
      missionQuestions.length - 1
    )
  );

  const next = {
    ...getState(),
    round: roundNumber,
    questionIndex,
    timer: 60,
    timerRunning: false,
    revealed: {},
    winner: ""
  };

  saveState(next);

  const transmissionsFromOtherRounds =
    getTransmissions().filter(
      (item) =>
        Number(item.round) !== Number(roundNumber)
    );

  saveTransmissions(transmissionsFromOtherRounds);

  return next;
}

function resetGameState() {
  localStorage.removeItem(TRANSMISSIONS_KEY);

  const fresh = createDefaultState();

  saveState(fresh);

  return fresh;
}

function normalizeFlightFeudAnswer(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/^(a|an|the)\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function findBoardAnswerIndex(
  answer,
  questionIndex = getState().questionIndex
) {
  const question =
    missionQuestions[questionIndex] ||
    missionQuestions[0];

  const submittedAnswer =
    normalizeFlightFeudAnswer(answer);

  return question.answers.findIndex(
    (boardAnswer) => {
      const normalizedBoardAnswer =
        normalizeFlightFeudAnswer(boardAnswer);

      return (
        submittedAnswer === normalizedBoardAnswer ||
        submittedAnswer.includes(
          normalizedBoardAnswer
        ) ||
        normalizedBoardAnswer.includes(
          submittedAnswer
        )
      );
    }
  );
}

function isAnswerAlreadyRevealed(answer) {
  const state = getState();

  const answerIndex = findBoardAnswerIndex(
    answer,
    state.questionIndex
  );

  return (
    answerIndex !== -1 &&
    Boolean(state.revealed[answerIndex])
  );
}

function getTransmissions() {
  try {
    const saved =
      localStorage.getItem(TRANSMISSIONS_KEY);

    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error(
      "Unable to load transmissions:",
      error
    );

    return [];
  }
}

function saveTransmissions(transmissions) {
  localStorage.setItem(
    TRANSMISSIONS_KEY,
    JSON.stringify(transmissions)
  );
}

function savePendingTransmission(
  teamName,
  answer,
  round
) {
  const transmissions = getTransmissions();

  const newTransmission = {
    id: Date.now() + Math.random(),
    teamName,
    answer,
    round,
    timestamp: new Date().toISOString(),
    status: "pending",
    pointsAwarded: 0,
    boardAnswerIndex: null,
    approvedAt: null,
    revealedAt: null
  };

  transmissions.push(newTransmission);

  saveTransmissions(transmissions);

  return newTransmission;
}

function getPendingTransmissions() {
  return getTransmissions().filter(
    (item) => item.status === "pending"
  );
}

function getApprovedWaitingTransmissions() {
  return getTransmissions().filter(
    (item) => item.status === "approved"
  );
}

function getRevealedTransmissions() {
  return getTransmissions().filter(
    (item) => item.status === "revealed"
  );
}

function getRejectedTransmissions() {
  return getTransmissions().filter(
    (item) => item.status === "rejected"
  );
}

function getApprovedTransmissions() {
  return getTransmissions().filter(
    (item) =>
      item.status === "approved" ||
      item.status === "revealed" ||
      item.status === "rejected"
  );
}