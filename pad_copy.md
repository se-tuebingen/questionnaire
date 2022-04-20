# Interactive Textbooks

## 20.04.22

1. F (done)
- square[x] statt x
- kringel[x] statt x

2. L
- Remove multiple-/Singlechoice Error

3.F
- Sprachinternationalisierung
- Sprachparameter in questionnaire default übergeben

4. L
- Bug Summary

5.1 L
- Pull request Pl1 + doku link

5.2 F
- Pull request Info 1 + doku link + beispiele

6. L
- gh pages workflow erstellen

7. F
- Dokumentieren wie man den style verändert

8. L
- github workflows latest version anstelle von version change number

9. L
 swipeEvents

10. F
 Animations

## Todos

### Typescript
- REFACTORING beenden
- Code / Bilder als Question/Answer
- <explanation>-Tags optional machen (wirft in der Konsole noch einen Fehler)
- <answer> -> <solution> && <distractor> (nächster Schritt)
- Validating html in typescript einbinden
- Fail-Testcases für alle Fails bauen
- Change Answer-Click functionality: Statt bisherigem Clickverhalten auf eine Answer(Click -> checkAnswer + showExplanation) soll bei einem Click zuerst die Auswahl der Antworten angezeigt werden und dann die Explanation extra ausgewählt werden

### Scribble


### GitHub
- Releases rauslassen via Workflow

## In Progress

- (L) Refactoring TS


## Done

- (Scribble, F) Ort für Solution manuell einstellen (latex-Makro)
- (Scribble, F) <answer> -> <solution> && <distractor>, Explanation Optional
- (F, Scribble) Code und Bilder in Fragetext/Antworten

## Feedback / Wünsche

- Multiplechoice/Singlechoice automatisch ermitteln
- Unterscheide Multiplechoice/Singlechoice durch Box/Kreis
- custom tag answer  -> <ul><li>
- Demo custom CSS via Style Tag/Scribble-Version



# Old


## Todos

- (beide, done) Scribbl installieren
- (beide, done) TypeScript installieren
- (beide, done) Entwurf für HTML-Interface überlegen
- (Linus) CSS-Layout
- (Linus)TS-Code, damit das ganze tut
- (L)Frage mit Typ außerhalb von Text (Image + Text als Frage, Image als Antwort)
- (L)Code cleanen
- (L) Feature: Anzeige für ANzahl richtiger Antworten
- (L) github-workflow bauen
- (L) Fehlermeldung: built-fail, falsche Syntax bei Fragen ausgeben
- (Flo)(html passt schon, latex passt schon) Scribbl-Modul schreiben
- Scribble-Testcase für Code/Bilder in Fragen/Antworten
- Testcases ausbauen: Ungültige Inhalte?
- Freundliche Fehlermeldungen

## Todos 31.03.2022
- Refactoring
- change <answer> to either <solution> or <distractor>
- change AnswerClick functionality: Statt bisherigem Clickverhalten auf eine Answer(Click -> checkAnswer + showExplanation) soll bei einem Click zuerst die Auswahl der Antworten angezeigt werden und dann die Explanation extra ausgewählt werden
- onclick-EventHandler zum Laufen bringen
