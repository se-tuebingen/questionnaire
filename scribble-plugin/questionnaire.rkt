#lang racket/base

(require racket/contract)
(require scriblib/render-cond)
(require scribble/core
         scribble/html-properties
         (only-in xml cdata))
(require scribble/base)
(require scribble/decode)

(provide questionnaire question answer explanation setup-questionnaire)

;;;;;;;;;;; custom HTML tags

(define questiontypes (or/c "singlechoice" "multiplechoice")) ; one-of does not work with strings

;; questionnaire
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

;;;;; Latex versions
(define answer-type (cons/c boolean? (cons/c content? content?)))
(define question-type (cons/c content? (listof answer-type)))
(define questionnaire-type (listof question-type))

; latex-renderer for questions
(define
  (latex-answer content)
  (item (car (cdr content))))
(define
  (latex-question content)
  (list (centered (car content))
        (itemlist (map latex-answer (cdr content)))))
(define
  (latex-questions content)
  (map latex-question content))

; latex-renderer for solutions
(define
  (latex-solutions content) "")

;;; pass content up in order to split it into questions and solutions
; explanation
(define/contract
  (explanation-latex content)
  (-> content? content?)
  "")
  ; content)

; answer
(define (is-no-whitespace? x)
  (not (or (string=? "\n" x) (string=? "" x))))
(define ;/contract
  (answer-latex correct content)
  (item content))
  ; ; (-> boolean? (listof content?))
  ; (filter is-no-whitespace? content))

; question
(define
  (question-latex content)
  (list (centered (car content)) (cdr content)))
  ; (filter is-no-whitespace? content))

; questionnaire
(define
  (questionnaire-latex content)
  content)
  ; (decode (list
  ;   (subsection "Questionnaire")
  ;   (decode content)
  ;     ; (latex-solutions content)))
  ; )))





;;;;;;;;;;;; Exposed Macros

; questionnaire
(define
  (questionnaire . questions)
  (cond-element
    [html (questionnaire-tag questions)]
    [latex (questionnaire-latex questions)]
  )
)

; single question
(define
  (question type . content)
  (cond-element
    [html (question-tag type content)]
    [latex (question-latex content)] ; todo latex implement. of mc questions
  )
)

; answer
(define
  (answer correct . content)
  (cond-element
    [html (answer-tag correct content)]
    [latex (answer-latex correct content)]
  )
)
; explanation
(define
  (explanation . exp)
  (cond-element
    [html (explanation-tag exp)]
    [latex (explanation-latex exp)]
  )
)

; script-tag to load plugin
(define setup-questionnaire
  (paragraph
   (style
    #f (list (alt-tag "script")
             (attributes `((type . "text/javascript")
                           (src . "questionnaire.js" )))))
   '()))
