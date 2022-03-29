#lang scribble/manual

@(require "questionnaire.rkt")
@(require pict) @; for testing picture rendering

@title[#:version ""]{Test-Seite für Questionnaire-Plugin}
@author["Florian Kellner"]

Diese Seite soll die Funktionen des Scribble-Plugins für das
Questionnaire-Modul testen.

@table-of-contents[]

@section{Single-Choice}

Test einer Single-Choice-Frage:

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
@setup-questionnaire

@section{Multiple-Choice}

Test einer Multiple-Choice-Frage:

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
]
@setup-questionnaire

@section{Block mit mehreren Fragen}

Test eines Blocks mit mehreren Fragen

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
@setup-questionnaire
