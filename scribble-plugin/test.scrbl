#lang scribble/manual

@(require "questionnaire.rkt")

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
