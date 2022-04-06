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
        && x.tagName != 'SOLUTION');
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
        if (validateQuestionnaireStructure(questionnaire) == true) {
            const r = parseQuestionnaire(questionnaire);
            console.log(r);
            // Possible ValidationPoint (Attributes)
            renderQuestionnaire(r);
        }
        else {
            //DO NOTHING
        }
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
      ${questionnaire.questions.map(renderQuestion).join('')}
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
        <div>${question.text.map(nodeOuterHTML).join('')}</div>
        <img src="${Ressources.plus_solid}" onclick="collapseEventHandler(event)">
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
    return `
  <answer correct="${answer.correct ? 'true' : 'false'}">
    <div class="wrapper-answer" onclick="clickAnswerHandler(event)">
      <img src="${Ressources.circle_regular}">
      <div>
        ${answer.text.map(nodeOuterHTML).join('')}
        ${(answer.explanation == undefined) ? '' : answer.explanation.outerHTML}
      </div>
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
    else if (html_tag == "SOLUTION" || html_tag == "DISTRACTOR") {
        // parent has to be a QUESTION
        return parentHasToBe(parent, "QUESTION");
    }
    else if (html_tag == "EXPLANATION") {
        // parent has to be an SOLUTION OR DISTRACTOR
        return parentHasToBe(parent, "SOLUTION", "DISTRACTOR");
    }
    function parentHasToBe(parent, tag, tag_two) {
        if ((parent === null || parent === void 0 ? void 0 : parent.tagName) == tag || (parent === null || parent === void 0 ? void 0 : parent.tagName) == tag_two) {
            return true;
        }
        else {
            let msg = `HTML structure is invalid: Please check your input at:  ${parent === null || parent === void 0 ? void 0 : parent.outerHTML}`;
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
// CollapseEventHandler
// Handles Collapse Event for shoowing explanation texts
function collapseEventHandler(event) {
    const el = event.target;
    const question = getTagRecursive(el, "question");
    const answers = question.getElementsByTagName("answer");
    //change icons and collapse
    if (el.getAttribute("clicked") == "true") {
        el.setAttribute("src", Ressources.plus_solid);
        el.setAttribute("clicked", "false");
        for (let i = answers.length - 1; i >= 0; i--) {
            let answer = answers[i];
            let explanation = answer.getElementsByTagName("explanation")[0];
            (explanation != undefined) ? explanation.removeAttribute("visible") : "";
        }
    }
    else {
        el.setAttribute("src", Ressources.minus_solid);
        el.setAttribute("clicked", "true");
        for (let i = answers.length - 1; i >= 0; i--) {
            let answer = answers[i];
            let explanation = answer.getElementsByTagName("explanation")[0];
            (explanation != undefined) ? explanation.setAttribute("visible", "true") : "";
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
    if (answer.getElementsByTagName('explanation').length == 0) {
        console.log("There is no explanation");
    }
    else {
        showExplanation(answer);
    }
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
    Ressources.angle_right_solid = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAy
NTYgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAt
IGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21l
LmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRp
Y29ucywgSW5jLiAtLT48cGF0aCBkPSJNNjQgNDQ4Yy04LjE4OCAwLTE2LjM4LTMuMTI1LTIy
LjYyLTkuMzc1Yy0xMi41LTEyLjUtMTIuNS0zMi43NSAwLTQ1LjI1TDE3OC44IDI1Nkw0MS4z
OCAxMTguNmMtMTIuNS0xMi41LTEyLjUtMzIuNzUgMC00NS4yNXMzMi43NS0xMi41IDQ1LjI1
IDBsMTYwIDE2MGMxMi41IDEyLjUgMTIuNSAzMi43NSAwIDQ1LjI1bC0xNjAgMTYwQzgwLjM4
IDQ0NC45IDcyLjE5IDQ0OCA2NCA0NDh6Ii8+PC9zdmc+`;
    Ressources.check_solid = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0
NDggNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAt
IGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21l
LmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRp
Y29ucywgSW5jLiAtLT48cGF0aCBkPSJNNDM4LjYgMTA1LjRDNDUxLjEgMTE3LjkgNDUxLjEg
MTM4LjEgNDM4LjYgMTUwLjZMMTgyLjYgNDA2LjZDMTcwLjEgNDE5LjEgMTQ5LjkgNDE5LjEg
MTM3LjQgNDA2LjZMOS4zNzIgMjc4LjZDLTMuMTI0IDI2Ni4xLTMuMTI0IDI0NS45IDkuMzcy
IDIzMy40QzIxLjg3IDIyMC45IDQyLjEzIDIyMC45IDU0LjYzIDIzMy40TDE1OS4xIDMzOC43
TDM5My40IDEwNS40QzQwNS45IDkyLjg4IDQyNi4xIDkyLjg4IDQzOC42IDEwNS40SDQzOC42
eiIvPjwvc3ZnPg==`;
    Ressources.circle_regular = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1
MTIgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAt
IGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21l
LmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRp
Y29ucywgSW5jLiAtLT48cGF0aCBkPSJNNTEyIDI1NkM1MTIgMzk3LjQgMzk3LjQgNTEyIDI1
NiA1MTJDMTE0LjYgNTEyIDAgMzk3LjQgMCAyNTZDMCAxMTQuNiAxMTQuNiAwIDI1NiAwQzM5
Ny40IDAgNTEyIDExNC42IDUxMiAyNTZ6TTI1NiA0OEMxNDEuMSA0OCA0OCAxNDEuMSA0OCAy
NTZDNDggMzcwLjkgMTQxLjEgNDY0IDI1NiA0NjRDMzcwLjkgNDY0IDQ2NCAzNzAuOSA0NjQg
MjU2QzQ2NCAxNDEuMSAzNzAuOSA0OCAyNTYgNDh6Ii8+PC9zdmc+`;
    Ressources.minus_solid = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0
NDggNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAt
IGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21l
LmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRp
Y29ucywgSW5jLiAtLT48cGF0aCBkPSJNNDAwIDI4OGgtMzUyYy0xNy42OSAwLTMyLTE0LjMy
LTMyLTMyLjAxczE0LjMxLTMxLjk5IDMyLTMxLjk5aDM1MmMxNy42OSAwIDMyIDE0LjMgMzIg
MzEuOTlTNDE3LjcgMjg4IDQwMCAyODh6Ii8+PC9zdmc+`;
    Ressources.plus_solid = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0
NDggNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAt
IGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21l
LmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRp
Y29ucywgSW5jLiAtLT48cGF0aCBkPSJNNDMyIDI1NmMwIDE3LjY5LTE0LjMzIDMyLjAxLTMy
IDMyLjAxSDI1NnYxNDRjMCAxNy42OS0xNC4zMyAzMS45OS0zMiAzMS45OXMtMzItMTQuMy0z
Mi0zMS45OXYtMTQ0SDQ4Yy0xNy42NyAwLTMyLTE0LjMyLTMyLTMyLjAxczE0LjMzLTMxLjk5
IDMyLTMxLjk5SDE5MnYtMTQ0YzAtMTcuNjkgMTQuMzMtMzIuMDEgMzItMzIuMDFzMzIgMTQu
MzIgMzIgMzIuMDF2MTQ0aDE0NEM0MTcuNyAyMjQgNDMyIDIzOC4zIDQzMiAyNTZ6Ii8+PC9z
dmc+`;
    Ressources.square_regular = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA0
NDggNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4xIGJ5IEBmb250YXdlc29tZSAt
IGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21l
LmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRp
Y29ucywgSW5jLiAtLT48cGF0aCBkPSJNMzg0IDMyQzQxOS4zIDMyIDQ0OCA2MC42NSA0NDgg
OTZWNDE2QzQ0OCA0NTEuMyA0MTkuMyA0ODAgMzg0IDQ4MEg2NEMyOC42NSA0ODAgMCA0NTEu
MyAwIDQxNlY5NkMwIDYwLjY1IDI4LjY1IDMyIDY0IDMySDM4NHpNMzg0IDgwSDY0QzU1LjE2
IDgwIDQ4IDg3LjE2IDQ4IDk2VjQxNkM0OCA0MjQuOCA1NS4xNiA0MzIgNjQgNDMySDM4NEMz
OTIuOCA0MzIgNDAwIDQyNC44IDQwMCA0MTZWOTZDNDAwIDg3LjE2IDM5Mi44IDgwIDM4NCA4
MHoiLz48L3N2Zz4=`;
    Ressources.xmark_solid = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAz
MjAgNTEyIj48IS0tISBGb250IEF3ZXNvbWUgUHJvIDYuMS4wIGJ5IEBmb250YXdlc29tZSAt
IGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tIExpY2Vuc2UgLSBodHRwczovL2ZvbnRhd2Vzb21l
LmNvbS9saWNlbnNlIChDb21tZXJjaWFsIExpY2Vuc2UpIENvcHlyaWdodCAyMDIyIEZvbnRp
Y29ucywgSW5jLiAtLT48cGF0aCBkPSJNMzEwLjYgMzYxLjRjMTIuNSAxMi41IDEyLjUgMzIu
NzUgMCA0NS4yNUMzMDQuNCA0MTIuOSAyOTYuMiA0MTYgMjg4IDQxNnMtMTYuMzgtMy4xMjUt
MjIuNjItOS4zNzVMMTYwIDMwMS4zTDU0LjYzIDQwNi42QzQ4LjM4IDQxMi45IDQwLjE5IDQx
NiAzMiA0MTZTMTUuNjMgNDEyLjkgOS4zNzUgNDA2LjZjLTEyLjUtMTIuNS0xMi41LTMyLjc1
IDAtNDUuMjVsMTA1LjQtMTA1LjRMOS4zNzUgMTUwLjZjLTEyLjUtMTIuNS0xMi41LTMyLjc1
IDAtNDUuMjVzMzIuNzUtMTIuNSA0NS4yNSAwTDE2MCAyMTAuOGwxMDUuNC0xMDUuNGMxMi41
LTEyLjUgMzIuNzUtMTIuNSA0NS4yNSAwczEyLjUgMzIuNzUgMCA0NS4yNWwtMTA1LjQgMTA1
LjRMMzEwLjYgMzYxLjR6Ii8+PC9zdmc+`;
    Ressources.style = `questionnaire {
  display: block;
  margin: 40px 0 100px ;
}

questionnaire .content-wrapper {
  display: flex;
  flex-wrap: wrap;
  flex-direction: column;
  margin: 10px;
  padding: 10px;
  justify-content: center;
}
questionnaire question{
  display:none;
}
questionnaire .question-overview{
margin: 0 auto 10px;
font-size:1.1em;
}
questionnaire question{
  width: 90%;
  margin: 0 auto;
  font-size: 18pt;
  padding:4vw;
  background-color: #fcfcfc;
}

questionnaire .question-header, questionnaire .question-footer, questionnaire .wrapper-answer {
  display: inline-flex;
  width: 100%;
}

questionnaire .question-header {
  justify-content: space-between;
  margin-bottom: 0.5em;
}

questionnaire .question-footer{
  justify-content: center;
}

questionnaire [visible=true]{
    display:block;
}

questionnaire .wrapper-answer {
  border: 1px solid #eee;
  padding: 5px 12px;
  font-size: 14pt;
  margin: 15px 0 0;
  width:90%;
}

questionnaire answer p {
  margin: 0 0 0 16px;
  padding: 6px;
  /*font-size: 12pt;
  border: 1px solid #000;
  width:100%;*/
}

questionnaire .wrapper-answer:hover, questionnaire img:hover, questionnaire .change-question-button:hover {
  cursor: pointer;
  /*background-color: #ddd;*/
}

questionnaire .wrapper-answer:hover {
  background-color: #eee;
}


questionnaire explanation {
  display: none;
  /*max-width: 30vw;*/
}

questionnaire answer [visible=true] {
  margin: 5px 0;
  padding: 15px 12px;
  font-size: 12pt;
  word-break: break-word;
  border:0;
  background-color: #fdfdfd;
}

questionnaire answer [visible=true] p {
  border: 0;
}

questionnaire img {
  height: 1em;
  align-self: center;
}

questionnaire p {
  margin: 0;
  align-self: center;
}

questionnaire .wrapper-answer > div, questionnaire .question-header > div {
  margin: 0.5em;
  align-self: center;
}

questionnaire [clicked=true] .wrapper-answer, questionnaire [clicked=true] .wrapper-answer:hover{
  background-color:#d30000;
}

questionnaire [clicked=true][correct=true] .wrapper-answer{
  background-color:#aceb84;
}

questionnaire .change-question-button{
  padding:15px;
  margin:0 15px;
  border: 4px solid #bbb;
  border-radius: 7px;
  font-size:1.3em;
}
questionnaire .change-question-button:hover{
  background-color: #bbb;
}

@media (min-width: 768px) {
  questionnaire question {
    max-width: 600px;
  }
}
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
}`;
})(Ressources || (Ressources = {}));
