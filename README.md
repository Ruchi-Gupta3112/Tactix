# Tactix

A responsive Tic-Tac-Toe game and best-move solver built with HTML, CSS, and JavaScript.

## Run

Open `index.html` in Chrome, Edge, or another modern browser. Keep `index.html`, `styles.css`, `engine.js`, and `app.js` in the same folder. No installation or server is needed.

## Play

- **Play AI:** Choose X or O. The AI makes optimal moves and cannot be beaten.
- **Two players:** Take turns on the same device.
- **Best move:** Highlights the strongest available square and shows how many game positions were examined.
- **New round:** Clears the board but keeps the match score.
- **Reset:** Clears the scores and starts a new round.

The solver uses minimax with alpha-beta pruning. It checks win and draw states, prefers faster wins, delays unavoidable losses, and chooses a move that secures at least a draw from a fair starting position.
