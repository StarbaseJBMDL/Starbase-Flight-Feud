document.addEventListener("DOMContentLoaded", () => {
  /* =========================================
     PAGE ELEMENTS
  ========================================= */

  const roundLabel = document.getElementById("currentRoundLabel");
  const questionBox = document.getElementById("questionBox");
  const answerBoard = document.getElementById("answerBoard");
  const teamScores = document.getElementById("teamScores");
  const timerDisplay = document.getElementById("timerDisplay");
  const roundNav = document.getElementById("roundNav");
  const totalPointsDisplay = document.getElementById("totalPointsDisplay");
  const revealBanner = document.getElementById("revealBanner");
  const winnerBox = document.getElementById("winnerBox");
  const winnerOverlay =
  document.getElementById("winnerOverlay");

const winnerCrewName =
  document.getElementById("winnerCrewName");

const winnerFinalScore =
  document.getElementById("winnerFinalScore");

const closeWinnerBtn =
  document.getElementById("closeWinnerBtn");

  const pendingCount = document.getElementById("pendingCount");
  const approvedWaitingCount =
    document.getElementById("approvedWaitingCount");

  const transmissionsList =
    document.getElementById("transmissionsList");

  const approvedWaitingList =
    document.getElementById("approvedWaitingList");

  const revealedList =
    document.getElementById("revealedList");

  const launchAnswerBtn =
    document.getElementById("launchAnswerBtn");

  const nextRoundBtn =
    document.getElementById("nextRoundBtn");

  const resetGameBtn =
    document.getElementById("resetGameBtn");

  const winnerBtn =
    document.getElementById("winnerBtn");

  const startMissionBtn =
    document.getElementById("startMissionBtn");

  const timerStartBtn =
    document.getElementById("timerStartBtn");

  const timerPauseBtn =
    document.getElementById("timerPauseBtn");

  const timerResetBtn =
    document.getElementById("timerResetBtn");

  const strikeOverlay =
    document.getElementById("strikeOverlay");

  const answerLaunchOverlay =
    document.getElementById("answerLaunchOverlay");

  const answerLaunchTitle =
    document.getElementById("answerLaunchTitle");

  const answerLaunchCountdown =
    document.getElementById("answerLaunchCountdown");

  const answerLaunchFinal =
    document.getElementById("answerLaunchFinal");

  const launchOverlay =
    document.getElementById("launchOverlay");

  const launchTitle =
    document.getElementById("launchTitle");

  const launchSubtitle =
    document.getElementById("launchSubtitle");

  const launchChecklist =
    document.getElementById("launchChecklist");

  const launchCountdown =
    document.getElementById("launchCountdown");

  const launchFinal =
    document.getElementById("launchFinal");
     /* =========================================
     GAME AUDIO
  ========================================= */

  const dingSound =
    document.getElementById("dingSound");

  const strikeSound =
    document.getElementById("strikeSound");

  const countdownSound =
    document.getElementById("countdownSound");

  const applauseSound =
    document.getElementById("applauseSound");

  const winnerSound =
    document.getElementById("winnerSound"); 

  const awardValues = [5, 12, 18, 22, 28];
  const boardPointValues = [28, 22, 18, 12, 8, 5];

  let state = getState();
  let flashRow = null;
  let bannerTimer = null;
  let launchInProgress = false;

  /* =========================================
     GENERAL HELPERS
  ========================================= */
  function playSound(sound, volume = 1) {
    if (!sound) {
      return;
    }

    sound.pause();
    sound.currentTime = 0;
    sound.volume = volume;

    const playPromise = sound.play();

    if (playPromise) {
      playPromise.catch((error) => {
        console.warn("Sound could not play:", error);
      });
    }
    }

    function launchConfetti() {
  const colors = [
    "#ffd54f",
    "#4dc3ff",
    "#7cff8a",
    "#ff4d5a",
    "#ffffff"
  ];

  for (let i = 0; i < 90; i += 1) {
    const piece = document.createElement("div");

    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background =
      colors[Math.floor(Math.random() * colors.length)];

    piece.style.animationDuration =
      `${2.2 + Math.random() * 2.2}s`;

    piece.style.animationDelay =
      `${Math.random() * 0.5}s`;

    document.body.appendChild(piece);

    window.setTimeout(() => {
      piece.remove();
    }, 5000);
  }
}

window.launchConfetti = launchConfetti;

function checkRoundComplete(revealedState) {
  const currentState = getState();

  const question =
    missionQuestions[currentState.questionIndex] ||
    missionQuestions[0];

  const allAnswersRevealed =
    question.answers.every((_, index) =>
      Boolean(revealedState[index])
    );

  if (allAnswersRevealed) {
    window.setTimeout(() => {
      showRevealBanner("ROUND COMPLETE!");
    }, 1800);
  }
}

  function wait(milliseconds) {
    return new Promise((resolve) => {
      window.setTimeout(resolve, milliseconds);
    });
  }

  function formatTime(totalSeconds) {
    const minutes = String(
      Math.floor(totalSeconds / 60)
    ).padStart(2, "0");

    const seconds = String(
      totalSeconds % 60
    ).padStart(2, "0");

    return `${minutes}:${seconds}`;
  }

  function getBoardPointValue(index) {
    return boardPointValues[index] ?? 5;
  }

  function calculateBoardPoints(question, revealed) {
    return question.answers.reduce(
      (total, answer, index) => {
        if (!revealed[index]) {
          return total;
        }

        return total + getBoardPointValue(index);
      },
      0
    );
  }

  function showRevealBanner(message) {
    revealBanner.textContent = message;
    revealBanner.classList.remove("show");

    void revealBanner.offsetWidth;

    revealBanner.classList.add("show");

    if (bannerTimer) {
      window.clearTimeout(bannerTimer);
    }

    bannerTimer = window.setTimeout(() => {
      revealBanner.classList.remove("show");
    }, 1400);
  }

  function showStrikeOverlay(teamName) {
     playSound(strikeSound, 0.9);

     document.body.classList.remove("strike-shake");
void document.body.offsetWidth;
document.body.classList.add("strike-shake");

window.setTimeout(() => {
  document.body.classList.remove("strike-shake");
}, 500);


    if (!strikeOverlay) {
      return;
    }

    const message = strikeOverlay.querySelector("p");

    if (message) {
      message.textContent =
        `${teamName.toUpperCase()} CREW STRIKE`;
    }

    strikeOverlay.classList.remove("hidden", "show");
    strikeOverlay.style.display = "grid";
    strikeOverlay.style.visibility = "visible";
    strikeOverlay.style.opacity = "1";

    void strikeOverlay.offsetWidth;

    strikeOverlay.classList.add("show");

    window.setTimeout(() => {
      strikeOverlay.classList.remove("show");
      strikeOverlay.style.opacity = "0";

      window.setTimeout(() => {
        strikeOverlay.style.display = "none";
        strikeOverlay.classList.add("hidden");
      }, 250);
    }, 1500);
  }

  /* =========================================
     AUTOMATIC LATE-DUPLICATE STRIKES
  ========================================= */

  function processLateDuplicateAnswers() {
    state = getState();

    const pending = getPendingTransmissions().filter(
      (item) =>
        Number(item.round) === Number(state.round)
    );

    if (pending.length === 0) {
      return;
    }

    const transmissions = getTransmissions();
    const strikes = { ...state.strikes };

    let transmissionsChanged = false;
    let strikesChanged = false;

    pending.forEach((pendingItem) => {
      if (!isAnswerAlreadyRevealed(pendingItem.answer)) {
        return;
      }

      const storedItem = transmissions.find(
        (item) =>
          String(item.id) === String(pendingItem.id)
      );

      if (!storedItem || storedItem.status !== "pending") {
        return;
      }

      storedItem.status = "rejected";
      storedItem.pointsAwarded = 0;
      storedItem.rejectionReason = "already-revealed";
      storedItem.approvedAt = new Date().toISOString();

      strikes[storedItem.teamName] = Math.min(
        3,
        (strikes[storedItem.teamName] || 0) + 1
      );

      transmissionsChanged = true;
      strikesChanged = true;
    });

    if (transmissionsChanged) {
      saveTransmissions(transmissions);
    }

    if (strikesChanged) {
      setState({ strikes });
      state = getState();
    }
  }

  /* =========================================
     ANSWER BOARD
  ========================================= */

  function renderAnswerBoard(currentQuestion) {
    answerBoard.innerHTML = "";

    currentQuestion.answers.forEach(
      (answer, index) => {
        const isRevealed =
          Boolean(state.revealed[index]);

        const card =
          document.createElement("article");

        card.className = [
  "answer-card",
  isRevealed ? "revealed" : "hidden-answer",
  flashRow === index ? "flip-reveal" : ""
]
  .filter(Boolean)
  .join(" ");
card.innerHTML = `
  <div class="answer-card-inner">
    <div class="answer-card-face answer-card-front">
      <div class="row-number">${index + 1}</div>

      <div class="row-bar hidden-row-bar">
        <span class="hidden-answer-mark">
          ${index + 1}
        </span>
      </div>

      <div class="row-points hidden-points"></div>
    </div>

    <div class="answer-card-face answer-card-back">
      <div class="row-number">${index + 1}</div>

      <div class="row-bar">
        <span class="row-answer">
          ${answer}
        </span>
      </div>

      <div class="row-points">
        ${getBoardPointValue(index)}
      </div>
    </div>
  </div>

  <button
    type="button"
    class="reveal-btn"
    data-answer-index="${index}"
    ${isRevealed ? "disabled" : ""}
  >
    ${isRevealed ? "Revealed" : "Manual Reveal"}
  </button>
`;

        card
          .querySelector(".reveal-btn")
          .addEventListener("click", () => {
            manuallyRevealAnswer(index);
          });

        answerBoard.appendChild(card);
      }
    );
  }

  function manuallyRevealAnswer(answerIndex) {
    state = getState();

    if (state.revealed[answerIndex]) {
      return;
    }

    const revealed = {
      ...state.revealed,
      [answerIndex]: true
    };

    setState({ revealed });

checkRoundComplete(revealed);

flashRow = answerIndex;

    showRevealBanner("ANSWER REVEALED");

    render();

    window.setTimeout(() => {
      flashRow = null;
      render();
    }, 1000);
  }

  /* =========================================
     ROUND NAVIGATION
  ========================================= */

  function renderRoundNavigation() {
    roundNav.innerHTML = "";

    missionQuestions.forEach(
      (question, index) => {
        const button =
          document.createElement("button");

        button.type = "button";

        button.className =
          state.questionIndex === index
            ? "round-pill active"
            : "round-pill";

        button.textContent =
          `Round ${index + 1}`;

        button.addEventListener("click", () => {
          setRound(index + 1);
          render();
        });

        roundNav.appendChild(button);
      }
    );
  }

  /* =========================================
     SCOREBOARD
  ========================================= */

  function renderScoreboard() {
    teamScores.innerHTML = "";

    teams.forEach((team) => {
      const score = state.scores[team] || 0;
      const strikes = state.strikes[team] || 0;
      const locked = strikes >= 3;

      const card =
        document.createElement("article");

      card.className = locked
        ? "team-score-card team-locked"
        : "team-score-card";

      card.innerHTML = `
        <div class="team-topline">
          <div>
            <div class="team-name">
              ${team} Crew
            </div>

            ${
              locked
                ? `
                  <div class="team-lock-label">
                    LOCKED — 3 STRIKES
                  </div>
                `
                : ""
            }
          </div>

          <div class="score-pill">${score}</div>
        </div>

        <div class="strike-row">
          ${Array.from(
            { length: 3 },
            (_, index) => `
              <span
                class="strike-slot ${
                  index < strikes ? "active" : ""
                }"
              >
                X
              </span>
            `
          ).join("")}
        </div>

        <div class="score-controls">
          ${awardValues
            .map(
              (points) => `
                <button
                  type="button"
                  class="score-btn"
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
            class="strike-btn add-strike-btn"
            ${locked ? "disabled" : ""}
          >
            Add Strike
          </button>

          <button
            type="button"
            class="strike-btn clear"
          >
            Clear Strikes
          </button>
        </div>
      `;

      card
        .querySelectorAll(".score-btn")
        .forEach((button) => {
          button.addEventListener("click", () => {
            const points =
              Number(button.dataset.points);

            const scores = {
              ...getState().scores
            };

            scores[team] =
              (scores[team] || 0) + points;

            setState({ scores });
            render();
          });
        });

      card
        .querySelector(".add-strike-btn")
        .addEventListener("click", () => {
          const current = getState();
          const strikes = {
            ...current.strikes
          };

          strikes[team] = Math.min(
            3,
            (strikes[team] || 0) + 1
          );

          setState({ strikes });
          showStrikeOverlay(team);
          render();
        });

      card
        .querySelector(".strike-btn.clear")
        .addEventListener("click", () => {
          const current = getState();
          const strikes = {
            ...current.strikes
          };

          strikes[team] = 0;

          setState({ strikes });
          render();
        });

      teamScores.appendChild(card);
    });
  }

  /* =========================================
     APPROVE / REJECT TRANSMISSIONS
  ========================================= */

  function approveTransmission(
    transmissionId,
    points
  ) {
    const transmissions = getTransmissions();

    const transmission = transmissions.find(
      (item) =>
        String(item.id) === String(transmissionId)
    );

    if (
      !transmission ||
      transmission.status !== "pending"
    ) {
      return;
    }

    const current = getState();

    const answerIndex = findBoardAnswerIndex(
      transmission.answer,
      current.questionIndex
    );

    if (answerIndex === -1) {
      const continueApproval = window.confirm(
        `"${transmission.answer}" does not exactly match a board answer. Approve it anyway? It will not be launchable.`
      );

      if (!continueApproval) {
        return;
      }
    }

    transmission.status = "approved";
    transmission.pointsAwarded = points;
    transmission.boardAnswerIndex =
      answerIndex === -1 ? null : answerIndex;

    transmission.approvedAt =
      new Date().toISOString();

    saveTransmissions(transmissions);

    const scores = {
      ...current.scores
    };

    scores[transmission.teamName] =
      (scores[transmission.teamName] || 0) +
      points;

    setState({ scores });

    showRevealBanner(
      `${transmission.teamName.toUpperCase()} APPROVED +${points}`
    );

    render();
  }

  function rejectTransmission(transmissionId) {
    const transmissions = getTransmissions();

    const transmission = transmissions.find(
      (item) =>
        String(item.id) === String(transmissionId)
    );

    if (
      !transmission ||
      transmission.status !== "pending"
    ) {
      return;
    }

    transmission.status = "rejected";
    transmission.pointsAwarded = 0;
    transmission.rejectionReason = "incorrect";
    transmission.approvedAt =
      new Date().toISOString();

    saveTransmissions(transmissions);

    const current = getState();

    const strikes = {
      ...current.strikes
    };

    strikes[transmission.teamName] = Math.min(
      3,
      (strikes[transmission.teamName] || 0) + 1
    );

    setState({ strikes });

    showStrikeOverlay(transmission.teamName);
    render();
  }

  /* =========================================
     PENDING TRANSMISSIONS
  ========================================= */

  function renderPendingTransmissions() {
    const pending = getPendingTransmissions()
      .filter(
        (item) =>
          Number(item.round) === Number(state.round)
      )
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() -
          new Date(b.timestamp).getTime()
      );

    pendingCount.textContent =
      `${pending.length} Pending`;

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
      const card =
        document.createElement("article");

      card.className = "transmission-card";

      card.innerHTML = `
        <div class="transmission-topline">
          <strong>
            ${transmission.teamName} Crew
          </strong>

          <span>
            Round ${transmission.round}
          </span>
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
          >
            X
          </button>
        </div>
      `;

      card
        .querySelectorAll(".award-btn")
        .forEach((button) => {
          button.addEventListener("click", () => {
            approveTransmission(
              transmission.id,
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

  /* =========================================
     APPROVED — WAITING TO REVEAL
  ========================================= */

  function getLaunchableGroups() {
    const approved =
      getApprovedWaitingTransmissions()
        .filter(
          (item) =>
            Number(item.round) ===
              Number(state.round) &&
            Number.isInteger(item.boardAnswerIndex) &&
            !state.revealed[item.boardAnswerIndex]
        )
        .sort(
          (a, b) =>
            new Date(a.approvedAt).getTime() -
            new Date(b.approvedAt).getTime()
        );

    const groups = new Map();

    approved.forEach((item) => {
      const key = String(item.boardAnswerIndex);

      if (!groups.has(key)) {
        groups.set(key, []);
      }

      groups.get(key).push(item);
    });

    return [...groups.values()];
  }

 function renderApprovedWaiting() {
  const groups = getLaunchableGroups();

  const approvedCount = groups.reduce(
    (total, group) => total + group.length,
    0
  );

  approvedWaitingCount.textContent =
    `${approvedCount} Waiting`;

  approvedWaitingList.innerHTML = "";

  if (groups.length === 0) {
    approvedWaitingList.innerHTML = `
      <p class="empty-note">
        No approved answers waiting.
      </p>
    `;

    launchAnswerBtn.disabled = true;
    return;
  }

  groups.forEach((group, groupIndex) => {
    const firstTransmission = group[0];
    const answerIndex = firstTransmission.boardAnswerIndex;

    const boardAnswer =
      missionQuestions[state.questionIndex]
        .answers[answerIndex];

    const card = document.createElement("article");

    card.className =
      groupIndex === 0
        ? "reveal-group-card next-to-launch"
        : "reveal-group-card";

    card.innerHTML = `
      <div class="reveal-group-header">
        <div>
          <span class="reveal-group-label">
            ${groupIndex === 0 ? "NEXT TO LAUNCH" : "WAITING"}
          </span>

          <h3>${boardAnswer}</h3>
        </div>

        <span class="team-count-badge">
          ${group.length}
          ${group.length === 1 ? "Crew" : "Crews"}
        </span>
      </div>

      <div class="reveal-group-teams">
        ${group
          .map(
            (transmission) => `
              <div class="reveal-team-row">
                <span>${transmission.teamName} Crew</span>
                <strong>+${transmission.pointsAwarded}</strong>
              </div>
            `
          )
          .join("")}
      </div>
    `;

    approvedWaitingList.appendChild(card);
  });

  launchAnswerBtn.disabled = launchInProgress;
}

  /* =========================================
     LAUNCH NEXT ANSWER
  ========================================= */

  async function launchNextAnswer() {
    if (launchInProgress) {
      return;
    }

    state = getState();

    const groups = getLaunchableGroups();

    if (groups.length === 0) {
      window.alert(
        "There are no launchable approved answers."
      );

      return;
    }

    const group = groups[0];
    const answerIndex =
      group[0].boardAnswerIndex;

    const boardAnswer =
      missionQuestions[state.questionIndex]
        .answers[answerIndex];
        const matchingPending = getPendingTransmissions().filter(
  (item) =>
    Number(item.round) === Number(state.round) &&
    findBoardAnswerIndex(
      item.answer,
      state.questionIndex
    ) === answerIndex
);

if (matchingPending.length > 0) {
  window.alert(
    `There ${
      matchingPending.length === 1 ? "is" : "are"
    } still ${matchingPending.length} pending response${
      matchingPending.length === 1 ? "" : "s"
    } matching "${boardAnswer}". Approve or reject every matching response before launching this answer.`
  );

  return;
}

    launchInProgress = true;
    launchAnswerBtn.disabled = true;

    answerLaunchOverlay.classList.remove(
      "hidden",
      "show"
    );

    answerLaunchOverlay.style.display = "grid";
    answerLaunchOverlay.style.visibility =
      "visible";

    answerLaunchOverlay.classList.add("show");

   answerLaunchTitle.textContent =
  "Verifying Transmission";

    answerLaunchFinal.classList.remove("show");
    answerLaunchCountdown.textContent = "";

    for (let count = 3; count >= 1; count -= 1) {
      const countdownBeep = new Audio("sounds/countdown.mp3");
countdownBeep.volume = 0.75;
countdownBeep.play().catch((error) => {
  console.warn("Countdown sound could not play:", error);
});

      answerLaunchCountdown.textContent =
        String(count);

      answerLaunchCountdown.classList.remove(
        "show"
      );

      void answerLaunchCountdown.offsetWidth;

      answerLaunchCountdown.classList.add("show");

      await wait(1000);
    }

    answerLaunchCountdown.textContent = "";
    answerLaunchFinal.textContent =
  "Answer Confirmed";

    answerLaunchFinal.classList.add("show");

    await wait(550);

    const revealed = {
      ...state.revealed,
      [answerIndex]: true
    };

   setState({ revealed });

checkRoundComplete(revealed);

playSound(dingSound, 0.9);

window.setTimeout(() => {
  playSound(applauseSound, 0.55);
}, 900);

const transmissions = getTransmissions();
    const groupIds = new Set(
      group.map((item) => String(item.id))
    );

    transmissions.forEach((item) => {
      if (groupIds.has(String(item.id))) {
        item.status = "revealed";
        item.revealedAt =
          new Date().toISOString();
      }
    });

    saveTransmissions(transmissions);

    flashRow = answerIndex;

    showRevealBanner(
      `${boardAnswer.toUpperCase()} — ${getBoardPointValue(answerIndex)}`
    );

    render();

    await wait(650);

    answerLaunchOverlay.classList.remove("show");
    answerLaunchOverlay.classList.add("hidden");
    answerLaunchOverlay.style.display = "none";

    launchInProgress = false;

    window.setTimeout(() => {
      flashRow = null;
      render();
    }, 500);
  }

  /* =========================================
     REVEALED HISTORY
  ========================================= */

  function renderRevealedHistory() {
    const history = getApprovedTransmissions()
      .filter(
        (item) =>
          Number(item.round) === Number(state.round) &&
          (
            item.status === "revealed" ||
            item.status === "rejected"
          )
      )
      .sort((a, b) => {
        const aTime =
          a.revealedAt ||
          a.approvedAt ||
          a.timestamp;

        const bTime =
          b.revealedAt ||
          b.approvedAt ||
          b.timestamp;

        return (
          new Date(bTime).getTime() -
          new Date(aTime).getTime()
        );
      });

    revealedList.innerHTML = "";

    if (history.length === 0) {
      revealedList.innerHTML = `
        <p class="empty-note">
          No answers revealed yet.
        </p>
      `;

      return;
    }

    history.forEach((transmission) => {
      const card =
        document.createElement("article");

      card.className =
        transmission.status === "rejected"
          ? "approved-card rejected"
          : "approved-card";

      const isLateDuplicate =
        transmission.rejectionReason ===
        "already-revealed";

      card.innerHTML = `
        <strong>
          ${transmission.teamName} Crew
        </strong>

        <span>
          ${transmission.answer}
          ${
            isLateDuplicate
              ? "<small>Already revealed</small>"
              : ""
          }
        </span>

        <b>
          ${
            transmission.status === "rejected"
              ? "X"
              : `+${transmission.pointsAwarded}`
          }
        </b>
      `;

      revealedList.appendChild(card);
    });
  }

  /* =========================================
     MAIN RENDER
  ========================================= */

  function render() {
    state = getState();

    processLateDuplicateAnswers();

    state = getState();

    const currentQuestion =
      missionQuestions[state.questionIndex] ||
      missionQuestions[0];

    roundLabel.textContent =
      `Round ${state.round}`;

    questionBox.textContent =
      currentQuestion.prompt;

    timerDisplay.textContent =
      formatTime(state.timer);

    totalPointsDisplay.textContent =
      calculateBoardPoints(
        currentQuestion,
        state.revealed || {}
      );

    winnerBox.textContent =
      state.winner
        ? `Winner: ${state.winner} Crew`
        : "Mission in progress";

    renderRoundNavigation();
    renderAnswerBoard(currentQuestion);
    renderPendingTransmissions();
    renderApprovedWaiting();
    renderRevealedHistory();
    renderScoreboard();
  }

  /* =========================================
     MISSION START SEQUENCE
  ========================================= */

  async function runLaunchSequence() {
    if (launchOverlay.classList.contains("active")) {
      return;
    }

    launchOverlay.classList.remove(
      "hidden",
      "closing"
    );

    launchOverlay.classList.add("active");

    launchChecklist.innerHTML = "";
    launchCountdown.textContent = "";
    launchFinal.classList.remove("show");

    launchTitle.textContent =
      "STARBASE MISSION CONTROL";

    launchSubtitle.textContent =
      "Initializing Flight Feud";

    startMissionBtn.disabled = true;

    const checklistItems = [
      "Systems Online",
      "Projector Connected",
      "Student Consoles Ready",
      "Mission Clock Ready",
      "Flight Feud Loaded"
    ];

    for (const item of checklistItems) {
      const row =
        document.createElement("div");

      row.className =
        "launch-check-item";

      row.textContent = `✓ ${item}`;

      launchChecklist.appendChild(row);

      await wait(450);

      row.classList.add("show");
    }

    for (let count = 5; count >= 1; count -= 1) {
      launchCountdown.textContent =
        String(count);

      launchCountdown.classList.add("show");

      await wait(650);

      launchCountdown.classList.remove("show");
    }

    launchCountdown.textContent = "";
    launchFinal.classList.add("show");

    await wait(1000);

    launchOverlay.classList.add("closing");

    await wait(650);

    launchOverlay.classList.remove(
      "active",
      "closing"
    );

    launchOverlay.classList.add("hidden");

    startMissionBtn.disabled = false;

    setState({
      timer: 60,
      timerRunning: true,
      winner: ""
    });

    render();
  }

  /* =========================================
     CONTROL EVENTS
  ========================================= */

  launchAnswerBtn.addEventListener(
    "click",
    launchNextAnswer
  );

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
      (state.scores[b] || 0) -
      (state.scores[a] || 0)
  )[0];

  const winnerScore =
    state.scores[winner] || 0;

  setState({ winner });

  playSound(winnerSound, 0.8);

  winnerCrewName.textContent =
    `${winner.toUpperCase()} CREW`;

  winnerFinalScore.textContent =
    winnerScore;

  winnerOverlay.classList.remove(
    "hidden",
    "show"
  );

  winnerOverlay.style.display = "grid";
  winnerOverlay.style.visibility = "visible";

  void winnerOverlay.offsetWidth;

  winnerOverlay.classList.add("show");

  launchConfetti();

  showRevealBanner(
    `${winner.toUpperCase()} CREW WINS!`
  );

  render();
});

closeWinnerBtn.addEventListener("click", () => {
  winnerOverlay.classList.remove("show");
  winnerOverlay.classList.add("hidden");
  winnerOverlay.style.display = "none";
});

  startMissionBtn.addEventListener(
    "click",
    runLaunchSequence
  );

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

    if (
      current.timerRunning &&
      current.timer > 0
    ) {
      setState({
        timer: current.timer - 1
      });
    }

    if (
      current.timerRunning &&
      current.timer <= 1
    ) {
      setState({
        timer: 0,
        timerRunning: false
      });
    }

    render();
  }, 1000);

  render();
});