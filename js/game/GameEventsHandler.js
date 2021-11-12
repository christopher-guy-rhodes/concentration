class GameEventsHandler {
    constructor() {
        this.numberOfPlayers = undefined;
        this.deckType = undefined;
        this.game = undefined;
    }

    /**
     * Handle events related to the control flow of the game.
     */
    handleEvents() {
        // Handle number of players, deck type and number of cards selections
        this.handleGameOptionsEvent();

        // Update the number of cards to use based on the deck
        this.updateNumberOfCardsEvent();

        // Add players and start the game
        this.addPlayersEvent(document);

        // Handle a card click
        this.handleCardClickEvent();

        // Handle a game restart click, default the values selected previously
        this.handleGameRestartEvent();

        // Handle the initial number of cards in the form
        this.updateFormNumberOfCardsEvent();

    }

    /* private */
    handleGameOptionsEvent() {
        let self = this;
        $('.gameOptionsSubmit').click(function(e) {
            self.handleGameOptions();
        });
    }

    /* private */
    updateNumberOfCardsEvent() {
        let self = this;
        $('.deckType').change(function(e) {
            self.updateFormNumberOfCards();
        });
    }

    /* private */
    addPlayersEvent(document) {
        let self = this;
        $('.playerNameSubmit').click(function(e) {
            self.addPlayers(document)
        });
    }

    /* private */
    handleCardClickEvent() {
        let self = this;
        $(document).on('click', '.clickable', function (e) {
            self.handleCardClick(e);
        });
    }

    /* private */
    handleGameRestartEvent() {
        let self = this;
        $('.gameOver').click(function() {
            self.handleGameRestart();
        });
    }

    /* private */
    updateFormNumberOfCardsEvent() {
        this.updateFormNumberOfCards();
    }

    /* private */
    updateFormNumberOfCards() {
        if (this.getFormDeckType() === 'picture') {
            $('input[name="numberOfCardsToUse"]').val(PictureCardDeck.getNumberOfCardsInDeck());
        } else {
            $('input[name="numberOfCardsToUse"]').val(PlayingCardDeck.getNumberOfCardsInDeck());
        }
    }

    /* private */
    handleGameRestart() {
        this.getGame().getScoreBoard().hideScoreboard();
        $('.gameOver').css('display', 'none');
        $('.deckType options[value="' + this.getDeckType() + '"]');
        $('.numPlayers option[value="'+ this.getNumPlayers() + '"]').attr('selected','selected');
        this.setFormOptionsFormVisibility(true);
    }

    /* private */
    handleCardClick(e) {
        let clickedCardId = $(e.target).attr('class').replace('clickable ', '');
        let card = this.getGame().getGameBoard().getDeck().getCardById(clickedCardId);
        if (!card.getIsFaceUp()) {
            this.getGame().takePlayerTurn(card);
        }
    }

    /* private */
    addPlayers(document) {
        this.setFormPlayerSubmitVisibility(false);
        this.getGame().addPlayers(this.buildFormPlayers());
        this.getGame().play(document);
    }

    /* private */
    handleGameOptions() {
        this.numberOfPlayers = this.getFormNumberOfPlayers();
        this.setPlayerNamesVisibility(this.numberOfPlayers, true);

        let numCards = this.getFormNumberOfCards();

        this.setFormOptionsFormVisibility(false);
        this.setFormPlayerSubmitVisibility(true);

        try {
            this.deckType = this.getFormDeckType();
            this.game = new Game(this.deckType, numCards);
        } catch (error) {
            this.handleError(error);
            this.setFormOptionsFormVisibility(true);
            this.setPlayerNamesVisibility(numberOfPlayers, false);
        }
    }

    /* private */
    buildFormPlayers() {
        let names = ['.name1', '.name2', '.name3', '.name4'];
        let players = [];
        for (let i = 0; i < this.numberOfPlayers; i++) {
            let name = names[i];
            let playerName = $(name).val();
            if (playerName.trim().length < 1) {
                playerName = 'Player ' + (i + 1);
            }
            players.push(new Player(playerName, (i + 1)));
            $('.player' + (i + 1)).css('display', 'block');
            $('.playerName' + (i + 1)).css('display', 'none');
        }
        return players;
    }

    /* private */
    getNumPlayers() {
        return this.numberOfPlayers;
    }

    /* private */
    getGame() {
        return this.game;
    }

    /* private */
    getDeckType() {
        return this.deckType;
    }

    /* private */
    handleError(error) {
        alert(error.message);
        console.log("%o", error);

    }

    /* private */
    getFormNumberOfPlayers() {
        return parseInt($('.numPlayers').val());
    }

    /* private */
    getFormNumberOfCards() {
        return parseInt($('input[name="numberOfCardsToUse"]').val());
    }

    /* private */
    getFormDeckType() {
        return $('.deckType').val();
    }

    /* private */
    setPlayerNamesVisibility(numberOfPlayers, flag) {
        for (let i = 0; i < numberOfPlayers; i++) {
            $('.playerName' + (i + 1)).css('display',flag ? 'block' : 'none');
        }
        return numberOfPlayers;
    }

    /* private */
    setFormOptionsFormVisibility(flag) {
        $('.gameOptionsForm').css('display', flag ? 'block' : 'none');
    }

    /* private */
    setFormPlayerSubmitVisibility(flag) {
        $('.playerNameSubmit').css('display', flag ? 'block' : 'none');
    }
}
