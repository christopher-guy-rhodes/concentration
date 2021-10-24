/**
 * Class for playing classic concentration game.
 */
class Game {
    constructor() {
        this.gameBoard = new GameBoardBuilder()
            .withNumberOfCardsPerRow(NUMBER_OF_CARDS_PER_ROW)
            .withNumberOfRows(NUMBER_OF_ROWS).build();

        this.players = [];
        this.playerTurnIndex = 0;
        this.scoreBoard = undefined;
        this.isFlippingLocked = false;
    }

    /**
     * Play the game.
     * @param document the dom document
     */
    play(document) {
        validateRequiredParams(this.play, arguments, 'document');
        this.scoreBoard.updateStats(this.getCurrentPlayer().getPlayerNumber());
        this.resetPlayers();
        this.getGameBoard().renderGameBoard(document);
        $('.playerForm').css('display', 'none');
    }

    /**
     * Handle the attempted flip of a card.
     * @param card the card that a player attempted to flip
     */
    takePlayerTurn(card) {
        if (card.getIsFaceUp()) {
            return;
        }
        card.flip();
        let chosenCards = this.getCurrentPlayer().takeTurn(card);
        if (chosenCards.length > 1) {
            // Player has selected two cards
            let card1 = chosenCards[0];
            let card2 = chosenCards[1];
            if (card1.isMatch(card2)) {
                // Cards match, remove then and update the score
                this.scoreBoard.updateStats(this.getCurrentPlayer().getPlayerNumber());
                this.removeSelectionsFromGameBoard(card1, card2);
            } else {
                // Cards do not match, flip them back over
                this.flipSelectionsFaceDown(card1, card2);
            }
        }
    }

    /**
     * Gets the game board used by this game.
     * @returns {GameBoard} the game board
     */
    getGameBoard() {
        return this.gameBoard;
    }

    /**
     * Gets the score board used by this game.
     * @returns {ScoreBoard} the score board
     */
    getScoreBoard() {
        return this.scoreBoard;
    }

    /**
     * Show the form to select the players.
     */
    selectPlayers() {
        $('.playerForm').css('display','block');
    }

    /**
     * Adds players to the game.
     * @param players array of Player objects to add
     */
    addPlayers(players) {
        validateRequiredParams(this.addPlayers, arguments, 'players');
        this.players = this.players.concat(players);
        this.scoreBoard = new ScoreBoard(this.players);
    }

    /**
     * Determine if card flipping is locked.
     * @returns {boolean} True if card flipping is locked in the ui, false otherwise.
     */
    getIsFlippingLocked() {
        return this.isFlippingLocked;
    }

    /* private */
    getCurrentPlayer() {
        return this.players[this.playerTurnIndex];
    }

    /* private */
    nextTurn() {
        if (this.playerTurnIndex >= this.players.length -1) {
            this.playerTurnIndex = 0;
        } else {
            this.playerTurnIndex++;
        }
        this.scoreBoard.updateStats(this.getCurrentPlayer().getPlayerNumber());
    }

    /* private */
    isGameOver() {
        let totalMatches = 0;
        for (let player of this.players) {
            totalMatches += player.getNumberOfMatches();
        }
        return totalMatches >= this.gameBoard.getDeck().getNumberOfCards();
    }

    /* private */
    handleGameOver() {
        this.scoreBoard.displayWinner(this.getWinningPlayer());
        $('.gameOver').css('display', 'block');
    }

    /* private */
    getWinningPlayer() {
        let maxScore = 0;
        let winningPlayer = undefined;
        for (let player of this.players) {
            if (player.getScore() > maxScore) {
                winningPlayer = player;
                maxScore = player.getScore();
            }
        }
        return winningPlayer;
    }

    /* private */
    resetPlayers() {
        for (let player of this.players) {
            player.reset();
        }
        this.playerTurnIndex = 0;
        this.scoreBoard.updateStats(this.getCurrentPlayer().getPlayerNumber());
    }

    /* private */
    flipSelectionsFaceDown(card1, card2) {
        this.isFlippingLocked = true;
        let self = this;
        setTimeout(function() {
            card1.flip();
            card2.flip();
            self.isFlippingLocked = false;
            self.nextTurn();
        }, CARD_FLIP_DELAY_MS)

    }

    /* private */
    removeSelectionsFromGameBoard(card1, card2) {
        this.isFlippingLocked = true;
        let self = this;
        setTimeout(function () {
            $('.' + card1.getId()).css('display', 'none');
            $('.' + card2.getId()).css('display', 'none');
            self.isFlippingLocked = false;
            if (self.isGameOver()) {
                self.handleGameOver();
            }
        }, CARD_FLIP_DELAY_MS);
    }
}
