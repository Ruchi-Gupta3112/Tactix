(function (root) {
  "use strict";

  const WIN_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  const MOVE_ORDER = [4, 0, 2, 6, 8, 1, 3, 5, 7];

  function getResult(board) {
    if (!Array.isArray(board) || board.length !== 9) throw new Error("Board must contain nine squares.");
    for (const line of WIN_LINES) {
      const [a, b, c] = line;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { status: "win", winner: board[a], line };
      }
    }
    return board.every(Boolean)
      ? { status: "draw", winner: null, line: [] }
      : { status: "playing", winner: null, line: [] };
  }

  function bestMove(board, mark) {
    if (mark !== "X" && mark !== "O") throw new Error("Mark must be X or O.");
    const current = board.slice();
    const opponent = mark === "X" ? "O" : "X";
    const initial = getResult(current);
    if (initial.status !== "playing") return { index: null, score: 0, nodes: 0, outcome: initial.status };
    let nodes = 0;

    function minimax(depth, maximizing, alpha, beta) {
      nodes++;
      const result = getResult(current);
      if (result.status === "win") return result.winner === mark ? 10 - depth : depth - 10;
      if (result.status === "draw") return 0;

      if (maximizing) {
        let value = -Infinity;
        for (const index of MOVE_ORDER) {
          if (current[index]) continue;
          current[index] = mark;
          value = Math.max(value, minimax(depth + 1, false, alpha, beta));
          current[index] = null;
          alpha = Math.max(alpha, value);
          if (beta <= alpha) break;
        }
        return value;
      }

      let value = Infinity;
      for (const index of MOVE_ORDER) {
        if (current[index]) continue;
        current[index] = opponent;
        value = Math.min(value, minimax(depth + 1, true, alpha, beta));
        current[index] = null;
        beta = Math.min(beta, value);
        if (beta <= alpha) break;
      }
      return value;
    }

    let index = null;
    let score = -Infinity;
    let alpha = -Infinity;
    for (const move of MOVE_ORDER) {
      if (current[move]) continue;
      current[move] = mark;
      const value = minimax(1, false, alpha, Infinity);
      current[move] = null;
      if (value > score) { score = value; index = move; }
      alpha = Math.max(alpha, score);
    }
    return { index, score, nodes, outcome: score > 0 ? "win" : score < 0 ? "loss" : "draw" };
  }

  root.TactixEngine = { getResult, bestMove };
  if (typeof module !== "undefined" && module.exports) module.exports = { getResult, bestMove };
})(globalThis);
