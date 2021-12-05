// Set class names used in callbacks as constants since the class won't be available in the callback
const NUM_PLAYERS_SELECTOR_CLASS = 'numPlayers';
const PLAY_ONLINE_CHECKBOX_NAME = 'playOnlineCheckboxName';
const DECK_TYPE_SELECTOR_CLASS = 'deckType';
const NUMBER_OF_CARDS_TO_USE_NAME = 'numberOfCardsToUse';
const PLAYER_NAME_PREFIX_CLASS = 'playerName';
const GAME_OPTIONS_FORM_CLASS = 'gameOptionsForm';

class GameConfigController {
    constructor() {
        this.numberOfPlayers = undefined;
        this.deckType = undefined;
        this.game = undefined;
        this.gamOptionsSubmitClass = 'gameOptionsSubmit';
        this.gameOptionsFormClass = GAME_OPTIONS_FORM_CLASS;
        this.deckTypeSelectorClass = DECK_TYPE_SELECTOR_CLASS;
        this.playerNameSubmitButtonClass = 'playerNameSubmit';
        this.clickableClass = 'clickable';
        this.gameResetClass = 'gameOver';
        this.numPlayersSelectorClass = NUM_PLAYERS_SELECTOR_CLASS;
        this.numberOfCardsToUseName = NUMBER_OF_CARDS_TO_USE_NAME;
        this.scoreBoardPlayerPrefixClass = 'player';
        this.playerNamePrefixClass = PLAYER_NAME_PREFIX_CLASS;
        this.nameInputPrefixClass = 'name';
        this.playerNameForm = 'playerNameForm';
        this.scoreBoardForm = 'scoreBoardForm';
        this.gameBoardCss = 'gameBoard';
        this.playOnlineCheckboxName = PLAY_ONLINE_CHECKBOX_NAME;
        this.waitLongerContainerClass = 'waitLongerContainer';
        this.waitLongerButtonClass = 'waitLonger';
        this.waitLongerForTurnContainer = 'waitLongerForTurnContainer';
        this.waitLongerForTurnButtonClass = 'waitLongerForTurn';
        this.waitingContainerClass = 'waiting';
        this.waitingOnClass = 'waitingOn';
        this.invitationClass = 'invitationClass';
        this.invitationLinkClass = 'invitationLink';


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
            .withWaitLongerContainerClass(this.waitLongerContainerClass)
            .withWaitLongerButtonClass(this.waitLongerButtonClass)
            .withWaitLongerForTurnContainer(this.waitLongerForTurnContainer)
            .withWaitLongerForTurnButtonClass(this.waitLongerForTurnButtonClass)
            .withPlayOnlineCheckboxName(this.playOnlineCheckboxName)
            .withWaitingContainerClass(this.waitingContainerClass)
            .withWaitingOnClass(this.waitingOnClass)
            .withInvitationClass(this.invitationClass)
            .withInvitationLInkClass(this.invitationLinkClass)
            .build();
    }

    /**
     * Handle events related to the control flow of the forms used to configure and start the game.
     * @param document the DOM document
     */
    handleEvents(document) {

        // Handle specific settings for online game play
        this.handleOnlineGamePlay();

        this.handleNumberOfPlayersEvent();

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

        // Handle a button click to wait longer for players to join
        this.handlePlayerWaitRestart();

        // Handle a button click to wait longer for players to take a turn
        this.handleWaitTurnRestart();

    }

    /**
     * Render the forms used to control the game settings.
     * @param document the DOM dodument
     */
    renderForms(document) {
        this.view.buildGameControlForms(document);
        this.scalingDimension = $(window).width();
        this.setViewPort(PREVIEW_IMG_WIDTH + VIEW_PORT_SCALING_FUDGE_FACTOR);
    }

    /* private */
    handleOnlineGamePlay() {
        let gameId = getUrlParam('gameId');
        let playerId = parseInt(getUrlParam('playerId'));
        if (gameId && playerId) {
            this.onlineGamePlay.loadGameForPlayer(gameId, playerId, this.loadGameForPlayer);
        }

    }

    /* private */
    loadGameForPlayer(gameDetail, playerId) {
        $('.' + NUM_PLAYERS_SELECTOR_CLASS).val(gameDetail['numberOfPlayers']);
        $('.' + NUM_PLAYERS_SELECTOR_CLASS).attr('disabled', true);
        $('input[name="' + PLAY_ONLINE_CHECKBOX_NAME + '"]').prop('checked', true);
        $('input[name="' + PLAY_ONLINE_CHECKBOX_NAME + '"]').attr('disabled', true);
        $('.' + DECK_TYPE_SELECTOR_CLASS).val(gameDetail['deckType']);
        $('.' + DECK_TYPE_SELECTOR_CLASS).attr('disabled', true);
        let img = $('.' + GAME_OPTIONS_FORM_CLASS).find('img');
        img.attr('src', gameDetail['deckType'] === 'picture' ? PictureCardDeck.getDeckImage() : PlayingCardDeck.getDeckImage());
        $('input[name="' + NUMBER_OF_CARDS_TO_USE_NAME + '"]').val(gameDetail['numberOfCards']);
        $('input[name="' + NUMBER_OF_CARDS_TO_USE_NAME + '"]').attr('disabled', true);

        console.log('==> game detail is %o', gameDetail);
        for (let pid of Object.keys(gameDetail['players'])) {
            let name = gameDetail['players'][pid]['playerName'];
            if (playerId !== parseInt(pid)) {
                $('.' + PLAYER_NAME_PREFIX_CLASS + pid).find('input').val(name);
                $('.' + PLAYER_NAME_PREFIX_CLASS + pid).find('input').attr('disabled', true);
            }
        }
    }

    /* private */
    handlePlayerWaitRestart() {
        let self = this;
        $('.' + this.waitLongerButtonClass).click(function (e) {
            self.waitForPlayers(getUrlParam('gameId'), getUrlParam('playerId'))
        });
    }

    /* private */
    handleWaitTurnRestart() {
        let self = this;
        $('.' + this.waitLongerForTurnButtonClass).click(function(e) {
            $('.' + self.waitLongerForTurnContainer).css('display', 'none');
            self.pollForGameLog(getUrlParam("gameId"));
        })
    }

    /* private */
    waitForPlayers(gameId, playerId) {
        let self = this;
        this.onlineGamePlay.setPlayerReady(gameId, playerId, function() {
            $('.' + self.waitLongerContainerClass).css('display', 'none');
            self.pollForPlayersReady(gameId, playerId);
        });
    }

    /* private */
    handleNumberOfPlayersEvent() {
        let self = this;
        $('.' + this.numPlayersSelectorClass).change(function(e) {
            let numberOfPlayers = $('.' + self.numPlayersSelectorClass).val();
            if (numberOfPlayers === '1') {
                $('input[name=' + self.playOnlineCheckboxName + ']').prop('checked', false);
            }
        });
    }

    /* private */
    handlePlayOnlineEvent() {
        let self = this;
        let checkbox = $('input[name="' + this.playOnlineCheckboxName + '"]');
        let getUrl = window.location;
        let baseUrl = getUrl.protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];

        checkbox.click(function(e) {
            if (checkbox.prop("checked")) {

                let numPlayers = $('.' + self.numPlayersSelectorClass).val();

                if (numPlayers < 2) {
                    alert('You need to select at least two players to play online');
                    $('.' + self.playOnlineCheckboxName).prop('checked', false);
                    checkbox.prop('checked', false);
                    return;
                }

                $('.' + self.playerNamePrefixClass + '1').find('span').text('Your name');

                let gameId = generateUuid();
                window.history.replaceState( {} , '', baseUrl + '?gameId=' + gameId);


                for (let i = 2; i <= MAX_PLAYERS; i++) {
                    let span = $('.' + self.playerNamePrefixClass + i).find('span');
                    $('.' + self.playerNamePrefixClass + i).find('input').css('display', 'none');
                    span.css('display', 'none');
                }

                for (let i = 2; i <= numPlayers; i++) {
                    $('.' + self.invitationLinkClass + i).html('Player ' + i + ': '
                        + self.generateInvitationLink(i, baseUrl, gameId));
                }

            } else {
                window.history.replaceState( {} , '', baseUrl);
                $('.' + self.playerNamePrefixClass + '1').find('span').text('Player 1 name:');
                for (let i = 2; i <= MAX_PLAYERS; i++) {
                    let span = $('.' + self.playerNamePrefixClass + i).find('span');
                    $('.' + self.playerNamePrefixClass + i).find('input').css('display', 'inline-block');
                    span.text('Player ' + i + ' name:');
                }
            }
        });
    }

    /* private */
    generateInvitationLink(playerNumber, baseUrl, uuid) {
        let url = baseUrl + '?gameId=' + uuid + '&playerId=' + playerNumber;
        return url + ' (<a href="' + url  +'" target="_blank">link</a>)';
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
        $(document).on('click', '.' + this.clickableClass, throttled(CARD_FLIP_ANIMATION_TIME_MS, function (e) {
            let turn = self.game.turnCounter;
            if (!self.onlineGamePlay.getGameLogCaughtUp()) {
                alert('Game events are catching up, please try again in a moment');
                return;
            }
            let cardClickId = $(e.target).parent().attr('id');
            let currentPlayer = self.onlineGamePlay.getCurrentPlayer();

            let gameId = getUrlParam('gameId');

            let playerTurn = self.game.playerTurnIndex + 1;
            console.log('playerTurn:' + playerTurn + ' currentPlayer:' + currentPlayer);
            if (gameId !== null && playerTurn !== parseInt(currentPlayer)) {
                alert('Sorry, it is not your turn yet');
            } else {
                self.onlineGamePlay.addLocalBrowserTurn(turn);
                self.handleCardClick(cardClickId, currentPlayer, true);
            }
        }));
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

        let url = new URL(window.location);
        let gameId = url.searchParams.get("gameId");

        if (gameId !== null) {
            let self = this;
            this.onlineGamePlay.resetGame(gameId, function() {
                self.onlineGamePlay.resetLocalBrowserTurns();

                self.onlineGamePlay.setAllPlayersReady(false);
                self.onlineGamePlay.setGameLogReadIndex(-1);
                self.onlineGamePlay.setGameLogCaughtUp(false);
                $('.' + self.waitingContainerClass).css('display', 'block');
                $('.' + self.invitationClass).css('display', 'block');

                for (let i = 1; i <= MAX_PLAYERS; i++) {
                    $('.' + self.waitingOnClass + i).css('display', 'inline-block');
                }
            });
            let currentPlayer = this.onlineGamePlay.getCurrentPlayer();
            this.onlineGamePlay.loadGameForPlayer(gameId, currentPlayer, this.loadGameForPlayer);
        }

        this.setFormOptionsFormVisibility(true);

    }

    /* private */
    handleCardClick(clickedCardId, player, isCurrentPlayer) {


        let url = new URL(window.location);
        let gameId = url.searchParams.get("gameId");

        let card = this.getGame().getGameBoard().getDeck().getCardById(clickedCardId);


        if (gameId !== null && this.game.matchPending) {
            // wait for the match to complete before starting another to thottle in online mode
            return;
        }

        if (!this.onlineGamePlay.getAllPlayersReady()) {
            alert('All players are not ready');
            return;
        }

        if (!card.getIsFaceUp()) {
            if (isCurrentPlayer && gameId !== null) {
                // only log the card flip if the player is caught up
                let turn = this.game.turnCounter;
                this.game.onlineGamePlay.logCardFlip(gameId, player, turn, clickedCardId);
            }
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

        let gameId = getUrlParam('gameId');
        let playerId = getUrlParam('playerId');
        if (playerId !== undefined) {
            playerId = parseInt(playerId);
        }

        if (gameId !== null) {
            let self = this;

            $('.waiting').css('display', 'block');
            let currentPlayer = playerId === undefined ? 1 : playerId;

            if (currentPlayer === 1) {
                $('.' + self.invitationClass).css('display', 'block');
            }

            for (let i = 1; i <= this.game.players.length; i++) {
                if (currentPlayer === i) {
                    continue;
                }
                let name = this.game.players[i -1]['playerName'];
                $('.' + self.waitingOnClass + i).text(name);
            }

            this.pollForPlayersReady(gameId, currentPlayer);
        }
        this.getGame().play(document);
    }

    /* private */
    pollForPlayersReady(gameId, currentPlayer) {
        let self = this;
        this.game.onlineGamePlay.pollForPlayersReady(gameId, currentPlayer,
            function(gameId, currentPlayer) {
                self.handleAllPlayersReady(currentPlayer);
                self.pollForGameLog(gameId);
            },
            function () {
                self.showWaitLongerButton();
            },
            function (id, name) {
                $('.' + self.waitingOnClass + id).css('display', 'none');
                self.game.players[id - 1]['playerName'] = name;
                self.game.scoreBoard.updateStats(self.game.players[0]);
            });
    }

    /* private */
    pollForGameLog(gameId) {
        let self = this;
        this.onlineGamePlay.pollForGameLog(gameId,
            function (logEntry, index) {
                console.log('replaying history entry ' + index + ' from ' + logEntry['player'] + ' of ' + logEntry['cardId']);
                //console.log('%o does not contain %o',localTurns, index);
                self.handleCardClick(logEntry['cardId'], logEntry['player'], false);
            },
            function() {
                return self.game.isGameOver();
            }, function () {
                $('.' + self.waitLongerForTurnContainer).css('display', 'block');
            });
    }

    /* private */
    handleAllPlayersReady(currentPlayer) {
        alert('All players are ready');
        $('.' + this.waitingContainerClass).css('display', 'none');
        if (currentPlayer !== '1') {
            console.log('handling all players ready class is ' + this.invitationClass);
            $('.' + this.invitationClass).css('display', 'none');
        }
        this.onlineGamePlay.setAllPlayersReady(true);
    }

    /* private */
    showWaitLongerButton() {
        $('.' + this.waitLongerContainerClass).css('display', 'block');
    }

    /* private */
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
            this.game = new Game(this.onlineGamePlay, this.deckType, numCards, this.clickableClass, this.gameResetClass,
                this.scoreBoardPlayerPrefixClass);

        } catch (error) {
            this.handleError(error);
            this.setFormOptionsFormVisibility(true);
            this.setPlayerNamesVisibility(this.numberOfPlayers, false);
            this.setFormPlayerSubmitVisibility(false);
        }
        try {
            this.game.getGameBoard().getDeck().validateNumberOfCards(this.game.getGameBoard().getNumberOfCards());

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
                playerName = 'Player ' + (i + 1);
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
