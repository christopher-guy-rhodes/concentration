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

        this.isFlippingLocked = false;
    }

    /**
     * Renders the game board with a newly shuffled deck.
     * @param document the dom document
     */
    renderGameBoard(document) {
        validateRequiredParams(this.renderGameBoard, arguments, 'document');
        this.gameBoard.renderGameBoard(document);
    }

    /**
     * Play the game.
     * @param document the dom document
     */
    play(document) {
        validateRequiredParams(this.play, arguments, 'document');
        this.highlightPlayer(this.getCurrentPlayer().getPlayerNumber());

        this.resetPlayers();
        this.renderGameBoard(document);
        $('.playerForm').css('display', 'none');

        $('.turn').css('display', 'block');
    }

    /**
     * Handle the attempted flip of a card.
     * TODO: clean up this code, it is messy
     * @param card the card that a player attempted to flip
     */
    handleFlipAttempt(card) {
        if (!card.getIsFaceUp()) {
            card.flip();
            let chosenCards = this.getCurrentPlayer().takeTurn(card);
            if (chosenCards.length > 1) {
                // Player has selected two cards
                if (chosenCards[0].isMatch(chosenCards[1])) {
                    this.getCurrentPlayer().addMatches();
                    this.updatePlayerStats(this.getCurrentPlayer().getPlayerNumber());

                    this.isFlippingLocked = true;
                    let self = this;
                    setTimeout(function () {
                        $('.' + chosenCards[0].getId()).css('display', 'none');
                        $('.' + chosenCards[1].getId()).css('display', 'none');
                        self.isFlippingLocked = false;
                        if (self.isGameOver()) {
                            self.handleGameOver();
                        }
                    }, CARD_FLIP_DELAY_MS)

                    // give player points and leave cards flipped
                } else {
                    this.isFlippingLocked = true;
                    this.nextTurn();
                    let self = this;
                    setTimeout(function() {
                        chosenCards[0].flip();
                        chosenCards[1].flip();
                        self.isFlippingLocked = false;
                    }, CARD_FLIP_DELAY_MS)
                }


            }
        }
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
    }

    /**
     * Get a card by id.
     * @param id the id of the card to get
     * @returns {Card}
     */
    getCardById(id) {
        return this.gameBoard.getDeck().getCardById(id);
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
    // TODO: clean up this code
    unhighlightPlayer(playerNumber) {
        let text = $('.player' + playerNumber).html();
        text = text.replace(/<strong>&gt;&gt;/, '');
        text = text.replace('&lt;&lt;</strong>', '');
        $('.player' + playerNumber).html(text);
    }

    /* private */
    // TODO: clean up this code
    highlightPlayer(currentPlayerNumber) {
        for (let playerNumber = 1; playerNumber <= this.players.length; playerNumber++) {
            if (currentPlayerNumber === playerNumber) {
                let text = $('.player' + playerNumber).html();
                text = text.replace(/Player [0-9]+/,'<strong>&gt;&gt;Player ' + playerNumber + '&lt;&lt;</strong>');
                $('.player' + playerNumber).html(text);
            } else {
                this.unhighlightPlayer(playerNumber);
            }
        }
    }

    /**
     * private
     * TODO: clean up this code, it is messy
     */
    updatePlayerStats(playerNumber) {
        let text = $('.player' + playerNumber).html();
        let score = this.getCurrentPlayer().getScore();
        text = text.replace(/[0-9]+ matches/,score + ' matches');

        $('.player' + playerNumber).html(text);
    }

    /**
     * private
     */
    nextTurn() {
        if (this.playerTurnIndex >= this.players.length -1) {
            this.playerTurnIndex = 0;
        } else {
            this.playerTurnIndex++;
        }
        this.highlightPlayer(this.getCurrentPlayer().getPlayerNumber());
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
    // TODO: clean up this code
    handleGameOver() {
        let maxScore = 0;
        let winningPlayerNumber = undefined;
        for (let player of this.players) {
            if (player.getScore() > maxScore) {
                winningPlayerNumber = player.getPlayerNumber();
                maxScore = player.getScore();
            }
        }

        let text = $('.player' + winningPlayerNumber).html();
        text = text.replace('<strong>&gt;&gt;', '');
        text = text.replace('&lt;&lt;</strong>', '');
        text = text.replace(/Player [0-9]+/, 'Player ' + winningPlayerNumber + '<strong style="color: #ff0000;"> is the winner!</strong>');

        $('.player' + winningPlayerNumber).html(text);
        $('.gameOver').css('display', 'block');
    }

    resetPlayers() {
        for (let player of this.players) {
            player.reset();
            let playerNumber = player.getPlayerNumber();
            let text = $('.player' + playerNumber).html();
            text = text.replace('<strong style="color: #ff0000;"> is the winner!</strong>', '');
            $('.player' + playerNumber).html(text);
            this.updatePlayerStats(player.getPlayerNumber());
        }
    }
}
