class OnlineGamePlay extends Dao {
    constructor() {
        super();
        //this.gameConfigController = new GameConfigController();
    }

    createGameRecord(gameId, numberOfPlayers, deckType, numberOfCards, playersInput, cardIds) {
        let players = {};
        players[1] = {
            'playerName' : playersInput[0]['playerName'],
            'ready' : true
        };
        if (playersInput.length > 1) {
            for (let i = 2; i <= playersInput.length; i++) {
                players[i] = {
                    'playerName' : playersInput[i-1]['playerName'],
                    'ready' : false
                }
            }
        }
        this.put(gameId, JSON.stringify(
            {numberOfPlayers : numberOfPlayers, deckType : deckType, numberOfCards: numberOfCards, players: players, cardIds: cardIds}));
        this.put(gameId + '-log', JSON.stringify([]));
    }

    resetGame(gameId, currentPlayer) {
        this.put(gameId + '-log', JSON.stringify([]));
        $('input[name=localBrowserTurns]').val('');
        $('input[name=allPlayersReady]').val(0);
        $('input[name=gameLogReadIndex]').val(-1);
        $('input[name=gameLogCaughtUp]').val(0);

        /*
        this.get(gameId, function(err, data) {
            if (err) {
                alert('Error polling for players ' + err.message + ', see console log for details');
                console.log('error: %o', err);
            } else {
                let gameDetail = JSON.parse(data.Body.toString('utf-8'));

                gameDetail['players'][currentPlayer]['ready'] = false;

                console.log('reset game %o', gameDetail);
                this.put(gameId, JSON.stringify(gameDetail), function (err) {
                    if (err) {
                        alert('Error polling for players ' + err.message + ', see console log for details');
                        console.log('error: %o', err);
                    }
                });
            }
        });

         */
    }

    markPlayerReady(gameId, playerId, name, game) {
        let self = this;
        this.get(gameId, function(err, data) {
            if (err) {
                alert('Error polling for players ' + err.message + ', see console log for details');
                console.log('error: %o', err);
            } else {
                let gameDetail = JSON.parse(data.Body.toString('utf-8'));

                console.log('update game %o to cardIds %o', game, gameDetail['cardIds']);

                let cards = [];
                for (let cardId of gameDetail['cardIds']) {
                    cards.push(game.gameBoard.deck.getCardById(cardId));
                }
                game.gameBoard.deck.cards = cards;
                game.gameBoard.renderGameBoard(document);

                gameDetail['players'][playerId]['playerName'] = name;
                gameDetail['players'][playerId]['ready'] = true;
                self.put(gameId, JSON.stringify(gameDetail), function (err, data) {
                    if (err) {
                        alert('Error marking players ready ' + err.message + ', see console log for details');
                        console.log('error: %o', err);
                    } else {
                        console.log('successfully marked player ' + playerId + ' ready');
                    }
                });
            }
        })
    }

    loadGameForPlayer(gameId, playerId) {
        this.get(gameId, function(err, data) {
            if (err) {
                alert('Error polling for players ' + err.message + ', see console log for details');
                console.log('error: %o', err);
            } else {
                let gameDetail = JSON.parse(data.Body.toString('utf-8'));
                console.log('loadGameForPlayer: playerId: %s gameId: %s detail: %o', playerId , gameId, gameDetail);
                $('input[name="currentPlayer"]').val(playerId);
                $('.numPlayers').val(gameDetail['numberOfPlayers']);
                $('.numPlayers').attr('disabled', true);
                $('input[name="playOnlineCheckboxName"]').prop('checked', true);
                $('input[name="playOnlineCheckboxName"]').attr('disabled', true);
                $('.deckType').val(gameDetail['deckType']);
                $('.deckType').attr('disabled', true);
                let img = $('.gameOptionsForm').find('img');
                img.attr('src', gameDetail['deckType'] === 'picture' ? PictureCardDeck.getDeckImage() : PlayingCardDeck.getDeckImage());
                $('input[name="' + 'numberOfCardsToUse' + '"]').val(gameDetail['numberOfCards']);
                $('input[name="' + 'numberOfCardsToUse' + '"]').attr('disabled', true);

                for (let pid of Object.keys(gameDetail['players'])) {
                    let name = gameDetail['players'][pid]['playerName'];
                    if (pid !== playerId) {
                        $('.playerName' + pid).find('input').val(name);
                        $('.playerName' + pid).find('input').attr('disabled', true);
                    } else {
                        //$('.playerName' + pid).find('input').val('');
                    }
                }
            }
        })
    }

    waitForGameRestart(gameId, count = 0) {
        let self = this;
        this.get(gameId + '-log', async function (err, data) {
            await self.sleep(10000);
            if (err) {
                alert('Error polling for players ' + err.message + ', see console log for details');
                console.log('error: %o', err);
            } else {
                let gameLog = JSON.parse(data.Body.toString('utf-8'));
                console.log('==> waiting for owner to restart found game log %o', gameLog);

                if (gameLog.length === 0) {
                    $('.gameOver').find('input').val('Play again');
                    $('.gameOver').find('input').prop('disabled', false);
                } else if (count < 9) {
                    self.waitForGameRestart(gameId, ++count);
                } else {
                    $('.gameOver').find('input').val('Game owner did not restart the game. Reload to play once the owner has restarted the game')
                }
            }
        });
    }

    logCardFlip(gameId, currentPlayer, cardId, game, count = 0) {
        let self = this;
        this.get(gameId + '-log', async function (err, data) {
            if  (err) {
                alert('Error polling for players ' + err.message + ', see console log for details');
                console.log('error: %o', err);
            } else {
                let gameLog = JSON.parse(data.Body.toString('utf-8'));
                console.log('==> found game log: %o', gameLog);
                if (gameLog.length < (game.turnCounter  - 1)) {
                    console.log('==> game log has ' + gameLog.length + ' entries, should have ' + (game.turnCounter - 1) + ' retrying for the ' + count + 'time');
                    await self.sleep(1000);
                    if (count < 3) {
                        self.logCardFlip(gameId, currentPlayer, cardId, game, ++count);
                    }
                }
                gameLog.push({player : currentPlayer, cardId : cardId});
                self.put(gameId + '-log', JSON.stringify(gameLog), function (err) {
                    console.log('==> error writing to game log %o', err);
                });
            }
        })
    }


    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
