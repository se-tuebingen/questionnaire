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
// render every questionnaire in the HTML Document
for (var i = q_col.length - 1; i >= 0; i--) {
    var questionnaire = q_col[i];
    renderQuestionaire(questionnaire);
}
// render questionnaire:
// addEventListener for "click"-Events
// build wrapper-<div> and <img>-icons for
// - answer
// - question
function renderQuestionaire(questionnaire) {
    console.log(questionnaire);
    renderQuestions(questionnaire);
    renderAnswers(questionnaire);
}
// renderQuestions
// for every question:
// add <div>-wrapper + <img>-icon (done)
// add EventListener for CollapseAll-Function
function renderQuestions(questionnaire) {
    var questions = questionnaire.getElementsByTagName("question");
    for (var i = questions.length - 1; i >= 0; i--) {
        var question = questions[i];
        var text = question.getElementsByTagName("p")[0];
        // build div-wrapper
        var new_div = document.createElement("div");
        new_div.setAttribute("class", "wrapper-question");
        question.prepend(new_div);
        // append text and img
        var img = document.createElement("img");
        img.setAttribute("src", "ressources/icons/plus-solid.svg");
        new_div.append(text, img);
        img.addEventListener("click", ExplanationEventHandler.bind(img, true));
    }
}
// questionnaire->DOM Manipulation
function renderAnswers(questionnaire) {
    var answers = questionnaire.getElementsByTagName("answer");
    //for every answer:
    // add <div> wrapper + <img>-icon (done)
    // add EventListener for AnswerClickEvents (done)
    for (var i = answers.length - 1; i >= 0; i--) {
        var answer = answers[i];
        // build div-wrapper
        var new_div = document.createElement("div");
        var text = answer.getElementsByTagName("p")[0];
        new_div.setAttribute("class", "wrapper-answer");
        answer.prepend(new_div);
        //append text and img
        var img = document.createElement("img");
        img.setAttribute("src", "ressources/icons/circle-regular.svg");
        new_div.append(img, text);
        answer.addEventListener("click", checkAnswer);
        answer.addEventListener("click", ExplanationEventHandler.bind(answer, false));
    }
}
// ExplanationEventHandler
// Handles Events for shoowing explanation text
function ExplanationEventHandler(collapse) {
    var _a;
    if (collapse == true) {
        var question = (_a = this.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement;
        var answers = question.getElementsByTagName("answer");
        //change icons and collapse
        if (this.getAttribute("clicked") == "true") {
            this.setAttribute("src", "ressources/icons/plus-solid.svg");
            this.setAttribute("clicked", "false");
            for (var i = answers.length - 1; i >= 0; i--) {
                var answer = answers[i];
                answer.getElementsByTagName("explanation")[0].setAttribute("visible", "false");
            }
        }
        else {
            this.setAttribute("src", "ressources/icons/minus-solid.svg");
            this.setAttribute("clicked", "true");
            for (var i = answers.length - 1; i >= 0; i--) {
                var answer = answers[i];
                answer.getElementsByTagName("explanation")[0].setAttribute("visible", "true");
            }
        }
    }
    else {
        showExplanation(this);
    }
}
// show <explanation>
//Answer->DOM Manipulation
function showExplanation(answer) {
    var explanation = answer.getElementsByTagName("explanation")[0];
    if (explanation.getAttribute("visible") == "true") {
        explanation.setAttribute("visible", "false");
    }
    else {
        explanation.setAttribute("visible", "true");
    }
}
// check click for correcct answer
// depending on question type show either
// - for multiplechoice just clicked answer
// - for singlechoice all answers
function checkAnswer() {
    var _a, _b;
    var question_type = (_a = this.parentElement) === null || _a === void 0 ? void 0 : _a.getAttribute("type");
    if (question_type == "multiplechoice") {
        showAnswer(this);
    }
    else if (question_type == "singlechoice") {
        var answers = (_b = this.parentElement) === null || _b === void 0 ? void 0 : _b.getElementsByTagName("answer");
        for (var i = (answers === null || answers === void 0 ? void 0 : answers.length) - 1; i >= 0; i--) {
            var answer = answers[i];
            showAnswer(answer);
        }
    }
}
// showAnswer
// show icons and highlight correct answer
function showAnswer(answer) {
    answer.setAttribute("clicked", "true");
    var img = answer.getElementsByTagName("img")[0];
    if (answer.getAttribute("correct") == "true") {
        img.setAttribute("src", "ressources/icons/check-solid.svg");
    }
    else {
        img.setAttribute("src", "ressources/icons/xmark-solid.svg");
    }
}
