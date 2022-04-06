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
(define arbitrary-content?
  (or/c block?
  (or/c content?
        (listof (or/c content? block?)))))

; helper for arbitrary content
(define/contract
  (homogenize xs)
  (-> (listof (or/c content? block?)) (listof block?))
  (map (lambda (x) (if (block? x) x
        (paragraph (style #f '()) x)
  )) xs)
)

; general answer for easy accessor
(struct/contract answer (
  [text arbitrary-content?])
  #:transparent
)

; solution and distractor
(struct/contract solution-container answer ()
  #:transparent
)
(define (solution . x) (solution-container x))

(struct/contract distractor-container answer ()
  #:transparent
)
(define (distractor . x) (distractor-container x))

; same but with explanation
(struct/contract solution/e solution-container (
  [explanation arbitrary-content?])
  #:transparent
)
(struct/contract distractor/e distractor-container (
  [explanation arbitrary-content?])
  #:transparent
)

; explanation
(struct/contract explanation-container (
  [text arbitrary-content?])
  #:transparent
)
(define (explanation . x) (explanation-container x))

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
    [((listof (or/c block? content?)) content)
     (nested-flow wrapper (homogenize content))]
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
    [((listof (or/c block? content?)) c) (homogenize c)]
  )
)

(define/contract
  (render-answer-html answer)
  (-> answer? block?)
  (answer-tag (solution-container? answer)
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

; show explanation for answer (if applicable)
(define/contract
  (latex-explanation n answer)
  (-> exact-integer? answer? (cons/c boolean? block?))
  (let ([correct (solution-container? answer)]
        [explanation (cond
          [(solution/e? answer) (solution/e-explanation answer)]
          [(distractor/e? answer) (distractor/e-explanation answer)]
          [else ""])]
        [letter (enumerate-letter n)])
    (cons
      ((or/c solution/e? distractor/e?) answer)
      (cond
        [(content? explanation)
         (car (blocksify (list (if correct (bold letter) letter) ")" explanation)))]
        [else
         (compound-paragraph
          (style #f '())
          (append
            (blocksify (list (if correct (bold letter) letter) ")"))
            (blocksify explanation)
          ))]
      )
    )
  )
)

; show letter for correct answers
(define/contract
  (short-solution n answer)
  (-> exact-integer? answer? content?)
  (if (solution-container? answer) (enumerate-letter n) "")
)

; solution for a question
(define/contract
  (latex-solution n question explain)
  (-> exact-integer? question-container? boolean? (listof block?))
  (let ([answers (question-container-answers question)]
        [numeral (string-append (number->string n) ".")])
    (append
      (blocksify (cons numeral (map-number short-solution answers)))
      (if explain
          (map (lambda (x) (cdr x))
            (filter (lambda (x) (car x))
              (map-number latex-explanation answers)))
          '())
    )
  )
)

; solution part
(define/contract
  (render-solutions-latex questionnaire solstyle explain)
  (-> questionnaire-container? texsolutionstyles boolean? block?)
  (let
    ([rotatedtext
      (nested-flow
        (style (string-append "QRotate" solstyle) (list 'command))
        (foldr append '() (map-number
          (lambda (n q) (latex-solution n q explain))
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
  (render-latex solstyle explain questionnaire)
  (-> texsolutionstyles boolean? questionnaire-container? block?)
  (nested-flow
    (style 'vertical-inset (list (tex-addition (solutions-style solstyle))))
    (list
     (render-questions-latex
      (questionnaire-container-questions questionnaire))
     (render-solutions-latex questionnaire solstyle explain)))
)

; save a questionnaire during the collect pass
(define/contract
  (save-questionnaire location content)
  (-> string? questionnaire-container? block?)
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

; retrieve and render questionnaire during the resolve pass
(define/contract
  (retrieve-questionnaire location renderer)
  (-> string? any/c delayed-block?)
  (delayed-block
    (lambda (r p ri)
      (renderer (resolve-get p ri (list (string->symbol (string-append "Questionnaire" location)) #t))))
  )
)


;;;;;;;;;;; Exposed API
; helper for being able to put arbitrary content in answers
(define (q . x) x)

; helper for assigning explanations to answers
(define/contract
  (merge-explanations xs)
  (-> (listof (or/c answer? explanation-container?)) (listof answer?))
  (if (pair? xs)
      (if (pair? (cdr xs))
          (let ([a (car xs)]
                [b (car (cdr xs))]
                [xxs (cdr (cdr xs))])
            (cond
              [(and (distractor-container? a) (explanation-container? b))
               (cons (distractor/e (answer-text a) (explanation-container-text b)) (merge-explanations xxs))]
              [(and (solution-container? a) (explanation-container? b))
               (cons (solution/e (answer-text a) (explanation-container-text b)) (merge-explanations xxs))]
              [(explanation-container? a)
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
     (raise-argument-error 'text "An Element of Type content?, block? or a list of (possibly a mix of) them" text)]
    [(not (andmap (or/c answer? explanation-container?) answers))
     (raise-argument-error 'answers "A list of @solution|@distractor|@explanation" answers)]
    [else
     (question-container type text (merge-explanations answers))]
  )
)

; helper for "nothing"
(define nothing (nested-flow (style #f '()) '()))

; questionnaire
(define
  (questionnaire #:key [key "DefaultQuestionnaire"] . questions)
   (cond [(not (andmap question-container? questions))
          (raise-argument-error 'questions "A list of @question s (question-container)" questions)]
         [(not (string? key))
          (raise-argument-error 'key "A string key for retrieving the questionnaire with @texquestions" key)]
         [else
         (cond-block
           [html (render-html (questionnaire-container questions))]
           [latex (save-questionnaire key (questionnaire-container questions))]
         )
         ]
   )
)

; latex print location
(define
  (texquestions #:key [key "DefaultQuestionnaire"] #:texsolutionstyle [style "margin"] #:explain [explain #t])
  (cond [(not (string? key))
         (raise-argument-error 'key "A string key for retrieving the questionnaire with @texquestions" key)]
        [(not (texsolutionstyles style))
         (raise-argument-error 'texsolutionstyle "A valid layout option for the solutions in latex (margin or inline), default: margin" style)]
        [(not (boolean? explain))
         (raise-argument-error 'explain "A boolean flag whether to print explanations, default: #t" explain)]
        [else (cond-block
                [latex
                 (retrieve-questionnaire key (lambda (x) (render-latex style explain x)))]
                [html nothing]
              )]
  )
)
