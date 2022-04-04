#lang racket/base

(require racket/contract)
(require scriblib/render-cond)
(require scribble/core
         scribble/html-properties
         (only-in xml cdata))
(require scribble/latex-properties)
(require scribble/base)

(provide questionnaire question solution distractor explanation texquestions)

;;;;;;;;;;; Type Definitions
(define questiontypes (or/c "singlechoice" "multiplechoice"))
(define texsolutionstyles (or/c "inline" "margin"))
 ; one-of does not work with strings

; general answer for easy accessor
(struct/contract answer (
  [text content?])
  #:transparent
)

; solution and distractor
(struct/contract solution answer ()
  #:transparent
)
(struct/contract distractor answer ()
  #:transparent
)

; same but with explanation
(struct/contract solution/e solution (
  [explanation content?])
  #:transparent
)
(struct/contract distractor/e distractor (
  [explanation content?])
  #:transparent
)

; explanation
(struct/contract explanation (
  [text content?])
  #:transparent
)

; question
(struct/contract question-container (
  [type questiontypes]
  [text content?]
  [answers (listof answer?)])
  #:transparent
)

; quiz
(struct/contract questionnaire-container (
  [questions (listof question-container?)])
  #:transparent
)

;;;;;;;;;;; HTML Part

;;;; Custom HTML tags
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

; question
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

; answer
(define/contract
  (answer-tag-wrapper correct)
  (-> boolean? xexpr-property?)
  (xexpr-property
    (cdata #f #f (if correct "<solution>" "<distractor>"))
    (cdata #f #f (if correct "</solution>" "</distractor>"))))

(define/contract
  (answer-tag correct content)
  (-> boolean? content? content?)
        (element (style #f (list (answer-tag-wrapper correct)))
                 content))

; explanation
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

;;;; Render-Functions for each struct
(define
  (render-answer-html answer)
  (answer-tag (solution? answer)
    (cons (answer-text answer)
          (cond
            [(solution/e? answer)
             (list (explanation-tag (solution/e-explanation answer)))]
            [(distractor/e? answer)
             (list (explanation-tag (distractor/e-explanation answer)))]
            [else '()]))
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

;;; question part
; single question
(define/contract
  (render-question-latex question)
  (-> question-container? (listof block?))
  (list (paragraph (style #f '()) (bold (question-container-text question)))
        (itemlist #:style 'ordered
        (map (lambda (x) (item (answer-text x)))
                       (question-container-answers question)))
  )
)

; list of questions
(define/contract
  (render-questions-latex questions)
  (-> (listof question-container?) block?)
  (itemlist #:style 'ordered
   (map (lambda (x) (item (render-question-latex x)))
        questions
   ))
)

;;; solution part
;; enumeration helpers

; turn letter into character
(define/contract
  (enumerate-letter n)
  (-> exact-integer? string?)
  (string (integer->char (+ (char->integer #\a) (- n 1))))
)

; like map, but with index (starting at 1) as first function argument
(define ;/contract
  (map-number #:current [current 1] f xs)
  ;(-> (-> exact-integer? %a %b) (listof %a) (listof %b))
  (if (null? xs) xs
  (cons (f current (car xs))
        (map-number #:current (+ current 1) f (cdr xs))))
)

; solution for single answer
(define/contract
  (latex-explanation n answer)
  (-> exact-integer? answer? content?)
  (let ([correct (solution? answer)]
        [explanation (cond
          [(solution/e? answer) (solution/e-explanation answer)]
          [(distractor/e? answer) (distractor/e-explanation answer)]
          [else ""])]
        [letter (enumerate-letter n)])
    (element #f (list
      (if correct (bold letter) letter)
      ")"
      explanation
      " "
    ))
  )
)

; solution for a question
(define/contract
  (latex-solution n question)
  (-> exact-integer? question-container? content?)
  (let ([answers (question-container-answers question)]
        [numeral (string-append (number->string n) ".")])

      (cons numeral
        (append (map-number latex-explanation answers)
                (list (element 'newline '()))))
  )
)

; solution part
(define/contract
  (render-solutions-latex questionnaire solstyle)
  (-> questionnaire-container? texsolutionstyles block?)
  (let
    ([rotatedtext
      (paragraph (style (string-append "QRotate" solstyle) '())
        (smaller
          (map-number latex-solution
           (questionnaire-container-questions questionnaire))))
    ])
  (cond [(string=? solstyle "inline") rotatedtext]
        [(string=? solstyle "margin") (margin-note rotatedtext)])
  )
)

; helper for generating latex macros
(define/contract
  (solutions-style version)
  (-> texsolutionstyles bytes?)
  (cond [(string=? version "inline")
         #"\\newcommand{\\QRotateinline}[1]{{\\rotatebox{180}{\\parbox{\\textwidth}{#1}}}}"]
        [(string=? version "margin")
          #"\\newcommand{\\QRotatemargin}[1]{{\\rotatebox{180}{\\parbox{\\marginparwidth}{#1}}}}"]
  )
)

;; top-level latex renderer for questionnaire
(define/contract
  (render-latex questionnaire solstyle)
  (-> questionnaire-container? texsolutionstyles block?)
  (nested-flow
    (style 'vertical-inset (list (tex-addition (solutions-style solstyle))))
    (list
     (render-questions-latex
      (questionnaire-container-questions questionnaire))
      (render-solutions-latex questionnaire solstyle)))
)

; save latex questionnaire
(define/contract
  (save-latex location content)
  (-> string? block? block?)
  (paragraph (style #f '()) (list
    (collect-element
      (style #f '())
      '()
      (lambda (ci)
        (collect-put!
          ci
          (list (string->symbol (string-append "Questionnaire" location)) #t)
          content
        )
      )
    )))
)

; retrieve latex questionnaire
(define/contract
  (retrieve-latex location)
  (-> string? delayed-block?)
  (delayed-block
    (lambda (r p ri)
      (resolve-get p ri (list (string->symbol (string-append "Questionnaire" location)) #t)))
  )
)


;;;;;;;;;;; Exposed API
; answer building blocks
(define/contract
  (merge-explanations xs)
  (-> (listof (or/c answer? explanation?)) (listof answer?))
  (if (pair? xs)
      (if (pair? (cdr xs))
          (let ([a (car xs)]
                [b (car (cdr xs))]
                [xxs (cdr (cdr xs))])
            (cond
              [(and (distractor? a) (explanation? b))
               (cons (distractor/e (answer-text a) (explanation-text b)) (merge-explanations xxs))]
              [(and (solution? a) (explanation? b))
               (cons (solution/e (answer-text a) (explanation-text b)) (merge-explanations xxs))]
              [else (cons a (merge-explanations (cdr xs)))]
            )
          )
          xs
      )
      xs
  )
)

; question
(define
  (question type text . answers)
  (cond
    [(not (questiontypes type))
     (raise-argument-error 'type "A valid question type string (singlechoice or multiplechoice)" type)]
    [(not (content? text))
     (raise-argument-error 'text "An Element of Type content (no block, like e.g. a table or itemization)" text)]
    [(not (andmap (or/c answer? explanation?) answers))
     (raise-argument-error 'answers "A list of @solution|@distractor|@explanation" answers)]
    [else
     (question-container type text (merge-explanations answers))]
  )
)

; helper for "nothing"
(define nothing (nested-flow (style #f '()) '()))

; questionnaire
(define
  (questionnaire #:texsolutionstyle [style "margin"] #:key [key "DefaultQuestionnaire"] #:nolatex [nolatex #f] . questions)
   (cond [(not (andmap question-container? questions))
          (raise-argument-error 'questions "A list of @question s (question-container)" questions)]
         [(not (texsolutionstyles style))
          (raise-argument-error 'texsolutionstyle "A valid layout option for the solutions in latex (margin or inline)" style)]
         [(not (string? key))
          (raise-argument-error 'key "A string key for retrieving the questionnaire with @texquestions" key)]
         [(not (boolean? nolatex))
          (raise-argument-error 'nolatex "A boolean flag whether to suppress latex rendering" nolatex)]
         [else
         (cond-block
           [html (render-html (questionnaire-container questions))]
           [latex (if nolatex
                      nothing
                      (save-latex key
                        (render-latex (questionnaire-container questions) style)))]
         )
         ]
   )
)

; latex print location
(define
  (texquestions #:key [key "DefaultQuestionnaire"])
  (cond [(not (string? key))
         (raise-argument-error 'key "A string key for retrieving the questionnaire with @texquestions" key)]
        [else (cond-block
                [latex (retrieve-latex key)]
                [html nothing]
              )]
  )
)
