class OnlineGamePlay extends Dao {
    constructor() {
        super();
    }

    createGameRecord(gameId, numberOfPlayers, deckType, numberOfCards, playersInput, cardIds) {
        let players = {};
        if (playersInput.length > 1) {
            for (let i = 1; i <= playersInput.length; i++) {
                players[i] = {
                    'playerName' : playersInput[i-1]['playerName'],
                    'ready' : i == 1 ? true : false,
                    'complete' : false
                }
            }
        }

        let gameDetails = {
            numberOfPlayers : numberOfPlayers,
            deckType : deckType,
            numberOfCards: numberOfCards,
            players: players,
            cardIds: cardIds
        };

        this.putObject(gameId, gameDetails);
        this.putObject(gameId + '-log', []);
    }

    resetGame(gameId, currentPlayer, fn) {
        this.put(gameId + '-log', JSON.stringify([]), function (err) {
            if (err) {
                alert('createGameRecord: error "' + err.message + '". See console log for details');
                throw new Error(err);
            }
            fn();
        });
    }

    setupPlayerAndDealCards(gameId, playerId, name, fnGetCardById, fnSuccess) {
        let self = this;
        this.get(gameId, function(err, data) {
            if (err) {
                alert('markPlayerReady error. See console log for details');
                throw new Error(err);
            } else {
                let gameDetail = JSON.parse(data.Body.toString('utf-8'));

                let cards = [];
                for (let cardId of gameDetail['cardIds']) {
                    cards.push(fnGetCardById(cardId));
                }

                gameDetail['players'][playerId]['playerName'] = name;
                gameDetail['players'][playerId]['ready'] = true;
                gameDetail['players'][playerId]['complete'] = false;

                self.put(gameId, JSON.stringify(gameDetail), function (err, data) {
                    if (err) {
                        alert('markPlayerReady error. See console log for details');
                        throw new Error(err);
                    }
                    fnSuccess(cards);
                });
            }
        })
    }

    loadGameForPlayer(gameId, playerId, fn) {
        this.get(gameId, function(err, data) {
            if (err) {
                alert('Error polling for players. See console log for details');
                throw new Error(err);
            } else {
                let gameDetail = JSON.parse(data.Body.toString('utf-8'));
                fn(gameDetail, playerId);
            }
        })
    }

    setPlayerReady(gameId, playerId, fn) {
        let self = this;
        this.get(gameId, function (err, data) {
            if (err) {
                alert('setPlayerReady error . See console log for details');
                throw new Error(err);
            } else {
                let gameDetail = JSON.parse(data.Body.toString('utf-8'));
                gameDetail['players'][playerId]['ready'] = true;
                self.put(gameId, JSON.stringify(gameDetail), function (err) {
                    if (err) {
                        alert('setPlayerReady error . See console log for details');
                        throw new Error(err);
                    }
                    fn();
                });
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

                    // TODO: use class variables to store this instead of the DOM
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

    waitForGameWrapUp(gameId, playerId, fn, count = 0) {
        let self = this;
        this.get(gameId, async function (err, data) {
            if (err) {
                alert('waitForGameWrapUp: error "' + err.message + '", see console log for details');
                throw new Error(err);
            }


            if (count >= GAME_WRAP_UP_ITERATIONS) {
                alert("waitForGameWrapUp error. See console log for details.")
                throw new Error(msg);
            }

            await sleep(GAME_WRAP_UP_DELAY_MS);

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
                    // If it is the game owner reset all the state
                    for (let playerId of Object.keys(gameDetail['players'])) {
                        gameDetail['players'][playerId]['complete'] = false;
                        gameDetail['players'][playerId]['ready'] = false;
                    }

                    self.putObject(gameId, gameDetail);
                    self.putObject(gameId + '-log', []);
                } else {
                    // If it is not the owner give time for the owner to reset the state
                    await sleep(GAME_RESET_NON_OWNER_DELAY);
                }
                fn();

            } else {
                self.waitForGameWrapUp(gameId, playerId, fn, ++count);
            }

        });
    }

    logCardFlip(gameId, currentPlayer, turn, cardId, game, count = 0) {
        let self = this;
        this.get(gameId + '-log', async function (err, data) {
            if  (err) {
                alert('logCardFlip error. See console log for details.');
                throw new Error(err);
            } else {
                let gameLog = JSON.parse(data.Body.toString('utf-8'));
                console.log('==> found game log: %o', gameLog);
                if (gameLog.length < (game.turnCounter  - 1)) {
                    console.log('==> game log has ' + gameLog.length + ' entries, should have ' + (game.turnCounter - 1) + ' retrying for the ' + count + 'time');
                    await sleep(LOG_CARD_FLIP_RETRY_DELAY);
                    if (count < LOG_CARD_FLIP_RETRIES) {
                        self.logCardFlip(gameId, currentPlayer, turn, cardId, game, ++count);
                    } else {
                        alert("logCardFlip error. See console log for details.")
                        throw new Error("logCardFlip: Log size is not the expected size after all retries");
                    }
                }
                gameLog[turn] = {player : currentPlayer, cardId : cardId};

                self.putObject(gameId + '-log', gameLog);
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
}
