document.addEventListener("DOMContentLoaded", () => {
  const teamSelect = document.getElementById("teamSelect");
  const currentQuestion = document.getElementById("currentQuestion");
  const answerInput = document.getElementById("answerInput");
  const submitAnswerBtn = document.getElementById("submitAnswerBtn");
  const transmissionMessage = document.getElementById("transmissionMessage");
  const studentStatus = document.getElementById("studentStatus");
  const strikeOverlay = document.getElementById("strikeOverlay");

  let lastStrikeTransmissionId = null;

  function showStudentStrikeOverlay(teamName) {
    if (!strikeOverlay) return;

    const message = strikeOverlay.querySelector("p");

    if (message) {
      message.textContent = `${teamName.toUpperCase()} CREW STRIKE`;
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

  function getCrewTransmission(state, teamName) {
    return (
      getTransmissions()
        .filter(
          (item) =>
            String(item.teamName) === String(teamName) &&
            Number(item.round) === Number(state.round)
        )
        .sort(
          (a, b) =>
            new Date(b.timestamp).getTime() -
            new Date(a.timestamp).getTime()
        )[0] || null
    );
  }

  function renderStudentConsole() {
    const state = getState();
    const question =
      missionQuestions[state.questionIndex] || missionQuestions[0];

    const selectedTeam = state.selectedTeam || teams[0];

    teamSelect.innerHTML = "";

    teams.forEach((team) => {
      const option = document.createElement("option");
      option.value = team;
      option.textContent = `${team} Crew`;
      teamSelect.appendChild(option);
    });

    teamSelect.value = selectedTeam;
    currentQuestion.textContent = question.prompt;

    const latestTransmission = getCrewTransmission(state, selectedTeam);

    if (!latestTransmission) {
      studentStatus.textContent = `${selectedTeam.toUpperCase()} READY`;
      transmissionMessage.textContent = "";
      transmissionMessage.classList.remove("show");
      submitAnswerBtn.disabled = false;
      submitAnswerBtn.textContent = "Submit Answer";
      answerInput.disabled = false;
      return;
    }

    if (latestTransmission.status === "pending") {
      studentStatus.textContent = "AWAITING APPROVAL";
      transmissionMessage.textContent =
        "Transmission sent to Mission Control. Awaiting approval.";
      transmissionMessage.classList.add("show");
      submitAnswerBtn.disabled = true;
      submitAnswerBtn.textContent = "Awaiting Approval";
      answerInput.disabled = true;
      return;
    }

    if (latestTransmission.status === "approved") {
      studentStatus.textContent = "APPROVED — WAITING TO REVEAL";
      transmissionMessage.textContent =
        `Mission Control approved your answer for +${latestTransmission.pointsAwarded} points.`;
      transmissionMessage.classList.add("show");
      submitAnswerBtn.disabled = false;
      submitAnswerBtn.textContent = "Submit Another Answer";
      answerInput.disabled = false;
      return;
    }

    if (latestTransmission.status === "revealed") {
      studentStatus.textContent = "ANSWER REVEALED";
      transmissionMessage.textContent =
        `Your approved answer was revealed for +${latestTransmission.pointsAwarded} points.`;
      transmissionMessage.classList.add("show");
      submitAnswerBtn.disabled = false;
      submitAnswerBtn.textContent = "Submit Another Answer";
      answerInput.disabled = false;
      return;
    }

    if (latestTransmission.status === "rejected") {
      studentStatus.textContent = "ANSWER REJECTED";
      transmissionMessage.textContent =
        "Mission Control marked that answer incorrect. Try another answer.";
      transmissionMessage.classList.add("show");
      submitAnswerBtn.disabled = false;
      submitAnswerBtn.textContent = "Try Another Answer";
      answerInput.disabled = false;

      if (lastStrikeTransmissionId !== latestTransmission.id) {
        lastStrikeTransmissionId = latestTransmission.id;
        showStudentStrikeOverlay(selectedTeam);
      }
    }
  }

  teamSelect.addEventListener("change", () => {
    const selectedTeam = teamSelect.value;

    setState({ selectedTeam });

    answerInput.value = "";
    transmissionMessage.textContent = "";
    transmissionMessage.classList.remove("show");

    renderStudentConsole();
  });

  submitAnswerBtn.addEventListener("click", () => {
    const answer = answerInput.value.trim();

    if (!answer) {
      transmissionMessage.textContent =
        "Enter your crew's answer before transmitting.";
      transmissionMessage.classList.add("show");
      return;
    }

    const state = getState();
    const teamName = teamSelect.value || state.selectedTeam || teams[0];

    const pendingTransmission = getPendingTransmissions().find(
      (item) =>
        item.teamName === teamName &&
        Number(item.round) === Number(state.round)
    );

    if (pendingTransmission) {
      transmissionMessage.textContent =
        "Your crew already has an answer awaiting approval.";
      transmissionMessage.classList.add("show");
      return;
    }

    savePendingTransmission(teamName, answer, state.round);

    answerInput.value = "";
    renderStudentConsole();
  });

  window.addEventListener("storage", renderStudentConsole);
  window.setInterval(renderStudentConsole, 750);

  renderStudentConsole();
});