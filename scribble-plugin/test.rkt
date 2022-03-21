#lang racket/base

(require racket/contract)
(define/contract
  (test a . b)
  (-> number? any/c (listof number?))
  b)

(test 1 2 3)
(test 1 2 3 4)
