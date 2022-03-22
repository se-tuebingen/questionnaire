#lang racket/base

(require racket/contract)
(require scriblib/render-cond)
(require scribble/core
         scribble/html-properties
         (only-in xml cdata))

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

;;;;;;;;;;;; Exposed Macros

; questionnaire
(define
  (questionnaire . questions)
  (questionnaire-tag questions)
)

; single question
(define
  (question type . content)
  (question-tag type
    content
  )
)

; answer
(define
  (answer correct . content)
  (answer-tag correct ;(equal? correct 1)
    content
  )
)
; explanation
(define
  (explanation . exp)
  (explanation-tag exp)
)

(define setup-questionnaire
  (paragraph
   (style
    #f (list (alt-tag "script")
             (attributes `((type . "text/javascript")
                           (src . "questionnaire.js" )))))
   '()))
; TODO: LaTex Output
; (define (step)
;   (cond-element
;     [html (question-tag "singlechoice" "arrow")]
;     [latex "$\\longrightarrow$"]))
