#lang racket/base

(require scriblib/render-cond)

(provide step)

(define (step)
  (cond-element [html "→"] [latex "$\\longrightarrow$"]))
