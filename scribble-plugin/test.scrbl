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
  @question["singlechoice"]{
    What is this course about?
    @answer[#f]{
      Learning to swim
      @explanation{We do not have a pool}
    }
    @answer[#f]{
      Learning to sing.
      @explanation{Singing is hard with masks on or network latency.}
    }
    @answer[#t]{
      Learning to program
      @explanation{Correct, you are reading this on some computer.}
    }
  }
]
@setup-questionnaire

@section{Multiple-Choice}

Test einer Multiple-Choice-Frage:

@questionnaire[
  @question["multiplechoice"]{
    What does TS stand for?
    @answer[#t]{
      TeamSpeak
      @explanation{etc}
    }
    @answer[#f]{
      Torus Examination
      @explanation{although technically...}
    }
    @answer[#t]{
      TypeScript
      @explanation{Yup}
    }
  }
]
@setup-questionnaire

@section{Block mit mehreren Fragen}

Test eines Blocks mit mehreren Fragen

@questionnaire[
  @question["multiplechoice"]{
    What does TS stand for?
    @answer[#t]{
      TeamSpeak
      @explanation{etc}
    }
    @answer[#f]{
      Torus Examination
      @explanation{although technically...}
    }
    @answer[#t]{
      TypeScript
      @explanation{Yup}
    }
  }
  @question["singlechoice"]{
    What is this course about?
    @answer[#f]{
      Learning to swim
      @explanation{We do not have a pool}
    }
    @answer[#f]{
      Learning to sing.
      @explanation{Singing is hard with masks on or network latency.}
    }
    @answer[#t]{
      Learning to program
      @explanation{Correct, you are reading this on some computer.}
    }
  }
  @question["singlechoice"]{
    Why is this happening?
    @answer[#f]{
      Yes
      @explanation{But actually no}
    }
    @answer[#f]{
      No
      @explanation{But actually yes}
    }
    @answer[#t]{
      Goat
      @explanation{Whatever floats your goat}
    }
  }
]
@setup-questionnaire

@section{Sonderzeichen und Rich Text}

Test, ob Bilder, Code und Auflistungen als Frageinhalte richtig dargestellt werden:

@questionnaire[
  @question["multiplechoice"]{
    Choose all answers that
    @itemlist[@item{Look right}
              @item{Are Correct}]
    @answer[#t]{
      @centered{Centered Text}
      @explanation{@centered{@bold{bold choice}}}
    }
    @answer[#t]{
      @(colorize (filled-ellipse 40 40) "beige")
      @explanation{@(colorize (filled-ellipse 40 40) "brown")}
    }
    @answer[#f]{
      @tabular[#:sep @hspace[1]
         (list (list "soup" "gazpacho")
               (list "soup" "tonjiru"))]
      @explanation{@tabular[#:style 'boxed
         #:column-properties '(left right)
         #:row-properties '(bottom-border ())
         (list (list @bold{recipe}   @bold{vegetable})
               (list "caldo verde"   "kale")
               (list "kinpira gobō"  "burdock")
               (list "makizushi"     'cont))]}
    }
  }
]
@setup-questionnaire
