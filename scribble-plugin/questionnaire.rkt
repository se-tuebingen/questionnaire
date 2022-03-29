#lang racket/base

(require racket/contract)
(require scriblib/render-cond)
(require scribble/core
         scribble/html-properties
         (only-in xml cdata))
(require scribble/latex-properties)
(require scribble/base)

(provide questionnaire question answer)

;;;;;;;;;;; Type Definitions
(define questiontypes (or/c "singlechoice" "multiplechoice"))
 ; one-of does not work with strings

(struct/contract answer-container (
  [correct boolean?]
  [text content?]
  [explanation content?])
  #:transparent
)

(struct/contract question-container (
  [type questiontypes]
  [text content?]
  [answers (listof answer-container?)])
  #:transparent
)

(struct/contract questionnaire-container (
  [questions (listof question-container?)])
  #:transparent
)

;;;;;;;;;;; HTML Part
; questionnaire
(define
  questionnaire-tag-wrapper
  (xexpr-property
    (cdata #f #f "<questionnaire>")
    (cdata #f #f "</questionnaire>")))

(define/contract
  (questionnaire-tag content)
  (-> content? content?)
      (element (style #f (list questionnaire-tag-wrapper))
                content))

;; question
(define/contract
  (question-tag-wrapper type)
  (-> questiontypes xexpr-property?)
  (xexpr-property
    (cdata #f #f (string-append
      "<question type=\"" type "\">"
      ))
    (cdata #f #f "</question>")))

(define/contract
  (question-tag type content)
  (-> questiontypes content? content?)
        (element (style #f (list (question-tag-wrapper type)))
                 content))

;; answer
(define/contract
  (answer-tag-wrapper correct)
  (-> boolean? xexpr-property?)
  (xexpr-property
    (cdata #f #f (string-append
      "<answer correct=\"" (if correct "true" "false") "\">"
      ))
    (cdata #f #f "</answer>")))

(define/contract
  (answer-tag correct content)
  (-> boolean? content? content?)
        (element (style #f (list (answer-tag-wrapper correct)))
                 content))

;; explanation
(define
  explanation-tag-wrapper
  (xexpr-property
    (cdata #f #f "<explanation>")
    (cdata #f #f "</explanation>")))

(define/contract
  (explanation-tag content)
  (-> content? content?)
      (element (style #f (list explanation-tag-wrapper))
                content))

(define
  (render-answer-html answer)
  (answer-tag (answer-container-correct answer)
    (list (answer-container-text answer)
          (explanation-tag (answer-container-explanation answer)))
  )
)

(define
  (render-question-html question)
  (question-tag (question-container-type question)
    (cons (question-container-text question)
          (map render-answer-html (question-container-answers question)))
  )
)

(define/contract
  (render-html questionnaire)
  (-> questionnaire-container? block?)
  (paragraph (style #f (list (js-addition "questionnaire.js")))
    (questionnaire-tag
      (map render-question-html
        (questionnaire-container-questions questionnaire)))
  )
)

;;;;;;;;;;; Latex Part
(define/contract
  (render-question-latex question)
  (-> question-container? (listof block?))
  (list (centered (question-container-text question))
        (itemlist (map (lambda (x) (item (answer-container-text x)))
                       (question-container-answers question)))
  )
)

(define/contract
  (render-solutions-latex questionnaire)
  (-> questionnaire-container? (listof block?))
  (list (paragraph (style "inbox" '()) "TODO: Lösungen"))
)

(define/contract
  (render-latex questionnaire)
  (-> questionnaire-container? block?)
  (nested-flow (style 'vertical-inset (list (tex-addition #"\\newcommand{\\inbox}[1]{{\\color{blue} #1}}")))
       (append 
         (apply append (map render-question-latex
          (questionnaire-container-questions questionnaire)))
         (render-solutions-latex questionnaire)))
)


;;;;;;;;;;; Exposed API
(define/contract
  (answer correct text explanation)
  (-> boolean? content? content? answer-container?)
  (answer-container correct text explanation)
)

(define; /contract
  (question type text . answers)
  ; (-> questiontypes content? (listof answer-container?) question-container?)
  (cond
    [(not (questiontypes type))
     (raise-argument-error 'type "A valid question type string (singlechoice or multiplechoice)" type)]
    [(not (content? text))
     (raise-argument-error 'text "An Element of Type content (no block, like e.g. a table or itemization)" text)]
    [(not (andmap answer-container? answers))
     (raise-argument-error 'answers "A list of @answer s (answer-container)" answers)]
    [else
     (question-container type text answers)]
  )
)

(define ; /contract
  (questionnaire . questions)
   ;(-> (listof question-container?) any)
   (if (andmap question-container? questions)
       (cond-block
         [html (render-html (questionnaire-container questions))]
         [latex (render-latex (questionnaire-container questions))]
       )
       (raise-argument-error 'questions "A list of @question s (question-container)" questions)
   )
)
