"use strict";
// #### QUESTIONNAIRE MODULE ####
// This module implements the questionnaire functionality
;
;
// ########### PARSE METHODS
function parseQuestionnaire(questionnaire) {
    return {
        rootElement: questionnaire,
        questions: Array.from(questionnaire.children).map(x => parseQuestion(x))
    };
}
function parseQuestion(question) {
    const type = question.getAttribute('type');
    const text = Array.from(question.childNodes)
        .filter(x => x.tagName != 'DISTRACTOR'
        || x.tagName == 'SOLUTION');
    const answers = Array.from(question.childNodes)
        .filter(x => x.tagName == 'DISTRACTOR'
        || x.tagName == 'SOLUTION');
    return {
        type: type,
        text: text,
        answers: answers.map(x => parseAnswer(x)),
        rootElement: question
    };
}
function parseAnswer(answer) {
    const correct = (answer.tagName == 'SOLUTION') ? true : false;
    const text = Array.from(answer.childNodes)
        .filter(x => x.tagName != 'EXPLANATION');
    const explanation = answer.getElementsByTagName('explanation')[0];
    return {
        correct: correct,
        text: text,
        explanation: explanation,
        rootElement: answer
    };
}
function setup() {
    // setup style
    const styleNode = document.createElement('style');
    styleNode.innerHTML = Ressources.style;
    document.getElementsByTagName('head')[0].appendChild(styleNode);
    const q_col = document.getElementsByTagName("questionnaire");
    // render every questionnaire in the HTML Document
    for (let i = q_col.length - 1; i >= 0; i--) {
        const questionnaire = q_col[i];
        // validate htmL Structure before parsing
        //    if (validateQuestionnaireStructure(questionnaire) == true) {
        const r = parseQuestionnaire(questionnaire);
        console.log(r);
        // Possible ValidationPoint (Attributes)
        renderQuestionnaire(r);
        //    }
        //    else {
        //DO NOTHING
        //    }
    }
}
window.onload = setup;
// render questionnaire:
// addEventListener for "click"-Events
// build wrapper-<div> and <img>-icons for
// - answer
// - question
// ### RENDER FUNCTIONS ###
function renderQuestionnaire(questionnaire) {
    const root = questionnaire.rootElement;
    root.setAttribute("total_questions", "" + questionnaire.questions.length);
    root.setAttribute("current_question", "1");
    const overview_text = oneQuestionOnly("overview_text");
    const buttons = oneQuestionOnly("buttons");
    root.innerHTML = `
    <div class="content-wrapper">
      <div class="question-overview">
      ${overview_text}
      </div>
      ${questionnaire.questions.reverse().map(renderQuestion)}
      <div class="question-footer">
      ${buttons}
      </div>
    </div>
  `;
    // Local functions
    function oneQuestionOnly(pos) {
        switch (pos) {
            // if only one question exists, ignore question overview text
            case "overview_text":
                if (questionnaire.questions.length == 1) {
                    return "";
                }
                else {
                    return `Question 1 of ${questionnaire.questions.length}`;
                }
            // if only one question exists, ignore "prev", "next" buttons.
            case "buttons":
                if (questionnaire.questions.length == 1) {
                    return "";
                }
                else {
                    return `
          <div class="change-question-button"
               id="prev_button"
               style="visibility:hidden;"
               onclick="questionChangeHandler(event)">
               prev
          </div>
          <div class="change-question-button"
               id="next_button"
               onclick="questionChangeHandler(event)">
               next
          </div>
          `;
                }
            default:
                break;
        }
    }
}
// renderQuestions
// if validation fails return false, else return html-string
function renderQuestion(question, index) {
    // if (validateAttribute(question) == true) {
    return `
    <question type="${question.type}" ${index == 0 ? 'visible="true"' : ''}>
      <div class="question-header">
        <p>${question.text.map(nodeOuterHTML).join('')}</p>
        <img src="${Ressources.plus_solid}" onclick="explanationEventHandler(event)">
      </div>
      ${question.answers.map(renderAnswer).join('')}
    </question>
  `;
}
//  else {
//    return "";
//  }
//}
function renderAnswer(answer) {
    var _a;
    return `
  <answer correct="${answer.correct ? 'true' : 'false'}">
    <div class="wrapper-answer" onclick="clickAnswerHandler(event)">
      <img src="${Ressources.circle_regular}">
      <p>
        ${answer.text.map(nodeOuterHTML).join('')}
      </p>
      ${(_a = answer.explanation) === null || _a === void 0 ? void 0 : _a.outerHTML}
    </div>
  </answer>
  `;
}
function nodeOuterHTML(x) {
    const outerHTML = x.outerHTML;
    if (outerHTML == undefined) {
        const data = x.data;
        if (data == undefined) {
            return '';
        }
        return data;
    }
    console.log("outerHTML:" + outerHTML);
    return outerHTML;
}
// renderError
function renderError(current_el, message) {
    const el_name = current_el.localName;
    const questionnaire = getTagRecursive(current_el, "questionnaire");
    const error_html = `
  <div class="error-wrapper">
    <div class="error-header">
      <h2> Why do I see this red funny box?</h2>
    </div>
    <div class="error-box">
    <p>There was a syntax error with:
    &lt;${el_name}&gt;</p>
    </div>
    <pre class="error-message">
    ${escapeHtml(message)}
    </pre>
  </div>
  `;
    questionnaire.innerHTML = error_html;
    console.log(error_html);
}
// ######### VALIDATION METHODS ##########
// validateQuestionnaireStructure
// checks if all necessary tags in questionnaire have the correct parentElement
function validateQuestionnaireStructure(questionnaire) {
    let questions = questionnaire.getElementsByTagName("question");
    let answers = questionnaire.getElementsByTagName("answer");
    let explanation = questionnaire.getElementsByTagName("explanation");
    // validate given html tag elements
    if (validateHtmlTagElements(questions.length - 1, questions) == true
        && validateHtmlTagElements(answers.length - 1, answers) == true
        && validateHtmlTagElements(explanation.length - 1, explanation) == true) {
        return true;
    }
    else {
        return false;
    }
    function validateHtmlTagElements(i, col) {
        if (i >= 0) {
            let validated = validateStructure(col[i]);
            if (validated == true) {
                let bool = validateHtmlTagElements(i - 1, col);
                return bool;
            }
            else {
                return false;
            }
        }
        else {
            return true;
        }
    }
}
// ValidateStructure
// <questionnaire> -> <question> -> at least 2 <answer> -> <explanation>
// return either messageString or Boolean: True
function validateStructure(el) {
    const html_tag = el.tagName;
    const parent = el.parentElement;
    if (html_tag == "QUESTION") {
        // parent has to be a QUESTIONNAIRE
        return parentHasToBe(parent, "QUESTIONNAIRE");
    }
    else if (html_tag == "ANSWER") {
        // parent has to be a QUESTION
        return parentHasToBe(parent, "QUESTION");
    }
    else if (html_tag == "EXPLANATION") {
        // parent has to be an ANSWER
        return parentHasToBe(parent, "ANSWER");
    }
    function parentHasToBe(parent, tag) {
        var _a;
        if ((parent === null || parent === void 0 ? void 0 : parent.tagName) == tag) {
            return true;
        }
        else {
            let msg = `HTML structure is invalid: Please check your input at:  ${(_a = el.parentElement) === null || _a === void 0 ? void 0 : _a.outerHTML}`;
            renderError(el, msg);
            return false;
        }
    }
}
// validateAttributes
// check <question> attribute singlechoice | multiplechoice
// check multiple <answer> attributes for at least (for multiplechoice) 1 correct answer
// returns true (for successful validation) or false (fail)
function validateAttribute(question) {
    let val = question.type;
    let answers = question.answers;
    let i = answers.length - 1;
    let x = 0;
    let correct_answers = getCorrectAnswer(x, i);
    // get all correct answers to this question
    function getCorrectAnswer(x, i) {
        if (i >= 0) {
            let correct = answers[i].correct;
            if (correct == true) {
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
    // if attr value does not exist
    if (val == null) {
        let msg = `Necessary attribute &lt;question type='' &gt; is missing at: ${question.rootElement.outerHTML}`;
        renderError(question.rootElement, msg);
        return false;
    }
    // if value exists, but is not correctly assigned
    else if (val != "singlechoice" && val != "multiplechoice") {
        let msg = `Necessary attribute &lt;question type='' &gt; with value: ${val}is neither 'singlechoice' nor 'multiplechoice': ${question.rootElement.outerHTML}`;
        renderError(question.rootElement, msg);
        return false;
    }
    // if only 1 or less answer exists
    else if (answers.length < 2) {
        let msg = `You need to provide at least two answers for one question:  ${question.rootElement.outerHTML}`;
        renderError(question.rootElement, msg);
        return false;
    }
    else if (correct_answers == 0) {
        let msg = `There is no correct answer in this question: ${question.rootElement.outerHTML}`;
        renderError(question.rootElement, msg);
        return false;
    }
    // if question attr is singlechoice, but more than one correct answer exists
    else if (val == "singlechoice" && correct_answers > 1) {
        let msg = `There is more than one correct answer, but your question type is 'singlechoice': " ${question.rootElement.outerHTML}`;
        renderError(question.rootElement, msg);
        return false;
    }
    else {
        return true;
    }
}
// ######## HELPER FUNCTIONS #######
// makeDiv
// ClassName as String -> HTMLDivElement
function makeDiv(css_name) {
    const new_div = document.createElement("div");
    new_div.setAttribute("class", css_name);
    return new_div;
}
// escapeHtml
// escape HTML TAGS
function escapeHtml(str) {
    return str.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
// getTagRecursive from a child element
// if element has TagName
// return;
// else: retry with parentElement
function getTagRecursive(el, tag) {
    if (el.tagName == tag.toUpperCase()) {
        return el;
    }
    else {
        let parent = el.parentElement;
        let result = getTagRecursive(parent, tag);
        return result;
    }
}
// ### EVENT HANDLER FUNCTIONS ###
// EVENT AFTER BUTTON "prev" OR "next" CLICK
// questionChangeHandler
// EventHandler -> DOM Manipulation
function questionChangeHandler(event) {
    var _a, _b;
    // get Questionnaire attributes
    let el = event.target;
    let button = el.getAttribute("id");
    let questionnaire = getTagRecursive(el, "questionnaire");
    let total_questions = parseInt(questionnaire.getAttribute("total_questions"));
    let current_question = parseInt(questionnaire.getAttribute("current_question"));
    let questions = questionnaire.getElementsByTagName("question");
    let min_qid = 0;
    let max_qid = total_questions - 1;
    let qid = current_question - 1;
    // change question
    // if button is "prev"
    switch (button) {
        case "prev_button":
            let prev_qid = current_question - 1;
            // change visibility to the previous question
            questions[qid].removeAttribute("visible");
            questions[qid - 1].setAttribute("visible", "true");
            // change question overview text
            questionnaire.setAttribute("current_question", prev_qid.toString());
            questionnaire.getElementsByClassName("question-overview")[0].textContent = "Question " + prev_qid.toString() + " of " + total_questions;
            //hide button if button to first question
            if (prev_qid - 1 == min_qid) {
                el.setAttribute("style", "visibility:hidden;");
            }
            // show next-Button
            (_a = el.nextElementSibling) === null || _a === void 0 ? void 0 : _a.setAttribute("style", "visibility:visible;");
            break;
        case "next_button":
            let next_qid = qid + 1;
            questions[qid].removeAttribute("visible");
            questions[next_qid].setAttribute("visible", "true");
            //change question overview text
            questionnaire.setAttribute("current_question", (current_question + 1).toString());
            questionnaire.getElementsByClassName("question-overview")[0].textContent = "Question " + (current_question + 1).toString() + " of " + total_questions;
            // hide button if button to last question
            if (next_qid == max_qid) {
                el.setAttribute("style", "visibility:hidden;");
            }
            //show prev_button
            (_b = el.previousElementSibling) === null || _b === void 0 ? void 0 : _b.setAttribute("style", "visibility:visible;");
            break;
        default:
            console.log("No Button caused this EventHandler", button);
            break;
    }
}
// ExplanationEventHandler
// Handles Events for shoowing explanation text
function explanationEventHandler(event) {
    const el = event.target;
    const question = getTagRecursive(el, "question");
    const answers = question.getElementsByTagName("answer");
    //change icons and collapse
    if (el.getAttribute("clicked") == "true") {
        el.setAttribute("src", Ressources.plus_solid);
        el.setAttribute("clicked", "false");
        for (let i = answers.length - 1; i >= 0; i--) {
            let answer = answers[i];
            answer.getElementsByTagName("explanation")[0].removeAttribute("visible");
        }
    }
    else {
        el.setAttribute("src", Ressources.minus_solid);
        el.setAttribute("clicked", "true");
        for (let i = answers.length - 1; i >= 0; i--) {
            let answer = answers[i];
            answer.getElementsByTagName("explanation")[0].setAttribute("visible", "true");
        }
    }
}
// show <explanation>
//Answer->DOM Manipulation
function showExplanation(answer) {
    let explanation = answer.getElementsByTagName("explanation")[0];
    if (explanation.getAttribute("visible") == "true") {
        explanation.removeAttribute("visible");
    }
    else {
        explanation.setAttribute("visible", "true");
    }
}
// unified click on answer event handler
function clickAnswerHandler(event) {
    const el = event.target;
    checkAnswerEventHandler(el);
    // show Explanation
    let answer = getTagRecursive(el, "answer");
    showExplanation(answer);
}
// check click for correct answer
// depending on question type show either
// - for multiplechoice just clicked answer
// - for singlechoice all answers
function checkAnswerEventHandler(el) {
    let question_type = getTagRecursive(el, "question").getAttribute("type");
    if (question_type == "multiplechoice") {
        let answer = getTagRecursive(el, "answer");
        showAnswer(answer);
    }
    else if (question_type == "singlechoice") {
        let answers = getTagRecursive(el, "question").getElementsByTagName("answer");
        for (let i = (answers === null || answers === void 0 ? void 0 : answers.length) - 1; i >= 0; i--) {
            let answer = answers[i];
            showAnswer(answer);
        }
    }
}
// showAnswer
// show icons and highlight answer
function showAnswer(answer) {
    answer.setAttribute("clicked", "true");
    let img = answer.getElementsByTagName("img")[0];
    if (answer.getAttribute("correct") == "true") {
        img.setAttribute("src", Ressources.check_solid);
    }
    else {
        img.setAttribute("src", Ressources.xmark_solid);
    }
}
var Ressources;
(function (Ressources) {
    Ressources.angle_left_solid = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAy
NTYgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAt
IGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21l
LmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRp
Y29ucywgSW5jLiAtLT48cGF0aCBkPSJNMTkyIDQ0OGMtOC4xODggMC0xNi4zOC0zLjEyNS0y
Mi42Mi05LjM3NWwtMTYwLTE2MGMtMTIuNS0xMi41LTEyLjUtMzIuNzUgMC00NS4yNWwxNjAt
MTYwYzEyLjUtMTIuNSAzMi43NS0xMi41IDQ1LjI1IDBzMTIuNSAzMi43NSAwIDQ1LjI1TDc3
LjI1IDI1NmwxMzcuNCAxMzcuNGMxMi41IDEyLjUgMTIuNSAzMi43NSAwIDQ1LjI1QzIwOC40
IDQ0NC45IDIwMC4yIDQ0OCAxOTIgNDQ4eiIvPjwvc3ZnPg==`;
    Ressources.angle_right_solid = `data:image/svg+xml;base64,PHN2ZyB4bWxuNTYgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmbexp
ort const angle_right_solid = `;
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
        `;
export const check_solid = `;
    data: image / svg + xml;
    base64, PHN2ZyB4bWxucz0export;
    co;
    Ressources.check_solid = `data:image/svg+xml;b

ase64,PHN2ZyB4bWxucz
0export const check_solid = `;
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
    eiIvPjwvc3Zn;
    square_regular = P `data:image/svg+xml;b
ase64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9Ij
AgMCA0
NDggNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4gIGJ5IEBmb250YXdl
c29tZSAt
IGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2Zvbn
Rhd2Vzb21l
L=NvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHly=WdodCAy
MDIyIEZvbnRp
Y29ucywgSW5jLiAtLT48cGF0aCBkPSJNMzg0IDMyQzQxOS4zIDMyIDQ0OC
A2MC42NSA0NDgg
OTZWNDE2QzQ0OCA0NTEuMyA0MTkuMyA0ODAgMzg0IDQ4MEg2NEMyOC42
NSA0ODAgMCA0NTEu
MyAwIDQxNlY5NkMwIDYwLjY1IDI4LjY1IDMyIDY0IDMySDM4NHpNMz
g0IDgwSDY0QzU1LjE2
IDgwIDQ4IDg3LjE2IDQ4IDk2VjQxNkM0OCA0MjQuOCA1NS4xNiA0
MzIgNjQgNDMySDM4NEMz
OTIuOCA0MzIgNDAwIDQyNC44IDQwMCA0MTZWOTZDNDAwIDg3LjE2IDM5Mi44IDgwIDM4NCA4
MHoiLz48L3N2Zz4=`;
    expo;
    t;
    const xmar;
    `;
export const circleY29ucywgSW5jL iAtLT48cGF0aCBkPSJNNDAwIDI4OGgtMzUyYy0Y29ucywgSW5jLiAtLT48cGF0aCBkPSJNNDA
wIDI4OGgtMzUyYy0xNy42OSAwLTMyLTE0LjMyLTMyLTMyLjAxczE0LjMxLTMxLjk5IDMyLTM
xLjk5aDM1MmMxNy42OSAwIDMyIDE0LjMgMzIgMzEuOTlTNDE3LjcgMjg4IDQwMCAyODh6Ii8
+PC9zdmc+`;
    co;
    nst;
    Ressources.plus_solid;
    Ressources.plus_solid = `data:i
mage/svg+xml;base64,PHN2ZyB4bWxucz0iexport const plus_solid = `;
    e / svg + xml;
    base64, PHN2ZyB4bWxucz0iaHRNDggNTEyIj48IS0tISBGb250IEF3ZXNvbWUg;
    UHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExp;
    Y2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExp;
    Y2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRpY29uywgSW5jLiAtLT48cGF0aCBkPSJNNDMyI;
    DI1NmMwIDE3LjY5LTE0LjMzIDMyLjAxLTMy;
    IDMyLjAxSDI1SyzIcT48cGF0aCBkPSJNMzg;
    0;
    IDMyQzQxOS4zIDMyIDQ0OCA2MC42NSA0NDgg;
    OTZWNDE2QzQ0OCA0NTEuMyA0MTkuMyA0O;
    DAgMzg0IDQ4MEg2NEMyOTZWNDE2QzQ0O;
    CA0NTEuMyA0MTkuMyA0ODAgMzg0IDQ4MEg2NEMyOC42NSA0ODAgMCA0NTEuMyAwIDQxNlY5NkMwIDYwLjY1IDI4LjY1IDMyIDY0IDMySDM4NHpNMzg0IDgwSDY0QzU1LjE2IDgwIDQ4IDg3LjE2IDQ4IDk2VjQxNkM0OCA0MjQuOCA1NS4xNiA0MzIgNjQgNDMySDM4NEMzOTIuOCA0MzIgNDAwIDQyNC44IDQwMCA0MTZWOTZDNDAwIDg3LjE2IDM5Mi44IDgwIDM4NCA4MHoiLz48L3N2Zz4 =
        questionnaire `;
export const xmark_solid = `;
    data: image / svg + xml;
    base6export;
    const xmark_solid = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0export const xmark_solid = `, data;
    /svg+xml;base64,PHN2ZyB4bWxucz0iaHMjAgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRpY29ucywgSW5jLiAtLT48cGF0aCBkPSJNzEwLjYgMzYxLjRjMTIuNSAxMi41IDEyLjUgMzIu;
    NzUgMCA0NS4yNUMzMDQuNCbody;
    {
        width: 100 % ;
        margin: 0;
        padding: 0;
        font - family;
        monospace;
    }
    A0MTIunOaire;
    questionSAyOTYMiA0MTYgMjg4IDQxNnMtMTYuMzgtMy4xMjUt;
    MjIuNjItOSzNzVMMTYwIDMwMS4zTDU0LjYzIDQwNi42QzQ4LjM4IDQxMi45IDQwLjE5IDQx;
    questionnaire;
    NiAzMiA0MZTMTUuNjMgNDEyLjkgOS4zNzUgNDA2LjZjLTEyLjUtMTIuNS0xMi41LTMyLjc1;
    IDAtNDUuMjVsMTA1LjQtMTA1LjRMOS4zNzUgMTUwLjZjLTEyLjUtMTIuNS0xMi41LTMyLjc1;
    IDAtNDUuMjVzMzIuNzUtMTIuNSA0NS4yNSAwTDE2MCAyMTAuOGwxMDUuNC0xMDUuNGMxMi41;
    UtMTIuNSA0NS4yNSAwczEyLjUgMzIuNzUgMCA0NS4yNWwtMTA1LjQgMTA1;
    LjRMMzEwnaire;
    questionLjYgMzYxLjR6Ii8 + PC9zdmc +
        `;
export con0tyle estionnaire {
  display: block;
  margin: 40px 0 100px ;
}

question-wrapper {
questionnaire   display: flex;
 questionnaire  flex-wrap: wrap;
questionnaire on: column;
  margin: 10px;
  padding: 10px;
questionnaire   justify-content: center;
}
  margin-bottom: 0.5em;
question{
  display:15pxone;
questionnaire  15px}
questionnaire .question-overview{
margin: 0 auto 10px;
font-size:1.1em;
questionnaire }
question{
  widthn: 0 auto;
  font-sadding:4vw;
questionnaire olor: #fcquestion-header, questionnaire .question-footer, questionnaire .wrapper-answer {
  display: inline-flex;

}

questionnaire.estion-header {
questionnaire ent: space-between;
  margin-bottom: 0.5em;
}

.questionanswer, -footer[visible=true] {
  justify-content: center;
}

questionnaire questionnaire [vi1spxibquestionnalre ie=true]{
 questionnaire    display:block;
}

.wrapper-answer {
questionnaire   border: 1px solid #eee;
  padding: 5px 12px;
  font-size: 14pt;
  margin: 15px 0 0;
  width:90%;
qu}stionnaire e

answer p {
  margin: 0  ding: 6pxe: 12pt;
  border: 1px solid #000;
questionn/ire a
}

questionnae.apper-answer:hover, questionnaire img:hover, questionnaire .change-question-button:hover {
  cursor: pointer;
/color: #ddd;*/
}

questionnaire .wrapper-answer:hover {
questionn ire a background-color: #eee;
i 0r2epx explanation {
  display: none;
  /*max-width: 30vw;*/
questionna}re i

qumargsnn1em;
  nlign-self: center;
}

qies;i
nnaire p { align-self: center answer [visible=true] {
 ;
  padding: 15px 12px;
questionnaire   font-size: 12pt;
  word-break questionnaire: break-word;
;ackgrou
 re20px
questionnaire   height: 1em;
center;
}

questionnaire questionnaire p {
 ater;
}

[click0rue] rapper-answer, questionnaire [clicked=true] .wrapper-answer:hover{
  background-color:#d30000;
}
questionnaire 
questi15pxnnair 0e [clicked=true][correct=true] .wrapper-answer{
  background-color:#aceb84;
}
 .change-question-button{
  questionnaire padding:15px;
  margin:0 15px;
  border: 4px solid #bbb;
 : 7px;
  font-size:1.3em;
}
q
.error-wrapper{
  display:block;
  max-width: 600px;
  border: 5px solid red;
   margin: 0 auto;
  padding:0 20px;
}
.error-header{

}
.error-box{
font-size:16pt;
line-height:1.5em;
}

.error-message{
  font-family:monospace;
  font-size:12pt;
}error-box{
font-size:16pt;
line-height:1.5em;
}

.error-message{
  font-family:monospace;
  font-size:12pt;
}`;
})(Ressources || (Ressources = {}));
