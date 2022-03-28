"use strict";
// #### QUESTIONNAIRE MODULE ####
// This module implements the questionnaire functionality
// <questionnaire> <- List of questions
//   <question type="multiplechoice|singlechoice">
//     <p>Question Text
//     <answer correct="true|false">
//       <p>Answer Text
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
        renderQuestionaire(questionnaire, i);
    }
}
window.onload = setup;
// render questionnaire:
// addEventListener for "click"-Events
// build wrapper-<div> and <img>-icons for
// - answer
// - question
function renderQuestionaire(questionnaire, j) {
    console.log(questionnaire);
    //build wrapper-content
    var content = document.createElement("div");
    content.setAttribute("class", "wrapper-content");
    var children = questionnaire.children;
    // access children and append to wrapper-content
    for (var i = children.length - 1; i >= 0; i--) {
        content.append(children[i]);
    }
    questionnaire.prepend(content);
    //render Questions + Answers
    renderQuestions(questionnaire, j);
    renderAnswers(questionnaire);
}
// renderQuestions
// for every question:
// add <div>-wrapper + <img>-icon (done)
// add EventListener for CollapseAll-Function
function renderQuestions(questionnaire, j) {
    // get wrapper-content
    var wrapper_content = questionnaire.firstChild;
    var questions = questionnaire.getElementsByTagName("question");
    questions[1].setAttribute("visible", "true");
    for (var i = questions.length - 1; i >= 0; i--) {
        var question = questions[i];
        buildQuestionHeader(question);
        // build question footer
        var footer = document.createElement("div");
        footer.setAttribute("class", "question-footer");
        question.append(footer);
        //build 2 buttons
        var prev_button = makeDiv("change-question-button");
        var next_button = makeDiv("change-question-button");
        prev_button.setAttribute("id", "prev_button");
        next_button.setAttribute("id", "next_button");
        prev_button.textContent = "prev";
        next_button.textContent = "next";
        prev_button.addEventListener("click", prevQuestion);
        next_button.addEventListener("click", nextQuestion);
        footer.append(prev_button, next_button);
        //create question_ids
        question.setAttribute("id", j + "-question_id-" + i);
        //append question to wrapper-content
        wrapper_content.append(question);
    }
}
//previousQuestion
//EventHandler -> DOM Manipulation
function prevQuestion() {
    var _a;
    var question = (_a = this.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement;
    var prev_question = question.previousSibling;
    if (prev_question == null) {
        //DO NOTHING
    }
    else {
        question.removeAttribute("visible");
        prev_question.setAttribute("visible", "true");
    }
}
//nextQuestion
//EventHandler -> DOM Manipulation
function nextQuestion() {
    var _a;
    var question = (_a = this.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement;
    var next_question = question.nextSibling;
    if (next_question == null) {
        //DO NOTHING
    }
    else {
        question.removeAttribute("visible");
        next_question.setAttribute("visible", "true");
    }
}
// question->DOM Manipulation
// Question Text and CollapseAll-Functionality in question-header
function buildQuestionHeader(question) {
    var text = question.getElementsByTagName("p")[0];
    var header = document.createElement("div");
    header.setAttribute("class", "question-header");
    question.prepend(header);
    // append text and img
    var img = document.createElement("img");
    img.setAttribute("src", Ressources.plus_solid);
    img.addEventListener("click", ExplanationEventHandler.bind(img, true));
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
        var text = answer.getElementsByTagName("p")[0];
        new_div.setAttribute("class", "wrapper-answer");
        answer.prepend(new_div);
        //append text and img
        var img = document.createElement("img");
        img.setAttribute("src", Ressources.circle_regular);
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
            this.setAttribute("src", Ressources.plus_solid);
            this.setAttribute("clicked", "false");
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
// makeDiv
// ClassName as String -> HTMLDivElement
function makeDiv(css_name) {
    var new_div = document.createElement("div");
    new_div.setAttribute("class", css_name);
    return new_div;
}
// swipeEvent
// const divContainer = document.getElementById("touch-event-test");
// divContainer.addEventListener("")
// function (){
//
// }
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var Ressources;
(function (Ressources) {
    Ressources.angle_left_solid = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAy\nNTYgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAt\nIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21l\nLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRp\nY29ucywgSW5jLiAtLT48cGF0aCBkPSJNMTkyIDQ0OGMtOC4xODggMC0xNi4zOC0zLjEyNS0y\nMi42Mi05LjM3NWwtMTYwLTE2MGMtMTIuNS0xMi41LTEyLjUtMzIuNzUgMC00NS4yNWwxNjAt\nMTYwYzEyLjUtMTIuNSAzMi43NS0xMi41IDQ1LjI1IDBzMTIuNSAzMi43NSAwIDQ1LjI1TDc3\nLjI1IDI1NmwxMzcuNCAxMzcuNGMxMi41IDEyLjUgMTIuNSAzMi43NSAwIDQ1LjI1QzIwOC40\nIDQ0NC45IDIwMC4yIDQ0OCAxOTIgNDQ4eiIvPjwvc3ZnPg==\n";
    Ressources.check_solid = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAg\nCA0\n\n\nDggNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc2\ntZ\nSAt\n\nIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRh\n\nVzb21l\n\nLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMD\n\nyIEZvbnR\n\nY29ucywgSW5jLiAtLT48cGF0aCBkPSJNNDM4LjYgMTA1LjRDNDUxLjEgMTE3\n\njkgNDUxLj\ng\nMTM4LjEgNDM4LjYgMTUwLjZMMTgyLjYgNDA2LjZDMTcwLjEgNDE5LjEgM\n\n5LjkgNDE5L\nEg\nMTM3LjQgNDA2LjZMOS4zNzIgMjc4LjZDLTMuMTI0IDI2Ni4xLTMuMT\nI0\nDI0NS45IDku\nzcy IDIzMy40QzIxLjg3IDIyMC45IDQyLjEzIDIyMC45IDU0LjYzIDI\nMy4\nTDE1OS4xIDMz\nC43 TDM5My40IDEwNS40QzQwNS45IDkyLjg4IDQyNi4xIDkyLjg4IDQzOC\n2IDEwNS40SDQzOC42 eiIvPjwvc3ZnPg==\n";
    Ressources.circle_regular = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9I\nAgM\nA1 MTIgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdl\n29tZ\nAt IGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnR\nd2Vzb\n1l LmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMD\nyIEZvb\nRp Y29ucywgSW5jLiAtLT48cGF0aCBkPSJNNTEyIDI1NkM1MTIgMzk3LjQgMzk3L\nQgNTEyI\nI1 NiA1MTJDMTE0LjYgNTEyIDAgMzk3LjQgMCAyNTZDMCAxMTQuNiAxMTQuNiAw\nDI1NiAwQ\nM5 Ny40IDAgNTEyIDExNC42IDUxMiAyNTZ6TTI1NiA0OEMxNDEuMSA0OCA0OCA\nNDEuMSA0O\nAy NTZDNDggMzcwLjkgMTQxLjEgNDY0IDI1NiA0NjRDMzcwLjkgNDY0IDQ2NC\nzNzAuOSA0N\nQg MjU2QzQ2NCAxNDEuMSAzNzAuOSA0OCAyNTYgNDh6Ii8+PC9zdmc+\n";
    e(__makeTemplateObject([";\nexport c\nnst plus_so\nl id = "], [";\nexport c\nnst plus_so\nl id = "]));
    data: i;
    mage / svg + xm;
    l;
    base64, PHN;
    2;
    ZyB4bWxucz0iaHR0;
    DovL3d;
    d;
    53;
    My5vcmcvMjAw;
    C;
    zdmciIHZpZXdCb3g9I;
    jAgMCA0;
    NDggNTE;
    y;
    Ij48I;
    0;
    tISBGb250;
    I;
    EF3ZXNvbWUgUHJvIDYuMS4w;
    I;
    GJ5IEBmb250YX;
    dlc29tZSAt;
    IGh0;
    H;
    zOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2Ug;
    SBodHRwczo;
    vL2ZvbnRhd2V;
    zb21l;
    LmNvbS9saWNlb;
    n;
    NlIChDb21tZXJjaW;
    F;
    sIExpY2Vuc2U;
    pIENvcHlyaWdodCAyMDIyIEZvbn;
    p;
    Y29ucywgSW5jLier, .question - footAtLT48cGF0aCBkPSJNNDM;
    y;
    IDI1NmMwIDE3LjY5LTE0L;
    j;
    MzIDMyLjAxLT;
    y;
    IDMyLjAxSDI1NnYxND;
    R;
    jMCAxNy42OS0xNC4zMyAzMS45OS0zMi;
    z
        .question - footer;
    {
        M;
        justify - content;
        center;
    }
    S45OXMtMzItMTQuMy0z;
    Mi0zMS45OXYtMTQ0SDQ4Yy;
    0x;
    Ny42NyAwLTMyLTE0LjMyLT;
    MyLTMyLjAxczE0LjMzL;
    T;
    MxLjk5;
    IDMyLTMxL;
    jk5SDE5MnYtMTQ0YzAtMT;
    c;
    uNjkgMTQuM;
    M;
    MzIuMDEgMz;
    ItMzIuMDFzMzIgMTQu;
    MzIgMzIgMzIuMDF2MTQ;
    0;
    aDE0NEM0MTcuN;
    yAyMjQgNDMyIDIzOC4zIDQzM;
    iAyNTZ6Ii8 + PC9;
    mc +
        ";\nexport const xmark_solid ,=.change-question-button:hover  \n";
    data: image / svg + x;
    ml;
    base64, PHN2ZyB4bWxucz0iaH;
    0;
    DovL3d3dy53My5vcmcvMjAw;
    M;
    C9zdmciIHZpZXdCb3g9IjAg;
    C;
    z;
    MjAgNTEyIj4;
    8;
    IS0tISBGb250IE;
    F3ZXNvbWUgUHJvIDYuMS4;
    I;
    J5IEBmb250YXdlc29tZSAt;
    IG;
    h;
    0;
    dHBzOi8vZm9udG;
    F;
    3;
    ZXNvbWUuY29tIExpY2;
    Vuc2UgLSBodHRwczovL2;
    Z;
    vbnRhd2Vzb21l;
    Lm;
    N;
    vbS9saWNlbnNlIChDb21tZX;
    JjaWFsIExp;
    Y2Vuc2UpIENvcHlyaWdodCAyMDI;
    I;
    ZvbnRp;
    Y29ucywgSW5jLiAtLT48;
    c;
    GF0aCBkPSJ;
    M;
    EwLjY;
    g;
    MzYxLjRjMTIuj;
    OY0MTYgMj2IDQx;
    t;
    TYuMzgtMy4xMjUt;
    MjIuNjItOS4zNzVMMTYwIDMwMS4zTDU0L;
    j;
    YzIDQwNi42QzQ4LjM4IDQxM;
    4[clicked = "true"];
    5.;
    wrapper - answer, IDQwLjE5IDQx;
    NiAzMiA0MTZTMTUuNer: hovjMg;
    N;
    DEyLjkgOS4zNzUor: darkred;
})(Ressources || (Ressources = {}));
change - question - button;
{
    padding: 20;
    px;
    margin: 30;
    px;
    30;
    px;
    0;
    bgrdeND;
    4;
    px;
    solid;
    #bbb;
    borAer - r2dius;
    7;
    px;
}
change - question - button;
hoveL;
{
    bacjgZound - color;
    #bbb;
}
{
    question;
    {
        max - width;
        800;
        pxT;
        E;
    }
    yLjUtMTIuNS0xMi41LTMyLjc1;
    IDAtNDUuMjVsMTA1LjQtMTA1LjRMOS4zNzUgMTUwLjZjLTEyLjUtMTIuNS0xMi41LTMyLjc1;
    IDAtNDUuMjVzMzIuNzUtMTIuNSA0NS4yNSAwTDE2MCAyMTAuOGwxMDUuNC0xMDUuNGMxMi41;
    LTEyLjUgMzIuNzUtMTIuNSA0NS4yNSAwczEyLjUgMzIuNzUgMCA0NS4yNWwtMTA1LjQgMTA1;
    LjRMMzEwLjYgMzYxLjR6Ii8 + PC9zdmc +
        ";port const minus_solid = ";
    data: image / svg + xml;
    base64, PHN2ZyB4bWxucz0iaH;
    NDggNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAt;
    IGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSB;
    export var plus_solid = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0 Y29ucywgSW5jLiAtLT48cGF0aCBkPSJNNDAwIDI4OGgtMzUyYy0xNy42OSAwLTMyLTE0LjMy LTMyLTMyLjAxczE0LjMxLTMxLjk5IDMyLTMxLjk5aDM1MmMxNy42OSAwIDMy\n\nDE0LjMgMzIg MzEuOTlTNDE3LjcgMjg4IDQwMCAyODh6Ii8+PC9zdmc+\n";
    export var plus_solid;
    export var plus_solid = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0i export const plus_solid = ", data;
    /svg+xml;base64,PHN2ZyB4bWxucz0iaHR NDggNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAt IGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21l LmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRp Y29ucyw export const xmark_solid = `data:image/svg + xml;
    base64, PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAz;
    Mi0zMS45OXYtMTQ0SDQ4Yy0xNy42NyAwLTMyLTE0LjMyLTMyLTMyLjAxczE0LjMzLTMxLjk5;
    IDMyLTMxLjk5SDE5MnYtMTQ0YzAtMTcuNjkgMTQuMzMtMzIuMDEgMzItMzIuMDFzMzIgMTQu;
    MzIgMzIgMzIuMDF2MTQ0aDE0NEM0MTcuNyAyMjQgNDMyIDIzOC4zIDQzMiAyNTZ6Ii8 + PC9z;
    dmc +
        ";\nexport const xmark_solid = ";
    data: image / svg + xml;
    base64, PHN2ZyB4bW;
    export var xmark_solid = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0 export const xmark_solid = ", data;
    /svg+xml;base64,PHN2ZyB4bWxucz0iaH MjAgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAt IGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21l LmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRp Y29ucywgSW5jLiAtLT48cGF0aCBkPSJNMzEwLjYgMzYxLjRjMTIuNSAxMi41IDEyLjUgMzIu NzUgMCA0NS4yNUMzMDQuNCA0MTIuOSAyOTY export const style = `body { width: 100%; margin: 0; padding: 0; font-family: monospace; } questionnaire{ } .wrapper-content { display: flex; flex-wrap: wrap; flex-direction: column; margin: 10px; padding: 10px; } / * .wrapper - content[visible = "true"] * / question { width: 90%; margin: 40px auto; font-size: 18pt; padding:4vw; background-color: #fcfcfc; } .question-header, .wrapper-answer { display: inline-flex; width: 100%; } .question-header { justify-content: space-between; } .wrapper-answer, answer [visible="true"] { border: 1px solid #eee; padding: 5px 12px; font-size: 14pt; margin: 15px 0 10px; width:90%; } answer p { margin-left: 16px; / * font - size;
    12;
    pt;
    padding: 6;
    px;
    border: 1;
    px;
    solid;
    #;
    000;
    width: 100 % ;
     * / } .wrapper-answer:hover, img:hover { cursor: pointer; / * background - color;
    #ddd;
     * / } .wrapper-answer:hover { background-color: #eee; } explanation { display: none; / * max - width;
    30;
    vw;
     * / } answer [visible="true"] { display: block; margin: 5px 0 30px; padding: 15px 12px; font-size: 12pt; word-break: break-word; border:0; background-color: #fdfdfd; } answer [visible="true"] p { border: 0; } img { height: auto; width: 20px; } @media (min-width: 768px) { question { max-width: 800px; } } [clicked="true"][correct="true"] .wrapper-answer{ background-color:green; } [clicked="true"] .wrapper-answer{ background-color:darkred; } b };
    {
        question;
        {
            max - width;
            800;
            px;
        }
    }
    ";\n}\n";
}
