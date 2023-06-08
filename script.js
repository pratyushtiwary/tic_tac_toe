class TicTacToe {
  #state = [];
  #EMPTY = "";
  #HISTORY = [];

  // Defaults
  #PLAYER = "X";
  #COMPUTER = "O";

  // for rendering
  #ELEMENTS = [];
  #PARENT_ELEMENT = undefined;

  #generateBlankBoard() {
    /**
     * Generates a blank board
     */
    const boardSize = 9;
    for (let i = 0; i < boardSize; i++) {
      this.#state[i] = this.#EMPTY;
    }
  }

  constructor(player) {
    this.#generateBlankBoard();
    this.#PLAYER = player;
    this.#COMPUTER = player === "X" ? "O" : "X";
  }

  get player() {
    /**
     * Returns player symbol
     */
    return this.#PLAYER;
  }

  get computer() {
    /**
     * Returns computer symbol
     */
    return this.#COMPUTER;
  }

  get state() {
    /**
     * Returns current game state
     */
    return this.#state;
  }

  printState(state) {
    /**
     * Used for debugging, this function pretty prints the state
     * @param state: array -> defines state of the game
     */
    console.log("--------------------------------");
    for (let i = 0; i < state.length; i += 3) {
      let temp = [];
      for (let j = 0; j < 3; j++) {
        temp.push(state[i + j]);
      }
      console.log(temp.join("\t"));
      console.log("\n");
    }
    console.log("--------------------------------");
  }

  checkWinner(state) {
    /**
     * Given a state of game this function checks if there is any winner
     * @param state: array -> defines state of the game
     */
    const EMPTY = this.#EMPTY;
    let winner = EMPTY;

    let count = 0;

    function reset() {
      count = 0;
      winner = EMPTY;
    }

    // Vertical
    for (let i = 0; i < 3; i++) {
      winner = EMPTY;
      for (let j = i; j < state.length; j += 3) {
        if (winner === EMPTY) {
          winner = state[j];
          count = 0;
        }

        if (winner === state[j]) {
          count += 1;
        } else {
          count = 0;
          winner = this.#EMPTY;
        }
      }
      if (winner !== EMPTY && count === 3) {
        break;
      }
    }

    if (count === 3) {
      return winner;
    }
    reset();

    // Horizontal
    for (let i = 0; i < state.length; i += 3) {
      winner = this.#EMPTY;
      for (let j = i; j < i + 3; j++) {
        if (winner === EMPTY) {
          winner = state[j];
          count = 0;
        }

        if (winner === state[j]) {
          count += 1;
        } else {
          count = 0;
          winner = this.#EMPTY;
        }
      }
      if (winner !== EMPTY && count === 3) {
        break;
      }
    }

    if (count === 3) {
      return winner;
    }
    reset();

    // Check Diags - 1
    for (let i = 0; i < state.length; i += 4) {
      if (winner === EMPTY) {
        winner = state[i];
        count = 0;
      }

      if (winner === state[i]) {
        count += 1;
      } else {
        count = 0;
        winner = this.#EMPTY;
      }
    }

    if (count === 3) {
      return winner;
    }
    reset();

    for (let i = 2; i < state.length - 1; i += 2) {
      if (winner === EMPTY) {
        winner = state[i];
        count = 0;
      }

      if (winner === state[i]) {
        count += 1;
      } else {
        count = 0;
        winner = this.#EMPTY;
      }
    }

    if (count === 3) {
      return winner;
    }

    return this.#EMPTY;
  }

  isGameOver(state) {
    let filled = 0;
    for (let i = 0; i < state.length; i++) {
      if (state[i] !== this.#EMPTY) {
        filled += 1;
      }
    }

    return !(filled - state.length);
  }

  isValid(state, move) {
    if (state[move] === this.#EMPTY) {
      return true;
    }
    return false;
  }

  takeMove(state, by, move) {
    if (this.isValid(state, move)) {
      state[move] = by;
      this.#HISTORY.push({
        by,
        move,
      });
    }
  }

  undoMove() {
    /**
     * Undo whatever last move was
     */
    if (this.#HISTORY.length === 0) {
      return;
    }
    const lastMove = this.#HISTORY.pop();

    this.#state[lastMove.move] = this.#EMPTY;
  }

  scoreMove(state, isMax = false, alpha = 1000, beta = -1000) {
    /**
     * Implementation of minimax
     * @param state:array -> defines the game state
     * @param isMax: boolean -> indicates the player
     */

    // Terminating Condition
    const winner = this.checkWinner(state);
    if (winner === this.#PLAYER) {
      return -100;
    }
    if (winner === this.#COMPUTER) {
      return 100;
    }
    if (this.isGameOver(state)) {
      return 0;
    }

    if (isMax) {
      let best = -1000;

      for (let i = 0; i < state.length; i++) {
        if (this.isValid(state, i)) {
          this.takeMove(state, this.#COMPUTER, i);

          best = Math.max(best, this.scoreMove(state, !isMax));
          alpha = Math.max(alpha, best);

          this.undoMove();
        }
      }
      return best;
    } else {
      let best = 1000;

      for (let i = 0; i < state.length; i++) {
        if (this.isValid(state, i)) {
          this.takeMove(state, this.#PLAYER, i);

          best = Math.min(best, this.scoreMove(state, !isMax));

          this.undoMove();
        }
      }
      return best;
    }
  }

  makeDecision(state) {
    /**
     * This function simulates gameplay and score each move to decide next move for computer
     * @param state: array -> defines game state
     */
    let bestScore = -9999;
    let bestMove = -1;

    for (let i = 0; i < state.length; i++) {
      if (this.isValid(state, i)) {
        this.takeMove(state, this.#COMPUTER, i);

        let score = this.scoreMove(state);

        this.undoMove();

        if (score > bestScore) {
          bestMove = i;
          bestScore = score;
        }
      }
    }

    return bestMove;
  }

  #handlePlayerMoveEvent(move) {
    /**
     * Function which will be assigned to each row's onclick event
     * @param move: int -> the position of the row
     */
    return () => {
      this.takeMove(this.#state, this.player, move);
      this.rerender();
      const comp_move = this.makeDecision(this.#state);
      this.takeMove(this.#state, this.#COMPUTER, comp_move);
      this.rerender();

      const winner = this.checkWinner(this.#state);

      if (winner !== this.#EMPTY) {
        this.onGameOver && this.onGameOver(winner);
      }

      if (this.isGameOver(this.#state)) {
        this.onGameOver && this.onGameOver();
      }
    };
  }

  disable() {
    /**
     * Removes event listener from every row
     */
    this.#ELEMENTS.forEach((e) => {
      e.onclick = undefined;
    });
  }

  rerender() {
    /**
     * Rerenders the board based on history
     */
    if (this.#HISTORY.length > 0) {
      const delta = this.#HISTORY.at(-1);
      this.render(undefined, this.#state, delta);
    }
  }

  render(parentElement, state = this.#state, delta = undefined) {
    /**
     * This function renders the game board
     * This function won't work outside the browser
     * A custom function needs to be written for node
     */
    if (!document || !document?.createElement) {
      throw Error(
        "Make sure you are calling the `render` function in a browser!"
      );
    }
    if (this.#ELEMENTS.length === 0) {
      this.#PARENT_ELEMENT = parentElement;
      let row, col;
      const board = parentElement;

      board.classList.add("game");
      board.classList.add("board");

      for (let i = 0; i < state.length; i += 3) {
        col = document.createElement("div");

        col.classList.add("game");
        col.classList.add("col");

        for (let j = 0; j < 3; j++) {
          row = document.createElement("div");
          row.classList.add("game");
          row.classList.add("row");

          row.onclick = this.#handlePlayerMoveEvent(i + j);

          this.#ELEMENTS.push(row);

          col.appendChild(row);
        }

        board.appendChild(col);
      }
    } else {
      const { move, by } = delta;

      this.#ELEMENTS[move].innerText = by;

      this.#ELEMENTS[move].onclick = undefined;
    }
  }

  reset() {
    this.#state = this.#generateBlankBoard();
    this.#PARENT_ELEMENT.innerHTML = "";
    this.#ELEMENTS = [];
    this.render(this.#PARENT_ELEMENT, this.#state);
  }

  destroy() {
    /**
     * Destroys the whole rendered board
     */
    if (this.#ELEMENTS.length > 0) {
      this.#ELEMENTS.forEach((e) => {
        e.remove();
      });
    }
  }
}

const modal = {};

modal.config = {
  classes: ["modal"], // this class will be given to each element inside our modal along with their respective classes
  dismissable: true,
  titleElement: "h2",
  customHTML: false, // setting customHTML to true can lead to security vulnerabilty in code
};

modal.create = (config) => {
  /**
   * Creates modal elements and return the parent
   * @param config: object -> defines how elements will be created
   */
  const { classes, titleElement, dismissable } = config;
  let parent = document.querySelector(".modal_parent");

  if (!parent) {
    parent = document.createElement("div");
    parent.classList.add("modal_parent");
    // make sure modal is hidden when created
    parent.classList.add("hide_modal");
    parent.classList.add(...classes);
  }

  parent.innerHTML = "";

  const content = document.createElement("div");

  content.classList.add("modal_content");
  content.classList.add(...classes);

  const title = document.createElement(titleElement || "h3");

  title.classList.add("modal_title");
  title.classList.add(...classes);

  const body = document.createElement("div");

  body.classList.add("modal_body");
  body.classList.add(...classes);

  if (dismissable) {
    const close = document.createElement("button");
    close.innerText = "X";

    close.classList.add("modal_close");
    close.classList.add(...classes);

    close.onclick = modal.hide;

    content.appendChild(close);
  }

  content.appendChild(title);
  content.appendChild(body);

  const opacity = document.createElement("div");

  opacity.classList.add("modal_opacity");
  opacity.classList.add(...classes);

  if (dismissable) {
    opacity.onclick = modal.hide;
  }

  parent.append(opacity);
  parent.append(content);

  document.querySelector("body").append(parent);

  return parent;
};

modal.show = (title, body, config = modal.config) => {
  /**
   * Opens a modal based on provided params
   * @param title: str
   * @param body: str
   * @param config: object -> defines how elements will be created and rendered
   */
  const { customHTML } = config;

  const modal_element = modal.create(config);

  const modal_title = modal_element.querySelector(
    ".modal_content .modal_title"
  );

  const modal_body = modal_element.querySelector(".modal_content .modal_body");

  modal_title.innerText = title;

  if (customHTML) {
    modal_body.innerHTML = body;
  } else {
    modal_body.innerText = body;
  }

  // show modal

  modal_element.classList.remove("hide_modal");
};

modal.hide = () => {
  /**
   * Hides the modal
   */
  const element = document.querySelector(".modal_parent");

  if (element) {
    element.classList.add("hide_modal");
  }
};
