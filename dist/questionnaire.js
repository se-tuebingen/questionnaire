"use strict";
// #### QUESTIONNAIRE MODULE ####
// This module implements the questionnaire functionality
// <questionnaire> <- List of questions
//   <question type="multiplechoice|singlechoice">
//     <p>Question Text
//     <answer correct="true|false">
//       <p>Answer Text
//       <explanation>Explanation Text
var q_col = document.getElementsByTagName("questionnaire");
// render every questionnaire
for (var i = q_col.length - 1; i >= 0; i--) {
    var questionnaire = q_col[i];
    renderQuestionaire(questionnaire);
}
// render questionnaire
function renderQuestionaire(questionnaire) {
    console.log(questionnaire);
    var a_col = questionnaire.getElementsByTagName("answer");
    //addEventListener for every <answer>
    for (var i = a_col.length - 1; i >= 0; i--) {
        var answer = a_col[i];
        answer.addEventListener("click", showExplanation);
    }
}
// get answers
// show <explanation>
function showExplanation() {
    var explanation = this.getElementsByTagName("explanation")[0];
    if (explanation.getAttribute("visible") == "true") {
        explanation.setAttribute("visible", "false");
    }
    else {
        explanation.setAttribute("visible", "true");
    }
}
