#lang scribble/manual

@(require "questionnaire.rkt")
@(require pict) @; for testing picture rendering

@title[#:version ""]{Questionnaire test manual}
@author["Florian Kellner"]

This manual aims to cover most possible valid configurations.

@table-of-contents[]

@section{Single-Choice and Multiple Choice}

Single-Choice Question:

@questionnaire[
  @question[
    "singlechoice"
    "What is this course about?"
    @answer[
      #f
      "Learning to swim"
      "We do not have a pool"
    ]
    @answer[
      #f
      "Learning to sing"
      "Singing is hard with masks on or network latency"
    ]
    @answer[
      #t
      "Learning to program"
      "You are sitting at a computer, aren't you?"
    ]
  ]
]

Multiple-Choice-Question (in the pdf, the solution should be below and not in the margin, here):

@questionnaire[ #:texsolutionstyle "inline"
  @question["multiplechoice"
    "What does TS stand for?"
    @answer[#t
      "TeamSpeak"
      "etc"
    ]
    @answer[#f
      "Torus Examination"
      "although technically..."
    ]
    @answer[#t
      "TypeScript"
      "Yup"
    ]
  ]
]

@section{More than one Question}

Questionnaire with several questions:

@questionnaire[
@question["multiplechoice"
  "What does TS stand for?"
  @answer[#t
    "TeamSpeak"
    "etc"
  ]
  @answer[#f
    "Torus Examination"
    "although technically..."
  ]
  @answer[#t
    "TypeScript"
    "Yup"
  ]
]
@question[
  "singlechoice"
  "What is this course about?"
  @answer[
    #f
    "Learning to swim"
    "We do not have a pool"
  ]
  @answer[
    #f
    "Learning to sing"
    "Singing is hard with masks on or network latency"
  ]
  @answer[
    #t
    "Learning to program"
    "You are sitting at a computer, aren't you?"
  ]
]
  @question["singlechoice"
    "Why is this happening?"
    @answer[#f
      "Yes"
      "But actually no"
    ]
    @answer[#f
      "No"
      "But actually yes"
    ]
    @answer[#t
      "Goat"
      "Whatever floats your goat"
    ]
  ]
]
