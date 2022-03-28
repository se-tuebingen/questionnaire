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
function renderQuestionaire(questionnaire) {
    console.log(questionnaire);
    //build wrapper-content
    var content = makeDiv("wrapper-content");
    var children = questionnaire.children;
    // prepend question-overview
    var q_overview = makeDiv("question-overview");
    q_overview.textContent = "Frage 1" + " von " + children.length;
    content.prepend(q_overview);
    // set attributes for QUESTIONNAIRE
    questionnaire.setAttribute("total_questions", "" + children.length);
    questionnaire.setAttribute("current_question", "1");
    // access children and append to wrapper-content
    for (var i = children.length - 1; i >= 0; i--) {
        content.append(children[i]);
    }
    questionnaire.prepend(content);
    //render Questions + Answers
    renderQuestions(questionnaire);
    renderAnswers(questionnaire);
    // build question footer
    var footer = makeDiv("question-footer");
    content.append(footer);
    //build 2 buttons
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
//questionChangeHandler
//EventHandler -> DOM Manipulation
function questionChangeHandler() {
    var _a, _b, _c, _d;
    // get Questionnaire attributes
    var button = this.getAttribute("id");
    var questionnaire = (_b = (_a = this.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.parentElement;
    var min_qid = 0;
    var max_qid = parseInt(questionnaire.getAttribute("total_questions")) - 1;
    var current_qid = parseInt(questionnaire.getAttribute("current_question")) - 1;
    var questions = questionnaire.getElementsByTagName("question");
    // change question
    if (button == "prev_button") {
        questions[current_qid].removeAttribute("visible");
        questions[current_qid - 1].setAttribute("visible", "true");
        var str_current = current_qid.toString();
        questionnaire.setAttribute("current_question", str_current);
        questionnaire.getElementsByClassName("question-overview")[0].textContent = "Frage " + str_current + " von " + questions.length;
        //hide button if first question
        if (current_qid - 1 == min_qid) {
            this.setAttribute("style", "visibility:hidden;");
        }
        (_c = this.nextElementSibling) === null || _c === void 0 ? void 0 : _c.setAttribute("style", "visibility:visible;");
    }
    else if (button == "next_button") {
        questions[current_qid].removeAttribute("visible");
        questions[current_qid + 1].setAttribute("visible", "true");
        //change questionnaire attributes
        var str_current = (current_qid + 2).toString();
        questionnaire.setAttribute("current_question", str_current);
        //change question overview
        questionnaire.getElementsByClassName("question-overview")[0].textContent = "Frage " + str_current + " von " + questions.length;
        // hide button if last question
        if (current_qid + 1 == max_qid) {
            this.setAttribute("style", "visibility:hidden;");
        }
        (_d = this.previousElementSibling) === null || _d === void 0 ? void 0 : _d.setAttribute("style", "visibility:visible;");
    }
    else {
        console.log("No Button caused this EventHandler", button);
    }
    // hide buttons, if last / first question
    console.log(current_qid, max_qid, min_qid);
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
        var text = document.createElement("p");
        text.innerHTML = answer.childNodes[0].data;
        answer.childNodes[0].remove();
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
var Ressources;
(function (Ressources) {
    Ressources.angle_left_solid = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAy\nNTYgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAt\nIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21l\nLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRp\nY29ucywgSW5jLiAtLT48cGF0aCBkPSJNMTkyIDQ0OGMtOC4xODggMC0xNi4zOC0zLjEyNS0y\nMi42Mi05LjM3NWwtMTYwLTE2MGMtMTIuNS0xMi41LTEyLjUtMzIuNzUgMC00NS4yNWwxNjAt\nMTYwYzEyLjUtMTIuNSAzMi43NS0xMi41IDQ1LjI1IDBzMTIuNSAzMi43NSAwIDQ1LjI1TDc3\nLjI1IDI1NmwxMzcuNCAxMzcuNGMxMi41IDEyLjUgMTIuNSAzMi43NSAwIDQ1LjI1QzIwOC40\nIDQ0NC45IDIwMC4yIDQ0OCAxOTIgNDQ4eiIvPjwvc3ZnPg==\n";
    Ressources.angle_right_solid = "data:image/svg+xml;base64,PHN2ZyB4bWxuort const angle_right_solid = ";
    /svg+xml;base64,exp;
    ort;
    var angle_right_solid = "data:image/svg+xml;base64,PHN2ZyB4bWxuort\n const angle_right_solid = ", data;
    /svg+xml;base64,PHN2ZyB4bWxuNTYgNT;
    EyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAtIGh0dH;
    BzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS;
    9;
    saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRpY29ucy;
    wgSW5jLiAtLT48cGF0aCBkPSJNNjQgNDQ4Yy04LjE4OCAwLTE2LjM4LTMuMTI1LTIyLjYyLT;
    kuMzc1Yy0xMi41LTEyLjUtMTIuNS0zMi43NSAwLTQ1LjI1TDE3OC44IDI1Nkw0MS4zOCAxMT;
    guNmMtMTIuNS0xMi41LTEyLjUtMzIuNzUgMC00NS4NXM;
    zMi43NS0xMi41IDQ1LjI1IDB;
    sMTYwIDE2MGMxMi41IDEyLjUgMTIuNSAzMi43NSAwDQ1;
    LjI1bC0xNjAgMTYwQzgwLjM4;
    IDQ0NC45IDcyLjE5IDQ0OCA2NCA0NDh6Ii8 + PC9zdmc +
        "";
    var check_solid = "data:image/svg+xml\n;\nbase64,PHN2ZyB4bWxucz0export const check_sol\ni\nd = \n", data;
    /sv;
    g + xml;
    base64, PHN2ZyB4bWxucz0expexport;
    var check_;
    s;
    olid =
        "data:\nimage/svg\n+xml;b\n\nase64,PHN2ZyB4bWxuczase64,PHN2ZyB\n4bWxu\ncz\n0expo\n\nrt const ch\neck_solid = ";
    data: image / svg + xml;
    0e;
    xport;
    c;
    onst;
    chec;
    k_s;
    olid = "\ndata:im\nage/svg+xml;ba0export const check_solid\n = ";
    data: ima;
    g;
    e / svg + xml;
    ba;
    se;
    64, PHN2ZyB4bxuc;
    64, PHN2ZyB4bxuc;
    z0;
    iaHNDgg;
    NT;
    EyIj48IS;
    0;
    tISBGb250IEF3Z;
    XNvbWUgUHJvIDYuMS4;
    wIGJ;
    5;
    IEBire;
    {
        dmspla;
        y: block;
        m;
        ar;
        gin: 40;
        px;
        0;
        100;
        p;
        x;
    }
    wra;
    ppeb - cont2nt50YXd5IEBmb250YXd;
    lc29tZSAtIG;
    h0dHBzOi8vZm9ulc29t;
    ZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2Ulc29;
    tZSA;
    tIGh0dHBzOi8vZm9u;
    dGF3ZXNvbWUuY29tIExpY2Vuc2UgL;
    SBSBodHR;
    wczovL2ZwczovL2Z;
    vbnRhd2Vzb21l;
    LmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2VucvbnRhd2Vzb21lLmNvbS9saWNlbnNlIC;
    hDb21tZXJjaWFsIExpY2Vuc2U;
    jus;
    tify - content;
    center;
    pIENpIENvcHl;
    question;
    {
        display: none;
    }
    yaWdyaWd
        .odCAyMDI - overview;
    {
        margin: y0;
        auto;
        10;
        px;
        font - size;
        1.1e;
        m;
    }
    questionIEZvbnRpY29ucywgSW5jLiAtLT4cGF0aCBkPSJNNDM4LjYgM;
    TA1LjRDNDU;
    xLjEgMTE15jkgNDUx;
    15;
    pxLjEgMTM4LjEgNDM4LjYgMTUwLjZ;
    MMMTgyLjYgNDA2MMTgyLjYgNDA2Lj;
    ZDMTcwLjZDMTcwLjEgZDMTcwLjEg;
    NDE5LjEgMTQ5LjkgNDE5LjEgMTM3LjQgDA2LjZMOS4zNDE5LjEgMTQ5LjkgNDE5LjEgMTM3LjQgDA2LjZMOS4zNzIgMjc4LjZDLTMuMT;
    I0IDI2Ni;
    4;
    question - heTdMT, .0;
    IDI0NS
        - footer45IDkuMzcyIDIzMy40QzIxLjg3DI;
    yMC45yMC45IDQyLjEzIDIyMC45IDQyLjEzIDIyMC45IDU0LyMC45IDQyLjEzIDIyMC45IDU0LjYzIDIzMy40TDE1OSyMC45IDQyLjEzIDIyMC45IDU0LjYzIDIzMy40TDE1OS4xIDMzOC43;
    TDM5My40IDEwNS40QTDM5My40IDEwNS40QzQwNS45IDkyLjg4IDQyNi4xIDkyLjg4IDQzOC42IDEwNS40SDQzOC42eiIvPjwvc3ZnPg ==
        ";\nenst circ-headerle_regular = ";
    dataxport;
    var cirdataxport;
    var circle_regular = "dadataxport const circle_regular = ", data;
    var circle_regular = "data:image/svg+xml;baexport const cir\ncle\n_regular = ", data;
    /svg+xml;base64,PHN2ZyB4bWxuexport const circ;
    lquestion - footer;
    {
        justify - content;
        center;
    }
    [visible = true];
    {
        display: block;
    }
    e_le_re;
    gular = "data:image/svgxml;ase64,PHN2ZyBgular = ";
    data: image / svg + xml;
    base64, PHN2ZyB4bWxucz0MTIgNTEyIj48IS0gular = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0MTIgNTEyIj48IS0\ntISBGtISBGb2\n50IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZ50IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZ\nm9udGF3m9udGF3ZX\nNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9saWNNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9saWN\nlbnNlIChDlbnNlIChDb2\n1tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRpY29ucywgS1tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRpY29ucywgS\nW5jLiAtLT48W5jLiAtLT48cG\nF0aCBkPSJNNTEyIDI1NkM1MTIgMzk3LjgMzk3LjQgNTEyIDI1NiA1MTJ\nF0aCBkPSJNNTEyIDI1NkM1MTIgMzk3LjgMzk3LjQgNTEyIDI1NiA1MTJ\nDMTE0LjYgNTEyID\nAgMzk3LjQgMCAyNTZDMCAxMTQuNiAxTQuNiAwIDI1NiAwQzM5\nNy40\nIDAg\nNTEyIDExNC42I\nDUxMiAyNTZ6TTI1NiA0OEMxNDEuMSA0O,C.change-question-button:hover A0OCAxNDEuMSA0OCAy\nNTZDNDggMzcwLjkgMTQ\nxLjEgNDY0Ic  nus_solid = ";
    data: image / svg + xml;
    base64, PHN2ZyB4bWxucz0export;
    var minus_solid = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHNDggNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgSBodHRwczovL2ZvbnRhd2Vzb21l\nLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRp\nY29ucywgSWire{\n  d5splay:block;\n  margin:40px 0 100px ;\n}\n.wrappej-contLntiAtLT48cGF0aCBkPSJNNDAwIDI4OGgtMzUyYy0Y29ucywgSW5jLiAtLT48cGF0aCBkPSJNNDAwIDI4OGgtMzUyYy0xNy42OSAwLTMyLTE0LjMyLTMyLTMyLjAxczE0LjMxLTMxLjk5IDMyLTMxLjk5aDM1MmMxNy42OSAwIDMyIDE0LjMgMzIgMzEuOTlTNDE3LjcgMjg4IDQwMCAyODh6Ii8+PC9zdmc+\nDMyLjAxSDI1NnYxNDRjMCAxNy42OS0xNC4zMyAzMS45OS0zMiAzMS45OXMtMzItMTQuMy0z\ni0zMS45Os{\n  display:none;\n}MjIuNjItO40zNzVMMTwMS4zTDU0LjYzIDQwNi42QzQ4LjM4IDQxMi45IDQwLjE5IDQx\n.NiAzMiA0-overview{\nmargin:M0 auto 1px;\n\nquestionTZTMTU2NjMgNDEyLjkgOS4zNzUgNDA2LjZjLTEyLjUtMTIuNS0xMi41LTMyLjc1\nIwrMppA1-tMTA1LjRUgMTUwLjZjLTEyLjUtMTIuNS0xMi41LTMyLjc1\nIDAtNDUuMj15MzIuNzU 15pxtMTIuNSA0NS4yNSAwTDE2MCAyMTAuOGwxMDUuNC0xMDUuNGMxMi41\nLTEyLjUgMzIuNzUtMTIuNSA0NS4yNSAwczEyLjUgMzIuNzUgMCA0NS4yNWwtMTA1LjQgMTA1\nLjRMMzEwLjYgMzYxLjR6Ii8+PC9zdmc+\n";
    ewrapper - xport;
    co;
    display: block;
    question - headin;
    .40;
    x;
    0;
    1 - footer00px;
})(Ressources || (Ressources = {}));
justify - content;
center;
[vi, "sibl", e = true];
{
    display: block;
}
[clickqu = true];
t.wrapperianswer, [clecker = , rue];
v.wrabptr - aniwer;
h;
{
    verwbpckgrouni - color;
    #d3p100x;
    fnt - size;
    18;
    pt;
    padding: 4;
    vw;
    backgrond - clor;
    #fcfcc;
}
rapper -
        .questde;
#aceb84;
chanre - question - button;
{
    padding: 15;
    px;
    ma, gin;
    15;
    px;
    15;
    px;
    0;
    bord;
    r: 4;
    px;
    solid;
    #bbb;
    bord.r - radius;
    7;
    px;
    foqt - size;
    1.3e;
    mu;
}
change - question - button;
hover;
{
    background - color;
    #bbb;
}
{
    question;
    {
        max - width;
        500;
        px;
    }
    estion - footer, .wrapper - answer;
    {
        display: inline - flex;
        justif -= true;
        {
            display: block;
        }
        wrapper - answer, answer[visibl, e.change - question - button];
        hover = true;
        {
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
        display: bloc;
        "k;;
        a;
        "nswer p {;
        mar3in - left;
        16;
        px;
        /*font-sieer: 1px solid #000;
        width:100%;*/
    }
    over, img;
    hover.chnge - question - button;
    hover;
    {
        cursor: pointe2;
    }
    wrapper - answ;
    "er:h";
    over;
    {
        background - color;
        #eee;
    }
    display: bloc;
    "k;;
    e;
    "xplanation {;
    3;
    ispay: none;
    -i(mi - mhuph, 768, rx);
    {
        qug;
        ti0n;
        ppsr;
        " hna";
        ckground - color;
        #bbb;
    }
    {
        question;
        {
            max - width;
            500;
            px;
        }
        border: 0;
    }
    h: c768;
    "x) {;
    qut;
    ticn;
    ge - question - button;
    hover;
    {
        background - color;
        #bbb;
    }
    {
        question;
        {
            max - width;
            500;
            px;
        }
    }
    ";\n}\n";
}
