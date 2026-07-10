document.addEventListener("DOMContentLoaded", () => {
  const teamSelect = document.getElementById("teamSelect");
  const currentQuestion = document.getElementById("currentQuestion");
  const answerInput = document.getElementById("answerInput");
  const submitAnswerBtn = document.getElementById("submitAnswerBtn");
  const transmissionMessage = document.getElementById("transmissionMessage");
  const studentStatus = document.getElementById("studentStatus");

  function getCrewTransmission(state, teamName) {
    return getTransmissions()
      .slice()
      .reverse()
      .find(
        (item) =>
          item.teamName === teamName &&
          Number(item.round) === Number(state.round)
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
      studentStatus.textContent = "ANSWER APPROVED";
      transmissionMessage.textContent =
        `Mission Control approved your answer for +${latestTransmission.pointsAwarded} points.`;
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
    }
  }

  teamSelect.addEventListener("change", () => {
    setState({ selectedTeam: teamSelect.value });
    answerInput.value = "";
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