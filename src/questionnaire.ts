// #### QUESTIONNAIRE MODULE ####
// This module implements the questionnaire functionality

// <questionnaire> <- List of questions
//   <question type="multiplechoice|singlechoice">
//     Question Text
//     <answer correct="true|false">
//       Answer Text
//       <explanation>Explanation Text
interface Questionnaire {
  rootElement: HTMLElement;
  questions: Question[];
};

type Questiontype = "singlechoice" | "multiplechoice";

interface Question {
  type: Questiontype;
  text: Node[];
  answers: Answer[];
  rootElement: HTMLElement;
};

interface Answer {
  correct: boolean;
  text: Node[];
  explanation?: HTMLElement;
  rootElement: HTMLElement;
}

// ########### PARSE METHODS

function parseQuestionnaire(questionnaire: HTMLElement): Questionnaire {
  return {
    rootElement: questionnaire,
    questions: Array.from(questionnaire.children as HTMLCollection).map(x => parseQuestion(x as HTMLElement))
  };
}

function parseQuestion(question: HTMLElement): Question {
  const type = question.getAttribute('type') as Questiontype;
  const text = Array.from(question.childNodes as NodeList)
    .filter(x => (x as HTMLElement).tagName != 'DISTRACTOR'
      && (x as HTMLElement).tagName != 'SOLUTION');
  const answers = Array.from(question.childNodes as NodeList)
    .filter(x => (x as HTMLElement).tagName == 'DISTRACTOR'
      || (x as HTMLElement).tagName == 'SOLUTION');
  return {
    type: type,
    text: text,
    answers: answers.map(x => parseAnswer(x as HTMLElement)),
    rootElement: question
  };
}

function parseAnswer(answer: HTMLElement): Answer {
  const correct = (answer.tagName == 'SOLUTION') ? true : false;
  const text = Array.from(answer.childNodes as NodeList)
    .filter(x => (x as HTMLElement).tagName != 'EXPLANATION');
  const explanation = answer.getElementsByTagName('explanation')[0] as HTMLElement;
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
  const q_col: HTMLCollection = document.getElementsByTagName("questionnaire") as HTMLCollection;
  // render every questionnaire in the HTML Document
  for (let i = q_col.length - 1; i >= 0; i--) {
    const questionnaire: HTMLElement = q_col[i] as HTMLElement;
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
function renderQuestionnaire(questionnaire: Questionnaire) {
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
  function oneQuestionOnly(pos: string) {
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
function renderQuestion(question: Question, index: number) {
  // if (validateAttribute(question) == true) {
  return `
    <question type="${question.type}" ${index == 0 ? 'visible="true"' : ''}>
      <div class="question-header">
        <div>${question.text.map(nodeOuterHTML).join('')}</div>
        <img src="${Ressources.plus_solid}" onclick="collapseEventHandler(event)">
      </div>
      ${question.answers.map((x) => renderAnswer(question.type, x)).join('')}
    </question>
  `;
}
//  else {
//    return "";
//  }
//}

function renderAnswer(type: Questiontype, answer: Answer) {
  return `
  <answer correct="${answer.correct ? 'true' : 'false'}">
    <div class="wrapper-answer" onclick="clickAnswerHandler(event)">
      <img src="${type == 'singlechoice' ? Ressources.circle_regular : Ressources.square_regular}">
      <div>
        ${answer.text.map(nodeOuterHTML).join('')}
        ${(answer.explanation == undefined)? '' : answer.explanation.outerHTML}
      </div>
    </div>
  </answer>
  `;
}

function nodeOuterHTML(x: Node) {
  const outerHTML = (x as HTMLElement).outerHTML;
  if (outerHTML == undefined) {
    const data = (x as Text).data;
    if (data == undefined) {
      return '';
    }
    return data;
  }
  console.log("outerHTML:" + outerHTML);
  return outerHTML;
}

// renderError
function renderError(current_el: HTMLElement, message: string) {
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
function validateQuestionnaireStructure(questionnaire: HTMLElement) {
  let questions: HTMLCollection = questionnaire.getElementsByTagName("question");
  let answers: HTMLCollection = questionnaire.getElementsByTagName("answer");
  let explanation: HTMLCollection = questionnaire.getElementsByTagName("explanation");
  // validate given html tag elements

  if (validateHtmlTagElements(questions.length - 1, questions) == true
    && validateHtmlTagElements(answers.length - 1, answers) == true
    && validateHtmlTagElements(explanation.length - 1, explanation) == true) {
    return true;
  }
  else {
    return false;
  }
  function validateHtmlTagElements(i: number, col: HTMLCollection) {
    if (i >= 0) {
      let validated = validateStructure(col[i] as HTMLElement);
      if (validated == true) {
        let bool = validateHtmlTagElements(i - 1, col) as boolean;
        return bool;
      }
      else {
        return false;
      }
    } else {
      return true;
    }
  }
}
// ValidateStructure
// <questionnaire> -> <question> -> at least 2 <answer> -> <explanation>
// return either messageString or Boolean: True
function validateStructure(el: HTMLElement) {
  const html_tag = el.tagName;
  const parent = el.parentElement as HTMLElement | null;
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
  function parentHasToBe(parent: HTMLElement | null, tag: string, tag_two?: string) {
    if (parent ?.tagName == tag || parent?.tagName == tag_two) {
      return true;
    } else {
      let msg = `HTML structure is invalid: Please check your input at:  ${parent?.outerHTML}`;
      renderError(el, msg);
      return false;
    }
  }
}

// validateAttributes
// check <question> attribute singlechoice | multiplechoice
// check multiple <answer> attributes for at least (for multiplechoice) 1 correct answer
// returns true (for successful validation) or false (fail)
function validateAttribute(question: Question) {
  let val = question.type;
  let answers = question.answers;
  let i = answers.length - 1;
  let x = 0 as number;
  let correct_answers = getCorrectAnswer(x, i) as number;
  // get all correct answers to this question
  function getCorrectAnswer(x: number, i: number) {
    if (i >= 0) {
      let correct = answers[i].correct;
      if (correct == true) {
        x = getCorrectAnswer(x + 1, i - 1) as number;
        return x;
      }
      else {
        x = getCorrectAnswer(x, i - 1) as number;
        return x;
      }
    } else {
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
function makeDiv(css_name: string) {
  const new_div = document.createElement("div");
  new_div.setAttribute("class", css_name);
  return new_div;
}
// escapeHtml
// escape HTML TAGS
function escapeHtml(str: string) {
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
function getTagRecursive(el: HTMLElement, tag: string) {
  if (el.tagName == tag.toUpperCase()) {
    return el;
  }
  else {
    let parent: HTMLElement = el.parentElement as HTMLElement;
    let result = getTagRecursive(parent, tag) as HTMLElement;
    return result;
  }
}

// ### EVENT HANDLER FUNCTIONS ###

// EVENT AFTER BUTTON "prev" OR "next" CLICK
// questionChangeHandler
// EventHandler -> DOM Manipulation
function questionChangeHandler(event: Event) {
  // get Questionnaire attributes
  let el: HTMLElement = event.target as HTMLElement;
  let button = el.getAttribute("id");
  let questionnaire: HTMLElement = getTagRecursive(el, "questionnaire") as HTMLElement;
  let total_questions: number = parseInt(questionnaire.getAttribute("total_questions") as string);
  let current_question: number = parseInt(questionnaire.getAttribute("current_question") as string);
  let questions = questionnaire.getElementsByTagName("question");
  let min_qid: number = 0;
  let max_qid: number = total_questions - 1;
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
      el.nextElementSibling ?.setAttribute("style", "visibility:visible;");
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
      el.previousElementSibling ?.setAttribute("style", "visibility:visible;");
      break;

    default:
      console.log("No Button caused this EventHandler", button);
      break;
  }


}



// CollapseEventHandler
// Handles Collapse Event for shoowing explanation texts
function collapseEventHandler(event: Event) {
  const el = event.target as HTMLElement;
  const question: HTMLElement = getTagRecursive(el, "question") as HTMLElement;
  const answers: HTMLCollection = question.getElementsByTagName("answer") as HTMLCollection;
  //change icons and collapse
  if (el.getAttribute("clicked") == "true") {
    el.setAttribute("src", Ressources.plus_solid);
    el.setAttribute("clicked", "false");
    for (let i = answers.length - 1; i >= 0; i--) {
      let answer = answers[i] as HTMLElement;
      let explanation = answer.getElementsByTagName("explanation")[0];
      (explanation != undefined) ? explanation.removeAttribute("visible"): "";
    }
  }
  else {
    el.setAttribute("src", Ressources.minus_solid);
    el.setAttribute("clicked", "true");
    for (let i = answers.length - 1; i >= 0; i--) {
      let answer = answers[i] as HTMLElement;
      let explanation = answer.getElementsByTagName("explanation")[0];
      (explanation != undefined) ? explanation.setAttribute("visible", "true"): "";
    }
  }
}
// show <explanation>
//Answer->DOM Manipulation
function showExplanation(answer: HTMLElement) {
  let explanation: HTMLElement = answer.getElementsByTagName("explanation")[0] as HTMLElement;
  if (explanation.getAttribute("visible") == "true") {
    explanation.removeAttribute("visible");
  }
  else {
    explanation.setAttribute("visible", "true");
  }
}
// unified click on answer event handler
function clickAnswerHandler(event: Event) {
  const el = event.target as HTMLElement;
  checkAnswerEventHandler(el);
  // show Explanation
  let answer = getTagRecursive(el, "answer");
  if (answer.getElementsByTagName('explanation').length == 0){
    console.log("There is no explanation");
  }
  else{
    showExplanation(answer);
  }
}


// check click for correct answer
// depending on question type show either
// - for multiplechoice just clicked answer
// - for singlechoice all answers
function checkAnswerEventHandler(el: HTMLElement) {
  let question_type = getTagRecursive(el, "question").getAttribute("type");
  if (question_type == "multiplechoice") {
    let answer = getTagRecursive(el, "answer");
    showAnswer(answer);
  }
  else if (question_type == "singlechoice") {
    let answers = getTagRecursive(el, "question").getElementsByTagName("answer") as HTMLCollection;
    for (let i = answers ?.length - 1; i >= 0; i--) {
      let answer: HTMLElement = answers[i] as HTMLElement;
      showAnswer(answer);
    }
  }
}
// showAnswer
// show icons and highlight answer
function showAnswer(answer: HTMLElement) {
  answer.setAttribute("clicked", "true");
  let img = answer.getElementsByTagName("img")[0];
  if (answer.getAttribute("correct") == "true") {
    img.setAttribute("src", Ressources.check_solid);
  }
  else {
    img.setAttribute("src", Ressources.xmark_solid);
  }
}
