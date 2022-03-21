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
    @answer[0 "Learning to swim"]{
      We do not have a pool
    }
    @answer[0 "Learning to sing."]{
      Singing is hard with masks on or network latency.
    }
    @answer[1 "Learning to program."]{
      Correct, you are reading this on some computer.
    }
  }
]
