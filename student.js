document.addEventListener('DOMContentLoaded', () => {
  const teamSelect = document.getElementById('teamSelect');
  const currentQuestion = document.getElementById('currentQuestion');
  const answerInput = document.getElementById('answerInput');
  const submitAnswerBtn = document.getElementById('submitAnswerBtn');
  const transmissionMessage = document.getElementById('transmissionMessage');
  const studentStatus = document.getElementById('studentStatus');

  function render() {
    const state = getState();
    const current = missionQuestions[state.questionIndex] || missionQuestions[0];
    teamSelect.innerHTML = '';
    teams.forEach((team) => {
      const option = document.createElement('option');
      option.value = team;
      option.textContent = team;
      teamSelect.appendChild(option);
    });

    teamSelect.value = state.selectedTeam || teams[0];
    currentQuestion.textContent = current.prompt;
    studentStatus.textContent = state.selectedTeam ? `${state.selectedTeam} ready` : 'Ready for launch';
    transmissionMessage.textContent = state.studentAnswer ? `Transmission received from ${state.selectedTeam || 'crew'}.` : 'Transmission received.';
  }

  teamSelect.addEventListener('change', (event) => {
    setState({ selectedTeam: event.target.value });
    render();
  });

  submitAnswerBtn.addEventListener('click', () => {
    const answer = answerInput.value.trim();
    if (!answer) {
      transmissionMessage.textContent = 'Please enter a crew answer.';
      return;
    }
    setState({ studentAnswer: answer });
    render();
    answerInput.value = '';
  });

  render();
});
