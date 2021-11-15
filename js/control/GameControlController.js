const MAX_PLAYERS = 4;

class GameControlController {
    constructor() {
        this.numberOfPlayers = undefined;
        this.deckType = undefined;
        this.game = undefined;
        this.nameInputPrefixClass = 'name';
        this.gamOptionsSubmitClass = 'gameOptionsSubmitClass';
        this.deckTypeClass = 'deckType';
        this.playerNameSubmitClass = 'playerNameSubmit';
        this.clickableClass = 'clickable';
        this.gameResetClass = 'gameOver';
        this.numPlayersClass = 'numPlayers';
        this.numberOfCardsToUseName = 'numberOfCardsToUse';
        this.playerPrefixClass = 'player';
        this.playerNamePrefixClass = 'playerName';

        this.view = new GameControlViewBuilder()
            .withMaxPlayers(MAX_PLAYERS)
            .withNameInputPrefixClass(this.nameInputPrefixClass)
            .withGameOptionsSubmitClass(this.gamOptionsSubmitClass)
            .withDeckTypeClass(this.deckTypeClass)
            .withPlayerNameSubmitClass(this.playerNameSubmitClass)
            .withGameResetClass(this.gameResetClass)
            .withNumPlayersClass(this.numPlayersClass)
            .withNumberOfCardsToUseName(this.numberOfCardsToUseName)
            .withPlayerPrefixClass(this.playerPrefixClass)
            .withPlayerNamePrefixClass(this.playerNamePrefixClass)
            .build();
    }


    /**
     * Handle events related to the control flow of the forms used to configure and start the game.
     * @param document the DOM document
     */
    handleEvents(document) {

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

    /**
     * Render the forms used to control the game settings.
     * @param document the DOM dodument
     */
    renderForms(document) {
        this.view.renderForms(document);
    }


    /* private */
    handleGameOptionsEvent() {
        let self = this;
        $('.' + this.gamOptionsSubmitClass).click(function(e) {
            self.handleGameOptions();
        });
    }

    /* private */
    updateNumberOfCardsEvent() {
        let self = this;
        $('.' + this.deckTypeClass).change(function(e) {
            self.updateFormNumberOfCards();
        });
    }

    /* private */
    addPlayersEvent(document) {
        let self = this;
        $('.' + this.playerNameSubmitClass).click(function(e) {
            self.addPlayers(document)
        });
    }

    /* private */
    handleCardClickEvent() {
        let self = this;
        $(document).on('click', '.' + this.clickableClass, function (e) {
            self.handleCardClick(e);
        });
    }

    /* private */
    handleGameRestartEvent() {
        let self = this;
        $('.' + this.gameResetClass).click(function() {
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
            $('input[name="' + this.numberOfCardsToUseName + '"]').val(PictureCardDeck.getNumberOfCardsInDeck());
        } else {
            $('input[name="' + this.numberOfCardsToUseName + '"]').val(PlayingCardDeck.getNumberOfCardsInDeck());
        }
    }

    /* private */
    handleGameRestart() {
        this.getGame().getScoreBoard().hideScoreboard();
        $('.' + this.gameResetClass).css('display', 'none');
        $('.' + this.deckType + ' options[value="' + this.getDeckType() + '"]');
        $('.' + this.numPlayersClass + ' option[value="'+ this.getNumPlayers() + '"]').attr('selected','selected');
        this.setFormOptionsFormVisibility(true);
    }

    /* private */
    handleCardClick(e) {
        let clickedCardId = $(e.target).parent().attr('id');

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
            if (this.deckType === undefined) {
                alert('no deck type');
            }
            this.game = new Game(this.deckType, numCards, this.clickableClass);
        } catch (error) {
            this.handleError(error);
            this.setFormOptionsFormVisibility(true);
            this.setPlayerNamesVisibility(this.numberOfPlayers, false);
            this.setFormPlayerSubmitVisibility(false);
        }
    }

    /* private */
    buildFormPlayers() {
        let players = [];
        for (let i = 0; i < this.numberOfPlayers; i++) {
            let name = '.' + this.nameInputPrefixClass + (i + 1);
            let playerName = $(name).val();
            if (playerName.trim().length < 1) {
                playerName = 'Player ' + (i + 1);
            }
            players.push(new Player(playerName, (i + 1)));
            $('.' + this.playerPrefixClass + (i + 1)).css('display', 'block');
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
        return parseInt($('.' + this.numPlayersClass).val());
    }

    /* private */
    getFormNumberOfCards() {
        return parseInt($('input[name="' + this.numberOfCardsToUseName + '"]').val());
    }

    /* private */
    getFormDeckType() {
        return $('.' + this.deckTypeClass).val();
    }

    /* private */
    setPlayerNamesVisibility(numberOfPlayers, flag) {
        for (let i = 0; i < numberOfPlayers; i++) {
            $('.' + this.playerNamePrefixClass + + (i + 1)).css('display',flag ? 'block' : 'none');
        }
        return numberOfPlayers;
    }

    /* private */
    setFormOptionsFormVisibility(flag) {
        $('.gameOptionsForm').css('display', flag ? 'block' : 'none');
    }

    /* private */
    setFormPlayerSubmitVisibility(flag) {
        $('.' + this.playerNameSubmitClass).css('display', flag ? 'block' : 'none');
    }
}
