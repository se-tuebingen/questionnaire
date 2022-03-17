#lang racket/base

(require scriblib/render-cond)

(provide step)

(define (step x)
  (cond-element [html "→"] [latex "$\\longrightarrow$"]))
