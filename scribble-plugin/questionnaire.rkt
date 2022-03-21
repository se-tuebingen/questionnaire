#lang racket/base

(require racket/contract)
(require scriblib/render-cond)
(require scribble/core
         scribble/html-properties
         (only-in xml cdata))

(provide step)

;; custom HTML

(define questiontypes (or/c "singlechoice" "multiplechoice")) ; one-of does not work with strings

(define/contract
  (question-tag-wrapper type)
  (-> questiontypes xexpr-property?)
  (xexpr-property
    (cdata #f #f (string-append
      "<question type=\"" type "\">"
      ))
    (cdata #f #f "</question")))

(define/contract
  (question-tag type content)
  (-> questiontypes content? content?)
        (element (style #f (list (question-tag-wrapper type)))
                 content))

(define (step)
  (cond-element
    [html (question-tag "singlechoice" "arrow")]
    [latex "$\\longrightarrow$"]))
