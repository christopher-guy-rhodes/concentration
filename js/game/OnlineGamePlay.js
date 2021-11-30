class OnlineGamePlay extends Dao {
    constructor() {
        super();
        this.gameLogReadIndex = -1;
        this.gameLogCaughtUp = false;
    }

    /**
     * Creates a game record for online play. Always marks the owner of the game record (player 1) as ready.
     * @param gameId the game id
     * @param numberOfPlayers the number of players in the game
     * @param deckType the type of deck
     * @param numberOfCards the number of cards in use
     * @param players the list of player objects from the game
     * @param cardIds the shuffled cards identifiers to use in the game
     */
    createGameRecord(gameId, numberOfPlayers, deckType, numberOfCards, players, cardIds) {
        this.putObject(gameId, {
            numberOfPlayers : numberOfPlayers,
            deckType : deckType,
            numberOfCards: numberOfCards,
            players: players.reduce((result, item) => {
                return { ...result, [ item.playerNumber ] : {
                        'playerName' : item.playerName,
                        'ready' : item.playerNumber === 1 ? true : false,
                        'complete' : false
                    } };
            }, {}),
            cardIds: cardIds
        });
        this.putObject(gameId + '-log', []);
    }

    /**
     * Reset the game log for the online game.
     * @param gameId the game identifier
     * @param callback the callback function to call after the game is reset
     */
    resetGame(gameId, callback) {
        this.put(gameId + '-log', JSON.stringify([]), function (err) {
            if (err) {
                alert('createGameRecord: error. See console log for details');
                throw new Error(err);
            }
            callback();
        });
    }

    /**
     * Records player details in the online data store and deal the cards for the game.
     * @param gameId the game identifier
     * @param playerId the player that is being set up
     * @param name the player name
     * @param fnGetCardById call provided function to fetch a card object given the card id
     * @param callback the callback function to call upon success
     */
    setupPlayerAndDealCards(gameId, playerId, name, fnGetCardById, callback) {
        let self = this;
        this.get(gameId, function(err, data) {
            if (err) {
                alert('markPlayerReady error. See console log for details');
                throw new Error(err);
            } else {
                let gameDetail = JSON.parse(data.Body.toString('utf-8'));

                gameDetail['players'][playerId]['playerName'] = name;
                gameDetail['players'][playerId]['ready'] = true;
                gameDetail['players'][playerId]['complete'] = false;

                self.put(gameId, JSON.stringify(gameDetail), function (err, data) {
                    if (err) {
                        alert('markPlayerReady error. See console log for details.');
                        throw new Error(err);
                    }
                    callback(gameDetail['cardIds'].map(cid => fnGetCardById(cid)));
                });
            }
        })
    }

    /**
     * Load the online game details for a player.
     * @param gameId the game id
     * @param playerId the player to load the game for
     * @param callback the callback function to call with the game detail
     */
    loadGameForPlayer(gameId, playerId, callback) {
        this.get(gameId, function(err, data) {
            if (err) {
                alert('Error polling for players. See console log for details');
                throw new Error(err);
            } else {
                let gameDetail = JSON.parse(data.Body.toString('utf-8'));
                callback(gameDetail, playerId);
            }
        })
    }

    /**
     * Set an online player state to ready.
     * @param gameId the game id
     * @param playerId the player to load the game for
     * @param callback the callback function to call with the game detail
     */
    setPlayerReady(gameId, playerId, callback) {
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
                    callback();
                });
            }
        })
    }

    /**
     * Polls for game log changes for all the players so that the changes can be applied for each players local
     * instance.
     * @param gameId the game id
     * @param fnReplayHandler the callback function that is called with a game log entry to process
     * @param fnTerminationCondition the callback function to determine when to terminate the polling
     * @returns {Promise<void>} a void promise that can be ignored
     */
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
                    this.gameLogReadIndex = index;
                    $('input[name=gameLogCaughtUp]').val(1);
                    this.gameLogCaughtUp = true;
                }

                if (!fnTerminationCondition()) {
                    self.pollForGameLog(gameId, fnReplayHandler, fnTerminationCondition);
                } else {
                    return;
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
