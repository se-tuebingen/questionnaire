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
        .filter(x => x.tagName != 'ANSWER');
    const answers = Array.from(question.getElementsByTagName('answer'));
    return {
        type: type,
        text: text,
        answers: answers.map(x => parseAnswer(x))
    };
}
function parseAnswer(answer) {
    const correct = answer.getAttribute('correct') == 'true';
    const text = Array.from(answer.childNodes)
        .filter(x => x.tagName != 'EXPLANATION');
    const explanation = answer.getElementsByTagName('explanation')[0];
    return {
        correct: correct,
        text: text,
        explanation: explanation
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
        const r = parseQuestionnaire(questionnaire);
        console.log(r);
        renderQuestionnaire(r);
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
    // if only one question exists, ignore "prev", "next" buttons.
    const f = () => {
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
    };
    const buttons = f();
    root.innerHTML = `
    <div class="content-wrapper">
      <div class="question-overview">
        Question 1 of ${questionnaire.questions.length}
      </div>
      ${questionnaire.questions.reverse().map(renderQuestion)}
      <div class="question-footer">
      ${buttons}
      </div>
    </div>
  `;
}
// function renderQuestionaire(questionnaire: HTMLElement) {
//   console.log(questionnaire);
//   //build wrapper-content
//   let content: HTMLDivElement = makeDiv("content-wrapper");
//   let questions = questionnaire.children as HTMLCollection;
//   let question_number: number = questions.length;
//   // access children and append to wrapper-content
//   for (let i = question_number - 1; i >= 0; i--) {
//     content.append(questions[i]);
//   }
//   questionnaire.prepend(content);
//   buildQuestionOverview(questionnaire, content, question_number);
//   //render Questions + Answers
//   renderQuestions(questionnaire);
//   renderAnswers(questionnaire);
//   buildQuestionnaireFooter(content, question_number);
// }
// function buildQuestionOverview(questionnaire:HTMLElement, content: HTMLDivElement, question_number:number){
//   // question-overview
//   let q_overview: HTMLDivElement = makeDiv("question-overview");
//   q_overview.textContent = "Frage 1" + " von " + question_number;
//   content.prepend(q_overview);
//   // question-current-total initial
//   questionnaire.setAttribute("total_questions", "" + question_number);
//   questionnaire.setAttribute("current_question", "1")
// }
// // build questionnaire footer
// // if only one question: BUILD NO BUTTON
// function buildQuestionnaireFooter(content:HTMLDivElement, question_number:number){
//   if (question_number == 1) {
//     //BUILD NOTHING
//   }
//   else {
//     let footer: HTMLDivElement = makeDiv("question-footer");
//     content.append(footer);
//     buildFooterButtons(footer);
//   }
// }
//build 2 buttons: "prev"-Question, "next"-Question
// function buildFooterButtons(footer: HTMLDivElement) {
//   let prev_button: HTMLDivElement = makeDiv("change-question-button");
//   let next_button: HTMLDivElement = makeDiv("change-question-button");
//   prev_button.setAttribute("id", "prev_button");
//   next_button.setAttribute("id", "next_button");
//   prev_button.setAttribute("style", "visibility:hidden;");
//   prev_button.textContent = "prev";
//   next_button.textContent = "next";
//   prev_button.addEventListener("click", questionChangeHandler);
//   next_button.addEventListener("click", questionChangeHandler);
//   footer.append(prev_button, next_button);
// }
// renderQuestions
// for every question:
// add <div>-wrapper + <img>-icon (done)
// add EventListener for CollapseAll-Function
function renderQuestion(question, index) {
    return `
    <question type="${question.type}" ${index == 0 ? 'visible="true"' : ''}>
      <div class="question-header">
        <p>${question.text.map(nodeOuterHTML).join('')}</p>
        <img src="${Ressources.plus_solid}" onclick="explanationEventHandler.bind(event.target.el, true)">
      </div>
      ${question.answers.map(renderAnswer).join('')}
    </question>
  `;
}
// function renderQuestions(questionnaire: HTMLElement) {
//   // get wrapper-content
//   let wrapper_content = questionnaire.firstChild as HTMLDivElement;
//   let questions: HTMLCollection = questionnaire.getElementsByTagName("question");
//   let lastIndex = questions.length - 1;
//   questions[lastIndex].setAttribute("visible", "true");
//
//   for (let i = lastIndex; i >= 0; i--) {
//     let question: HTMLElement = questions[i] as HTMLElement;
//     buildQuestionHeader(question);
//
//     //append question to wrapper-content
//     wrapper_content.append(question);
//   }
// }
//
//
// // question->DOM Manipulation
// // Question Text and CollapseAll-Functionality in question-header
// function buildQuestionHeader(question: HTMLElement) {
//   let text = document.createElement("p");
//   text.innerHTML = (question.childNodes[0] as Text).data;
//   question.childNodes[0].remove();
//   let header: HTMLDivElement = document.createElement("div");
//   header.setAttribute("class", "question-header");
//   question.prepend(header);
//   // append text and img
//   let img = document.createElement("img");
//   img.setAttribute("src", Ressources.plus_solid);
//   img.addEventListener("click", explanationEventHandler.bind(img, true));
//   header.append(text, img);
// }
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
// // questionnaire->DOM Manipulation
// function renderAnswers(questionnaire: HTMLElement) {
//   let answers: HTMLCollection = questionnaire.getElementsByTagName("answer");
//   //for every answer:
//   // add <div> wrapper + <img>-icon (done)
//   // add EventListener for AnswerClickEvents (done)
//   for (let i = answers.length - 1; i >= 0; i--) {
//     let answer: HTMLElement = answers[i] as HTMLElement;
//     // build div-wrapper
//     let new_div: HTMLDivElement = document.createElement("div");
//     let text = document.createElement("p");
//     text.innerHTML = (answer.childNodes[0] as Text).data;
//     answer.childNodes[0].remove();
//     new_div.setAttribute("class", "wrapper-answer");
//     answer.prepend(new_div);
//     //append text and img
//     let img = document.createElement("img");
//     const mode = answer.parentElement?.getAttribute("type");
//     img.setAttribute("src", mode === 'singlechoice' ? Ressources.circle_regular : Ressources.square_regular);
//     new_div.append(img, text);
//     answer.addEventListener("click", checkAnswerEventHandler);
//     answer.addEventListener("click", explanationEventHandler.bind(answer, false));
//   }
// }
//
// makeDiv
// ClassName as String -> HTMLDivElement
function makeDiv(css_name) {
    let new_div = document.createElement("div");
    new_div.setAttribute("class", css_name);
    return new_div;
}
// ### EVENT HANDLER FUNCTIONS ###
// EVENT AFTER BUTTON "prev" OR "next" CLICK
// questionChangeHandler
// EventHandler -> DOM Manipulation
function questionChangeHandler(event) {
    var _a, _b, _c, _d;
    // get Questionnaire attributes
    let el = event.target;
    let button = el.getAttribute("id");
    let questionnaire = (_b = (_a = el.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.parentElement;
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
            (_c = el.nextElementSibling) === null || _c === void 0 ? void 0 : _c.setAttribute("style", "visibility:visible;");
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
            (_d = el.previousElementSibling) === null || _d === void 0 ? void 0 : _d.setAttribute("style", "visibility:visible;");
            break;
        default:
            console.log("No Button caused this EventHandler", button);
            break;
    }
}
// ExplanationEventHandler
// Handles Events for shoowing explanation text
function explanationEventHandler(collapse) {
    var _a;
    if (collapse == true) {
        let question = (_a = this.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement;
        let answers = question.getElementsByTagName("answer");
        //change icons and collapse
        if (this.getAttribute("clicked") == "true") {
            this.setAttribute("src", Ressources.plus_solid);
            //  this.setAttribute("clicked", "false");
            for (let i = answers.length - 1; i >= 0; i--) {
                let answer = answers[i];
                answer.getElementsByTagName("explanation")[0].removeAttribute("visible");
            }
        }
        else {
            this.setAttribute("src", Ressources.minus_solid);
            this.setAttribute("clicked", "true");
            for (let i = answers.length - 1; i >= 0; i--) {
                let answer = answers[i];
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
    console.log(event.target);
    const el = event.target;
} //: Event) {
// console.log('clicked clickAnswerHandler');
// console.log(this);
// const el = this.target as HTMLElement;
// console.log(el);
// checkAnswerEventHandler.bind(el);
// explanationEventHandler.bind(el, false);
//}
// check click for correct answer
// depending on question type show either
// - for multiplechoice just clicked answer
// - for singlechoice all answers
function checkAnswerEventHandler() {
    var _a, _b;
    let question_type = (_a = this.parentElement) === null || _a === void 0 ? void 0 : _a.getAttribute("type");
    if (question_type == "multiplechoice") {
        showAnswer(this);
    }
    else if (question_type == "singlechoice") {
        let answers = (_b = this.parentElement) === null || _b === void 0 ? void 0 : _b.getElementsByTagName("answer");
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
// swipeEvent
// const divContainer = document.getElementById("touch-event-test");
// divContainer.addEventListener("")
// function (){
//
// }
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
}`;
})(Ressources || (Ressources = {}));
