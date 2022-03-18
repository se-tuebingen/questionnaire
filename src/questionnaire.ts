// #### QUESTIONNAIRE MODULE ####
// This module implements the questionnaire functionality

// <questionnaire> <- List of questions
//   <question type="multiplechoice|singlechoice">
//     <p>Question Text
//     <answer correct="true|false">
//       <p>Answer Text
//       <explanation>Explanation Text


const q_col: HTMLCollection = document.getElementsByTagName("questionnaire") as HTMLCollection;
// render every questionnaire
for (let i = q_col.length - 1; i >= 0; i--) {
  let questionnaire: HTMLElement = q_col[i] as HTMLElement;
  renderQuestionaire(questionnaire);
}
// render questionnaire
function renderQuestionaire(questionnaire: HTMLElement) {
  console.log(questionnaire);
  let a_col: HTMLCollection = questionnaire.getElementsByTagName("answer");
  //addEventListener for every <answer>
  for (let i = a_col.length - 1; i >= 0; i--) {
    let answer: HTMLElement = a_col[i] as HTMLElement;
    answer.addEventListener("click", showExplanation);
  }
}
// get answers


// show <explanation>
function showExplanation(this: HTMLElement) {
  let explanation: HTMLElement = this.getElementsByTagName("explanation")[0] as HTMLElement;
  if (explanation.getAttribute("visible") == "true") {
    explanation.setAttribute("visible", "false");
  }
  else {
    explanation.setAttribute("visible", "true");

  }
}
