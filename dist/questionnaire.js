"use strict";
// #### QUESTIONNAIRE MODULE ####
// This module implements the questionnaire functionality
// <questionnaire> <- List of questions
//   <question type="multiplechoice|singlechoice">
//     Question Text
//     <answer correct="true|false">
//       Answer Text
//       <explanation>Explanation Text
function setup() {
    // setup style
    var styleNode = document.createElement('style');
    styleNode.innerHTML = Ressources.style;
    document.getElementsByTagName('head')[0].appendChild(styleNode);
    var q_col = document.getElementsByTagName("questionnaire");
    // render every questionnaire in the HTML Document
    for (var i = q_col.length - 1; i >= 0; i--) {
        var questionnaire = q_col[i];
        renderQuestionaire(questionnaire);
    }
}
window.onload = setup;
// render questionnaire:
// addEventListener for "click"-Events
// build wrapper-<div> and <img>-icons for
// - answer
// - question
// ### RENDER FUNCTIONS ###
function renderQuestionaire(questionnaire) {
    console.log(questionnaire);
    //build wrapper-content
    var content = makeDiv("content-wrapper");
    var questions = questionnaire.getElementsByTagName("question");
    var question_number = questions.length;
    // access children and append to wrapper-content
    for (var i = question_number - 1; i >= 0; i--) {
        if (validateQuestionnaireStructure(questions[i]) == true) {
            content.append(questions[i]);
        }
        else {
            return;
        }
    }
    questionnaire.prepend(content);
    buildQuestionOverview(questionnaire, content, question_number);
    //render Questions + Answers
    renderQuestions(questionnaire);
    buildQuestionnaireFooter(content, question_number);
    //  renderError(questionnaire, "TEST ERROR");
}
function buildQuestionOverview(questionnaire, content, question_number) {
    // question-overview
    var q_overview = makeDiv("question-overview");
    q_overview.textContent = "Question 1" + " of " + question_number;
    content.prepend(q_overview);
    // question-current-total initial
    questionnaire.setAttribute("total_questions", "" + question_number);
    questionnaire.setAttribute("current_question", "1");
    questionnaire.setAttribute("correct_questions", "0");
}
// build questionnaire footer
// if only one question: BUILD NO BUTTON
function buildQuestionnaireFooter(content, question_number) {
    if (question_number == 1) {
        //BUILD NOTHING
    }
    else {
        var footer = makeDiv("question-footer");
        content.append(footer);
        buildFooterButtons(footer);
    }
}
//build 2 buttons: "prev"-Question, "next"-Question
function buildFooterButtons(footer) {
    var prev_button = makeDiv("change-question-button");
    var next_button = makeDiv("change-question-button");
    prev_button.setAttribute("id", "prev_button");
    next_button.setAttribute("id", "next_button");
    prev_button.setAttribute("style", "visibility:hidden;");
    prev_button.textContent = "prev";
    next_button.textContent = "next";
    prev_button.addEventListener("click", questionChangeHandler);
    next_button.addEventListener("click", questionChangeHandler);
    footer.append(prev_button, next_button);
}
// renderQuestions
// for every question:
// add <div>-wrapper + <img>-icon (done)
// add EventListener for CollapseAll-Function
function renderQuestions(questionnaire) {
    // get wrapper-content
    var wrapper_content = questionnaire.firstChild;
    var questions = questionnaire.getElementsByTagName("question");
    var lastIndex = questions.length - 1;
    questions[lastIndex].setAttribute("visible", "true");
    for (var i = lastIndex; i >= 0; i--) {
        var question = questions[i];
        if (validateAttribute(question) == true) {
            buildQuestionHeader(question);
            renderAnswers(question);
            //append question to wrapper-content
            wrapper_content.append(question);
            continue;
        }
        else {
            console.log("failed build: see validateAttribute for more information");
            break;
        }
    }
}
// question->DOM Manipulation
// Question Text and CollapseAll-Functionality in question-header
function buildQuestionHeader(question) {
    var text = document.createElement("p");
    text.innerHTML = question.childNodes[0].data;
    question.childNodes[0].remove();
    var header = document.createElement("div");
    header.setAttribute("class", "question-header");
    question.prepend(header);
    // append text and img
    var img = document.createElement("img");
    img.setAttribute("src", Ressources.plus_solid);
    img.addEventListener("click", explanationEventHandler.bind(img, true));
    header.append(text, img);
}
// question->DOM Manipulation
function renderAnswers(question) {
    var answers = question.getElementsByTagName("answer");
    //for every answer:
    // add <div> wrapper + <img>-icon (done)
    // add EventListener for AnswerClickEvents (done)
    for (var i = answers.length - 1; i >= 0; i--) {
        var answer = answers[i];
        // build div-wrapper
        var new_div = document.createElement("div");
        var text = document.createElement("p");
        text.innerHTML = answer.childNodes[0].data;
        answer.childNodes[0].remove();
        new_div.setAttribute("class", "wrapper-answer");
        answer.prepend(new_div);
        //append text and image
        var img = document.createElement("img");
        img.setAttribute("src", Ressources.circle_regular);
        new_div.append(img, text);
        answer.addEventListener("click", checkAnswerEventHandler);
        answer.addEventListener("click", explanationEventHandler.bind(answer, false));
        //validate explanation tag
        var explanation = answer.getElementsByTagName("explanation");
        if (explanation.length > 1) {
            var msg = "More than one <explanation> matches an answer: " + answer.innerHTML;
            renderError(answer, msg);
        }
    }
}
// validateAttributes
// check <question> attribute singlechoice | multiplechoice
// check multiple <answer> attributes for at least (for multiplechoice) 1 correct answer
// returns true (for successful validation) or false (fail)
function validateAttribute(question) {
    var attr = "type";
    var val = question.getAttribute(attr);
    var answers = question.children;
    var i = answers.length - 1;
    var x = 0;
    var correct_answers = getCorrectAnswer(x, i);
    // get all correct answers to this question
    function getCorrectAnswer(x, i) {
        if (i >= 0) {
            var correct = answers[i].getAttribute("correct");
            if (correct == "true") {
                x = getCorrectAnswer(x + 1, i - 1);
                return x;
            }
            else {
                x = getCorrectAnswer(x, i - 1);
                return x;
            }
        }
        else {
            return x;
        }
    }
    console.log(correct_answers);
    // if attr value does not exist
    if (val == null) {
        var msg = "Necessary attribute" + attr + "is missing at: " + question;
        renderError(question, msg);
        return false;
    }
    // if value exists, but is not correctly assigned
    else if (val != "singlechoice" && val != "multiplechoice") {
        var msg = "Necessary attribute" + attr + "with value: " + val + "is not 'singlechoice' nor 'multiplechoice': " + question;
        renderError(question, msg);
        return false;
    }
    // if only 1 or less answer exists
    else if (answers.length < 2) {
        var msg = "You need to provide at least two answers for one question: " + question + ", " + answers;
        renderError(question, msg);
        return false;
    }
    else if (correct_answers == 0) {
        var msg = "There is no correct answer in this question: " + question + ", " + answers;
        renderError(question, msg);
        return false;
    }
    // if question attr is singlechoice, but more than one correct answer exists
    else if (val == "singlechoice" && correct_answers > 1) {
        var msg = "There is more than one correct answer, but your question type is 'singlechoice': " + question + ", " + answers;
        renderError(question, msg);
        return false;
    }
    else {
        return true;
    }
}
//else if (val == "singlechoice" && )
// ValidateQuestionnaireStructure
// <questionnaire> -> <question> -> at least 2 <answer> -> <explanation>
// return either messageString or Boolean: True
function validateQuestionnaireStructure(el) {
    var html_tag = el.tagName;
    var parent = el.parentElement;
    if (html_tag == "QUESTION") {
        // parent has to be a QUESTIONNAIRE
        return parentHasToBe(parent, "QUESTIONNAIRE");
    }
    else if (html_tag == "ANSWER") {
        // child has to be an explanation
        return parentHasToBe(parent, "QUESTION");
    }
    else if (html_tag == "EXPLANATION") {
        // necessarily no children allowed for explanation
        return parentHasToBe(parent, "ANSWER");
    }
    function parentHasToBe(parent, tag) {
        if ((parent === null || parent === void 0 ? void 0 : parent.tagName) == tag) {
            return true;
        }
        else {
            var msg = "HTML structure is invalid: Please check your input at: " + el.innerHTML;
            renderError(el, msg);
            return false;
        }
    }
}
// renderError
function renderError(current_el, message) {
    var questionnaire = getQuestionnaireRecursive(current_el);
    var wrapper = makeDiv("error-wrapper");
    var header = makeDiv("error-header");
    header.innerHTML = "<h2>Why do I see this error?</h2>";
    var box = makeDiv("error-box");
    box.innerHTML = "<p>There was a syntax error in the programming module, probably caused by a wrong syntax.</p>";
    var msg = makeDiv("error-message");
    msg.innerHTML = "<p>" + current_el + ", Error:" + message + "</p>";
    // msg.setAttribute("id","error_msg");
    wrapper.append(header, box, msg);
    questionnaire.replaceChildren(wrapper);
}
// makeDiv
// ClassName as String -> HTMLDivElement
function makeDiv(css_name) {
    var new_div = document.createElement("div");
    new_div.setAttribute("class", css_name);
    return new_div;
}
// getQuestionnaireRecursive from a child element
// if element has TagName
// return;
// else: retry with parentElement
function getQuestionnaireRecursive(el) {
    console.log(el);
    if (el.tagName == "QUESTIONNAIRE") {
        return el;
    }
    else {
        var parent_1 = el.parentElement;
        var result = getQuestionnaireRecursive(parent_1);
        return result;
    }
}
// ### EVENT HANDLER FUNCTIONS ###
// EVENT AFTER BUTTON "prev" OR "next" CLICK
// questionChangeHandler
// EventHandler -> DOM Manipulation
function questionChangeHandler() {
    var _a, _b;
    // get Questionnaire attributes
    var button_id = this.getAttribute("id");
    var questionnaire = getQuestionnaireRecursive(this);
    console.log(questionnaire);
    var min_qid = 0;
    var max_qid = parseInt(questionnaire.getAttribute("total_questions")) - 1;
    var current_qid = parseInt(questionnaire.getAttribute("current_question")) - 1;
    var questions = questionnaire.getElementsByTagName("question");
    // change question
    // if button is "prev"
    if (button_id == "prev_button") {
        questions[current_qid].removeAttribute("visible");
        questions[current_qid - 1].setAttribute("visible", "true");
        var str_current = current_qid.toString();
        questionnaire.setAttribute("current_question", str_current);
        questionnaire.getElementsByClassName("question-overview")[0].textContent = "Frage " + str_current + " von " + questions.length;
        //hide button if button to first question is clicked
        if (current_qid - 1 == min_qid) {
            // !!! CHANGE CLASS INSTEAD OF STYLE?
            this.setAttribute("style", "visibility:hidden;");
        }
        // show next-Button
        (_a = this.nextElementSibling) === null || _a === void 0 ? void 0 : _a.setAttribute("style", "visibility:visible;");
    }
    else if (button_id == "next_button") {
        questions[current_qid].removeAttribute("visible");
        questions[current_qid + 1].setAttribute("visible", "true");
        //change questionnaire attributes
        var str_current = (current_qid + 2).toString();
        questionnaire.setAttribute("current_question", str_current);
        //change question overview
        questionnaire.getElementsByClassName("question-overview")[0].textContent = "Frage " + str_current + " von " + questions.length;
        // hide button if last question of questionnaire
        if (current_qid + 1 == max_qid) {
            this.setAttribute("style", "visibility:hidden;");
        }
        (_b = this.previousElementSibling) === null || _b === void 0 ? void 0 : _b.setAttribute("style", "visibility:visible;");
    }
    else {
        console.log("No Button caused this EventHandler", button_id);
    }
}
// ExplanationEventHandler
// Handles Events for shoowing explanation text
function explanationEventHandler(collapse) {
    var _a;
    if (collapse == true) {
        var question = (_a = this.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement;
        var answers = question.getElementsByTagName("answer");
        //change icons and collapse
        if (this.getAttribute("clicked") == "true") {
            this.setAttribute("src", Ressources.plus_solid);
            //  this.setAttribute("clicked", "false");
            for (var i = answers.length - 1; i >= 0; i--) {
                var answer = answers[i];
                answer.getElementsByTagName("explanation")[0].removeAttribute("visible");
            }
        }
        else {
            this.setAttribute("src", Ressources.minus_solid);
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
        explanation.removeAttribute("visible");
    }
    else {
        explanation.setAttribute("visible", "true");
    }
}
// check click for correct answer
// depending on question type show either
// - for multiplechoice just clicked answer
// - for singlechoice all answers
function checkAnswerEventHandler() {
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
// show icons and highlight answer
function showAnswer(answer) {
    answer.setAttribute("clicked", "true");
    var img = answer.getElementsByTagName("img")[0];
    if (answer.getAttribute("correct") == "true") {
        img.setAttribute("src", Ressources.check_solid);
    }
    else {
        img.setAttribute("src", Ressources.xmark_solid);
    }
}
// swipeEvent
// const divContainer = document.getElementById("touch-event-test");
// divContainer.addEventListener("")
// function (){
//
// }
var Ressources;
(function (Ressources) {
    Ressources.angle_left_solid = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAy\nNTYgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAt\nIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21l\nLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRp\nY29ucywgSW5jLiAtLT48cGF0aCBkPSJNMTkyIDQ0OGMtOC4xODggMC0xNi4zOC0zLjEyNS0y\nMi42Mi05LjM3NWwtMTYwLTE2MGMtMTIuNS0xMi41LTEyLjUtMzIuNzUgMC00NS4yNWwxNjAt\nMTYwYzEyLjUtMTIuNSAzMi43NS0xMi41IDQ1LjI1IDBzMTIuNSAzMi43NSAwIDQ1LjI1TDc3\nLjI1IDI1NmwxMzcuNCAxMzcuNGMxMi41IDEyLjUgMTIuNSAzMi43NSAwIDQ1LjI1QzIwOC40\nIDQ0NC45IDIwMC4yIDQ0OCAxOTIgNDQ4eiIvPjwvc3ZnPg==\n";
    Ressources.angle_right_solid = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAy\nNTYgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAt\nIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21l\nLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRp\nY29ucywgSW5jLiAtLT48cGF0aCBkPSJNNjQgNDQ4Yy04LjE4OCAwLTE2LjM4LTMuMTI1LTIy\nLjYyLTkuMzc1Yy0xMi41LTEyLjUtMTIuNS0zMi43NSAwLTQ1LjI1TDE3OC44IDI1Nkw0MS4z\nOCAxMTguNmMtMTIuNS0xMi41LTEyLjUtMzIuNzUgMC00NS4yNXMzMi43NS0xMi41IDQ1LjI1\nIDBsMTYwIDE2MGMxMi41IDEyLjUgMTIuNSAzMi43NSAwIDQ1LjI1bC0xNjAgMTYwQzgwLjM4\nIDQ0NC45IDcyLjE5IDQ0OCA2NCA0NDh6Ii8+PC9zdmc+\n";
    Ressources.check_solid = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0\nNDggNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAt\nIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21l\nLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRp\nY29ucywgSW5jLiAtLT48cGF0aCBkPSJNNDM4LjYgMTA1LjRDNDUxLjEgMTE3LjkgNDUxLjEg\nMTM4LjEgNDM4LjYgMTUwLjZMMTgyLjYgNDA2LjZDMTcwLjEgNDE5LjEgMTQ5LjkgNDE5LjEg\nMTM3LjQgNDA2LjZMOS4zNzIgMjc4LjZDLTMuMTI0IDI2Ni4xLTMuMTI0IDI0NS45IDkuMzcy\nIDIzMy40QzIxLjg3IDIyMC45IDQyLjEzIDIyMC45IDU0LjYzIDIzMy40TDE1OS4xIDMzOC43\nTDM5My40IDEwNS40QzQwNS45IDkyLjg4IDQyNi4xIDkyLjg4IDQzOC42IDEwNS40SDQzOC42\neiIvPjwvc3ZnPg==\n";
    Ressources.circle_regular = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1\nMTIgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAt\nIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21l\nLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRp\nY29ucywgSW5jLiAtLT48cGF0aCBkPSJNNTEyIDI1NkM1MTIgMzk3LjQgMzk3LjQgNTEyIDI1\nNiA1MTJDMTE0LjYgNTEyIDAgMzk3LjQgMCAyNTZDMCAxMTQuNiAxMTQuNiAwIDI1NiAwQzM5\nNy40IDAgNTEyIDExNC42IDUxMiAyNTZ6TTI1NiA0OEMxNDEuMSA0OCA0OCAxNDEuMSA0OCAy\nNTZDNDggMzcwLjkgMTQxLjEgNDY0IDI1NiA0NjRDMzcwLjkgNDY0IDQ2NCAzNzAuOSA0NjQg\nMjU2QzQ2NCAxNDEuMSAzNzAuOSA0OCAyNTYgNDh6Ii8+PC9zdmc+\n";
    Ressources.minus_solid = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0\nNDggNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAt\nIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21l\nLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRp\nY29ucywgSW5jLiAtLT48cGF0aCBkPSJNNDAwIDI4OGgtMzUyYy0xNy42OSAwLTMyLTE0LjMy\nLTMyLTMyLjAxczE0LjMxLTMxLjk5IDMyLTMxLjk5aDM1MmMxNy42OSAwIDMyIDE0LjMgMzIg\nMzEuOTlTNDE3LjcgMjg4IDQwMCAyODh6Ii8+PC9zdmc+\n";
    Ressources.plus_solid = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0\nNDggNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAt\nIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21l\nLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRp\nY29ucywgSW5jLiAtLT48cGF0aCBkPSJNNDMyIDI1NmMwIDE3LjY5LTE0LjMzIDMyLjAxLTMy\nIDMyLjAxSDI1NnYxNDRjMCAxNy42OS0xNC4zMyAzMS45OS0zMiAzMS45OXMtMzItMTQuMy0z\nMi0zMS45OXYtMTQ0SDQ4Yy0xNy42NyAwLTMyLTE0LjMyLTMyLTMyLjAxczE0LjMzLTMxLjk5\nIDMyLTMxLjk5SDE5MnYtMTQ0YzAtMTcuNjkgMTQuMzMtMzIuMDEgMzItMzIuMDFzMzIgMTQu\nMzIgMzIgMzIuMDF2MTQ0aDE0NEM0MTcuNyAyMjQgNDMyIDIzOC4zIDQzMiAyNTZ6Ii8+PC9z\ndmc+\n";
    Ressources.xmark_solid = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAz\nMjAgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAt\nIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21l\nLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRp\nY29ucywgSW5jLiAtLT48cGF0aCBkPSJNMzEwLjYgMzYxLjRjMTIuNSAxMi41IDEyLjUgMzIu\nNzUgMCA0NS4yNUMzMDQuNCA0MTIuOSAyOTYuMiA0MTYgMjg4IDQxNnMtMTYuMzgtMy4xMjUt\nMjIuNjItOS4zNzVMMTYwIDMwMS4zTDU0LjYzIDQwNi42QzQ4LjM4IDQxMi45IDQwLjE5IDQx\nNiAzMiA0MTZTMTUuNjMgNDEyLjkgOS4zNzUgNDA2LjZjLTEyLjUtMTIuNS0xMi41LTMyLjc1\nIDAtNDUuMjVsMTA1LjQtMTA1LjRMOS4zNzUgMTUwLjZjLTEyLjUtMTIuNS0xMi41LTMyLjc1\nIDAtNDUuMjVzMzIuNzUtMTIuNSA0NS4yNSAwTDE2MCAyMTAuOGwxMDUuNC0xMDUuNGMxMi41\nLTEyLjUgMzIuNzUtMTIuNSA0NS4yNSAwczEyLjUgMzIuNzUgMCA0NS4yNWwtMTA1LjQgMTA1\nLjRMMzEwLjYgMzYxLjR6Ii8+PC9zdmc+\n";
    Ressources.style = "body {\n  width: 100%;\n  margin: 0;\n  padding: 0;\n  font-family: monospace;\n}\n\nquestionnaire{\n  display:block;\n  margin:40px 0 100px ;\n}\n\n.content-wrapper {\n  display: flex;\n  flex-wrap: wrap;\n  flex-direction: column;\n  margin: 10px;\n  padding: 10px;\n  justify-content: center;\n}\nquestion{\n  display:none;\n}\n.question-overview{\nmargin: 0 auto 10px;\nfont-size:1.1em;\n}\nquestion{\n  width: 90%;\n  margin: 15px auto 15px;\n  font-size: 18pt;\n  padding:4vw;\n  background-color: #fcfcfc;\n}\n\n.question-header, .question-footer, .wrapper-answer {\n  display: inline-flex;\n  width: 100%;\n}\n\n.question-header {\n  justify-content: space-between;\n}\n\n.question-footer{\n  justify-content: center;\n}\n\n[visible=true]{\n    display:block;\n}\n\n.wrapper-answer, answer [visible=true] {\n  border: 1px solid #eee;\n  padding: 5px 12px;\n  font-size: 14pt;\n  margin: 15px 0 10px;\n  width:90%;\n}\n\nanswer p {\n  margin: 0 0 0 16px;\n  padding: 6px;\n  /*font-size: 12pt;\n  border: 1px solid #000;\n  width:100%;*/\n}\n\n.wrapper-answer:hover, img:hover, .change-question-button:hover {\n  cursor: pointer;\n  /*background-color: #ddd;*/\n}\n\n.wrapper-answer:hover {\n  background-color: #eee;\n}\n\n\nexplanation {\n  display: none;\n  /*max-width: 30vw;*/\n}\n\nanswer [visible=true] {\n  margin: 5px 0 20px;\n  padding: 15px 12px;\n  font-size: 12pt;\n  word-break: break-word;\n  border:0;\n  background-color: #fdfdfd;\n}\n\nanswer [visible=true] p {\n  border: 0;\n}\n\nimg {\n  height: auto;\n  width: 20px;\n}\n\n[clicked=true] .wrapper-answer, [clicked=true] .wrapper-answer:hover{\n  background-color:#d30000;\n}\n\n[clicked=true][correct=true] .wrapper-answer{\n  background-color:#aceb84;\n}\n\n.change-question-button{\n  padding:15px;\n  margin:15px 15px 0;\n  border: 4px solid #bbb;\n  border-radius: 7px;\n  font-size:1.3em;\n}\n.change-question-button:hover{\n  background-color: #bbb;\n}\n\n@media (min-width: 768px) {\n  question {\n    max-width: 600px;\n  }\n}\n.error-wrapper{\n  display:block;\n  max-width: 600px;\n  border: 5px solid red;\n   margin: 0 auto;\n  padding:0 20px;\n}\n.error-header{\n\n}\n.error-box{\nfont-size:16pt;\nline-height:1.5em;\n}\n\n.error-message{\n  font-family:monospace;\n  font-size:12pt;\n}";
})(Ressources || (Ressources = {}));
