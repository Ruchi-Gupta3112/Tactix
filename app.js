(function () {
  "use strict";

  const { getResult, bestMove } = globalThis.TactixEngine;
  const squares = Array.from(document.querySelectorAll(".square"));
  const statusElement = document.querySelector("#status");
  const titleElement = document.querySelector("#round-title");
  const hintPanel = document.querySelector("#hint-panel");
  const state = {
    board: Array(9).fill(null), mode: "ai", human: "X", turn: "X",
    over: false, winningLine: [], aiThinking: false, roundToken: 0,
    hintIndex: null, scores: { X: 0, O: 0, draw: 0 }
  };

  function other(mark) { return mark === "X" ? "O" : "X"; }
  function aiMark() { return other(state.human); }

  function setMessage(message, kind = "normal") {
    statusElement.textContent = message;
    statusElement.dataset.kind = kind;
  }

  function render() {
    squares.forEach((square, index) => {
      const mark = state.board[index];
      square.textContent = mark || "";
      square.disabled = Boolean(mark || state.over || state.aiThinking || (state.mode === "ai" && state.turn !== state.human));
      square.classList.toggle("x", mark === "X");
      square.classList.toggle("o", mark === "O");
      square.classList.toggle("winning", state.winningLine.includes(index));
      square.classList.toggle("hint", state.hintIndex === index);
      square.setAttribute("aria-label", `Row ${Math.floor(index / 3) + 1}, column ${index % 3 + 1}${mark ? `, ${mark}` : ", empty"}`);
    });
    document.querySelector("#mode-badge").textContent = state.mode === "ai" ? "VS AI" : "2 PLAYERS";
    document.querySelector("#mark-selector").hidden = state.mode !== "ai";
    document.querySelector("#x-label").textContent = state.mode === "ai" ? (state.human === "X" ? "You" : "AI") : "Player X";
    document.querySelector("#o-label").textContent = state.mode === "ai" ? (state.human === "O" ? "You" : "AI") : "Player O";
    document.querySelector("#x-score").textContent = String(state.scores.X);
    document.querySelector("#o-score").textContent = String(state.scores.O);
    document.querySelector("#draw-score").textContent = String(state.scores.draw);
    document.querySelector("#turn-dot").dataset.mark = state.over ? "end" : state.turn;
    document.querySelector("#hint").disabled = state.over || state.aiThinking;
  }

  function finish(result) {
    state.over = true;
    state.winningLine = result.line;
    if (result.status === "draw") {
      state.scores.draw++;
      titleElement.textContent = "A perfect tie.";
      setMessage("It's a draw. Every move mattered.", "draw");
    } else {
      state.scores[result.winner]++;
      if (state.mode === "ai") {
        const humanWon = result.winner === state.human;
        titleElement.textContent = humanWon ? "You won!" : "The AI wins.";
        setMessage(humanWon ? "Brilliant play! You beat the AI." : "Well played. Try a new round!", humanWon ? "win" : "loss");
      } else {
        titleElement.textContent = `${result.winner} wins!`;
        setMessage(`Player ${result.winner} made three in a row.`, "win");
      }
    }
    render();
  }

  function play(index, mark) {
    if (state.over || state.board[index] || state.turn !== mark) return;
    state.board[index] = mark;
    state.hintIndex = null;
    hintPanel.hidden = true;
    const result = getResult(state.board);
    if (result.status !== "playing") { finish(result); return; }
    state.turn = other(mark);
    render();
    if (state.mode === "ai" && state.turn === aiMark()) {
      scheduleAi();
    } else {
      titleElement.textContent = state.mode === "ai" ? "Your move." : `Player ${state.turn}'s move`;
      setMessage(state.mode === "ai" ? `You're ${state.human}. Pick your next square.` : `Player ${state.turn}, choose a square.`);
    }
  }

  function scheduleAi() {
    const token = state.roundToken;
    state.aiThinking = true;
    titleElement.textContent = "Thinking ahead…";
    setMessage("The AI is looking for its best move.");
    render();
    window.setTimeout(() => {
      if (token !== state.roundToken || state.over || state.mode !== "ai") return;
      const move = bestMove(state.board, aiMark());
      state.aiThinking = false;
      if (move.index !== null) play(move.index, aiMark());
    }, 320);
  }

  function newRound() {
    state.roundToken++;
    state.board = Array(9).fill(null);
    state.turn = "X";
    state.over = false;
    state.winningLine = [];
    state.aiThinking = false;
    state.hintIndex = null;
    hintPanel.hidden = true;
    titleElement.textContent = state.mode === "ai" && state.human === "O" ? "AI goes first." : state.mode === "ai" ? "Your move, X" : "Player X's move";
    setMessage(state.mode === "ai" ? (state.human === "X" ? "You're X. Choose a square to begin." : "You're O. The AI opens this round.") : "Player X, choose a square to begin.");
    render();
    if (state.mode === "ai" && state.human === "O") scheduleAi();
  }

  function updateChoice(buttons, active) {
    buttons.forEach((button) => {
      const selected = button === active;
      button.classList.toggle("active", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
  }

  squares.forEach((square, index) => square.addEventListener("click", () => {
    if (state.mode === "ai" && (state.turn !== state.human || state.aiThinking)) return;
    play(index, state.turn);
  }));
  document.querySelector("#new-round").addEventListener("click", newRound);
  document.querySelector("#reset-score").addEventListener("click", () => {
    state.scores = { X: 0, O: 0, draw: 0 };
    newRound();
  });

  const modeButtons = [document.querySelector("#mode-ai"), document.querySelector("#mode-local")];
  modeButtons.forEach((button) => button.addEventListener("click", () => {
    const mode = button.id === "mode-ai" ? "ai" : "local";
    if (state.mode === mode) return;
    state.mode = mode;
    state.scores = { X: 0, O: 0, draw: 0 };
    updateChoice(modeButtons, button);
    newRound();
  }));

  const markButtons = [document.querySelector("#choose-x"), document.querySelector("#choose-o")];
  markButtons.forEach((button) => button.addEventListener("click", () => {
    const mark = button.id === "choose-x" ? "X" : "O";
    if (state.human === mark) return;
    state.human = mark;
    state.scores = { X: 0, O: 0, draw: 0 };
    updateChoice(markButtons, button);
    newRound();
  }));

  document.querySelector("#hint").addEventListener("click", () => {
    if (state.over || state.aiThinking) return;
    const advice = bestMove(state.board, state.turn);
    if (advice.index === null) return;
    state.hintIndex = advice.index;
    render();
    const row = Math.floor(advice.index / 3) + 1;
    const col = advice.index % 3 + 1;
    const outcome = advice.outcome === "win" ? "a possible win" : advice.outcome === "draw" ? "a draw against perfect play" : "the best defense available";
    hintPanel.innerHTML = `<strong>Best move: row ${row}, column ${col}</strong><span>Minimax checked ${advice.nodes.toLocaleString()} positions. This move leads toward ${outcome}.</span>`;
    hintPanel.hidden = false;
    setMessage(`Suggested move highlighted at row ${row}, column ${col}.`);
  });

  newRound();
})();
