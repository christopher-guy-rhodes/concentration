

class GameConfigController {
    constructor() {
        this.numberOfPlayers = undefined;
        this.deckType = undefined;
        this.game = undefined;
        this.gamOptionsSubmitClass = 'gameOptionsSubmit';
        this.gameOptionsFormClass = 'gameOptionsForm';
        this.deckTypeSelectorClass = 'deckType';
        this.playerNameSubmitButtonClass = 'playerNameSubmit';
        this.clickableClass = 'clickable';
        this.gameResetClass = 'gameOver';
        this.numPlayersSelectorClass = 'numPlayers';
        this.numberOfCardsToUseName = 'numberOfCardsToUse';
        this.scoreBoardPlayerPrefixClass = 'player';
        this.playerNamePrefixClass = 'playerName';
        this.nameInputPrefixClass = 'name';
        this.playerNameForm = 'playerNameForm';

        this.view = new GameConfigViewBuilder()
            .withGameOptionsFormClass(this.gameOptionsFormClass)
            .withGameOptionsSubmitButtonClass(this.gamOptionsSubmitClass)
            .withDeckTypeSelectorClass(this.deckTypeSelectorClass)
            .withPlayerNameSubmitClass(this.playerNameSubmitButtonClass)
            .withGameResetClass(this.gameResetClass)
            .withNumPlayersClass(this.numPlayersSelectorClass)
            .withNumberOfCardsToUseName(this.numberOfCardsToUseName)
            .withPlayerPrefixClass(this.scoreBoardPlayerPrefixClass)
            .withPlayerNamePrefixClass(this.playerNamePrefixClass)
            .withNameInputPrefixClass(this.nameInputPrefixClass)
            .withPlayerNameForm(this.playerNameForm)
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
        this.view.buildGameControlForms(document);
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
        $('.' + this.deckTypeSelectorClass).change(function(e) {
            self.updateCardsAndImagePreview();
        });
    }

    /* private */
    addPlayersEvent(document) {
        let self = this;
        $('.' + this.playerNameSubmitButtonClass).click(function(e) {
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
        this.updateCardsAndImagePreview();
    }

    /* private */
    updateCardsAndImagePreview() {
        let img = $('.' + this.gameOptionsFormClass).find('img');
        let input = $('input[name="' + this.numberOfCardsToUseName + '"]');
        let isPicture = this.getFormDeckType() === 'picture';

        input.val(isPicture ? PictureCardDeck.getNumberOfCardsInDeck() : PlayingCardDeck.getNumberOfCardsInDeck());
        img.attr('src', isPicture ? PictureCardDeck.getDeckImage() : PlayingCardDeck.getDeckImage());
        img.attr('width', '700px');
    }

    /* private */
    handleGameRestart() {
        this.getGame().getScoreBoard().hideScoreboard();
        $('.' + this.gameResetClass).css('display', 'none');
        $('.' + this.deckTypeSelectorClass + ' options[value="' + this.getDeckType() + '"]');
        $('.' + this.numPlayersSelectorClass + ' option[value="'+ this.getNumPlayers() + '"]').attr('selected','selected');
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
        this.getGame().addPlayers(this.buildPlayersFromForm());
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
            this.game = new Game(this.deckType, numCards, this.clickableClass);
        } catch (error) {
            this.handleError(error);
            this.setFormOptionsFormVisibility(true);
            this.setPlayerNamesVisibility(this.numberOfPlayers, false);
            this.setFormPlayerSubmitVisibility(false);
        }
    }

    /* private */
    buildPlayersFromForm() {
        let players = [];
        for (let i = 0; i < this.numberOfPlayers; i++) {
            let name = '.' + this.nameInputPrefixClass + (i + 1);
            let playerName = $(name).val();
            if (playerName.trim().length < 1) {
                playerName = 'Player ' + (i + 1);
            }
            players.push(new Player(playerName, (i + 1)));
            $('.' + this.scoreBoardPlayerPrefixClass + (i + 1)).css('display', 'block');
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
        return parseInt($('.' + this.numPlayersSelectorClass).val());
    }

    /* private */
    getFormNumberOfCards() {
        return parseInt($('input[name="' + this.numberOfCardsToUseName + '"]').val());
    }

    /* private */
    getFormDeckType() {
        return $('.' + this.deckTypeSelectorClass).val();
    }

    /* private */
    setPlayerNamesVisibility(numberOfPlayers, flag) {
        $('.' + this.playerNameForm).css('display', flag ? 'inline-block' : 'none');
        for (let i = 0; i < numberOfPlayers; i++) {
            $('.' + this.playerNamePrefixClass + + (i + 1)).css('display',flag ? 'block' : 'none');
        }
        return numberOfPlayers;
    }

    /* private */
    setFormOptionsFormVisibility(flag) {
        $('.' + this.gameOptionsFormClass).css('display', flag ? 'block' : 'none');
    }

    /* private */
    setFormPlayerSubmitVisibility(flag) {
        $('.' + this.playerNameForm).css('display', flag ? 'inline-block' : 'none');
        $('.' + this.playerNameSubmitButtonClass).css('display', flag ? 'block' : 'none');
    }
}
