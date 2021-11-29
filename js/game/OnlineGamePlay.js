class OnlineGamePlay extends Dao {
    constructor() {
        super();
        //this.gameConfigController = new GameConfigController();
    }

    createGameRecord(gameId, numberOfPlayers, deckType, numberOfCards, playersInput, cardIds) {
        let players = {};
        players[1] = {
            'playerName' : playersInput[0]['playerName'],
            'complete' : false,
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

        let gameDetails = {numberOfPlayers : numberOfPlayers,
            deckType : deckType,
            numberOfCards: numberOfCards,
            players: players,
            cardIds: cardIds};

        this.put(gameId, JSON.stringify(gameDetails), function (err) {
            if (err) {
                alert('createGameRecord: error "' + err.message + '". See console log for details');
                throw new Error(err);
            }
        });
        this.put(gameId + '-log', JSON.stringify([]), function (err) {
            if (err) {
                alert('createGameRecord: error "' + err.message + '". See console log for details');
                throw new Error(err);
            }
        });
    }

    resetGame(gameId, currentPlayer) {
        this.put(gameId + '-log', JSON.stringify([]), function (err) {
            if (err) {
                alert('createGameRecord: error "' + err.message + '". See console log for details');
                throw new Error(err);
            }
        });
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

                //console.log('update game %o to cardIds %o', game, gameDetail['cardIds']);

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
                        //console.log('successfully marked player ' + playerId + ' ready');
                    }
                });
            }
        })
    }

    loadGameForPlayer(gameId, playerId) {
        this.get(gameId, function(err, data) {
            if (err) {
                alert('Error polling for players. See console log for details');
                throw new Error(err);
            } else {
                let gameDetail = JSON.parse(data.Body.toString('utf-8'));
                //console.log('loadGameForPlayer: playerId: %s gameId: %s detail: %o', playerId , gameId, gameDetail);
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

    async pollForGameLog(gameId, fnReplayHandler, fnTerminationCondition) {
        await sleep(5000);

        let self = this;

        this.get(gameId + '-log', async function (err, data) {
            if (err) {
                alert('Error polling for players. see console log for details');
                throw new Error(err);
            } else {
                let gameLog = JSON.parse(data.Body.toString('utf-8'));
                //console.log('polling for game log %o', gameLog);

                let index = $('input[name=gameLogReadIndex]').val();
                if (index === '-1') {
                    index = '0';
                }
                let currentPlayer = $('input[name=currentPlayer]').val();
                let playCatchUp = index === '0';
                console.log('game log %o', gameLog);
                if (index < gameLog.length) {
                    //console.log('gameLog: %o', gameLog);
                    $('input[name=gameLogCaughtUp]').val(0);
                    for (let i = index; i < gameLog.length; i++) {
                        let logEntry = gameLog[i];

                        // Don't handle the click from the game log if it was a local clieck
                        let localTurns = $('input[name=localBrowserTurns]').val().split(',');
                        if (localTurns.includes(index.toString())) {
                            console.log('not replaying history entry ' + index + ' from ' + logEntry['player'] + ' of ' + logEntry['cardId'] + ' because it was a local turn taken');
                        } else {

                            fnReplayHandler(logEntry, index);
                            await sleep(2000);
                        }
                        index++

                    }
                    //console.log('==> marking new index as ' + (index));
                    $('input[name=gameLogReadIndex]').val(index);
                    $('input[name=gameLogCaughtUp]').val(1);
                }

                if (!fnTerminationCondition()) {
                    self.pollForGameLog(gameId, fnReplayHandler, fnTerminationCondition);
                } else {
                    return true;
                }
            }
        });


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
                    if (err) {
                        alert('markGameCompleteForPlayer: error see console log for details');
                        throw new Error(err);
                    }
                })
            }
        });
    }

    waitForGameWrapUp(gameId, playerId, count = 0) {
        let self = this;
        this.get(gameId, async function (err, data) {

            if (count >= 30) {
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

    logCardFlip(gameId, currentPlayer, turn, cardId, game, count = 0) {
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
                    await self.sleep(100);
                    if (count < 3) {
                        self.logCardFlip(gameId, currentPlayer, turn, cardId, game, ++count);
                    }
                }
                gameLog[turn] = {player : currentPlayer, cardId : cardId};

                self.put(gameId + '-log', JSON.stringify(gameLog), function() {
                    if (err) {
                        alert('need to handle this error');
                    }
                });
            }
        })
    }

    async pollForPlayersReady(gameId, currentPlayer, fnSuccess, fnTimeout, fnPlayerReady, count = 0, joinNotifications = {}) {
        await sleep(POLL_PLAYERS_DELAY);

        let self = this;
        this.get(gameId, async function(err, data) {
            if (err) {
                alert('pollForPlayersReady: error see console log for details.');
                throw new Error(err);
            }
            let gameDetail = JSON.parse(data.Body.toString('utf-8'));

            if (count >= POLL_PLAYERS_ITERATIONS) {

                // Giving up waiting on other players. Mark this player not ready and surface try again button.

                fnTimeout();
                gameDetail['players'][currentPlayer]['ready'] = false;
                self.putObject(gameId, gameDetail);
                return;
            }

            console.log('pollForPlayersReady: gameId: %s gameDetail %o', gameId, gameDetail);
            let allPlayersReady = true;
            for (let id of Object.keys(gameDetail.players)) {
                if (gameDetail.players[id]['ready'] === false) {
                    allPlayersReady = false;
                    break;
                } else {

                    let nameInDetail = gameDetail.players[id]['playerName'];
                    if (!joinNotifications[id]) {
                        fnPlayerReady(id, nameInDetail);
                        joinNotifications[id] = true;
                    }

                }
            }
            console.log('==> players: %o', gameDetail.players);
            if (!allPlayersReady) {
                return self.pollForPlayersReady(gameId, currentPlayer, fnSuccess, fnTimeout, fnPlayerReady, ++count, joinNotifications);
            } else {
                fnSuccess(gameId, currentPlayer);
            }
        });
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
