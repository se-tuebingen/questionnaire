#lang scribble/manual

@(require "questionnaire.rkt")
@; @(require scribble/eval)

@title[#:version ""]{Questionnaire test manual}
@author["Florian Kellner"]

This manual aims to cover one specific error.

@table-of-contents[]

@section{No-Solution-Error}

The following question has no solution and should not compile:

@questionnaire[
  @question[#:type "singlechoice"
    @q{What is an error?}
    @solution{fun}
    @solution{something to eat}
    @distractor{a flipped goat}
    @distractor{ghost sandwich}
]
]
