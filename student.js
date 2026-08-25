document.addEventListener("DOMContentLoaded", () => {
  const answerLimitNote =
  document.getElementById("answerLimitNote");
  const crewSelectPanel =
    document.getElementById("crewSelectPanel");

  const crewChoiceGrid =
    document.getElementById("crewChoiceGrid");

  const lockedCrewPanel =
    document.getElementById("lockedCrewPanel");

  const lockedCrewName =
    document.getElementById("lockedCrewName");

  const currentQuestion =
    document.getElementById("currentQuestion");

  const answerInputs =
    document.getElementById("answerInputs");

  const answerLimitDisplay =
    document.getElementById("answerLimitDisplay");

  const submitAnswerBtn =
    document.getElementById("submitAnswerBtn");

  const transmissionMessage =
    document.getElementById("transmissionMessage");

  const studentStatus =
    document.getElementById("studentStatus");

  const strikeOverlay =
    document.getElementById("strikeOverlay");

  const CREW_LOCK_KEY =
    "flight-feud-crew-lock";
    const CREW_SESSION_KEY =
  "flight-feud-crew-session";

  let lastStrikeTransmissionId = null;
  let renderedRound = null;
  let renderedCrew = null;
  let renderedSubmissionCount = null;

  /* =========================================
     CREW LOCK
  ========================================= */
function getLockedCrew() {
  const state = getState();

  const lockedCrew =
    localStorage.getItem(CREW_LOCK_KEY);

  const lockedSession =
    localStorage.getItem(CREW_SESSION_KEY);

  if (!lockedCrew) {
    return null;
  }

  /*
    If Mission Control reset the game,
    the session ID changes.

    That automatically unlocks this device.
  */
  if (
    lockedSession !==
    String(state.sessionId)
  ) {
    localStorage.removeItem(
      CREW_LOCK_KEY
    );

    localStorage.removeItem(
      CREW_SESSION_KEY
    );

    return null;
  }

  return lockedCrew;
}

 function lockCrew(teamName) {
  const existingCrew = getLockedCrew();

  // Once a crew is selected, this device
  // cannot switch crews during the game.
  if (existingCrew) {
    return;
  }

  localStorage.setItem(
    CREW_LOCK_KEY,
    teamName
  );
  const state = getState();

localStorage.setItem(
  CREW_SESSION_KEY,
  String(state.sessionId)
);

  setState({
    selectedTeam: teamName
  });

  // Immediately remove crew selection
  // from the screen.
  crewSelectPanel.classList.add("hidden");
  lockedCrewPanel.classList.remove("hidden");

  renderStudentConsole();
}

  function renderCrewChoices() {
    crewChoiceGrid.innerHTML = "";

   teams.forEach((team) => {
  const button =
    document.createElement("button");

  button.type = "button";
  button.className = "crew-choice-btn";
  button.textContent = `${team} Crew`;

  button.addEventListener("click", () => {
    // Ignore all crew buttons if this
    // device has already selected a crew.
    if (getLockedCrew()) {
      return;
    }

    lockCrew(team);
  });

  crewChoiceGrid.appendChild(button);
});
  }

  /* =========================================
     TRANSMISSION HELPERS
  ========================================= */

  function getCrewRoundTransmissions(
    teamName,
    round
  ) {
    return getTransmissions().filter(
      (item) =>
        String(item.teamName) ===
          String(teamName) &&
        Number(item.round) ===
          Number(round)
    );
  }

  function getSubmissionCount(
    teamName,
    round
  ) {
    return getCrewRoundTransmissions(
      teamName,
      round
    ).length;
  }

  function getRemainingAnswerSlots(
    teamName,
    state,
    question
  ) {
    const submitted =
      getSubmissionCount(
        teamName,
        state.round
      );

    return Math.max(
      0,
      question.answers.length - submitted
    );
  }

  function getLatestCrewTransmission(
    state,
    teamName
  ) {
    return (
      getCrewRoundTransmissions(
        teamName,
        state.round
      )
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() -
            new Date(a.timestamp).getTime()
        )[0] || null
    );
  }

  /* =========================================
     ANSWER INPUTS
  ========================================= */

  function buildAnswerInputs(
    remainingSlots
  ) {
    answerInputs.innerHTML = "";

    for (
      let index = 0;
      index < remainingSlots;
      index += 1
    ) {
      const input =
        document.createElement("input");

      input.type = "text";
      input.className =
        "input-field crew-answer-input";

      input.placeholder =
        `Answer ${index + 1}`;

      input.autocomplete = "off";

      answerInputs.appendChild(input);
    }
  }

  function getEnteredAnswers() {
    return [
      ...answerInputs.querySelectorAll(
        ".crew-answer-input"
      )
    ]
      .map((input) => input.value.trim())
      .filter(Boolean);
  }

  /* =========================================
     STRIKE EFFECT
  ========================================= */

  function showStudentStrikeOverlay(
    teamName
  ) {
    if (!strikeOverlay) {
      return;
    }

    const message =
      strikeOverlay.querySelector("p");

    if (message) {
      message.textContent =
        `${teamName.toUpperCase()} CREW STRIKE`;
    }

    strikeOverlay.classList.remove(
      "hidden",
      "show"
    );

    strikeOverlay.style.display = "grid";
    strikeOverlay.style.visibility =
      "visible";
    strikeOverlay.style.opacity = "1";

    void strikeOverlay.offsetWidth;

    strikeOverlay.classList.add("show");

    window.setTimeout(() => {
      strikeOverlay.classList.remove(
        "show"
      );

      strikeOverlay.style.opacity = "0";

      window.setTimeout(() => {
        strikeOverlay.style.display =
          "none";

        strikeOverlay.classList.add(
          "hidden"
        );
      }, 250);
    }, 1500);
  }

  /* =========================================
     STATUS
  ========================================= */

  function renderTransmissionStatus(
    state,
    teamName
  ) {
    const latestTransmission =
      getLatestCrewTransmission(
        state,
        teamName
      );

    if (!latestTransmission) {
      transmissionMessage.textContent = "";
      transmissionMessage.classList.remove(
        "show"
      );

      return;
    }

    if (
      latestTransmission.status ===
      "pending"
    ) {
      transmissionMessage.textContent =
        "Transmission received by Mission Control.";

      transmissionMessage.classList.add(
        "show"
      );

      return;
    }

    if (
      latestTransmission.status ===
      "approved"
    ) {
      transmissionMessage.textContent =
        "Mission Control approved a transmission.";

      transmissionMessage.classList.add(
        "show"
      );

      return;
    }

    if (
      latestTransmission.status ===
      "revealed"
    ) {
      transmissionMessage.textContent =
        "One of your crew's answers has been revealed.";

      transmissionMessage.classList.add(
        "show"
      );

      return;
    }

    if (
      latestTransmission.status ===
      "rejected"
    ) {
      transmissionMessage.textContent =
        "Mission Control marked a transmission incorrect.";

      transmissionMessage.classList.add(
        "show"
      );

      if (
        lastStrikeTransmissionId !==
        latestTransmission.id
      ) {
        lastStrikeTransmissionId =
          latestTransmission.id;

        showStudentStrikeOverlay(
          teamName
        );
      }
    }
  }

  /* =========================================
     MAIN RENDER
  ========================================= */

  function renderStudentConsole() {
    const state = getState();

    const question =
      missionQuestions[
        state.questionIndex
      ] || missionQuestions[0];

    const lockedCrew =
      getLockedCrew();

    currentQuestion.textContent =
      question.prompt;

    /* No crew selected yet */

    if (!lockedCrew) {
      crewSelectPanel.classList.remove(
        "hidden"
      );

      lockedCrewPanel.classList.add(
        "hidden"
      );

      studentStatus.textContent =
        "SELECT CREW";

      answerInputs.innerHTML = "";

      answerLimitDisplay.textContent =
        `0 of ${question.answers.length} submitted`;

      submitAnswerBtn.disabled = true;

      transmissionMessage.textContent =
        "";

      transmissionMessage.classList.remove(
        "show"
      );

      return;
    }

    /* Crew is locked */

    crewSelectPanel.classList.add(
      "hidden"
    );

    lockedCrewPanel.classList.remove(
      "hidden"
    );

    lockedCrewName.textContent =
      `${lockedCrew.toUpperCase()} CREW`;

    studentStatus.textContent =
      `${lockedCrew.toUpperCase()} READY`;

    const submitted =
      getSubmissionCount(
        lockedCrew,
        state.round
      );

    const maxAnswers =
      question.answers.length;answerLimitNote.textContent =
  `Enter up to ${maxAnswers} answer${
    maxAnswers === 1 ? "" : "s"
  }.`;

    const remainingSlots =
      getRemainingAnswerSlots(
        lockedCrew,
        state,
        question
      );

    answerLimitDisplay.textContent =
      `${submitted} of ${maxAnswers} submitted`;

    /*
      Only rebuild the inputs when something
      important changes. This prevents the
      student's typing from disappearing every
      time the page refreshes its game state.
    */

    if (
      renderedRound !== state.round ||
      renderedCrew !== lockedCrew ||
      renderedSubmissionCount !==
        submitted
    ) {
      buildAnswerInputs(
        remainingSlots
      );

      renderedRound =
        state.round;

      renderedCrew =
        lockedCrew;

      renderedSubmissionCount =
        submitted;
    }

    if (remainingSlots === 0) {
      submitAnswerBtn.disabled = true;

      submitAnswerBtn.textContent =
        "Maximum Answers Submitted";

      studentStatus.textContent =
        `${lockedCrew.toUpperCase()} COMPLETE`;
    } else {
      submitAnswerBtn.disabled = false;

      submitAnswerBtn.textContent =
        remainingSlots === 1
          ? "Transmit Answer"
          : "Transmit Answers";
    }

    renderTransmissionStatus(
      state,
      lockedCrew
    );
  }

  /* =========================================
     SUBMIT ANSWERS
  ========================================= */

  submitAnswerBtn.addEventListener(
    "click",
    () => {
      const state = getState();

      const question =
        missionQuestions[
          state.questionIndex
        ] || missionQuestions[0];

      const lockedCrew =
        getLockedCrew();

      if (!lockedCrew) {
        return;
      }

      const remainingSlots =
        getRemainingAnswerSlots(
          lockedCrew,
          state,
          question
        );

      const enteredAnswers =
        getEnteredAnswers();

      if (enteredAnswers.length === 0) {
        transmissionMessage.textContent =
          "Enter at least one answer before transmitting.";

        transmissionMessage.classList.add(
          "show"
        );

        return;
      }

      if (
        enteredAnswers.length >
        remainingSlots
      ) {
        transmissionMessage.textContent =
          `Your crew may submit only ${remainingSlots} more answer${
            remainingSlots === 1
              ? ""
              : "s"
          }.`;

        transmissionMessage.classList.add(
          "show"
        );

        return;
      }

      enteredAnswers.forEach(
        (answer) => {
          savePendingTransmission(
            lockedCrew,
            answer,
            state.round
          );
        }
      );

      transmissionMessage.textContent =
        `${enteredAnswers.length} transmission${
          enteredAnswers.length === 1
            ? ""
            : "s"
        } sent to Mission Control.`;

      transmissionMessage.classList.add(
        "show"
      );

      /*
        Force the next render to rebuild
        the remaining answer slots.
      */

      renderedSubmissionCount = null;

      renderStudentConsole();
    }
  );

  /* =========================================
     STARTUP / SYNC
  ========================================= */

  renderCrewChoices();

  window.addEventListener(
    "storage",
    renderStudentConsole
  );

  window.setInterval(
    renderStudentConsole,
    750
  );

  renderStudentConsole();
});