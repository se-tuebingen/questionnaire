#lang racket/base

(require scriblib/render-cond)
(require scribble/core
         scribble/html-properties
         (only-in xml cdata))

(provide step)

;; custom HTML
(define (question-tag-wrapper type)
        (xexpr-property
          (cdata #f #f "<question>")
          (cdata #f #f "</question")))

(define (question-tag type content)
        (element (style #f (list (question-tag-wrapper type)))
                 content))

(define (step)
  (cond-element
    [html (question-tag "singlechoice" "arrow")]
    [latex "$\\longrightarrow$"]))
