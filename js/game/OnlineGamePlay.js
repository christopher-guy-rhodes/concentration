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
                    'ready' : false,
                    'complete' : false
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
        $('.waiting').css('display', 'block');
        $('.invitationClass').css('display', 'block');

        for (let i = 1; i <= MAX_PLAYERS; i++) {
            $('.waitingOn' + i).css('display', 'inline-block');
        }

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
                gameDetail['players'][playerId]['complete'] = false;
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

    markGameCompleteForPlayer(gameId, playerId) {
        let self = this;
        this.get(gameId, async function (err, data) {
            if (err) {
                alert('markGameCompleteForPlayer: error "' + err.message + '", see console log for details');
                throw new Error(err);
            } else {
                let gameDetail = JSON.parse(data.Body.toString('utf-8'));
                gameDetail['players'][playerId]['complete'] = true;

                self.put(gameId, JSON.stringify(gameDetail), function (err) {
                    alert('markGameCompleteForPlayer: error "' + err.message + '", see console log for details');
                    throw new Error(err);
                })
            }
        });
    }

    waitForGameWrapUp(gameId, playerId, count = 0) {
        let self = this;
        this.get(gameId, async function (err, data) {

            if (count >= 10) {
                let msg = 'something went wrong, game did not warp up';
                alert(msg);
                throw new Error(msg);
            }

            await self.sleep(5000);
            if (err) {
                alert('waitForGameWrapUp: error "' + err.message + '", see console log for details');
                throw new Error(err);
            } else {
                let gameDetail = JSON.parse(data.Body.toString('utf-8'));

                let allComplete = true;
                for (let playerId of Object.keys(gameDetail['players'])) {
                    if (!gameDetail['players'][playerId]['complete']) {
                        allComplete = false;
                        break;
                    }
                }

                if (allComplete) {
                    if (playerId == '1') {
                        for (let playerId of Object.keys(gameDetail['players'])) {
                            gameDetail['players'][playerId]['complete'] = false;
                            gameDetail['players'][playerId]['ready'] = false;
                        }

                        self.put(gameId, JSON.stringify(gameDetail), function (err) {
                            if (err) {
                                alert('waitForGameWrapUp: error "' + err.message + '", see console log for details');
                                throw new Error(err);
                            };
                        });
                        self.put(gameId + '-log', JSON.stringify([]), function(err) {
                            if (err) {
                                alert('waitForGameWrapUp: error "' + err.message + '", see console log for details');
                                throw new Error(err);
                            };
                        })
                    } else {
                        // give time for game to be reset
                        await self.sleep(10000);
                    }

                    $('.gameOver').find('input').prop('disabled', false);
                    $('.gameOver').find('input').val('Play again!');

                } else {
                    self.waitForGameWrapUp(gameId, playerId, ++count);
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
