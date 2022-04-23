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
  language: ImplementedLanguage;
};

type Questiontype = "singlechoice" | "multiplechoice";

interface Question {
  type: Questiontype;
  text: Node[];
  answers: Answer[];
  solutionCount: number;
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
  const questions = Array.from(questionnaire.children as HTMLCollection);
  const lang = questionnaire.getAttribute('language');
  return {
    rootElement: questionnaire,
    questions: questions.map(x => parseQuestion(x as HTMLElement)),
    language: lang == 'de' || lang == 'en' ? lang : 'en'
  };
}

function parseQuestion(question: HTMLElement): Question {
  const type = question.getAttribute('type') as Questiontype | null;
  const solution_count = question.getElementsByTagName("solution").length;
  const text = Array.from(question.childNodes as NodeList)
    .filter(x => (x as HTMLElement).tagName != 'DISTRACTOR'
      && (x as HTMLElement).tagName != 'SOLUTION');
  const answers = Array.from(question.childNodes as NodeList)
    .filter(x => (x as HTMLElement).tagName == 'DISTRACTOR'
      || (x as HTMLElement).tagName == 'SOLUTION');
  return {
    type: getQuestionType(type, solution_count) as Questiontype,
    text: text,
    answers: answers.map(x => parseAnswer(x as HTMLElement)),
    solutionCount: solution_count,
    rootElement: question
  };
}
// String, Number, HTMLElement -> String | DOM Manipulation
// optional singlechoice / multiplechoice attribute
// automatically assigns the correct type, if not given single- or multiplechoice
// if optional attribute is assigned throw an error for invalid arguments
function getQuestionType(type: Questiontype |  null, solution_count: number) {
  if (type == "singlechoice" || type == "multiplechoice") {
    return type;
  }
  else {
    if (solution_count == 1) {
      console.log("inferred type: singlechoice");
      return "singlechoice";
    }
    else if (solution_count > 1) {
      console.log("inferred type: multiplechoice");
      return "multiplechoice";
    }
  }
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

// ############### main function
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
      if (validateQuesionnaireAttributes(r) == true) {
        // Possible ValidationPoint (Attributes)
        renderQuestionnaire(r);
      } else {
        console.log('invalid questionnaire attributes')
      }
    } else {
      console.log('invalid questionnaire structure');
      console.log(validateQuestionnaireStructure(questionnaire));
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

// - state is stored in the DOM via attributes
// - as much hiding/showing as possible is done via css classes depending
//   on those attributes

// store initial State after rendering for re-access
const renderedQuestionnaires: string[] = [];

// ### Language internationalization
//               ^------18--------^
interface TextDict {
  goto: string;
  select: string;
  toggle: string;
  wrong: string;
  correct: string;
  next: string;
  submit: string;
  reset: string;
  feedbacks: string[];
}
type ImplementedLanguage = 'en' | 'de';

const i18n: {[id: string]: TextDict; } = {
  'en': {
    goto: 'Go to question',
    select: 'Select answer',
    toggle: 'Show/hide explanation',
    wrong: 'Wrong!',
    correct: 'Correct!',
    next: 'Next',
    submit: 'Submit',
    reset: 'Reset',
    feedbacks: ['Keep trying!', 'Okay', 'Better Luck next time!',
      'Not bad!', 'Great!', 'Perfect!']
  },
  'de': {
    goto: 'Gehe zu Frage',
    select: 'Wähle die Antwort aus',
    toggle: 'Verstecke/Zeige Erklärung',
    wrong: 'Falsch!',
    correct: 'Richtig!',
    next: 'Weiter',
    submit: 'Antwort prüfen',
    reset: 'Zurücksetzen',
    feedbacks: ['Nicht aufgeben!', 'Okay', 'Mehr Glück beim nächsten Mal!',
      'Nicht schlecht!', 'Super!', 'Perfekt!']
  }
};
let lang = 'en';

// ### Questionnaire
// <questionnaire>
//  - total_questions
//  - current_question
//  - render_id
function renderQuestionnaire(questionnaire: Questionnaire) {
  // setup internationalization
  lang = questionnaire.language;

  // setup questionnaire properties
  const root = questionnaire.rootElement;
  root.setAttribute("total_questions", "" + questionnaire.questions.length);
  root.setAttribute("current_question", "1");
  root.setAttribute("language", lang);

  // render HTML
  root.innerHTML = `
    <div class="content-wrapper">
      <div class="question-overview">
      ${questionnaire.questions.map((_, i) => `
        <p   class="bubble bubble-pending ${i == 0 ? 'bubble-current' : ''}"
             question="${i + 1}"
             onclick="gotoQuestion(event)"
             title="${i18n[lang].goto} ${i + 1}"></p>`).join('')}
      </div>
      ${questionnaire.questions.map(renderQuestion).join('')}
      ${questionnaire.questions.length <= 1 ? '' : `
      <div class="summary">
        <div class="summary-bar-container">
          <div class="summary-bar"></div>
        </div>
        <p class="summary-text"></p>
        <button onclick="resetQuestionnaire(event)"
                class="reset-button">
          ${i18n[lang].reset}
        </button>
      </div>
      `}
    </div>
  `;

  // store rendered innerHTML for resets
  root.setAttribute('render_id', (renderedQuestionnaires.push(root.innerHTML) - 1).toString());
}

function gotoQuestion(e: Event) {
  const el: HTMLElement = e.target as HTMLElement;
  const navTarget = el.getAttribute('question') as string;

  // set current question
  const questionnaire: HTMLElement = getTagRecursive(el, 'questionnaire');
  questionnaire.setAttribute('current_question', navTarget);

  // set question visible
  const questions = questionnaire.getElementsByTagName('question');
  Array.from(questions).map(q => {
    if (q.getAttribute('number') == navTarget) {
      q.setAttribute('visible', 'true');
    } else {
      q.removeAttribute('visible');
    }
  });

  // hide summary
  const summary = questionnaire.getElementsByClassName('summary')[0] as HTMLElement;
  summary.removeAttribute('visible');

  // set bubble class
  const bubbles = questionnaire.getElementsByClassName('bubble');
  Array.from(bubbles).map(b => {
    if (b.getAttribute('question') == navTarget) {
      b.classList.add('bubble-current');
    } else {
      b.classList.remove('bubble-current');
    }
  });

}

function resetQuestionnaire(e: Event) {
  const el: HTMLElement = e.target as HTMLElement;
  const questionnaire = getTagRecursive(el, 'questionnaire');
  questionnaire.setAttribute('current_question', '1');
  questionnaire.innerHTML = renderedQuestionnaires[parseInt(questionnaire.getAttribute('render_id') as string)] as string;

}

// ### Question
// <question>
//  - type: "singlechoice"|"multiplechoice"
//  - visible: "true" or not present
//  - answer: "pending"|"correct"|"wrong"
function renderQuestion(question: Question, index: number) {
  return `
    <question type="${question.type}"
              ${index == 0 ? 'visible="true"' : ''}
              number="${index + 1}"
              answer="pending">
      <div class="correct-text">
        <p>${i18n[lang].correct}</p>
      </div>
      <div class="wrong-text">
        <p>${i18n[lang].wrong}</p>
      </div>
      <div class="question-header">
        <div>${question.text.map(nodeOuterHTML).join('')}</div>
      </div>
      ${question.answers.map((x) => renderAnswer(question.type, x)).join('')}
      <div class="question-footer">
        <div class="next-button" onClick="showNextQuestion(event)">
          ${i18n[lang].next}
        </div>
        <div class="submit-button" onClick="submitAnswer(event)">
          ${i18n[lang].submit}
        </div>
      </div>
    </question>
  `;
}

// event handlers:
// continue
function showNextQuestion(event: Event) {
  const el: HTMLElement = event.target as HTMLElement;
  const currentQuestion: HTMLElement = getTagRecursive(el, "question");
  const questionnaire: HTMLElement = getTagRecursive(currentQuestion, "questionnaire");

  // update header
  const total_questions: number = parseInt(questionnaire.getAttribute("total_questions") as string);
  const current_question: number = parseInt(questionnaire.getAttribute("current_question") as string);

  if (current_question == total_questions) {
    // update questionnaire
    questionnaire.setAttribute('current_question', '0');

    // ### compute summary
    const questions = Array.from(questionnaire.getElementsByTagName('question'));
    const correct = questions.filter(q => q.getAttribute('answer') == 'correct').length;
    const ratio = (correct / questions.length);
    const percentage = (ratio * 100).toPrecision(3);

    // adjust bar length
    const summaryBar = questionnaire.getElementsByClassName('summary-bar')[0] as HTMLElement;
    summaryBar.innerHTML = '?';
    summaryBar.style.width = `${percentage}%`;
    summaryBar.animate([
      { width: 0 },
      { width: `${percentage}%`, easing: 'ease-out' }
    ], 1000);
    // show text after animation
    window.setTimeout(() => {
      summaryBar.innerHTML = `${percentage}%`;
      // adjust text
      const lang = questionnaire.getAttribute('language') as string;
      const feedbacks = i18n[lang].feedbacks;
      const summaryText = questionnaire.getElementsByClassName('summary-text')[0] as HTMLElement;
      summaryText.innerHTML = feedbacks[Math.floor(ratio * 0.99 * feedbacks.length)];
    }, 1000);

  } else {
    // update questionnaire
    questionnaire.setAttribute("current_question", (current_question + 1).toString());
  }

  // update header
  const bubbles = questionnaire.getElementsByClassName('bubble');
  Array.from(bubbles).map(b => {
    if (b.getAttribute('question') == '' + (current_question + 1)) {
      b.classList.add('bubble-current');
    } else {
      b.classList.remove('bubble-current');
    }
  });

  // update visibility
  currentQuestion.nextElementSibling ?.setAttribute('visible', 'true');
  currentQuestion.removeAttribute('visible');

}
// submit
function submitAnswer(event: Event) {
  const el: HTMLElement = event.target as HTMLElement;
  const question: HTMLElement = getTagRecursive(el, "question");

  const answers = question.getElementsByTagName('answer');

  // check correctness
  const correct = Array.from(answers).every(a =>
    a.getAttribute('correct') == a.getAttribute('selected'));

  // update question
  question.setAttribute('answer', correct ? 'correct' : 'wrong');

  // update bubble
  const questionnaire: HTMLElement = getTagRecursive(question, 'questionnaire');
  const bubbles = questionnaire.getElementsByClassName('bubble');
  Array.from(bubbles).filter(b =>
    b.getAttribute('question') == question.getAttribute('number')
  ).map(b => {
    b.classList.remove('bubble-pending');
    if (correct) {
      b.classList.add('bubble-correct');
    } else {
      b.classList.add('bubble-wrong');
    }
  });

  // expand necessary explanations, if present
  Array.from(answers).map(a => {
    if (a.getAttribute('selected') != a.getAttribute('correct')) {
      a.setAttribute('expanded', 'true');
    }
  });
}

// ### Answer
// <answer>
//  - correct: "true"|"false"
//  - selected: "true"|"false"
function renderAnswer(type: Questiontype, answer: Answer) {
  return `
  <answer correct="${answer.correct ? 'true' : 'false'}"
          selected="false"
          expanded="false">
    <div class="wrapper-answer"
         onclick="selectAnswer(event)"
         title="${i18n[lang].select}">
      <img class="answer-mark" src="${type == 'singlechoice' ? Ressources.circle_regular : Ressources.square_regular}">
      <img class="answer-mark answer-mark-selected"
           src="${Ressources.xmark_solid}">
      <div class="answer-text-container">
        ${answer.text.map(nodeOuterHTML).join('')}
      </div>
      ${answer.explanation == undefined ? '' : `
        <img class="expander"
             title="${i18n[lang].toggle}"
             src="${Ressources.angle_down_solid}">
        <img class="collapser"
             title="${i18n[lang].toggle}"
             src="${Ressources.angle_up_solid}">
      `}
    </div>
    ${(answer.explanation == undefined) ? '' : answer.explanation.outerHTML}
  </answer>
  `;
}
// helper
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
// event handler
function selectAnswer(event: Event) {
  const el: HTMLElement = event.target as HTMLElement;
  const answer: HTMLElement = getTagRecursive(el, 'answer');
  const question: HTMLElement = getTagRecursive(answer, 'question');
  if (question.getAttribute('answer') == 'pending') {
    // toggle answer selection
    if (answer.getAttribute('selected') == 'false') {
      answer.setAttribute('selected', 'true');
      if (question.getAttribute('type') == 'singlechoice') {
        submitAnswer(event);
      }
    } else {
      answer.setAttribute('selected', 'false');
    }
  } else {
    // toggle showing of explanation
    if (answer.getAttribute('expanded') == 'true') {
      answer.setAttribute('expanded', 'false');
    } else {
      answer.setAttribute('expanded', 'true');
    }
  }

}

// ### Error
// render Function
function renderError(current_el: HTMLElement, error:string, message: string) {
  const questionnaire = getTagRecursive(current_el, "questionnaire");
  const error_html = `
  <div class="error-wrapper">
    <div class="error-header">
      <h2> Why do I see this red funny box?</h2>
    </div>
    <div class="error-box">
    <p>${error}</p>
    </div>
    <pre>
    <code class="error-message">
    ${escapeHtml(message)}
    </code>
    </pre>
  </div>
  `;
  questionnaire.innerHTML = error_html;
  console.log(error_html);
}
// helper
// escape HTML TAGS
function escapeHtml(str: string) {
  return str.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

}


// ######### VALIDATION METHODS ##########


// validateQuestionnaireStructure
// checks if all necessary tags in questionnaire have the correct parentElement
function validateQuestionnaireStructure(questionnaire: HTMLElement) {
  let questions: HTMLCollection = questionnaire.getElementsByTagName("question");
  let answers: HTMLCollection = questionnaire.getElementsByTagName("answer");
  let explanation: HTMLCollection = questionnaire.getElementsByTagName("explanation");
  // validate given html tag elements

  return Array.from(questions).every(q => validateStructure(q as HTMLElement)) &&
      Array.from(answers).every(a => validateStructure(a as HTMLElement)) &&
      Array.from(explanation).every(e => validateStructure(e as HTMLElement));

}
// ValidateStructure
// <questionnaire> -> <question> -> at least 2 <answer> -> <explanation>
// return either messageString or Boolean: True
function validateStructure(el: HTMLElement) {
  const html_tag = el.tagName;
  const parent = el.parentElement as HTMLElement | null;
  switch(html_tag){
    case 'QUESTION':
    return parentHasToBe(el, parent, "QUESTIONNAIRE");

    case 'SOLUTION':
    case 'DISTRACTOR':
    return parentHasToBe(el, parent, "QUESTION");

    case 'EXPLANATION':
    return parentHasToBe(el, parent, "SOLUTION", "DISTRACTOR");

    default:
    console.log('html_tag to check was no question, solution, distractor or explanation');
    return true;
  }

}

function parentHasToBe(el: HTMLElement, parent: HTMLElement | null, tag: string, tag_two?: string) {
  if (parent ?.tagName == tag || parent ?.tagName == tag_two) {
    return true;
  } else {
    let err = `HTML structure is invalid: Please check your input at: `;
    let msg = parent ?.outerHTML as string;
    renderError(el, err, msg);
    return false;
  }
}

function validateQuesionnaireAttributes(questionnaire:Questionnaire){
  const questions = questionnaire.questions;
  for (let i = 0; i < questions.length; i++){
    if (validateQuestionAttributes(questions[i]) == false){
      return false;
    }
  }
  return true;
}

function validateQuestionAttributes(question:Question){
  const type = question.type;
  const answers:number = question.answers.length;
  const solutions:number = question.solutionCount;
  // if only 1 or less answers exists
  if (answers < 2) {
    let err = `You need to provide at least two answers for one &lt;question&gt;:`;
    let msg =  question.rootElement.outerHTML;
    renderError(question.rootElement, err, msg);
    return false;
  }
  // if there is no solution
  else if (solutions == 0) {
    let err = `This question has no &lt;solution&gt;:`;
    let msg = question.rootElement.outerHTML;
    renderError(question.rootElement, err, msg);
    return false;
  }
  // if type is multiplechoice but doesnt match with solutions
  else if(type == "multiplechoice" && solutions < 2){
    let err = `Optional attribute &lt;question type='multiplechoice'&gt; doesnt match with number of solutions:`;
    let msg = question.rootElement.outerHTML;
    renderError(question.rootElement, err, msg);
    return false;
  }
  // if type is singlechoice but doesnt match with solutions
  else if (type == "singlechoice" && solutions > 1){
    let err = `Optional attribute &lt;question type='singlechoice'&gt; doesnt match with number of solutions:`;
    let msg = question.rootElement.outerHTML;
    renderError(question.rootElement, err, msg);
    return false;
  }
return true;
}



// ######## HELPER FUNCTIONS #######

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
// function questionChangeHandler(event: Event) {
//   // get Questionnaire attributes
//   let el: HTMLElement = event.target as HTMLElement;
//   let button = el.getAttribute("id");
//   let questionnaire: HTMLElement = getTagRecursive(el, "questionnaire") as HTMLElement;
//   let total_questions: number = parseInt(questionnaire.getAttribute("total_questions") as string);
//   let current_question: number = parseInt(questionnaire.getAttribute("current_question") as string);
//   let questions = questionnaire.getElementsByTagName("question");
//   let min_qid: number = 0;
//   let max_qid: number = total_questions - 1;
//   let qid = current_question - 1;
//   // change question
//   // if button is "prev"
//   switch (button) {
//     case "prev_button":
//       let prev_qid = current_question - 1;
//       // change visibility to the previous question
//       questions[qid].removeAttribute("visible");
//       questions[qid - 1].setAttribute("visible", "true");
//       // change question overview text
//       questionnaire.setAttribute("current_question", prev_qid.toString());
//       questionnaire.getElementsByClassName("question-overview")[0].textContent = "Question " + prev_qid.toString() + " of " + total_questions;
//       //hide button if button to first question
//       if (prev_qid - 1 == min_qid) {
//         el.setAttribute("style", "visibility:hidden;");
//       }
//       // show next-Button
//       el.nextElementSibling ?.setAttribute("style", "visibility:visible;");
//       break;
//
//     case "next_button":
//       let next_qid = qid + 1;
//       questions[qid].removeAttribute("visible");
//       questions[next_qid].setAttribute("visible", "true");
//       //change question overview text
//       questionnaire.setAttribute("current_question", (current_question + 1).toString());
//       questionnaire.getElementsByClassName("question-overview")[0].textContent = "Question " + (current_question + 1).toString() + " of " + total_questions;
//       // hide button if button to last question
//       if (next_qid == max_qid) {
//         el.setAttribute("style", "visibility:hidden;");
//       }
//       //show prev_button
//       el.previousElementSibling ?.setAttribute("style", "visibility:visible;");
//       break;
//
//     default:
//       console.log("No Button caused this EventHandler", button);
//       break;
//   }
//
//
// }
//
//
//
// // CollapseEventHandler
// // Handles Collapse Event for shoowing explanation texts
// function collapseEventHandler(event: Event) {
//   const el = event.target as HTMLElement;
//   const question: HTMLElement = getTagRecursive(el, "question") as HTMLElement;
//   const answers: HTMLCollection = question.getElementsByTagName("answer") as HTMLCollection;
//   //change icons and collapse
//   if (el.getAttribute("clicked") == "true") {
//     el.setAttribute("src", Ressources.plus_solid);
//     el.setAttribute("clicked", "false");
//     for (let i = answers.length - 1; i >= 0; i--) {
//       let answer = answers[i] as HTMLElement;
//       let explanation = answer.getElementsByTagName("explanation")[0];
//       (explanation != undefined) ? explanation.removeAttribute("visible"): "";
//     }
//   }
//   else {
//     el.setAttribute("src", Ressources.minus_solid);
//     el.setAttribute("clicked", "true");
//     for (let i = answers.length - 1; i >= 0; i--) {
//       let answer = answers[i] as HTMLElement;
//       let explanation = answer.getElementsByTagName("explanation")[0];
//       (explanation != undefined) ? explanation.setAttribute("visible", "true"): "";
//     }
//   }
// }
// // show <explanation>
// //Answer->DOM Manipulation
// function showExplanation(answer: HTMLElement) {
//   let explanation: HTMLElement = answer.getElementsByTagName("explanation")[0] as HTMLElement;
//   if (explanation.getAttribute("visible") == "true") {
//     explanation.removeAttribute("visible");
//   }
//   else {
//     explanation.setAttribute("visible", "true");
//   }
// }
// // unified click on answer event handler
// function clickAnswerHandler(event: Event) {
//   const el = event.target as HTMLElement;
//   checkAnswerEventHandler(el);
//   // show Explanation
//   let answer = getTagRecursive(el, "answer");
//   if (answer.getElementsByTagName('explanation').length == 0){
//     console.log("There is no explanation");
//   }
//   else{
//     showExplanation(answer);
//   }
// }
//
//
// // check click for correct answer
// // depending on question type show either
// // - for multiplechoice just clicked answer
// // - for singlechoice all answers
// function checkAnswerEventHandler(el: HTMLElement) {
//   let question_type = getTagRecursive(el, "question").getAttribute("type");
//   if (question_type == "multiplechoice") {
//     let answer = getTagRecursive(el, "answer");
//     showAnswer(answer);
//   }
//   else if (question_type == "singlechoice") {
//     let answers = getTagRecursive(el, "question").getElementsByTagName("answer") as HTMLCollection;
//     for (let i = answers ?.length - 1; i >= 0; i--) {
//       let answer: HTMLElement = answers[i] as HTMLElement;
//       showAnswer(answer);
//     }
//   }
// }
// // showAnswer
// // show icons and highlight answer
// function showAnswer(answer: HTMLElement) {
//   answer.setAttribute("clicked", "true");
//   let img = answer.getElementsByTagName("img")[0];
//   if (answer.getAttribute("correct") == "true") {
//     img.setAttribute("src", Ressources.check_solid);
//   }
//   else {
//     img.setAttribute("src", Ressources.xmark_solid);
//   }
// }
