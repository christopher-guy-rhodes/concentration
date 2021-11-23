

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
        this.scoreBoardForm = 'scoreBoardForm';
        this.gameBoardCss = 'gameBoard';
        this.playOnlineCheckboxName = 'playOnlineCheckboxName';

        this.onlineGamePlay = new OnlineGamePlay();

        this.scalingDimension = undefined;

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
            .withScoreBoardForm(this.scoreBoardForm)
            .withPlayOnlineCheckboxName(this.playOnlineCheckboxName)
            .build();
    }


    /**
     * Handle events related to the control flow of the forms used to configure and start the game.
     * @param document the DOM document
     */
    handleEvents(document) {

        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const playerId = urlParams.get('playerId');
        const gameId = urlParams.get('gameId');

        if (playerId) {
            this.onlineGamePlay.loadGameForPlayer(gameId, playerId);
            /*
            $('.' + this.gameOptionsFormClass).css('display', 'none');
            $('.' + this.playerNameForm).css('display', 'inline-block');
            $('.' + this.playerNamePrefixClass + playerId).css('display', 'block');
            $('.' + this.playerNameSubmitButtonClass).css('display', 'block');

             */
        }

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

        // Handle the play online checkbox
        this.handlePlayOnlineEvent();

    }

    handlePlayOnlineEvent() {
        let self = this;
        let checkbox = $('input[name="' + this.playOnlineCheckboxName + '"]');
        let getUrl = window.location;
        let baseUrl = getUrl.protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];
        let search = getUrl.search;

        checkbox.click(function(e) {
            if (checkbox.prop("checked")) {
                $('.' + self.playerNamePrefixClass + '1').find('span').text('Your name');


                let uuid = generateUuid();



                window.history.replaceState( {} , '', baseUrl + '?gameId=' + uuid);


                for (let i = 2; i <= MAX_PLAYERS; i++) {
                    let span = $('.' + self.playerNamePrefixClass + i).find('span');
                    $('.' + self.playerNamePrefixClass + i).find('input').css('display', 'none');
                    //span.text('Player ' + i + ' invitation link: ' + self.generateInvitationLink(i, baseUrl, uuid));
                    span.css('display', 'none');
                }

                let numPlayers = $('.numPlayers').val();

                let html = '<strong>Invitation Links:</strong><br/>';
                for (let i = 1; i <= numPlayers; i++) {
                    html += 'Player ' + i + ' ' + self.generateInvitationLink(i, baseUrl, uuid) + '<br/>';
                }
                $('.invitationClass').html(html);

            } else {
                alert(search);
                window.history.replaceState( {} , '', baseUrl);
                $('.' + self.playerNamePrefixClass + '1').find('span').text('Player 1 name:');
                for (let i = 2; i <= MAX_PLAYERS; i++) {
                    let span = $('.' + self.playerNamePrefixClass + i).find('span');
                    span.text('Player ' + i + ' name:');
                    $('.' + self.playerNamePrefixClass + i).find('input').css('display', 'inline-block');
                }
            }
        });
    }

    generateInvitationLink(playerNumber, baseUrl, uuid) {
        return baseUrl + '?gameId=' + uuid + '&playerId=' + playerNumber;
    }



    /**
     * Render the forms used to control the game settings.
     * @param document the DOM dodument
     */
    renderForms(document) {
        this.view.buildGameControlForms(document);
        this.scalingDimension = $(window).width();
        this.setViewPort(PREVIEW_IMG_WIDTH + 50);
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

        let deckMetadata = this.getDeckMetadata();
        input.val(deckMetadata['numberOfCards']);
        img.attr('src', deckMetadata['image']);
        img.attr('width', PREVIEW_IMG_WIDTH + 'px');
    }

    /* private */
    getDeckMetadata() {
        let numberOfCards = undefined;
        let image = undefined;
        switch(this.getFormDeckType()) {
            case 'picture':
                numberOfCards = PictureCardDeck.getNumberOfCardsInDeck();
                image = PictureCardDeck.getDeckImage();
                break;
            case 'playing':
                numberOfCards = PlayingCardDeck.getNumberOfCardsInDeck;
                image = PlayingCardDeck.getDeckImage();
                break;
            default:
                throw new Error(this.getFormDeckType() + ' is an unkonwn dec type');
        }

        return {
            numberOfCards : numberOfCards,
            image : image
        }
    }


    /* private */
    handleGameRestart() {
        this.getGame().getScoreBoard().hideScoreboard();
        $('.' + this.gameBoardCss).css('display', 'none');
        $('.' + this.gameResetClass).css('display', 'none');
        $('.' + this.scoreBoardForm).css('display', 'none');

        // TODO: remove the next two lines, I don't think they do anything.
        $('.' + this.deckTypeSelectorClass + ' options[value="' + this.getDeckType() + '"]');
        $('.' + this.numPlayersSelectorClass + ' option[value="'+ this.getNumPlayers() + '"]').attr('selected','selected');
        this.setFormOptionsFormVisibility(true);
    }

    /* private */
    handleCardClick(e) {
        let clickedCardId = $(e.target).parent().attr('id');

        let areAllPlayersReady = $('input[name=allPlayersReady]').val() === '1';

        if (!areAllPlayersReady) {
            alert('All players are not ready');
            return;
        }

        let card = this.getGame().getGameBoard().getDeck().getCardById(clickedCardId);
        if (!card.getIsFaceUp()) {
            this.getGame().takePlayerTurn(card);
        }
    }

    /* private */
    addPlayers(document) {
        this.setFormPlayerSubmitVisibility(false);
        this.getGame().addPlayers(this.buildPlayersFromForm());
        // show the game board
        this.getGame().getGameBoard().getNumberOfCardsPerRow();

        let numberOfRows = this.getGame().getGameBoard().getNumberOfRows();
        let numberOfCardsPerRow = this.getGame().getGameBoard().getNumberOfCardsPerRow();
        let cardWidth = this.getGame().getGameBoard().getDeck().getCardWidth();
        let cardHeight = this.getGame().getGameBoard().getDeck().getCardHeight();

        $('.' + this.gameBoardCss).css('display', 'block');
        $('.' + this.gameBoardCss).css('height',numberOfRows * cardHeight);
        $('.' + this.gameBoardCss).css('width', numberOfCardsPerRow * cardWidth);

        // set the view port
        this.setViewPort(PREVIEW_IMG_WIDTH + 50);

        this.getGame().play(document);
    }

    setViewPort(screenWidth) {

        let viewportMeta = document.querySelector('meta[name="viewport"]');
        let width = $(window).width();
        let height = $(window).height();
        let scalingDimension = this.scalingDimension;
        viewportMeta.content = viewportMeta.content.replace(/initial-scale=[^,]+/,
            'initial-scale=' + (scalingDimension / screenWidth));

    }

    /* private */
    handleGameOptions() {
        this.numberOfPlayers = this.getFormNumberOfPlayers();


        let numCards = this.getFormNumberOfCards();



        try {
            this.deckType = this.getFormDeckType();
            this.game = new Game(this.deckType, numCards, this.clickableClass, this.gameResetClass,
                this.scoreBoardPlayerPrefixClass);

        } catch (error) {
            this.handleError(error);
            this.setFormOptionsFormVisibility(true);
            this.setPlayerNamesVisibility(this.numberOfPlayers, false);
            this.setFormPlayerSubmitVisibility(false);
        }
        try {
            // TODO: move this validation into a separate method
            this.game.getGameBoard().getDeck().validateNumberOfCards(this.game.getGameBoard().getNumberOfCards());

            let isOnline = $('input[name=' + this.playOnlineCheckboxName + ']').prop('checked');
            let numPlayersSelected = $('.' + this.numPlayersSelectorClass).val();
            if(isOnline && numPlayersSelected === '1') {
                throw new Error('You must choose at least 2 players to play online');
            }

            this.setPlayerNamesVisibility(this.numberOfPlayers, true);
            this.setFormOptionsFormVisibility(false);
            this.setFormPlayerSubmitVisibility(true);
        } catch (error) {
            alert(error.message);
        }
    }

    /* private */
    buildPlayersFromForm() {
        $('.' + this.scoreBoardForm).css('display', 'inline-block');
        let players = [];
        for (let i = 0; i < this.numberOfPlayers; i++) {
            let name = '.' + this.nameInputPrefixClass + (i + 1);
            let playerName = $(name).val();
            if (playerName.trim().length < 1) {
                let isOnline = $('input[name=' + this.playOnlineCheckboxName + ']').prop('checked');
                playerName = (isOnline && i > 0) ? 'Waiting for player ' + (i + 1) : 'Player ' + (i + 1);
            }
            players.push(new Player(playerName, (i + 1)));
            $('.' + this.scoreBoardPlayerPrefixClass + (i + 1)).css('display', 'inline-block');
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
        if (flag) {
            this.setViewPort(PLAYER_FORM_WIDTH + 50);
        }
        $('.' + this.playerNameForm).css('display', flag ? 'inline-block' : 'none');
        for (let i = 0; i < numberOfPlayers; i++) {
            $('.' + this.playerNamePrefixClass + + (i + 1)).css('display',flag ? 'block' : 'none');
        }
        return numberOfPlayers;
    }

    /* private */
    setFormOptionsFormVisibility(flag) {
        $('.' + this.gameOptionsFormClass).css('display', flag ? 'inline-block' : 'none');
    }

    /* private */
    setFormPlayerSubmitVisibility(flag) {
        $('.' + this.playerNameForm).css('display', flag ? 'inline-block' : 'none');
        $('.' + this.playerNameSubmitButtonClass).css('display', flag ? 'block' : 'none');
    }
}
