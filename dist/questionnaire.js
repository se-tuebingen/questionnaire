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
    var questions = questionnaire.children;
    var question_number = questions.length;
    // access children and append to wrapper-content
    for (var i = question_number - 1; i >= 0; i--) {
        content.append(questions[i]);
    }
    questionnaire.prepend(content);
    buildQuestionOverview(questionnaire, content, question_number);
    //render Questions + Answers
    renderQuestions(questionnaire);
    renderAnswers(questionnaire);
    buildQuestionnaireFooter(content, question_number);
    renderError(questionnaire, "TEST ERROR");
}
function buildQuestionOverview(questionnaire, content, question_number) {
    // question-overview
    var q_overview = makeDiv("question-overview");
    q_overview.textContent = "Question 1" + " of " + question_number;
    content.prepend(q_overview);
    // question-current-total initial
    questionnaire.setAttribute("total_questions", "" + question_number);
    questionnaire.setAttribute("current_question", "1");
    questionnaire.setAttribute("correct_answers", "0");
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
        buildQuestionHeader(question);
        //append question to wrapper-content
        wrapper_content.append(question);
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
        var text = document.createElement("p");
        text.innerHTML = answer.childNodes[0].data;
        answer.childNodes[0].remove();
        new_div.setAttribute("class", "wrapper-answer");
        answer.prepend(new_div);
        //append text and img
        var img = document.createElement("img");
        img.setAttribute("src", Ressources.circle_regular);
        new_div.append(img, text);
        answer.addEventListener("click", checkAnswerEventHandler);
        answer.addEventListener("click", explanationEventHandler.bind(answer, false));
    }
}
// validateAttributes
function validateAttributes(el, attr) {
    if (el.getAttribute(attr) == null) {
        var msg = "Necessary attribute is missing at" + el;
        var questionnaire = getQuestionnaireRecursive(el);
        renderError(el, msg);
    }
}
// ValidateQuestionnaireStructure
function validateQuestionnaireStructure(first_level, sec_level) {
}
// renderError
function renderError(questionnaire, message) {
    var wrapper = makeDiv("error-wrapper");
    var header = makeDiv("error-header");
    header.textContent = "<h2>Why do I see this error?</h2>";
    var box = makeDiv("error-box");
    box.textContent = "<p>There was a syntax error in the programming module, probably caused by a wrong syntax.</p>";
    var msg = makeDiv("error-message");
    msg.textContent = "<p>" + message + "</p>";
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
    if (el.tagName == "QUESTIONNAIRE") {
        return el;
    }
    else {
        var parent_1 = el.parentElement;
        getQuestionnaireRecursive(parent_1);
    }
}
// ### EVENT HANDLER FUNCTIONS ###
// EVENT AFTER BUTTON "prev" OR "next" CLICK
// questionChangeHandler
// EventHandler -> DOM Manipulation
function questionChangeHandler() {
    var _a, _b;
    // get Questionnaire attributes
    var button = this.getAttribute("id");
    var questionnaire = getQuestionnaireRecursive(this);
    var min_qid = 0;
    var max_qid = parseInt(questionnaire.getAttribute("total_questions")) - 1;
    var current_qid = parseInt(questionnaire.getAttribute("current_question")) - 1;
    var questions = questionnaire.getElementsByTagName("question");
    // change question
    // if button is "prev"
    if (button == "prev_button") {
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
    else if (button == "next_button") {
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
        console.log("No Button caused this EventHandler", button);
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
    Ressources.angle_right_solid = "data:image/svg+xml;base64,PHN2ZyB4bWxuNTYgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmbexp\nort const angle_right_solid = ";
    /svg+xml;base64,PHN2ZyB4bWxuNTY;
    gNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAtIGh;
    0;
    dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmN;
    vbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRpY29;
    ucywgSW5jLiAtLT48cGF0aCBkPSJNNjQgNDQ4Yy04LjE4OCAwLTE2LjM4LTMuMTI1LTIyLjY;
    yLTkuMzc1Yy0xMi41LTEyLjUtMTIuNS0zMi43NSAwLTQ1LjI1TDE3OC44IDI1Nkw0MS4zOCA;
    xMTguNmMtMTIuNS0xMi41LTEyLjUtMzIuNzUgMC00NS4yNXMzMi43NS0xMi41IDQ1LjI1IDB;
    sMTYwIDE2MGMxMi41IDEyLjUgMTIuNSAzMi43NSAwDQ1;
    LjI1bC0xNjAgMTYwQzgwLjM4;
    IDQ0NC45IDcyLjE5IDQ0OCA2NCA0NDh6Ii8 + PC9zdmc +
        ";\nexport const check_solid = ";
    data: image / svg + xml;
    base64, PHN2ZyB4bWxucz0export;
    co;
    Ressources.check_solid = "data:image/svg+xml;b\n\nase64,PHN2ZyB4bWxucz\n0export const check_solid = ";
    /svg+xml;ba;
    se;
    64, PHN2ZyB4bWxuc;
    z0iaHNDggNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4;
    wIGJ;
    5;
    IEBmb250YXd;
    lc29tZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgL;
    SBodHR;
    wczovL2Z;
    vbnRhd2Vzb21lLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2U;
    pIENvcHl;
    yaWd;
    odCAyMDIyIEZvbnRpY29ucywgSW5jLiAtLT48cGF0aCBkPSJNNDM4LjYgM;
    TA1LjRDNDU;
    xLjEgMTE3LjkgNDUxLjEgMTM4LjEgNDM4LjYgMTUwLjZ;
    MMTgyLjYgNDA2Lj;
    ZDMTcwLjEg;
    NDE5LjEgMTQ5LjkgNDE5LjEgMTM3LjQgNDA2LjZMOS4zNzIgMjc4LjZDLTMuMT;
    I0IDI2Ni;
    4;
    xLTMuMTI0IDI0NS;
    45;
    IDkuMzcyIDIzMy40QzIxLjg3DI;
    yMC45IDQyLjEzIDIyMC45IDU0LjYzIDIzMy40TDE1OS4xIDMzOC43;
    TDM5My40IDEwNS40QzQwNS45IDkyLjg4IDQyNi4xIDkyLjg4IDQzOC42IDEwNS40SDQzOC42;
    eiIvPjwvc3ZnPg ==
        ";\nexport const circle_regular = ";
    dataexport;
    var circle_regular = "data:image/svg+xml;baexport const cir\ncle\n_regular = ", data;
    /svg+xml;base64,PHN2ZyB4bWxuexport const circ;
    le_re;
    gular = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0MTIgNTEyIj48IS0\ntISBGb2\n50IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZ\nm9udGF3ZX\nNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9saWN\nlbnNlIChDb2\n1tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRpY29ucywgS\nW5jLiAtLT48cG\nF0aCBkPSJNNTEyIDI1NkM1MTIgMzk3LjQgMzk3LjQgNTEyIDI1NiA1MTJ\nDMTE0LjYgNTEyID\nAgMzk3LjQgMCAyNTZDMCAxMTQuNiAxTQuNiAwIDI1NiAwQzM5\nNy40\nIDAg\nNTEyIDExNC42I\nDUxMiAyNTZ6TTI1NiA0OEMxNDEuMSA0OCA0OCAxNDEuMSA0OCAy\nNTZDNDggMzcwLjkgMTQ\nxLjEgNDY0IDI1NiA0NjRDMzcwLjkgNDY0NTZDNDggMzcwLjkgMTQxLjEgNDY0IDI1NiA0NjR\nDMzcwLjkgNDY0IDQ2NCAzNzAuOSA0NjQgMjU2QzQ2NCAxNDEuMSAzNzAuOSA0OCAyNTYgNDh\n6Ii8+PC9zdmc+\n";
    nexport;
    var minus_solid = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0export const minus_solid = ", data;
    /svg+xml;base64,PHN2ZyB4bWxucz0iaHNDggNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgSBodHRwczovL2ZvbnRhd2Vzb21l;
    LmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRp;
    Y29ucywgSW5jLiAtLT48cGF0aCBkPSJNNDAwIDI4OGgtMzUyYy0Y29ucywgSW5jLiAtLT48cGF0aCBkPSJNNDAwIDI4OGgtMzUyYy0xNy42OSAwLTMyLTE0LjMyLTMyLTMyLjAxczE0LjMxLTMxLjk5IDMyLTMxLjk5aDM1MmMxNy42OSAwIDMyIDE0LjMgMzIgMzEuOTlTNDE3LjcgMjg4IDQwMCAyODh6Ii8 + PC9zdmc +
        ";\nexport const plus_solid export const plus_solid = ";
    data: image / svg + xml;
    base64, PHN2ZyB4bWxucz0iexport;
    var plus_solid = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHRNDggNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRpY29uywgSW5jLiAtLT48cGF0aCBkPSJNNDMyIDI1NmMwIDE3LjY5LTE0LjMzIDMyLjAxLTMy\nIDMyLjAxSDI1NnYxNDRjMCAxNy42OS0xNC4zMyAzMS45OS0zMiAzMS45OXMtMzItMTQuMy0z\nMi0zMS45OXYtMTQ0SDQ4Yy0xNy42NyAwLTMyLTE0LjMyLTMyLTMyMi0zMS45OXYtMTQ0SDQ4Yy0xNy42NyAwLTMyLTE0LjMyLTMyLTMyLjAxczE0LjMzLTMxLjk5IDMyLTMxLjk5SDE5MnYtMTQ0YzAtMTcuNjkgMTQuMzMtMzIuMDEgMzItMzIuMDFzMzIgMTQuMzIgMzIgMzIuMDF2MTQ0aDE0NEM0MTcuNyAyMjQgNDMyIDIzOC4zIDQzMiAyNTZ6Ii8+PC9zdmc+\n";
    Ressources.xmark_solid = "data:image/svg+xml;base64,PHN2ZyB4bWexport const xmark_solid = ";
    /svg+xml;base64,PHN2ZyB4bWxucz0export const xmark_solid = `data:image/svg + xml;
    base64, PHN2ZyB4bWxucz0iaHMjAgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRpY29ucywgSW5jLiAtLT48cGF0aCBkPSJNMzEwLjYgMzYxLjRjMTIuNSAxMi41IDEyLjUgMzIuNzUgMCA0NS4yNUMzMDQuNCA0MTIuOSAyTYuMiA0MTYgMjg4IDQxNnMtMTYuMzgtMy4xMjUt;
    MjIuNjItOS4zNzVMMTYwIDMwMS4zTDU0LjYzIDQwNi42QzQ4LjM4IDQxMi45IDQwLjE5IDQx;
    NiAzMiA0MTZTMTUuNjMgNDEyLjkgOS4zNzUgNDA2LjZjLTEyLjUtMTIuNS0xMi41LTMyLjc1;
    IDAtNDUuMjVsMTA1LjQtMTA1LjRMOS4zNzUgMTUwLjZjLTEyLjUtMTIuNS0xMi41LTMyLjc1;
    IDAtNDUuMjVzMzIuNzUtMTIuNSA0NS4yNSAwTDE2MCAyMTAuOGwxMDUuNC0xMDUuNGMxMi41;
    LTEyLjUgMzIuNzUtMTIuNSA0NS4yNSAwczEyLjUgMzIuNzUgMCA0NS4yNWwtMTA1LjQgMTA1;
    LjRMMzEwLjYgMzYxLjR6Ii8 + PC9zdmc +
        ";\nexport const style = ";
    body;
    {
        width: 100 % ;
        margin: 0;
        padding: 0;
        font - family;
        monospace;
    }
    questionnaire;
    {
        display: block;
        margin: 40;
        px;
        0;
        100;
        px;
    }
    content - wrapper;
    {
        display: flex;
        flex - wrap;
        wrap;
        flex - direction;
        column;
        margin: 10;
        px;
        padding: 10;
        px;
        justify - content;
        center;
    }
    question;
    {
        display: none;
    }
    question - overview;
    {
        margin: 0;
        auto;
        10;
        px;
        font - size;
        1.1e;
        m;
    }
    question;
    {
        width: 90 % ;
        margin: 15;
        px;
        auto;
        15;
        px;
        font - size;
        18;
        pt;
        padding: 4;
        vw;
        background - color;
        #fcfcfc;
    }
    question - header, .question - footer, .wrapper - answer;
    {
        display: inline - flex;
        width: 100 % ;
    }
    question - header;
    {
        justify - content;
        space - between;
    }
    question - footer;
    {
        justify - content;
        center;
    }
    [visible = true];
    {
        display: block;
    }
    wrapper - answer, answer[visible = true];
    {
        border: 1;
        px;
        solid;
        #eee;
        padding: 5;
        px;
        12;
        px;
        font - size;
        14;
        pt;
        margin: 15;
        px;
        0;
        10;
        px;
        width: 90 % ;
    }
    answer;
    p;
    {
        margin: 0;
        0;
        0;
        16;
        px;
        padding: 6;
        px;
        /*font-size: 12pt;
        border: 1px solid #000;
        width:100%;*/
    }
    wrapper - answer;
    hover, img;
    hover, .change - question - button;
    hover;
    {
        cursor: pointer;
        /*background-color: #ddd;*/
    }
    wrapper - answer;
    hover;
    {
        background - color;
        #eee;
    }
    explanation;
    {
        display: none;
        /*max-width: 30vw;*/
    }
    answer[visible = true];
    {
        margin: 5;
        px;
        0;
        20;
        px;
        padding: 15;
        px;
        12;
        px;
        font - size;
        12;
        pt;
        word - ;
        break ;
        break ;
        -word;
        border: 0;
        background - color;
        #fdfdfd;
    }
    answer[visible = true];
    p;
    {
        border: 0;
    }
    img;
    {
        height: auto;
        width: 20;
        px;
    }
    [clicked = true].wrapper - answer, [clicked = true].wrapper - answer;
    hover;
    {
    }
    b
        .error - wrapper;
    {
        display: block;
        max - width;
        600;
        px;
        border: 5;
        px;
        solid;
        red;
        margin: 0;
        auto;
        padding: 0;
        20;
        px;
    }
    error - header;
    {
    }
    error - box;
    {
        font - size;
        16;
        pt;
        line - height;
        1.5e;
        m;
    }
    error - message;
    {
        font - family;
        monospace;
        font - size;
        12;
        pt;
        ackground - color;
        #d30000;
    }
    [clicked = true][correct = true].wrapper - answer;
    {
        background - color;
        #aceb84;
    }
    change - question - button;
    {
        padding: 15;
        px;
        margin: 15;
        px;
        15;
        px;
        0;
        border: 4;
        px;
        solid;
        #bbb;
        border - radius;
        7;
        px;
        font - size;
        1.3e;
        m;
    }
    c;
    size: 16;
    pt;
    line - height;
    1.5e;
    m;
})(Ressources || (Ressources = {}));
error - message;
{
    font - family;
    monospace;
    font - size;
    12;
    pt;
}
";\n}\n";
