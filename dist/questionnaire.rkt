#lang racket/base

(require racket/contract)
(require scriblib/render-cond)
(require scribble/core
         scribble/html-properties
         (only-in xml cdata))
(require scribble/latex-properties)
(require scribble/base)

(provide questionnaire question solution distractor explanation texquestions q)

;;;;;;;;;;; Type Definitions
(define questiontypes (or/c "singlechoice" "multiplechoice"))
(define texsolutionstyles (or/c "inline" "margin"))
 ; one-of does not work with strings
(define arbitrary-content? (or/c block? (or/c (listof block?) content?)))

; general answer for easy accessor
(struct/contract answer (
  [text arbitrary-content?])
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
  [explanation arbitrary-content?])
  #:transparent
)
(struct/contract distractor/e distractor (
  [explanation arbitrary-content?])
  #:transparent
)

; explanation
(struct/contract explanation (
  [text arbitrary-content?])
  #:transparent
)

; question
(struct/contract question-container (
  [type questiontypes]
  [text arbitrary-content?]
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
; helper for wrapping arbitrary content
(define/contract
  (wrap-tag wrapper content)
  (-> style? arbitrary-content? block?)
  (cond
    [(content? content)
     (paragraph wrapper content)]
    [(block? content)
     (nested-flow wrapper (list content))]
    [((listof block?) content)
     (nested-flow wrapper content)]
  )
)

; questionnaire
(define
  questionnaire-tag-wrapper
  (style "" (list (alt-tag "questionnaire")))
)

(define/contract
  (questionnaire-tag content)
  (-> arbitrary-content? block?)
  (wrap-tag questionnaire-tag-wrapper content)
)

; question
(define/contract
  (question-tag-wrapper type)
  (-> questiontypes style?)
  (style "" (list
    (alt-tag "question")
    (attributes (list (cons 'type type)))
  ))
)

(define/contract
  (question-tag type content)
  (-> questiontypes arbitrary-content? block?)
  (wrap-tag (question-tag-wrapper type) content)
)

; answer
(define/contract
  (answer-tag-wrapper correct)
  (-> boolean? style?)
  (style "" (list
    (alt-tag (if correct "solution" "distractor"))
  ))
)

(define/contract
  (answer-tag correct content)
  (-> boolean? arbitrary-content? block?)
  (wrap-tag (answer-tag-wrapper correct) content)
)

; explanation
(define
  explanation-tag-wrapper
  (style "" (list (alt-tag "explanation")))
)

(define/contract
  (explanation-tag content)
  (-> arbitrary-content? block?)
  (wrap-tag explanation-tag-wrapper content)
)

;;;; Render-Functions for each struct
; helper
(define/contract
  (blocksify c)
  (-> arbitrary-content? (listof block?))
  (cond
    [(content? c) (list (paragraph (style #f '()) c))]
    [(block? c) (list c)]
    [((listof block?) c) c]
  )
)

(define/contract
  (render-answer-html answer)
  (-> answer? block?)
  (answer-tag (solution? answer)
    (append
      (blocksify (answer-text answer))
      (cond
        [(solution/e? answer)
         (list (explanation-tag (solution/e-explanation answer)))]
        [(distractor/e? answer)
         (list (explanation-tag (distractor/e-explanation answer)))]
        [else '()]))
  )
)

(define/contract
  (render-question-html question)
  (-> question-container? block?)
  (question-tag (question-container-type question)
    (append
      (blocksify (question-container-text question))
      (map render-answer-html (question-container-answers question)))
  )
)

(define/contract
  (render-html questionnaire)
  (-> questionnaire-container? block?)
  (nested-flow
    (style #f (list (js-addition "questionnaire.js")))
    (list
      (questionnaire-tag
       (map render-question-html
         (questionnaire-container-questions questionnaire))))
  )
)

;;;;;;;;;;; Latex Part

;;; question part
; single question
(define/contract
  (render-question-latex question)
  (-> question-container? (listof block?))
  (append
    (blocksify (question-container-text question))
    (list
      (itemlist #:style 'ordered
        (map (lambda (x) (item (answer-text x)))
             (question-container-answers question))))
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
  (-> exact-integer? answer? block?)
  (let ([correct (solution? answer)]
        [explanation (cond
          [(solution/e? answer) (solution/e-explanation answer)]
          [(distractor/e? answer) (distractor/e-explanation answer)]
          [else ""])]
        [letter (enumerate-letter n)])
    (compound-paragraph
      (style #f '())
      (append
        (blocksify (list (if correct (bold letter) letter) ")"))
        (blocksify explanation)
      )
    )
  )
)

; solution for a question
(define/contract
  (latex-solution n question)
  (-> exact-integer? question-container? (listof block?))
  (let ([answers (question-container-answers question)]
        [numeral (string-append (number->string n) ".")])
    (append
      (blocksify numeral)
      (map-number latex-explanation answers)
    )
  )
)

; solution part
(define/contract
  (render-solutions-latex questionnaire solstyle)
  (-> questionnaire-container? texsolutionstyles block?)
  (let
    ([rotatedtext
      (nested-flow
        (style (string-append "QRotate" solstyle) (list 'command))
        (foldr append '() (map-number latex-solution
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
; helper for being able to put arbitrary content in answers
(define (q . x) x)

; helper for assigning explanations to answers
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
              [(explanation? a)
               (raise-argument-error 'xs "A solution or distractor before every explanation, at most one explanation per solution/distractor" xs)]
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
    [(not (arbitrary-content? text))
     (raise-argument-error 'text "An Element of Type content?, block? or a list of one of them" text)]
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
