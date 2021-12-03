class OnlineGamePlay extends Dao {
    constructor() {
        super();
        this.gameLogReadIndex = -1;
        this.gameLogCaughtUp = false;
        this.currentPlayer = undefined;
        this.allPlayersReady = false;
        this.localBrowserTurns = new Set();
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
        let self = this;
        this.get(gameId, function(err, data) {
            if (err) {
                alert('Error polling for players. See console log for details');
                throw new Error(err);
            } else {
                let gameDetail = JSON.parse(data.Body.toString('utf-8'));
                self.setCurrentPlayer(playerId);
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
     * @param fnTimeout the callback function to call when there was been a timeout waiting for a new log event
     * @returns {Promise<void>} a void promise that can be ignored
     */
    async pollForGameLog(gameId, fnReplayHandler, fnTerminationCondition, fnTimeout, count = 0) {
        await sleep(5000);

        let self = this;

        if (count >= MAX_GAME_LOG_POLL_ITERATIONS) {
            fnTimeout();
            return;
        }

        this.get(gameId + '-log', async function (err, data) {
            if (err) {
                alert('Error polling for players. see console log for details');
                throw new Error(err);
            } else {
                let gameLog = JSON.parse(data.Body.toString('utf-8'));
                //console.log('polling for game log %o', gameLog);

                let index = self.gameLogReadIndex;
                if (index === -1) {
                    index = 0;
                }
                let playCatchUp = index === 0;
                console.log('wait count %d game log %o',count, gameLog);
                if (index < gameLog.length) {
                    count = -1;
                    self.gameLogCaughtUp = false;
                    for (let i = index; i < gameLog.length; i++) {
                        let logEntry = gameLog[i];

                        // Don't handle the click from the game log if it was a local clieck
                        if (self.localBrowserTurns.has(index)) {
                            console.log('not replaying history entry ' + index + ' from ' + logEntry['player'] + ' of ' + logEntry['cardId'] + ' because it was a local turn taken');
                        } else {

                            fnReplayHandler(logEntry, index);
                            await sleep(GAME_LOG_POLL_SLEEP_MS);
                        }
                        index++
                    }

                    // TODO: use class variables to store this instead of the DOM
                    self.gameLogReadIndex = index;
                    self.gameLogCaughtUp = true;
                }

                if (!fnTerminationCondition()) {
                    self.pollForGameLog(gameId, fnReplayHandler, fnTerminationCondition, fnTimeout, ++count);
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

    logCardFlip(gameId, currentPlayer, turn, cardId, count = 0) {
        let self = this;
        this.get(gameId + '-log', async function (err, data) {
            if  (err) {
                alert('logCardFlip error. See console log for details.');
                throw new Error(err);
            } else {
                let gameLog = JSON.parse(data.Body.toString('utf-8'));
                console.log('==> found game log: %o', gameLog);
                if (gameLog.length < (turn  - 1)) {
                    console.log('==> game log has ' + gameLog.length + ' entries, should have ' + (turn - 1) + ' retrying for the ' + count + 'time');
                    await sleep(LOG_CARD_FLIP_RETRY_DELAY);
                    if (count < LOG_CARD_FLIP_RETRIES) {
                        self.logCardFlip(gameId, currentPlayer, turn, cardId, ++count);
                    } else {
                        alert("logCardFlip error. See console log for details.")
                        throw new Error("logCardFlip: Log size is not the expected size after all retries");
                    }
                }

                if (turn > 0) {
                    let cnt = 0;

                    while (!gameLog[turn - 1]) {
                        if (cnt >= 4) {
                            alert('game up waiting on ' + (turn - 1));
                            throw new Error('gave up waiting');
                        }
                        //alert('can not write out ' + turn + ' when ' + (turn - 1) + ' is null sleep and wait');

                        await sleep(2000);

                        await self.get(gameId + '-log', async function(err, data) {

                            if (err) {
                                alert('retry failed');
                            } else {
                                gameLog = JSON.parse(data.Body.toString('utf-8'));
                            }
                        })


                        cnt++;
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

    /**
     * Get the current position of the game log read state.
     * @returns {number} the game log read index
     */
    getGameLogReadIndex() {
        return this.gameLogReadIndex;
    }

    /**
     * Set the current position of the game log read state.
     * @param val the value to set the game log index to
     */
    setGameLogReadIndex(val) {
        this.gameLogReadIndex = val;
    }

    /**
     * Determine if the game log is caught up.
     * @returns {boolean} true if the game log is caught up, false otherwise
     */
    getGameLogCaughtUp() {
        return this.gameLogCaughtUp;
    }

    /**
     * Set whether the game log is caught up
     * @param flag true if the game log is caught up, false otherwise
     */
    setGameLogCaughtUp(flag) {
        this.gameLogCaughtUp = flag;
    }

    /**
     * Get the current player
     * @returns {number|undefined} the current player id
     */
    getCurrentPlayer() {
        return this.currentPlayer;
    }

    /**
     * Set the current player
     * @param playerId the current player id
     */
    setCurrentPlayer(playerId) {
        this.currentPlayer = playerId;
    }

    /**
     * Get whether or not all players are ready.
     * @returns {boolean} true if all players are ready, false otherwise
     */
    getAllPlayersReady() {
        return this.allPlayersReady;
    }

    /**
     * Set whether all players are ready.
     * @param flag true if all players are ready, false otherwise
     */
    setAllPlayersReady(flag) {
        this.allPlayersReady = flag;
    }

    /**
     * Add a turn to the local browser cache.
     * @param turn to add to the cache
     */
    addLocalBrowserTurn(turn) {
        this.localBrowserTurns.add(turn);
    }

    /**
     * Reset the local turn cache.
     */
    resetLocalBrowserTurns() {
        this.localBrowserTurns = new Set();
    }
}
