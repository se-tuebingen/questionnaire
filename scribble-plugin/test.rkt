#lang racket/base

(define
  (test a . b)
  (if (pair? b) (car b) b))

(test 1 2)
(test 1 2 3 4)
