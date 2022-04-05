# interactive-textbooks
[Etherpad](http://160.uk.to/pad/p/interactive-textbooks)
[![Generate HTML & PDF](https://github.com/se-tuebingen/interactive-textbooks/actions/workflows/publish.yml/badge.svg)](https://github.com/se-tuebingen/interactive-textbooks/actions/workflows/publish.yml)

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

You can generate your questions much in the same style as in the HTML document. The `@q` helper does not change the input, but enables you to use content notation while producing a racket argument (more on that [here](https://docs.racket-lang.org/scribble/reader.html)).
```scribble
@questionnaire[
  @question[
    "singlechoice"
    "Question Text"
    @solution{correct answer}
    @distractor{wrong answer}
  ]
  @question[
    "multiplechoice"
    @q{Question Text with some @italic{formatting}}

    @solution{correct answer}
    @explanation{optional explanation for correct answer}

    @distractor{wrong answer}

    @explanation{optional explanation for wrong answer}
    @solution{another correct solution}
  ]
]
@texquestions[]
```

For your questions to show up in a PDF, you need to specify where they should be rendered.
- A simple `@texquestions[]` renders the last `@questionnaire` that was defined above it. _If `@texquestions[]` is not called, the code for generating the latex for a question will not be run._
- Using this several times will produce a warning, which can be safely ignored (`WARNING: collected information for key multiple times: '(QuestionnaireDefaultQuestionnaire #t);`)
- If you have several questionnaires and want to e.g. move them to a separate section at the end, you need to specify a key as a keyword argument to both commands: `@texquestions[#:key "intro"]` renders what has been defined in `@questionnaire[#:key "intro" ...]`.

There are also some styling options for the LaTex output that can be passed as keyword arguments to `@texquestions`:
- `#:texsolutionstyle` Where the solution is added:
  - `"margin"` (default) in the margin beside the questions
  - `"inline"` below the questions
- `#:explain` Whether to include explanations in the solution (default: `#t`)

## Tests

- `questionnaire-test.html` loads the JavaScript plugin into a plain HTML page.
- Executing `make test` or running `test.sh` in the `scribble-plugin` folder tests the Scribble plugin and generates PDF- and HTML output.

## Ressources

### Scribble etc

[Overview of Scribble Document Types](https://docs.racket-lang.org/scribble/core.html#%28part._parts%29) - Everything Scribble-Related should be in the same documentation.

[Racket Documentation about Pairs and Lists](https://docs.racket-lang.org/guide/pairs.html) - for anything else it should suffice to enter the function name into the search box.

[Variable Arity Expressions in Racket](https://stackoverflow.com/questions/65873698/using-variable-arity-function-on-values-expression)

[Keyword Arguments in Racket](https://riptutorial.com/racket/example/8681/keyword-arguments)

For moving document parts around in Scribble, see e.g. the
[delayed block](https://docs.racket-lang.org/scribble/core.html#%28def._%28%28lib._scribble%2Fcore..rkt%29._delayed-block%29%29) documentation. Saving stuff in a LaTex variable and accessing it later is impossible because the Top Scribble Document Element needs to be a block, which translates Custom Latex Properties to an environment, which cannot generate a `\def\variable{}` command.



## Next Meeting
Dienstag 14:00 Uhr

## MacOS Support
- Running `raco scribble` instead of `scribble`
