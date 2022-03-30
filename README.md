# interactive-textbooks

## What is this Repository?

This is sort of an exchange playground for Linus and Florian to develop
HTML/JS Modules for use in lecture materials.

## Development

### Requirements

For the JavaScript module, [TypeScript](https://www.typescriptlang.org/download) is required. Once you have [nodejs](https://nodejs.org/en/download/) installed, you can simply run `npm install -g typescript`.

For the Scribble module, you need to have [Racket](https://download.racket-lang.org/) installed. For PDF-Generation, you also need to have LaTex installed, more specifically on Linux Systems the `texlive-extra` and `texlive-fonts-extra` packages, on Mac Systems via the Homebrew-Installer `texlive`.

For the time being, this repository uses bash for helper scripts, which should work fine on Linux and Mac Systems, for Windows users an emulator like Cygwin or Mingw should do.

### Compilation and Targets

Executing `tsc` in project root creates the single-file drop-in questionnaire module from the `src` folder.

Because the goal is to provide on single JavaScript file, Styles and SVG icons are provided as String ressources in `ressources.ts`.
This module is generated from the contents of the `ressources` folder (`style.css` and the `svg`-files in the `icons` folder) by running `bundle-ressources.sh`.
So any changes in those files are only applied after running this script!

For ease of use, there is also a Makefile, so you can simply
run
- `make all` to bundle ressources and compile the JavaScript plugin, and
- `make test` to execute the tests - currently this only compiles a scribble test document in pdf and html


## How to use

### JavaScript module

In order to use the JavaScript module, one only needs to create HTML in the correct format and include the script somewhere on the page:
```html
<questionnaire>
  <question type="singlechoice"><!-- or multiplechoice-->
    Question Text
    <answer correct="false">
      Answer Text
      <explanation>Explanation Text</explanation>
    </answer>
    <!-- etc.. -->
  </question>
  <!-- etc. ... -->
</questionnaire>

<!-- somewhere else in the same document -->
<script src="questionnaire.js"></script>
```

### Scribble-Plugin

Copy the Scribble-Plugin and the JavaScript-Plugin (`questionnaire.rkt` *and* `questionnaire.js`) to your source folder and import it with
```scribble
@(require "questionnaire.rkt")
```

You can generate your questions in the same style as in the HTML document (any string can also be something of type content - but be aware you are in Racket mode between angled braces):
```scribble
@questionnaire[
  @question[
    "singlechoice"
    "Question Text"
    @answer[#t
      "correct answer"
      "Explanation"
    ]
    @answer[#f
      "wrong answer"
      "Explanation"
    ]
  ]
  @question[
    "multiplechoice"
    "Question Text"
    @answer[#t
      "correct answer"
      "Explanation"
    ]
    @answer[#f
      "wrong answer"
      "Explanation"
    ]
    @answer[#t
      "correct answer"
      "Explanation"
    ]
  ]
]
```

When you render your Questionnaire to PDF, the solution will be added as a block of rotated text in the margin beside the quiz. If you want to have it below the text instead, you can add the keyword argument `#:texsolutionstyle "inline"` before your questions in the `@questionnaire`.

## Tests

- `questionnaire-test.html` loads the JavaScript plugin into a plain HTML page.
- Executing `make test` or running `test.sh` in the `scribble-plugin` folder tests the Scribble plugin and generates PDF- and HTML output.

## Ressources

[Installing GNU Utils on MacOS](https://ryanparman.com/posts/2019/using-gnu-command-line-tools-in-macos-instead-of-freebsd-tools/)

[Overview of Scribble Document Types](https://docs.racket-lang.org/scribble/core.html#%28part._parts%29) - Everything Scribble-Related should be in the same documentation.

[Racket Documentation about Pairs and Lists](https://docs.racket-lang.org/guide/pairs.html) - for anything else it should suffice to enter the function name into the search box.

[Variable Arity Expressions in Racket](https://stackoverflow.com/questions/65873698/using-variable-arity-function-on-values-expression)

[Keyword Arguments in Racket](https://riptutorial.com/racket/example/8681/keyword-arguments)



## Todos

- (beide, done) Scribbl installieren
- (beide, done) TypeScript installieren
- (beide, done) Entwurf für HTML-Interface überlegen
- (Linus) CSS-Layout
- (Linus)TS-Code, damit das ganze tut
- (L)Frage mit Typ außerhalb von Text (Image + Text als Frage, Image als Antwort)
- (L)Code cleanen
- (L) Feature: Anzeige für Anzahl richtiger Antworten
- (L) github-workflow tut
- (L) Fehlermeldung: built-fail, falsche Syntax bei Fragen ausgeben
- (Flo)(html passt schon, latex passt schon) Scribbl-Modul schreiben
- Scribble-Testcase für Code/Bilder in Fragen/Antworten
- Testcases ausbauen: Ungültige Inhalte?
- Freundliche Fehlermeldungen

## MacOS Support
- Running `raco scribble` instead of `scribble`
