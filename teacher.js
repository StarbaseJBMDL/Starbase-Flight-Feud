document.addEventListener("DOMContentLoaded", () => {
  const roundLabel = document.getElementById("currentRoundLabel");
  const questionBox = document.getElementById("questionBox");
  const answerBoard = document.getElementById("answerBoard");
  const teamScores = document.getElementById("teamScores");
  const timerDisplay = document.getElementById("timerDisplay");
  const roundNav = document.getElementById("roundNav");
  const totalPointsDisplay = document.getElementById("totalPointsDisplay");
  const revealBanner = document.getElementById("revealBanner");
  const winnerBox = document.getElementById("winnerBox");

  const nextRoundBtn = document.getElementById("nextRoundBtn");
  const resetGameBtn = document.getElementById("resetGameBtn");
  const winnerBtn = document.getElementById("winnerBtn");
  const startMissionBtn = document.getElementById("startMissionBtn");

  const timerStartBtn = document.getElementById("timerStartBtn");
  const timerPauseBtn = document.getElementById("timerPauseBtn");
  const timerResetBtn = document.getElementById("timerResetBtn");

  const transmissionsList = document.getElementById("transmissionsList");
  const approvedList = document.getElementById("approvedList");

  const launchOverlay = document.getElementById("launchOverlay");
  const launchTitle = document.getElementById("launchTitle");
  const launchSubtitle = document.getElementById("launchSubtitle");
  const launchChecklist = document.getElementById("launchChecklist");
  const launchCountdown = document.getElementById("launchCountdown");
  const launchFinal = document.getElementById("launchFinal");

  const awardValues = [5, 12, 18, 22, 28];

  let state = getState();
  let flashRow = null;
  let bannerTimer = null;

  function formatTime(totalSeconds) {
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  }

  function wait(milliseconds) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, milliseconds);
    });
  }

  function normalizeAnswer(value) {
    return String(value)
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .replace(/^(a|an|the)\s+/i, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function findMatchingAnswerIndex(studentAnswer, answers) {
    const submitted = normalizeAnswer(studentAnswer);

    return answers.findIndex((answer) => {
      const boardAnswer = normalizeAnswer(answer);

      return (
        submitted === boardAnswer ||
        submitted.includes(boardAnswer) ||
        boardAnswer.includes(submitted)
      );
    });
  }

  function showRevealBanner(message = "ANSWER REVEALED") {
    revealBanner.textContent = message;
    revealBanner.classList.remove("show");

    void revealBanner.offsetWidth;

    revealBanner.classList.add("show");

    if (bannerTimer) {
      window.clearTimeout(bannerTimer);
    }

    bannerTimer = window.setTimeout(() => {
      revealBanner.classList.remove("show");
    }, 1200);
  }

  function calculateBoardPoints(question, revealed) {
    return question.answers.reduce((total, answer, index) => {
      if (!revealed[index]) {
        return total;
      }

      return total + getBoardPointValue(index);
    }, 0);
  }

  function getBoardPointValue(index) {
    const pointScale = [28, 22, 18, 12, 5];
    return pointScale[index] ?? 5;
  }

  function revealBoardAnswer(index) {
    state = getState();

    if (state.revealed[index]) {
      return;
    }

    const revealed = {
      ...state.revealed,
      [index]: true
    };

    flashRow = index;

    setState({ revealed });
    showRevealBanner();

    render();

    window.setTimeout(() => {
      if (flashRow === index) {
        flashRow = null;
        render();
      }
    }, 1000);
  }

  function renderRoundNavigation() {
    roundNav.innerHTML = "";

    missionQuestions.forEach((question, index) => {
      const button = document.createElement("button");

      button.type = "button";
      button.className =
        state.questionIndex === index
          ? "round-pill active"
          : "round-pill";

      button.textContent = `Round ${index + 1}`;

      button.addEventListener("click", () => {
        setRound(index + 1);
        render();
      });

      roundNav.appendChild(button);
    });
  }

  function renderAnswerBoard(currentQuestion) {
    answerBoard.innerHTML = "";

    currentQuestion.answers.forEach((answer, index) => {
      const revealed = Boolean(state.revealed[index]);
      const card = document.createElement("article");

      card.className = [
        "answer-card",
        revealed ? "revealed" : "",
        flashRow === index ? "flash" : ""
      ]
        .filter(Boolean)
        .join(" ");

      card.innerHTML = `
        <div class="row-number">${index + 1}</div>

        <div class="row-bar">
          <span class="row-answer">
            ${revealed ? answer : ""}
          </span>
        </div>

        <div class="row-points">
          ${revealed ? getBoardPointValue(index) : ""}
        </div>

        <button
          type="button"
          class="reveal-btn"
          ${revealed ? "disabled" : ""}
        >
          ${revealed ? "Revealed" : "Reveal"}
        </button>
      `;

      card
        .querySelector(".reveal-btn")
        .addEventListener("click", () => revealBoardAnswer(index));

      answerBoard.appendChild(card);
    });
  }

  function renderScoreboard() {
    teamScores.innerHTML = "";

    teams.forEach((team) => {
      const score = state.scores[team] || 0;
      const strikes = state.strikes[team] || 0;
      const locked = strikes >= 3;

      const card = document.createElement("article");
      card.className = locked
        ? "team-score-card team-locked"
        : "team-score-card";

      card.innerHTML = `
        <div class="team-topline">
          <div>
            <div class="team-name">${team} Crew</div>
            ${
              locked
                ? '<div class="team-lock-label">LOCKED — 3 STRIKES</div>'
                : ""
            }
          </div>

          <div class="score-pill">${score}</div>
        </div>

        <div class="strike-row" aria-label="${strikes} strikes">
          ${Array.from({ length: 3 }, (_, index) => {
            return `
              <span class="strike-slot ${index < strikes ? "active" : ""}">
                X
              </span>
            `;
          }).join("")}
        </div>

        <div class="score-controls">
          ${awardValues
            .map(
              (points) => `
                <button
                  type="button"
                  class="score-btn"
                  data-action="points"
                  data-points="${points}"
                >
                  +${points}
                </button>
              `
            )
            .join("")}
        </div>

        <div class="strike-controls">
          <button
            type="button"
            class="strike-btn"
            data-action="strike"
            ${locked ? "disabled" : ""}
          >
            Add Strike
          </button>

          <button
            type="button"
            class="strike-btn clear"
            data-action="clear-strikes"
          >
            Clear Strikes
          </button>
        </div>
      `;

      card.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", () => {
          state = getState();

          const scores = { ...state.scores };
          const nextStrikes = { ...state.strikes };

          if (button.dataset.action === "points") {
            const points = Number(button.dataset.points);
            scores[team] = (scores[team] || 0) + points;
          }

          if (button.dataset.action === "strike") {
            nextStrikes[team] = Math.min(
              3,
              (nextStrikes[team] || 0) + 1
            );
          }

          if (button.dataset.action === "clear-strikes") {
            nextStrikes[team] = 0;
          }

          setState({
            scores,
            strikes: nextStrikes
          });

          render();
        });
      });

      teamScores.appendChild(card);
    });
  }

  function approveTransmission(transmissionId, points) {
    const transmissions = getTransmissions();

    const transmission = transmissions.find(
      (item) => String(item.id) === String(transmissionId)
    );

    if (!transmission || transmission.status !== "pending") {
      return;
    }

    transmission.status = "approved";
    transmission.pointsAwarded = points;
    transmission.approvedAt = new Date().toISOString();

    saveTransmissions(transmissions);

    state = getState();

    const scores = { ...state.scores };
    scores[transmission.teamName] =
      (scores[transmission.teamName] || 0) + points;

    const currentQuestion =
      missionQuestions[state.questionIndex] || missionQuestions[0];

    const revealed = { ...state.revealed };

    const matchIndex = findMatchingAnswerIndex(
      transmission.answer,
      currentQuestion.answers
    );

    if (matchIndex !== -1) {
      revealed[matchIndex] = true;
      flashRow = matchIndex;
      showRevealBanner(`${transmission.teamName} CREW — +${points}`);

      window.setTimeout(() => {
        if (flashRow === matchIndex) {
          flashRow = null;
          render();
        }
      }, 1000);
    } else {
      showRevealBanner(`${transmission.teamName} CREW — +${points}`);
    }

    setState({
      scores,
      revealed
    });

    render();
  }

  function rejectTransmission(transmissionId) {
    const transmissions = getTransmissions();

    const transmission = transmissions.find(
      (item) => String(item.id) === String(transmissionId)
    );

    if (!transmission || transmission.status !== "pending") {
      return;
    }

    transmission.status = "rejected";
    transmission.pointsAwarded = 0;
    transmission.approvedAt = new Date().toISOString();

    saveTransmissions(transmissions);

    state = getState();

    const strikes = { ...state.strikes };

    strikes[transmission.teamName] = Math.min(
      3,
      (strikes[transmission.teamName] || 0) + 1
    );

    setState({ strikes });

    showRevealBanner(`${transmission.teamName} CREW — X`);

    render();
  }

  function renderPendingTransmissions() {
    const pending = getPendingTransmissions();

    transmissionsList.innerHTML = "";

    if (pending.length === 0) {
      transmissionsList.innerHTML = `
        <p class="empty-note">
          No pending crew transmissions.
        </p>
      `;
      return;
    }

    pending.forEach((transmission) => {
      const card = document.createElement("article");
      card.className = "transmission-card";

      card.innerHTML = `
        <div class="transmission-topline">
          <strong>${transmission.teamName} Crew</strong>
          <span>Round ${transmission.round}</span>
        </div>

        <p class="student-answer-text">
          “${transmission.answer}”
        </p>

        <div class="approval-row">
          ${awardValues
            .map(
              (points) => `
                <button
                  type="button"
                  class="award-btn"
                  data-id="${transmission.id}"
                  data-points="${points}"
                >
                  +${points}
                </button>
              `
            )
            .join("")}

          <button
            type="button"
            class="reject-btn"
            data-id="${transmission.id}"
          >
            X
          </button>
        </div>
      `;

      card.querySelectorAll(".award-btn").forEach((button) => {
        button.addEventListener("click", () => {
          approveTransmission(
            button.dataset.id,
            Number(button.dataset.points)
          );
        });
      });

      card
        .querySelector(".reject-btn")
        .addEventListener("click", () => {
          rejectTransmission(transmission.id);
        });

      transmissionsList.appendChild(card);
    });
  }

  function renderApprovedResponses() {
    const approved = getApprovedTransmissions()
      .slice()
      .reverse()
      .slice(0, 12);

    approvedList.innerHTML = "";

    if (approved.length === 0) {
      approvedList.innerHTML = `
        <p class="empty-note">
          No approved responses yet.
        </p>
      `;
      return;
    }

    approved.forEach((transmission) => {
      const card = document.createElement("article");

      card.className =
        transmission.status === "rejected"
          ? "approved-card rejected"
          : "approved-card";

      card.innerHTML = `
        <strong>${transmission.teamName} Crew</strong>

        <span>${transmission.answer}</span>

        <b>
          ${
            transmission.status === "rejected"
              ? "X"
              : `+${transmission.pointsAwarded}`
          }
        </b>
      `;

      approvedList.appendChild(card);
    });
  }

  function render() {
    state = getState();

    const currentQuestion =
      missionQuestions[state.questionIndex] || missionQuestions[0];

    roundLabel.textContent = `Round ${state.round}`;
    questionBox.textContent = currentQuestion.prompt;
    timerDisplay.textContent = formatTime(state.timer);

    totalPointsDisplay.textContent = calculateBoardPoints(
      currentQuestion,
      state.revealed || {}
    );

    winnerBox.textContent = state.winner
      ? `Winner: ${state.winner} Crew`
      : "Mission in progress";

    renderRoundNavigation();
    renderAnswerBoard(currentQuestion);
    renderPendingTransmissions();
    renderApprovedResponses();
    renderScoreboard();
  }

  async function runLaunchSequence() {
    if (launchOverlay.classList.contains("active")) {
      return;
    }

    launchOverlay.classList.remove("hidden", "closing");
    launchOverlay.classList.add("active");

    launchChecklist.innerHTML = "";
    launchCountdown.textContent = "";
    launchFinal.classList.remove("show");

    launchTitle.textContent = "STARBASE MISSION CONTROL";
    launchSubtitle.textContent = "Initializing Flight Feud";

    startMissionBtn.disabled = true;

    const checklistItems = [
      "Systems Online",
      "Projector Connected",
      "Student Consoles Ready",
      "Mission Clock Ready",
      "Flight Feud Loaded"
    ];

    for (const item of checklistItems) {
      const row = document.createElement("div");

      row.className = "launch-check-item";
      row.textContent = `✓ ${item}`;

      launchChecklist.appendChild(row);

      await wait(450);

      row.classList.add("show");
    }

    for (let count = 5; count >= 1; count -= 1) {
      launchCountdown.textContent = count;
      launchCountdown.classList.add("show");

      await wait(650);

      launchCountdown.classList.remove("show");
    }

    launchCountdown.textContent = "";
    launchFinal.classList.add("show");

    await wait(1000);

    launchOverlay.classList.add("closing");

    await wait(650);

    launchOverlay.classList.remove("active", "closing");
    launchOverlay.classList.add("hidden");

    startMissionBtn.disabled = false;

    setState({
      timer: 60,
      timerRunning: true,
      winner: ""
    });

    render();
  }

  nextRoundBtn.addEventListener("click", () => {
    state = getState();

    const nextRound =
      state.round < missionQuestions.length
        ? state.round + 1
        : 1;

    setRound(nextRound);
    render();
  });

  resetGameBtn.addEventListener("click", () => {
    const confirmed = window.confirm(
      "Reset all scores, strikes, answers, and transmissions?"
    );

    if (!confirmed) {
      return;
    }

    resetGameState();
    render();
  });

  winnerBtn.addEventListener("click", () => {
    state = getState();

    const winner = [...teams].sort(
      (a, b) =>
        (state.scores[b] || 0) - (state.scores[a] || 0)
    )[0];

    setState({ winner });

    showRevealBanner(`${winner} CREW WINS!`);

    render();
  });

  startMissionBtn.addEventListener("click", runLaunchSequence);

  timerStartBtn.addEventListener("click", () => {
    setState({ timerRunning: true });
    render();
  });

  timerPauseBtn.addEventListener("click", () => {
    setState({ timerRunning: false });
    render();
  });

  timerResetBtn.addEventListener("click", () => {
    setState({
      timer: 60,
      timerRunning: false
    });

    render();
  });

  window.addEventListener("storage", render);

  window.setInterval(() => {
    const current = getState();

    if (current.timerRunning && current.timer > 0) {
      setState({
        timer: current.timer - 1
      });
    }

    if (current.timerRunning && current.timer <= 1) {
      setState({
        timer: 0,
        timerRunning: false
      });
    }

    render();
  }, 1000);

  render();
});