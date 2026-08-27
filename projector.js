document.addEventListener("DOMContentLoaded", () => {
  const projectorRound =
    document.getElementById("projectorRound");

  const projectorTimer =
    document.getElementById("projectorTimer");

  const projectorBoardPoints =
    document.getElementById("projectorBoardPoints");

  const projectorQuestion =
    document.getElementById("projectorQuestion");

  const projectorAnswerBoard =
    document.getElementById("projectorAnswerBoard");

  const projectorScores =
    document.getElementById("projectorScores");

  const projectorRevealBanner =
    document.getElementById("projectorRevealBanner");

  const projectorStrikeOverlay =
    document.getElementById("projectorStrikeOverlay");

  const projectorWinnerOverlay =
    document.getElementById("projectorWinnerOverlay");

  const projectorWinnerCrewName =
    document.getElementById("projectorWinnerCrewName");

  const projectorWinnerFinalScore =
    document.getElementById("projectorWinnerFinalScore");

  const boardPointValues = [28, 22, 18, 12, 8, 5];

  let lastRevealedSnapshot = "";
  let lastWinner = "";
  let lastStrikeSnapshot = "";
  let lastCelebratedRound = "";

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
    projectorRevealBanner.textContent = message;
    projectorRevealBanner.classList.remove("show");

    void projectorRevealBanner.offsetWidth;

    projectorRevealBanner.classList.add("show");

    window.setTimeout(() => {
      projectorRevealBanner.classList.remove("show");
    }, 1400);
  }

  function showProjectorStrike(teamName) {
    if (!projectorStrikeOverlay) {
      return;
    }

    const message =
      projectorStrikeOverlay.querySelector("p");

    if (message) {
      message.textContent =
        `${teamName.toUpperCase()} CREW STRIKE`;
    }

    document.body.classList.remove("strike-shake");

    void document.body.offsetWidth;

    document.body.classList.add("strike-shake");

    projectorStrikeOverlay.classList.remove(
      "hidden",
      "show"
    );

    projectorStrikeOverlay.style.display = "grid";
    projectorStrikeOverlay.style.visibility = "visible";
    projectorStrikeOverlay.style.opacity = "1";

    void projectorStrikeOverlay.offsetWidth;

    projectorStrikeOverlay.classList.add("show");

    window.setTimeout(() => {
      projectorStrikeOverlay.classList.remove("show");
      projectorStrikeOverlay.style.opacity = "0";

      document.body.classList.remove("strike-shake");

      window.setTimeout(() => {
        projectorStrikeOverlay.style.display = "none";
        projectorStrikeOverlay.classList.add("hidden");
      }, 250);
    }, 1500);
  }

  function renderAnswerBoard(state, question) {
    projectorAnswerBoard.innerHTML = "";

    question.answers.forEach((answer, index) => {
      const isRevealed =
        Boolean(state.revealed[index]);

      const card =
        document.createElement("article");

      card.className = [
        "answer-card",
        isRevealed ? "revealed" : "hidden-answer"
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
      `;

      projectorAnswerBoard.appendChild(card);
    });
  }

  function renderScores(state) {
    projectorScores.innerHTML = "";

    teams.forEach((team) => {
      const score =
        state.scores[team] || 0;

      const strikes =
        state.strikes[team] || 0;

      const card =
        document.createElement("article");

      card.className = "projector-score-card";

      card.innerHTML = `
        <div>
          <strong>${team} Crew</strong>
          <div class="projector-strikes">
            ${Array.from(
              { length: 3 },
              (_, index) => `
                <span class="${
                  index < strikes ? "active" : ""
                }">
                  X
                </span>
              `
            ).join("")}
          </div>
        </div>

        <div class="projector-score-value">
          ${score}
        </div>
      `;

      projectorScores.appendChild(card);
    });
  }

  function detectRevealEffects(state, question) {
    const revealedKeys =
      Object.keys(state.revealed || {})
        .filter(
          (key) => Boolean(state.revealed[key])
        )
        .sort();

    const snapshot =
      revealedKeys.join(",");

    if (
      lastRevealedSnapshot &&
      snapshot !== lastRevealedSnapshot
    ) {
      const previousKeys =
        lastRevealedSnapshot
          .split(",")
          .filter(Boolean);

      const newKey =
        revealedKeys.find(
          (key) => !previousKeys.includes(key)
        );

      if (newKey !== undefined) {
        const index = Number(newKey);

        const answer =
          question.answers[index];

        showRevealBanner(
          `${answer.toUpperCase()} — ${getBoardPointValue(index)}`
        );

        window.setTimeout(() => {
          const card =
            projectorAnswerBoard.children[index];

          if (card) {
            card.classList.add("flip-reveal");

            window.setTimeout(() => {
              card.classList.remove("flip-reveal");
            }, 1000);
          }
        }, 50);
      }
    }

    lastRevealedSnapshot = snapshot;
  }

  function detectStrikeEffects(state) {
    const snapshot =
      teams
        .map(
          (team) =>
            `${team}:${state.strikes[team] || 0}`
        )
        .join("|");

    if (
      lastStrikeSnapshot &&
      snapshot !== lastStrikeSnapshot
    ) {
      const previous =
        Object.fromEntries(
          lastStrikeSnapshot
            .split("|")
            .map((item) => {
              const [team, value] =
                item.split(":");

              return [team, Number(value)];
            })
        );

      const changedTeam =
        teams.find(
          (team) =>
            (state.strikes[team] || 0) >
            (previous[team] || 0)
        );

      if (changedTeam) {
        showProjectorStrike(changedTeam);
      }
    }

    lastStrikeSnapshot = snapshot;
  }

  function renderWinner(state) {
    if (!state.winner) {
      lastWinner = "";

      projectorWinnerOverlay.classList.remove("show");
      projectorWinnerOverlay.classList.add("hidden");
      projectorWinnerOverlay.style.display = "none";

      return;
    }

    if (state.winner === lastWinner) {
      return;
    }

    lastWinner = state.winner;

    projectorWinnerCrewName.textContent =
      `${state.winner.toUpperCase()} CREW`;

    projectorWinnerFinalScore.textContent =
      state.scores[state.winner] || 0;

    projectorWinnerOverlay.classList.remove(
      "hidden",
      "show"
    );

    projectorWinnerOverlay.style.display = "grid";
    projectorWinnerOverlay.style.visibility = "visible";

    void projectorWinnerOverlay.offsetWidth;

    projectorWinnerOverlay.classList.add("show");
  }

  function launchProjectorConfetti() {
  const colors = [
    "#ffd54f",
    "#4dc3ff",
    "#7cff8a",
    "#ff4d5a",
    "#ffffff"
  ];

  for (let i = 0; i < 120; i += 1) {
    const piece =
      document.createElement("div");

    piece.className = "confetti-piece";

    piece.style.left =
      `${Math.random() * 100}vw`;

    piece.style.background =
      colors[
        Math.floor(
          Math.random() * colors.length
        )
      ];

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
  function detectRoundComplete(
  state,
  question
) {
  const revealed =
    state.revealed || {};

  const allAnswersRevealed =
    question.answers.every(
      (_, index) =>
        Boolean(revealed[index])
    );

  const roundKey =
    `${state.sessionId || "game"}-${state.round}`;

  if (
    allAnswersRevealed &&
    lastCelebratedRound !== roundKey
  ) {
    lastCelebratedRound = roundKey;

    window.setTimeout(() => {
      launchProjectorConfetti();

      showRevealBanner(
        "ROUND COMPLETE!"
      );
    }, 1800);
  }

  /*
    New/cleared round:
    allow celebration again.
  */
  if (
    !allAnswersRevealed &&
    lastCelebratedRound === roundKey
  ) {
    lastCelebratedRound = "";
  }
}
  function renderProjector() {
    const state =
      getState();

    const question =
      missionQuestions[state.questionIndex] ||
      missionQuestions[0];

    projectorRound.textContent =
      state.round;

    projectorTimer.textContent =
      formatTime(state.timer);

    projectorBoardPoints.textContent =
      calculateBoardPoints(
        question,
        state.revealed || {}
      );

    projectorQuestion.textContent =
      question.prompt;

 renderAnswerBoard(state, question);
renderScores(state);
detectRevealEffects(state, question);
detectStrikeEffects(state);
detectRoundComplete(state, question);
renderWinner(state);
  }

  window.addEventListener(
    "storage",
    renderProjector
  );

  window.setInterval(
    renderProjector,
    500
  );

  renderProjector();
});
