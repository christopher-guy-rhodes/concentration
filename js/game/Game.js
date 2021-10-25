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
        // Keep track of the turns that are waiting on to flip cards back over or remove cards after a match attempt.
        // This way if the player makes a new selection before the time delay they can proceed without having to wait.
        this.pendingFlipOrRemovel = new Set();
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
    }

    /**
     * Handle the attempted flip of a card by a player.
     * @param card the card that a player attempted to flip
     */
    takePlayerTurn(card) {
        if (this.pendingFlipOrRemovel.size > 0) {
            for (let pendingMatches of this.pendingFlipOrRemovel) {
                if (this.doCardsMatch(pendingMatches)) {
                    this.getGameBoard().removeCards(pendingMatches);
                } else {
                    this.setSelectionFaceDown(pendingMatches);
                }
            }
        }
        if (card.getIsFaceUp()) {
            return;
        }
        card.flip();
        let chosenCards = this.getCurrentPlayer().takeTurn(card);
        if (chosenCards.length > 1) {
            this.pendingFlipOrRemovel.add(chosenCards);
        }
        this.doCardsMatch(chosenCards) ? this.handleMatch(chosenCards) : this.handleFailedMatch(chosenCards);
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
        let isLastPlayer = this.playerTurnIndex >= this.players.length - 1;
        this.playerTurnIndex = isLastPlayer ? 0 : this.playerTurnIndex + 1;
        this.scoreBoard.updateStats(this.getCurrentPlayer().getPlayerNumber());
    }

    /* private */
    isGameOver() {
        return this.players.reduce(function(a, b) {
            return a + b.getNumberOfMatches();
        }, 0) >= this.gameBoard.getDeck().getNumberOfCards();
    }

    /* private */
    handleGameOver() {
        this.scoreBoard.displayWinners(this.getWinningPlayers());
        $('.gameOver').css('display', 'block');
    }

    /* private */
    getWinningPlayers() {
        let maxScore = Math.max.apply(Math,this.players.map(function(p){return p.getScore();}));
        return this.players.filter(player => player.getScore() === maxScore);
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
    handleFailedMatch(cards) {
        if (cards.length < 2) {
            return;
        }
        this.isFlippingLocked = true;
        let self = this;
        setTimeout(function() {;
            self.setSelectionFaceDown(cards)
            self.isFlippingLocked = false;
            self.nextTurn();
            self.pendingFlipOrRemovel.delete(cards);
        }, CARD_FLIP_DELAY_MS)

    }

    /* private */
    setSelectionFaceDown(cards) {
        for (let card of cards) {
            card.setFaceDown();
        }
    }

    /* private */
    handleMatch(cards) {
        this.scoreBoard.updateStats(this.getCurrentPlayer().getPlayerNumber());
        this.isFlippingLocked = true;
        let self = this;
        setTimeout(function () {
            self.getGameBoard().removeCards(cards);
            if (self.isGameOver()) {
                self.handleGameOver();
            }
            self.isFlippingLocked = false;
        }, CARD_FLIP_DELAY_MS);
    }

    /* private */
    doCardsMatch(cards) {
        return cards.length > 1 && cards[0].isMatch(cards[1]);
    }

}
