

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
        this.dao = new Dao();

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

        this.handleWaitLonger();

    }

    handleWaitLonger() {
        let self = this;
        $('.waitLonger').click(function (e) {
            let url = new URL(window.location);
            let gameId = url.searchParams.get("gameId");
            let playerId = url.searchParams.get("playerId");


            self.dao.get(gameId, function (err, data) {
                if (err) {
                    alert('handleWaitLonger(1): error "' + err.message + '". See console log for details');
                    throw new Error(err);
                } else {
                    let gameDetail = JSON.parse(data.Body.toString('utf-8'));
                    gameDetail['players'][playerId]['ready'] = true;
                    console.log('in success block of get')
                    self.dao.put(gameId, JSON.stringify(gameDetail), function (err) {
                        if (err) {
                            alert('handleWaitLonger(1): error "' + err.message + '". See console log for details');
                            throw new Error(err);
                        }
                        console.log('in success block of put');
                        self.pollForPlayersReady(gameId);

                        $('.waitLongerContainer').css('display', 'none');
                    });
                }
            })
            //console.log('got a click on wait for longer, polling again');
            //self.pollForGameLog(gameId);
        });
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
                for (let i = 2; i <= numPlayers; i++) {
                    html += 'Player ' + i + ': ' + self.generateInvitationLink(i, baseUrl, uuid) + '<br/>';
                }

                $('.invitationClass').html(html);
            } else {
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
        let url = baseUrl + '?gameId=' + uuid + '&playerId=' + playerNumber;
        return url + ' (<a href="' + url  +'">link</a>)';
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
            if ($('input[name=gameLogCaughtUp]').val() !== '1' && $('input[name=gameLogReadIndex]').val() !== '-1') {
                alert('Game events are catching up, please try again in a moment');
                return;
            }
            let cardClickId = $(e.target).parent().attr('id');
            let currentPlayer = $('input[name=currentPlayer]').val();
            let turn = self.game.turnCounter;

            let url = new URL(window.location);
            let gameId = url.searchParams.get("gameId");

            let playerTurn = self.game.playerTurnIndex + 1;
            console.log('playerTurn:' + playerTurn + ' currentPlayer:' + currentPlayer);
            if (gameId !== null && playerTurn !== parseInt(currentPlayer)) {
                alert('Sorry, it is not your turn yet');
            } else {

                //localBrowserTurns
                let existingTurns = $('input[name=localBrowserTurns]').val();
                if (existingTurns === '') {
                    existingTurns = turn;
                } else {
                    existingTurns += ',' + turn;
                }
                $('input[name=localBrowserTurns]').val(existingTurns);


                let currentPlayer = $('input[name=currentPlayer]').val();
                self.handleCardClick(cardClickId, currentPlayer, true);
            }
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

        let url = new URL(window.location);
        let gameId = url.searchParams.get("gameId");

        let currentPlayer = $('input[name=currentPlayer]').val();
        if (gameId !== null) {
            this.onlineGamePlay.resetGame(gameId, currentPlayer);
            this.onlineGamePlay.loadGameForPlayer(gameId, currentPlayer);
        }

        // TODO: remove the next two lines, I don't think they do anything.
        $('.' + this.deckTypeSelectorClass + ' options[value="' + this.getDeckType() + '"]');
        $('.' + this.numPlayersSelectorClass + ' option[value="'+ this.getNumPlayers() + '"]').attr('selected','selected');
        this.setFormOptionsFormVisibility(true);

    }

    /* private */
    handleCardClick(clickedCardId, player, isCurrentPlayer) {


        let url = new URL(window.location);
        let gameId = url.searchParams.get("gameId");

        let card = this.getGame().getGameBoard().getDeck().getCardById(clickedCardId);




        let areAllPlayersReady = $('input[name=allPlayersReady]').val() === '1';

        if (!areAllPlayersReady) {
            alert('All players are not ready');
            return;
        }

        if (!card.getIsFaceUp()) {
            if (isCurrentPlayer && gameId !== null) {
                // only log the card flip if the player is caught up
                this.onlineGamePlay.logCardFlip(gameId, player, clickedCardId, this.getGame());
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

        let url = new URL(window.location);
        let gameId = url.searchParams.get("gameId");
        let playerId = url.searchParams.get("playerId");


        if (gameId !== null) {
            let self = this;

            $('.waiting').css('display', 'block');
            let currentPlayer = playerId === null ? '1' : playerId;

            $('.invitationClass').css('display', 'block');

            for (let i = 1; i <= this.game.players.length; i++) {
                if (parseInt(currentPlayer) === i) {
                    continue;
                }
                let name = this.game.players[i -1]['playerName'];
                $('.waitingOn' + i).text(name);
            }

            this.pollForPlayersReady(gameId, function(gameId, currentPlayer) {
                self.handlePlayersReady(currentPlayer);
                self.pollForGameLog(gameId);
            });
        }
        this.getGame().play(document);
    }

    handlePlayersReady(currentPlayer) {
        alert('All players are ready');
        console.log('this is %o', this);
        $('.waiting').css('display', 'none');
        if (currentPlayer !== '1') {
            $('.invitationClass').css('display', 'none');
        }
        $('input[name=allPlayersReady]').val(1);
    }

    async pollForPlayersReady(gameId, fn, count = 0, joinNotifications = {}) {
        await sleep(5000);

        let self = this;
        let currentPlayer = $('input[name=currentPlayer]').val();
        this.dao.get(gameId, async function(err, data) {
            if (err) {
                alert('pollForPlayersReady: error "' + err.message + '", see console log for details');
                throw new Error(err);
            } else {
                let gameDetail = JSON.parse(data.Body.toString('utf-8'));

                if (count >= 60) {

                    $('.waitLongerContainer').css('display', 'block');

                    gameDetail['players'][currentPlayer]['ready'] = false;
                    self.dao.put(gameId, JSON.stringify(gameDetail), function (err) {
                        if (err) {
                            alert('pollForPlayersReady: error "' + err.message + '", see console loog for details');
                            throw new Error(err);
                        }
                    });
                    return false;
                }

                console.log('pollForPlayersReady: gameId: %s gameDetail %o', gameId, gameDetail);
                let allPlayersReady = true;
                for (let id of Object.keys(gameDetail.players)) {
                    if (gameDetail.players[id]['ready'] === false) {
                        allPlayersReady = false;
                    } else {

                        if (currentPlayer !== id && !joinNotifications[id]) {
                            $('.waitingOn' + id).css('display', 'none');
                            joinNotifications[id] = true;
                        }

                        let nameInDetail = gameDetail.players[id]['playerName'];
                        let nameInPlayerObject = self.game.players[id - 1]['playerName'];

                        if (nameInDetail !== nameInPlayerObject) {
                            console.log('setting ' + nameInPlayerObject + ' to ' + nameInDetail);
                            self.game.players[id - 1]['playerName'] = gameDetail.players[id]['playerName'];


                            self.game.scoreBoard.updateStats(self.game.players[0]);

                        }
                        $('.name' + id).val(nameInDetail);
                    }
                }
                console.log('==> players: %o', gameDetail.players);
                if (!allPlayersReady) {
                    return self.pollForPlayersReady(gameId, fn, ++count, joinNotifications);
                } else {
                    fn(gameId, currentPlayer);
                    /*
                    $('.waiting').css('display', 'none');
                    if (currentPlayer !== '1') {
                        $('.invitationClass').css('display', 'none');
                    }
                    $('input[name=allPlayersReady]').val(1);
                    return await self.pollForGameLog(gameId);

                     */
                }
            }
        });
    }

    async pollForGameLog(gameId) {
        await sleep(5000);

        let self = this;

        this.dao.get(gameId + '-log', async function (err, data) {
            if (err) {
                alert('Error polling for players ' + err.message + ', see console log for details');
                throw new Error(err);
            } else {
                let gameLog = JSON.parse(data.Body.toString('utf-8'));
                console.log('polling for game log %o', gameLog);

                let index = $('input[name=gameLogReadIndex]').val();
                if (index === '-1') {
                    index = '0';
                }
                let currentPlayer = $('input[name=currentPlayer]').val();
                let playCatchUp = index === '0';
                if (index < gameLog.length) {
                    console.log('gameLog: %o', gameLog);
                    $('input[name=gameLogCaughtUp]').val(0);
                    for (let i = index; i < gameLog.length; i++) {
                        let logEntry = gameLog[i];

                        // Don't handle the click from the game log if it was a local clieck
                        let localTurns = $('input[name=localBrowserTurns]').val().split(',');
                        if (localTurns.includes(index.toString())) {
                            console.log('not replaying history entry ' + index + ' from ' + logEntry['player'] + ' of ' + logEntry['cardId'] + ' because it was a local turn taken');
                        } else {
                            console.log('replaying history entry ' + index + ' from ' + logEntry['player'] + ' of ' + logEntry['cardId']);
                            console.log('%o does not contain %o',localTurns, index);
                            self.handleCardClick(logEntry['cardId'], logEntry['player'], false);
                            await sleep(2000);
                        }
                        index++

                    }
                    console.log('==> marking new index as ' + (index));
                    $('input[name=gameLogReadIndex]').val(index);
                    $('input[name=gameLogCaughtUp]').val(1);
                }

                if (!self.game.isGameOver()) {
                    self.pollForGameLog(gameId);
                } else {
                    return true;
                }
            }
        });


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
