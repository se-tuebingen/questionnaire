#lang scribble/manual

@(require "questionnaire.rkt")
@; @(require scribble/eval)

@title[#:version ""]{Questionnaire test manual}
@author["Florian Kellner"]

This manual aims to cover most possible valid configurations.

@table-of-contents[]

@section{Single-Choice and Multiple Choice}

Single-Choice Question:

@questionnaire[#:key "singlechoicetest"
@question[
  "singlechoice"
  @q{What is this @bold{course} @italic{about?}}

  @distractor{Learning to swim}
  @explanation{We do not have a pool}

  @distractor{Learning to sing}
  @explanation{Singing is hard with masks on or network latency}

  @solution{Learning to program}
  @explanation{You are sitting at a computer, aren't you?}
]
]

Multiple-Choice-Question (in the pdf, the solution should be below and not in the margin, here):

@questionnaire[
@question["multiplechoice"
  @q{What does TS stand for?}

  @solution{TeamSpeak}
  @distractor{Torus Examination}
  @solution{TypeScript}
]
]

In latex, the questions should be rendered below:
@texquestions[#:key "singlechoicetest"]
@texquestions[#:texsolutionstyle "inline"]

@section{More than one Question}

Questionnaire with several questions:

@questionnaire[
@question["multiplechoice"
  @q{What does TS stand for?}

  @solution{TeamSpeak}

  @distractor{Torus Examination}
  @explanation{although technically...}

  @solution{TypeScript}
]
@question[
  "singlechoice"
  @q{What is this course about?}

  @distractor{Learning to swim}
  @explanation{We do not have a pool}

  @distractor{Learning to sing}
  @explanation{Singing is hard with masks on or network latency}

  @solution{Learning to program}
  @explanation{You are sitting at a computer, aren't you?}
]
  @question["singlechoice"
    @q{Why is this happening?}

    @distractor{Yes}
    @explanation{But actually no}

    @distractor{No}
    @explanation{But actually yes}

    @solution{Goat}
    @explanation{Whatever floats your goat}
  ]
]

@texquestions[]

@section{Moving questions to another section}

In the pdf version, we should see the "What is this course about?" question here again (but without explanations), in the HTML version, it is "What does TS stand for":

@texquestions[#:key "singlechoicetest" #:explain #f]
@questionnaire[
  @question["multiplechoice"
    @q{What does TS stand for?}

    @solution{TeamSpeak}
    @distractor{Torus Examination}
    @solution{TypeScript}
  ]
]

@section{Including arbitrary Content}

Scribble allows to create:
@itemlist[
  @item{Itemizations}
  @item{Tables
    @tabular[#:sep @hspace[3]
 (list (list @bold{Numbers}       @bold{Strings})
       (list @racket[42]         @racket["42"])
       (list @racket[(+ 21 21)]  @racket["(+ 21 21)"]))]
  }
  @item{
    @racketblock[(string-append "Racket" "Code")]
  }
  @item{
    Images: @image["rocket-s.jpg"]
  }
  @item{ And much more, which cannot be covered in its entirety}
]


This questionnaire tests proper handling of those cases:

@questionnaire[
  @question["multiplechoice"
    @q{
      Which of the following answers are correct?
      @itemlist[
        @item{The first}
        @item{The second}
        @item{The third}
      ]
    }
    @distractor{
      @itemlist[
        @item{1.}
        @item{3.}
      ]
    }
    @distractor{
      What about
      @itemlist[ #:style 'ordered
        @item{The third}
        @item{The first}
      ]
    }
    @solution{
      None of the above
    }
    @explanation{
      @itemlist[ #:style 'ordered
        @item{1. and 3. contradict each other}
        @item{with such riddles, this is always the answer}
      ]
    }
  ]

  @question["singlechoice"
    @q{
      Fill in the gap in the table!
      @tabular[#:sep @hspace[3]
   (list (list @bold{Expression}       @bold{Value})
         (list @racket[42]         @racket[42])
         (list @racket[(+ 21 21)] ""))]
    }
    @distractor{
      Of course it is
      @tabular[#:sep @hspace[3]
   (list (list @bold{Expression}       @bold{Value})
         (list @racket[42]         @racket[42])
         (list @racket[(+ 21 21)]  @racket["(+ 21 21)"]))]
    }
    @solution{
      @tabular[#:sep @hspace[3]
   (list (list @bold{Expression}       @bold{Value})
         (list @racket[42]         @racket[42])
         (list @racket[(+ 21 21)]  @racket[42]))]
    }
    @distractor{
      None of the above
    }
    @explanation{
      No, the below is correct:
      @tabular[#:sep @hspace[3]
   (list (list @bold{Expression}       @bold{Value})
         (list @racket[42]         @racket[42])
         (list @racket[(+ 21 21)]  @racket[42]))]
    }
  ]

  @question["multiplechoice"
    @q{
      More reduction!
      @racketblock[
        (+
          (* 3 7)
          (* 7 3)
        )
      ]
    }
    @solution{
      @racketblock[
        (+
           21
           21
        )
      ]
    }
    @solution{
      Finally
      @racketblock[42]
    }
    @explanation{
      Both happen:
      @racketblock[
        (+ 21 21)
        42
      ]
    }
    @distractor{
      None of the above
    }
  ]

  @question["singlechoice"
    @q{
      We only have one test image, so bear with me:
      @image["rocket-s.jpg"] @tt{+} @image["rocket-s.jpg"] @tt{=?}
    }
    @distractor{
      @image["rocket-s.jpg"]
    }
    @solution{
      @image["rocket-s.jpg"] @image["rocket-s.jpg"]
    }
    @explanation{
      @image["rocket-s.jpg"] times 2
    }
    @distractor{
      @image["rocket-s.jpg"] @image["rocket-s.jpg"] @image["rocket-s.jpg"]
    }
  ]
]
@texquestions[]

@section{Error Test Cases}
