const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENT_NAMES = /([^\s,]+)/g;
function getParamNames(func) {
    var fnStr = func.toString().replace(STRIP_COMMENTS, '');
    var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if(result === null)
        result = [];
    return result;
}

function validateRequiredParams(func, values) {
    if (func === undefined) {
        throw new Error("Cannot validate parameters if function is not passed in");
    }
    if (values === undefined || values.length < 1) {
        throw new Error("Cannot validate parameters if parameters to validate is empty or undefined");
    }

    let argumentNames = getParamNames(func);
    let argumentNameIndex = argumentNames.reduce(
        (hash, elem, index) => {
            hash[elem] = index;
            return hash;
        }, {});

    let requiredArgsNames = Array.from(arguments).slice(2);
    for (let requiredArgName of requiredArgsNames) {
        let index = argumentNameIndex[requiredArgName];
        if (values[index] === undefined) {
            throw new Error("function " + func.name + " is missing required parameter \"" + requiredArgName + "\"");
        }
    }
}

function generateUuid() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getUrlParam(param) {
    let urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param) === null ? undefined : urlParams.get(param);
}

function throttled(delay, fn) {
    let lastCall = 0;
    return function (...args) {
        const now = (new Date).getTime();
        if (now - lastCall < delay) {
            return;
        }
        lastCall = now;
        return fn(...args);
    }
}

function stdErrorHandler(fnName, err) {
    if (err) {
        alert(fnName + ' error. See console log for details');
        throw new Error(fnName + ' error:\n' + err);
    }
}
class Dao {
    constructor() {
        AWS.config.region = S3_REGION; // Region
        AWS.config.credentials = new AWS.CognitoIdentityCredentials({
            IdentityPoolId: COGNITO_IDENTITY_POOL_ID,
        });

        this.s3 = new AWS.S3({apiVersion: AWS_SDK_API_VERSION});
        this.bucket = S3_BUCKET_NAME;
        this.stateDir = S3_ONLINE_GAMEPLAY_DIR;
    }

    putObject(key, value, fn) {
        this.put(key, JSON.stringify(value), function (err) {
            if (fn !== undefined) {
                fn(err);
            }
        });
    }

    put(key, value, fn) {
        let self = this;

        this.s3.putObject({
            Bucket: this.bucket + '/' + this.stateDir,
            Key: key,
            ContentType: 'application/json; charset=utf-8',
            Body: value
        }, function(err) {
            if (fn !== undefined) {
                fn(err);
            }
        });

    }

    get(key, fn) {
        let self = this;
        this.s3.getObject({Bucket : this.bucket + '/' + this.stateDir, Key: key}, function (err, data) {
            if (fn !== undefined) {
                fn(err, data);
            }
        });
    }
}
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
        }, function (err) {
            stdErrorHandler('createGameRecord', err);
        });

        this.putObject(gameId + '-log', [], function(err) {
            stdErrorHandler('createGameRecord', err);
        });
    }

    /**
     * Reset the game log for the online game.
     * @param gameId the game identifier
     * @param callback the callback function to call after the game is reset
     */
    resetGame(gameId, callback) {
        this.put(gameId + '-log', JSON.stringify([]), function (err) {
            if (err) {
                stdErrorHandler('resetGame', err);
            } else {
                callback();
            }
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
                stdErrorHandler('setupPlayerAndDealCards', err);
            } else {
                let gameDetail = JSON.parse(data.Body.toString('utf-8'));

                gameDetail['players'][playerId]['playerName'] = name;
                gameDetail['players'][playerId]['ready'] = true;
                gameDetail['players'][playerId]['complete'] = false;

                self.put(gameId, JSON.stringify(gameDetail), function (err, data) {
                    if (err) {
                        stdErrorHandler('setupPlayerAndDealCards', err);
                    } else {
                        callback(gameDetail['cardIds'].map(cid => fnGetCardById(cid)));
                    }
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
                stdErrorHandler('loadGameForPlayer', err);
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
     * @param callback the callback function to call with the game detail upon success
     */
    setPlayerReady(gameId, playerId, callback) {
        let self = this;
        this.get(gameId, function (err, data) {
            if (err) {
                stdErrorHandler('setPlayerReady', err);
            } else {
                let gameDetail = JSON.parse(data.Body.toString('utf-8'));
                gameDetail['players'][playerId]['ready'] = true;
                self.put(gameId, JSON.stringify(gameDetail), function (err) {
                    if (err) {
                        stdErrorHandler('setPlayerReady', err);
                    } else {
                        callback();
                    }
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
        await sleep(GAME_LOG_POLL_SLEEP_MS);

        let self = this;

        if (count >= MAX_GAME_LOG_POLL_ITERATIONS) {
            fnTimeout();
            return;
        }

        this.get(gameId + '-log', async function (err, data) {
            if (err) {
                stdErrorHandler('pollForGameLog', err);
            } else {
                let gameLog = JSON.parse(data.Body.toString('utf-8'));
                //console.log('polling for game log %o', gameLog);

                let index = self.gameLogReadIndex === -1 ? 0 : self.gameLogReadIndex;
                let playCatchUp = index === 0;
                console.log('wait count %d game log %o',count, gameLog);
                if (index < gameLog.length) {
                    count = -1; // new chunk of game log to read reset count
                    self.gameLogCaughtUp = false;
                    for (let i = index; i < gameLog.length; i++) {
                        let logEntry = gameLog[i];

                        // Don't handle the click from the game log if it was a local click
                        if (self.localBrowserTurns.has(index)) {
                            console.log('not replaying history entry ' + index + ' from ' + logEntry['player'] +
                                ' of ' + logEntry['cardId'] + ' because it was a local click');
                        } else {
                            fnReplayHandler(logEntry, index);
                            await sleep(GAME_LOG_CARD_FLIP_SLEEP_MS);
                        }
                        index++
                    }

                    self.gameLogReadIndex = index;
                    self.gameLogCaughtUp = true;
                } else if (gameLog.length === 0) {
                    self.gameLogCaughtUp = true;
                }

                if (!fnTerminationCondition()) {
                    await self.pollForGameLog(gameId, fnReplayHandler, fnTerminationCondition, fnTimeout, ++count);
                } else {
                    return;
                }
            }
        });
    }

    /**
     * Mark a game complete for a player.
     * @param gameId the game the player is playing
     * @param playerId the player to mark the game complete
     */
    markGameCompleteForPlayer(gameId, playerId) {
        let self = this;
        this.get(gameId, async function (err, data) {
            if (err) {
                stdErrorHandler('markGameCompleteForPlayer', err);
            } else {
                let gameDetail = JSON.parse(data.Body.toString('utf-8'));
                gameDetail['players'][playerId]['complete'] = true;

                self.put(gameId, JSON.stringify(gameDetail), function (err) {
                    if (err) {
                        alert('markGameCompleteForPlayer error. See console log for details');
                        throw new Error('markGameCompleteForPlayer error:\n' + err);
                    }
                })
            }
        });
    }

    /**
     * Wait for the game to wrap up for all players so that it can be restarted if desired.
     * @param gameId the game id that is being waited on
     * @param playerId the player doing the waiting
     * @param callback the callback function when the game is wrapped up
     * @param count counter used to break out of the wait recursion
     */
    waitForGameWrapUp(gameId, playerId, callback, count = 0) {
        let self = this;
        this.get(gameId, async function (err, data) {
            if (err) {
                stdErrorHandler('waitForGameWrapUp', err);
            }

            if (count >= GAME_WRAP_UP_ITERATIONS) {
                let msg = "waitForGameWrapUp error. See console log for details.";
                alert(msg);
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
                if (playerId === 1) {
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
                callback();

            } else {
                self.waitForGameWrapUp(gameId, playerId, callback, ++count);
            }

        });
    }

    /**
     * Record a card flip in the centralized store so that it can be replayed for each of the players.
     * @param gameId the game id
     * @param currentPlayer the player flipping the card
     * @param turn which turn it is
     * @param cardId the id of the card being flipped
     * @param count counter used to break out of the polling once it reaches a certain threshold
     */
    logCardFlip(gameId, currentPlayer, turn, cardId, count = 0) {
        let self = this;
        this.get(gameId + '-log', async function (err, data) {
            if (count >= LOG_CARD_FLIP_RETRIES) {
                let msg = 'logCardFlip error: Gave up after ' + LOG_CARD_FLIP_RETRIES + ' retries';
                alert(msg);
                throw new Error(msg);
                return;
            }
            if (err) {
                console.log('logCardFlip error. Get of gamelog failed retrying with count ' + count);
                let sleepFactor = Math.abs(parseInt(turn) - (gameLog.length -1));
                await sleep(sleepFactor * GAME_LOG_CATCH_UP_SLEEP_MS);
                return self.logCardFlip(gameId, currentPlayer, turn, cardId, ++count);
            } else {
                let gameLog = JSON.parse(data.Body.toString('utf-8'));
                if (turn > 0 && !gameLog[turn - 1]) {
                    let sleepFactor = Math.abs(parseInt(turn) - (gameLog.length -1));
                    console.log('can not write out index ' + turn + ' when index ' + (turn -1) +
                        ' is missing. Sleeping ' + sleepFactor + '*' + GAME_LOG_CATCH_UP_SLEEP_MS +
                        ' seconds and then checking again');
                    await sleep(sleepFactor * GAME_LOG_CATCH_UP_SLEEP_MS);
                    return self.logCardFlip(gameId, currentPlayer, turn, cardId, ++count);
                }

                gameLog[turn] = {player : currentPlayer, cardId : cardId};

                self.putObject(gameId + '-log', gameLog);
            }
        })
    }

    /**
     * Poll for players to be ready to play the game.
     * @param gameId the game id
     * @param currentPlayer the current player
     * @param fnSuccess the callback function called when all players are ready
     * @param fnTimeout the callback function called if the polling has timed out
     * @param fnPlayerReady the callback function called when an individual player is ready
     * @param count count variable used to decide when to timeout
     * @param joinNotifications hash that stores what players have been processed
     * @returns {Promise<void>} nothing
     */
    async pollForPlayersReady(gameId,
                              currentPlayer,
                              fnSuccess,
                              fnTimeout,
                              fnPlayerReady,
                              count = 0,
                              joinNotifications = {}) {
        await sleep(POLL_PLAYERS_DELAY);

        let self = this;
        this.get(gameId, async function(err, data) {
            if (err) {
                stdErrorHandler('pollForPlayersReady', err);
            } else {
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
                    await self.pollForPlayersReady(gameId, currentPlayer, fnSuccess, fnTimeout, fnPlayerReady, ++count, joinNotifications);
                } else {
                    fnSuccess(gameId, currentPlayer);
                }
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
        if (playerId !== parseInt(playerId)) {
            stdErrorHandler('setCurrentPlayer', 'playerId must be an integer');
        }
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
class Element {
    constructor(document, tag, id, cssClass, innerText, attributes) {
        validateRequiredParams(this.constructor, arguments, 'document', 'tag');
        this.document = document;
        this.tag = tag;
        this.id = id;
        this.class = cssClass;
        this.innerText = innerText;
        this.attributes = attributes;

        this.node = this.createElement();
    }

    createElement() {
        let element = this.document.createElement(this.tag);
        if (this.id !== undefined) {
            element.id = this.id;
        }
        if (this.class !== undefined) {
            element.className = this.class;
        }
        if (this.innerText !== undefined) {
            element.innerText = this.innerText;
        }
        if (Object.keys(this.attributes).length > 0) {
            for (let key of Object.keys(this.attributes)) {
                element.setAttribute(key, this.attributes[key]);
            }
        }
        return element;
    }

    appendChild(element) {
        // The append does not work for "body" or "head" unless the document is used. Not sure why
        if (this.tag === BODY_TAG) {
            this.document.body.appendChild(element.node);
        } else if (this.tag === HEAD_TAG) {
            this.document.head.appendChild(element.node);
        } else {
            this.node.appendChild(element.node);
        }
        return this;
    }
}
class ElementBuilder {
    constructor(document) {
        this.document = document;
        this.tag = undefined;
        this.id = undefined;
        this.class = undefined;
        this.innerText = undefined;
        this.attributes = {};
    }

    withTag(tag) {
        validateRequiredParams(this.withTag, arguments, 'tag');
        this.tag = tag;
        return this;
    }

    withId(id) {
        validateRequiredParams(this.withId, arguments, 'id');
        this.id = id;
        return this;
    }

    withClass(cssClass) {
        validateRequiredParams(this.withClass, arguments, 'cssClass');
        this.class = cssClass;
        return this;
    }

    withInnerText(text) {
        validateRequiredParams(this.withInnerText, arguments, 'text');
        this.innerText = text;
        return this;
    }

    withAttribute(name, value) {
        validateRequiredParams(this.withAttribute, arguments, 'name', 'value');
        this.attributes[name] = value;
        return this;
    }

    build() {
        return new Element(this.document, this.tag, this.id, this.class, this.innerText, this.attributes);
    }
}
// Online game S3 config
const COGNITO_IDENTITY_POOL_ID = 'us-east-1:5c67bf62-755c-41f2-8ddf-a0a0ceea6a18';
const S3_REGION = 'us-east-1';
const S3_BUCKET_NAME = 'concentrationgame';
const S3_ONLINE_GAMEPLAY_DIR = 'state';

// Online game config
const AWS_SDK_API_VERSION = '2006-03-01';
const POLL_PLAYERS_DELAY = 5000;
const POLL_PLAYERS_ITERATIONS = 60;
const MAX_GAME_LOG_POLL_ITERATIONS = 30;
const GAME_LOG_POLL_SLEEP_MS = 5000;
const GAME_LOG_CARD_FLIP_SLEEP_MS = 2000;
const GAME_LOG_CATCH_UP_SLEEP_MS = 2000;
const LOG_CARD_FLIP_RETRIES = 20;
const LOG_CARD_FLIP_RETRY_DELAY = 100;
const GAME_WRAP_UP_DELAY_MS = 5000;
const GAME_WRAP_UP_ITERATIONS = 100;
const GAME_RESET_NON_OWNER_DELAY = 10000;

// Game config
const CARD_FLIP_DELAY_MS = 1500;
const MAX_PLAYERS = 4;
const PREVIEW_IMG_WIDTH = 1300;
const PLAYER_FORM_WIDTH = 1000;
const CARD_FLIP_ANIMATION_TIME_MS = 500;
const VIEW_PORT_SCALING_FUDGE_FACTOR = 50;


// DOM constants
const BODY_TAG = 'body';
const HEAD_TAG = 'head';
const FORM_TAG = 'form';
const H2_TAG = 'h2';
const H3_TAG = 'h3';
const DIV_TAG = 'div';
const INPUT_TAG = 'input';
const SELECT_TAG = 'select';
const OPTION_TAG = 'option';
const BREAK_TAG = 'br';
const ANCHOR_TAG = 'a';
const STYLE_TAG = 'style';
const SPAN_TAG = 'span';
const IMAGE_TAG = 'img';
const PARAGRAPH_TAG = 'p';
const STRONG_TAG = 'strong';

// Css constants
const FRONT_ID_SUFFIX = 'FRONT';
const BACK_ID_SUFFIX = 'BACK';

// Top level DOM elements
const GAMEBOARD_ELEMENT = new ElementBuilder(document).withTag(DIV_TAG)
    .withAttribute('style', 'display : none')
    .withClass('gameBoard').build();
const BODY_ELEMENT = new ElementBuilder(document).withTag(BODY_TAG).build();
const HEAD_ELEMENT = new ElementBuilder(document).withTag(HEAD_TAG).build();
/**
 * Handles image rendering for a particular card using a single image that has all the cards.
 */
class CardImage {
    constructor(id, width, height, image, isFaceUp, imgOffsetX, imgOffsetY, faceDownOffsetX, faceDownOffsetY,
                clickableClass) {
        validateRequiredParams(this.constructor, arguments, 'id', 'height', 'width', 'image', 'imgOffsetX','imgOffsetY',
            'faceDownOffsetX', 'faceDownOffsetY', 'clickableClass');
        this.id = id;
        this.height = height;
        this.width = width;
        this.image = image;
        this.isFaceUp = isFaceUp;
        this.imgOffsetX = imgOffsetX;
        this.imgOffsetY = imgOffsetY;
        this.faceDownCardXOffset = -1 * (faceDownOffsetX * width);
        this.faceDownCardYOffset = -1 * (faceDownOffsetY * height);
        this.clickableClass = clickableClass;
    }

    /**
     * Creates the css and html needed to display a single card from the big image with all the cards given a particular
     * x and y offset into the image.
     * @param document the DOM document
     * @param xPixelOffset the number of pixels to offset horizontally to find the card
     * @param yPixelOffset the number of pixels to offset vertically to find the card
     */
    renderCssAndHtml(document, xPixelOffset, yPixelOffset) {
        validateRequiredParams(this.renderCssAndHtml, arguments, 'document', 'xPixelOffset', 'yPixelOffset');

        HEAD_ELEMENT.appendChild(this.getCssElement(document,
            FRONT_ID_SUFFIX,
            this.imgOffsetX,
            this.imgOffsetY,
            xPixelOffset,
            yPixelOffset));
        HEAD_ELEMENT.appendChild(this.getCssElement(document,
            BACK_ID_SUFFIX,
            this.faceDownCardXOffset,
            this.faceDownCardYOffset,
            xPixelOffset,
            yPixelOffset));

        // remove the node before creating to handle redraw events
        $('#' + this.id).remove();

        GAMEBOARD_ELEMENT.appendChild(new ElementBuilder(document)
            .withTag(DIV_TAG)
            .withClass(this.clickableClass)
            .withId(this.id).build()
            .appendChild(new ElementBuilder(document)
                .withTag(DIV_TAG)
                .withId(this.id + '-FRONT').build())
            .appendChild(new ElementBuilder(document)
                .withTag(DIV_TAG)
                .withId(this.id + '-BACK').build()));

    }

    getCssElement(document, suffix, offsetX, offsetY, xPixelOffset, yPixelOffset) {
        let rotateY = suffix === FRONT_ID_SUFFIX ? '-180' : '0';

        return new ElementBuilder(document).withTag(STYLE_TAG)
            .withInnerText('#' + this.id + '-' + suffix + '{' +
                'height: ' + this.height + 'px;' +
                'width: ' + this.width + 'px;' +
                'background-image: url(' + this.image + ');' +
                'background-position: ' + offsetX + 'px ' + offsetY + 'px;' +
                'position: absolute;' +
                'top: ' + yPixelOffset + 'px;' +
                'left: ' + xPixelOffset + 'px;' +
                'transform: rotateY(' + rotateY + 'deg);' +
                'backface-visibility: hidden;' +
                'transition: transform ' + (CARD_FLIP_ANIMATION_TIME_MS/1000) + 's linear 0s;' +
            '}').build();
    }

    /**
     * Sets the card face down.
     */
    setFaceDown() {
        this.setOffset(this.faceDownCardXOffset, this.faceDownCardYOffset);
        this.isFaceUp = false;
        $(this).attr('data-click-state', 0);
        this.animateFlip(this.id, true);
    }

    /**
     * Sets the card face up.
     */
    setFaceUp() {
        this.setOffset(this.imgOffsetX, this.imgOffsetY);
        this.isFaceUp = true;
        $(this).attr('data-click-state', 1)
        this.animateFlip(this.id, false);
    }

    /**
     * Get the height of the card
     * @returns {number}
     */
    getWidth() {
        return this.width;
    }

    /**
     * Get the width of the card
     * @returns {number}
     */
    getHeight() {
        return this.height;
    }

    /* private */
    setOffset(xOffset, yOffset) {
        $('.' + this.id).css('background-position', xOffset + 'px ' + yOffset + 'px');
    }

    /* private */
    animateFlip(id, isFlippingToFront) {
        let rotateYFront = isFlippingToFront ? '-180' : '0';
        let rotateYBack = isFlippingToFront ? '0' : '180';
        $('#' + id + '-FRONT').css('transform', 'rotateY(' + rotateYFront + 'deg)');
        $('#' + id + '-BACK').css('transform', 'rotateY(' + rotateYBack + 'deg)');
    }
}
/**
 * Class that represents any game card.
 */
class Card {
    constructor(id, x, y, faceDownX, faceDownY, width, height, image, clickableClass) {
        this.id = id;
        this.isFaceUp = false;
        this.width = width;
        this.height = height;

        this.cardImage = new CardImageBuilder()
            .withId(id)
            .withWidth(width)
            .withHeight(height)
            .withImage(image)
            .withImgOffsetX(-1 * x * width)
            .withImgOffsetY(-1 * y * height)
            .withFaceDownOffsetX(faceDownX)
            .withFaceDownOffsetY(faceDownY)
            .withClickableClass(clickableClass).build();
    }

    /**
     * Get the id of the card.
     * @returns {string} the card id
     */
    getId() {
        return this.id;
    }

    /**
     * Get the width of a card.
     * @returns {number}
     */
    getWidth() {
        return this.width;
    }

    /**
     * Get the height of a card.
     * @returns {number}
     */
    getHeight() {
        return this.height;
    }

    /**
     * Sets a card face down.
     */
    setFaceDown() {
        this.cardImage.setFaceDown();
        this.isFaceUp = false;
    }

    /**
     * Sets a card face up.
     */
    setFaceUp() {
        this.cardImage.setFaceUp();
        this.isFaceUp = true;
    }

    /**
     * Determines if the card is face up.
     * @returns {boolean} true if the card is face up, false otherwise
     */
    getIsFaceUp() {
        return this.isFaceUp;
    }

    /**
     * Render this card at a particular position on the screen.
     * @param document the DOM document
     * @param x the x position to render the card
     * @param y the y position to render the card.
     */
    renderCard(document, x, y) {
        validateRequiredParams(this.renderCard, arguments, 'document', 'x', 'y');
        this.getCardImage().renderCssAndHtml(document,
            x * this.getCardImage().getWidth(),
            y * this.getCardImage().getHeight());
    }

    /* friend of GameBoard */
    getCardImage() {
        return this.cardImage;
    }
}
/**
 * Class that represents a playing card.
 */
class PlayingCard extends Card {
    constructor(rank, suit, x, y, clickableClass) {
        super(rank + '-' + suit,
            x,
            y,
            0   ,
            4,
            100,
            146,
            PlayingCardDeck.PLAYING_CARD_IMAGE, clickableClass);
        validateRequiredParams(this.constructor, arguments, 'rank', 'suit', 'x', 'y', 'clickableClass');
        this.rank = rank;
        this.suit = suit;
    }

    /**
     * Determines if the other card is a match with this card.
     * @param otherCard the other card to compare to this card for a match
     */
    isMatch(otherCard) {
        return this.rank === otherCard.rank && this.isBlackSuit() === otherCard.isBlackSuit();
    }

    /* private */
    isBlackSuit() {
        return this.suit === CLUBS || this.suit === SPADES;
    }
}
/**
 * Class that represents a playing card.
 */
class PictureCard extends Card {
    constructor(animal, number, x, y, clickableClass) {
        super(animal + '-' + number,
            x,
            y,
            0,
            6,
            116,
            114,
            PictureCardDeck.PICTURE_CARD_IMAGE, clickableClass);
        validateRequiredParams(this.constructor, arguments, 'animal', 'number', 'x', 'y', 'clickableClass');
        this.animal = animal;
        this.number = number;
    }

    /**
     * Determines if the other card is a match with this card.
     * @param otherCard the other card to compare to this card for a match
     */
    isMatch(otherCard) {
        return this.animal === otherCard.animal;
    }
}
/**
 * Builder for the CardImage object.
 */
class CardImageBuilder {
    constructor() {
        this.id = undefined;
        this.height = undefined;
        this.width = undefined;
        this.image = undefined;
        this.isFaceUp = false;
        this.imgOffsetX = undefined;
        this.imgOffsetY = undefined;
        this.faceDownOffsetX = undefined;
        this.faceDownOffsetY = undefined;
        this.clickableClass = undefined;
    }

    withId(id) {
        validateRequiredParams(this.withId, arguments, 'id');
        this.id = id;
        return this;
    }

    withHeight(height) {
        validateRequiredParams(this.withHeight, arguments, 'height');
        this.height = height;
        return this;
    }

    withWidth(width) {
        validateRequiredParams(this.withWidth, arguments, 'width');
        this.width = width;
        return this;
    }

    withImage(image) {
        validateRequiredParams(this.withImage, arguments, 'image');
        this.image = image;
        return this;
    }

    withImgOffsetX(imgOffsetX) {
        validateRequiredParams(this.withImage, arguments, 'image');
        this.imgOffsetX = imgOffsetX;
        return this;
    }

    withImgOffsetY(imgOffsetY) {
        validateRequiredParams(this.withImgOffsetY, arguments, 'imgOffsetY');
        this.imgOffsetY = imgOffsetY;
        return this;
    }

    withFaceDownOffsetX(x) {
        this.faceDownOffsetX = x;
        return this;
    }

    withFaceDownOffsetY(y) {
        this.faceDownOffsetY = y;
        return this;
    }

    withClickableClass(clickableClass) {
        this.clickableClass = clickableClass;
        return this;
    }

    build() {
        return new CardImage(this.id, this.width, this.height, this.image, this.isFaceUp, this.imgOffsetX,
            this.imgOffsetY, this.faceDownOffsetX, this.faceDownOffsetY, this.clickableClass);
    }
}
class Deck {
    constructor(cards, numberOfCardsInDeck, image) {
        this.cards = cards;
        this.numberOfCardsInDeck = numberOfCardsInDeck;
        // Keep index from card id to card for random access card lookup by id
        this.cardIndex = {};

        for (let card of cards) {
            this.indexCard(card);
        }

        this.image = image;
    }

    /**
     * Get a card by id.
     * @param id the unique id for the card
     * @returns {PlayingCard} the card with the specified id
     */
    getCardById(id) {
        return this.cardIndex[id];
    }

    /**
     * Deal the cards.
     * @returns {[PlayingCard]} the deck of cards
     */
    getCards() {
        return this.cards;
    }

    /**
     * Get the height of a card.
     * @returns {number}
     */
    getCardHeight() {
        return this.dealTopCard().getHeight();
    }

    /**
     * Get the width of a card.
     * @returns {number}a
     */
    getCardWidth() {
        return this.dealTopCard().getWidth();
    }

    /**
     * Shuffle the deck of cards.
     */
    shuffleCards() {
        let currentIndex = this.cards.length;

        // while there remain cards to shuffle
        while (currentIndex != 0) {

            // Pick a remaining card
            let randomIndex = Math.floor(Math.random() * currentIndex--);

            // And swap it with the current card.
            [this.cards[currentIndex], this.cards[randomIndex]] = [this.cards[randomIndex], this.cards[currentIndex]];
        }
    }

    /**
     * Get the number of cards being used.
     * @returns {number} the number of cards being used
     */
    getNumberOfCards() {
        return this.cards.length;
    }

    /**
     * Get the number of cards in the deck.
     * @returns {number} the number of cards in the deck
     */
    getNumberOfCardsInDeck() {
        return this.numberOfCardsInDeck;
    }

    /* private */
    indexCard(card) {
        this.cardIndex[card.getId()] = card;
    }

    /* private */
    dealTopCard() {
        return this.cards[0];
    }
}
const A = 'A';
const TWO = 'TWO';
const THREE = 'THREE';
const FOUR = 'FOUR';
const FIVE = 'FIVE';
const SIX = 'SIX';
const SEVEN = 'SEVEN';
const EIGHT = 'EIGHT';
const NINE = 'NINE';
const TEN = 'TEN';
const J = 'J';
const K = 'K';
const Q = 'Q';

const SPADES = 'SPADES';
const HEARTS = 'HEARTS';
const DIAMONDS = 'DIAMONDS';
const CLUBS = 'CLUBS';

/**
 * Class that models a deck of playing cards.
 */
class PlayingCardDeck extends Deck {
    static PLAYING_CARD_IMAGE = '../images/decks/playing_cards.png';

    constructor(numberOfCards, clickableClass) {
        super(PlayingCardDeck.dealCards(numberOfCards, clickableClass),
            PlayingCardDeck.getNumberOfCardsInDeck(),
            PlayingCardDeck.PLAYING_CARD_IMAGE);
        this.numberOfCards = numberOfCards;
    }

    validateNumberOfCards(numSelected) {
        let numCardsInDeck = PlayingCardDeck.getNumberOfCardsInDeck();
        if (this.numberOfCards !== 2 &&
            (this.numberOfCards / 2 % 2 !== 0 || numSelected < 0 || numSelected > numCardsInDeck)) {
            throw new Error("In order for there to be an even number of matches you must use between 2 and "
                + numCardsInDeck + " cards. There must be an even number of pairs cards.");
        }
    }

    /**
     * Get the deck image
     * @returns {string} the url of the deck image
     */
    static getDeckImage() {
        return PlayingCardDeck.PLAYING_CARD_IMAGE;
    }


    /**
     * Get the maximum number of cards in the deck.
     */
    static getNumberOfCardsInDeck() {
        return PlayingCardDeck.getSuits().length * PlayingCardDeck.getRanks().length;
    }

    static getSuits() {
        return [SPADES, CLUBS, DIAMONDS, HEARTS];
    }

    static getRanks() {
        return [A, TWO, THREE, FOUR, FIVE, SIX, SEVEN, EIGHT, NINE, TEN, J, Q, K];
    }

    static dealCards(numberOfCards, clickableClass) {
        let cards = [];
        const suits = this.getSuits();
        const ranks = this.getRanks();

        main_loop:
        for (let y = 0; y < suits.length; y++) {
            let suit = suits[y];
            for (let x = 0; x < ranks.length; x++) {
                let rank = ranks[x];
                let card = new PlayingCard(rank, suit, x, y, clickableClass);
                cards.push(card);

                // We may not be using a full deck

                // Are there any cards left
                if (cards.length >= numberOfCards) {
                    break main_loop;
                }

                // Make sure we only use 1/4 the number of cards from each suit so that there will be matches. For
                // example if there are 4 cards we want to grab two aces and two twos.
                if ((x + 1) * suits.length >= numberOfCards) {
                    break;
                }
            }
        }
        return cards;
    }
}
const BIRD = 'BIRD';
const PENGUIN = 'PENGUIN';
const HORSE = 'HORSE';
const PANDA = 'PANDA';
const DOG = 'DOG';
const TORTOISE = 'TORTOISE';
const BEE = 'BEE';
const MONKEY = 'MONKEY'
const SQUIRREL = 'SQUIRREL';
const PIG = 'PIG';
const DRAGONFLY = 'DRAGONFLY';
const COCK = 'COCK';
const ELEPHANT = 'ELEPHANT';
const LION = 'LION';
const OSTRICH = 'OSTRICH';
const WOLF = 'WOLF';
const SNAIL = 'SNAIL';
const DEER = 'DEER';
const RABBIT = 'RABBIT';
const RACCOON = 'RACCOON';
const CATTLE = 'CATTLE';
const PEAFOWL = 'PEAFOWL';
const ANT = 'ANT';
const KANGAROO = 'KANGAROO';
const DUCK = 'DUCK';
const HIPPO = 'HIPPO';
const CAT = 'CAT';
const SHEEP = 'SHEEP';
const SHARK = 'SHARK';
const STARFISH ='STARFISH';
const FISH = 'FISH';
const FOX = 'FOX';
const GIRAFFE = 'GIRAFFE';
const OCTOPUS = 'OCTOPUS';
const CRAB = 'CRAB';
const OWL = 'OWL';

/**
 * Class that models a deck of picture cards.
 */
class PictureCardDeck extends Deck {
    static PICTURE_CARD_IMAGE = '../images/decks/picture_cards.png';

    constructor(numberOfCards, clickableClass) {
        super(PictureCardDeck.dealCards(numberOfCards, clickableClass),
            PictureCardDeck.getNumberOfCardsInDeck(),
            PlayingCardDeck.PLAYING_CARD_IMAGE);
        this.numberOfCards = numberOfCards;
    }

    validateNumberOfCards(numSelected) {
        let numCardsInDeck = PictureCardDeck.getNumberOfCardsInDeck();
        if (this.numberOfCards % 2 !== 0 || numSelected < 0 || numSelected > numCardsInDeck) {
            throw new Error("In order to play with a picture card deck you must use between 2 and " + numCardsInDeck +
                " cards. There must be an even number of cards.");
        }
    }

    /**
     * Get the deck image
     * @returns {string} the url of the deck image
     */
    static getDeckImage() {
        return PictureCardDeck.PICTURE_CARD_IMAGE;
    }

    /**
     * Get the maximum number of cards in the deck
     */
    static getNumberOfCardsInDeck() {
        let cardRows = PictureCardDeck.getAnimals();
        return 2 * cardRows.reduce(function(count, row) {
            return count + row.length;
        }, 0);
    }

    static getAnimals() {
        return [
            [BIRD, PENGUIN, HORSE, PANDA, DOG, TORTOISE],
            [BEE, MONKEY, SQUIRREL, PIG, DRAGONFLY, COCK],
            [ELEPHANT, LION, OSTRICH, WOLF, SNAIL, DEER],
            [RABBIT, RACCOON, CATTLE, PEAFOWL, ANT, KANGAROO],
            [DUCK, HIPPO, CAT, SHEEP, SHARK, STARFISH],
            [FISH, FOX, GIRAFFE, OCTOPUS, CRAB, OWL]
        ];
    }

    static dealCards(numberOfCards, clickableClass) {
        let cardRows = this.getAnimals();
        let cards = [];
        main_loop:
        for (let y = 0; y < cardRows.length; y++) {
            for (let x = 0; x < cardRows[y].length; x++) {
                let animal = cardRows[y][x];
                let card1 = new PictureCard(animal, "ONE", x, y, clickableClass);
                let card2 = new PictureCard(animal, "TWO", x, y, clickableClass);
                cards.push(card1);
                cards.push(card2);

                // Are there any cards left
                if (cards.length >= numberOfCards) {
                    break main_loop;
                }

                // Make sure we only use 1/6 the number of cards from each row so that there will be matches. For
                // example if there are 4 cards we want to grab two birds and two penguins.
                if ((x + 1) * 2 * cardRows.length >= numberOfCards) {
                    break;
                }
            }
        }
        return cards;
    }
}
/**
 * Main class to render card game
 */
class GameBoard {
    constructor(numberOfCards, deckType, clickableClass) {
        validateRequiredParams(this.constructor, arguments, 'numberOfCards', 'deckType', 'clickableClass');
        this.numberOfCards = numberOfCards;
        this.deckType = deckType;
        this.clickableClass = clickableClass;

        this.deck = this.getDeckByType(deckType, numberOfCards);


        this.numberOfRows = this.getNumOfRowsThatMakesBiggestRectangle();
        this.numberOfCardsPerRow = this.numberOfCards / this.numberOfRows;
    }

    /**
     * Renders the shuffled deck on the grid.
     * @param document the dom document
     */
    renderGameBoard(document) {
        validateRequiredParams(this.renderGameBoard, arguments, 'document');

        let cards = this.deck.getCards();
        let gridPositions = this.buildGrid();

        let gridPositionIndex = 0;
        for (let card of cards) {
            card.setFaceDown();
            $('.' + card.getId()).css('display', 'block');
            let x = gridPositions[gridPositionIndex]['x'];
            let y = gridPositions[gridPositionIndex]['y'];
            card.renderCard(document, x, y);
            gridPositionIndex++;
        }
    }

    /**
     * Get the number of cards used on the game board
     * @returns {number}
     */
    getNumberOfCards() {
        return this.numberOfCards;
    }

    /**
     * Remove a set of cards from the game board.
     * @param card1 the fist card
     * @param card2 the second matching card
     */
    removeCards(cards) {
        for (let card of cards) {
            $('#' + card.getId()).css('display', 'none');
        }
    }

    /**
     * Get the deck used for the game board.
     * @returns {Deck}
     */
    getDeck() {
        return this.deck;
    }

    /**
     * Get the number of rows on the game bord.
     * @returns {number} the number of rows
     */
    getNumberOfRows() {
        return this.numberOfRows;
    }

    /**
     * Get the number of cards per row on the game bord.
     * @returns {number} the number of cards per row
     */

    getNumberOfCardsPerRow() {
        return this.numberOfCardsPerRow;
    }

    /* private */
    getDeckByType(deckType, numberOfCards) {
        let deck = undefined;
        switch(deckType) {
            case 'picture':
                deck = new PictureCardDeck(numberOfCards, this.clickableClass);
                break;
            case 'playing':
            default :
                deck = new PlayingCardDeck(numberOfCards, this.clickableClass);
        }

        return deck;
    }

    /* private */
    buildGrid() {
        let gridPositions = [];
        for (let y = 0; y < this.numberOfRows; y++) {
            for (let x = 0; x < this.numberOfCardsPerRow; x++) {
                gridPositions.push({x : x, y : y});
            }
        }
        return gridPositions;
    }

    /* private */
    getNumOfRowsThatMakesBiggestRectangle() {
        // Let n be the number of cards n = a*b . We want to minimize b - a so that a and b are as large as possible.
        // It follows that a is the largest divisor that is less than or equal to the square root.
        let a = Math.floor(Math.sqrt(this.numberOfCards));
        while(this.numberOfCards % a !== 0) {
            a--;
        }
        return a;
    }
}
/**
 * Builder for the GameBoard object.
 */
class GameBoardBuilder {
    constructor() {
        this.numberOfCards = undefined;
        this.deckType = undefined;
        this.clickableClass = undefined;
    }

    withNumberOfCards(numberOfCards) {
        this.numberOfCards = numberOfCards;
        return this;
    }

    withDeckType(type) {
        this.deckType = type;
        return this;
    }

    withClickableClass(clickableClass) {
        this.clickableClass = clickableClass;
        return this;
    }

    build() {
        return new GameBoard(this.numberOfCards, this.deckType, this.clickableClass);
    }
}
/**
 * Class that handles a player in the game.
 */
class Player {
    constructor(playerName, playerNumber) {
        validateRequiredParams(this.constructor, arguments, 'playerName', 'playerNumber');
        // Set of card ids that the player has matched
        this.matches = [];
        this.firstCard = undefined;
        this.playerName = playerName;
        this.playerNumber = playerNumber;
        this.numberOfTries = 0;
    }

    /**
     * Get the player number
     * @returns {Number} the player number
     */
    getPlayerNumber() {
        return this.playerNumber;
    }

    /**
     * Gets the players name.
     * @returns {String}
     */
    getPlayerName() {
        return this.playerName;
    }

    /**
     * Get the number of matches a player has.
     * @returns {number}
     */
    getNumberOfMatches() {
        return this.matches.length;
    }

    /**
     * Gets the player's current score.
     * @returns {number} the current score
     */
    getScore() {
        return this.matches.length / 2;
    }

    /**
     * Get the number of attempts the player has made.
     * @returns {number} the number of tries
     */
    getNumberOfTries() {
        return this.numberOfTries;
    }

    /**
     * Takes a turn for the player. Returns the set of cards they have flipped in this turn.
     * @param card the card the player has flipped
     * @returns {[String]} all of the cards the player has flipped in this turn
     */
    takeTurn(card) {
        let selections = undefined;
        if (this.firstCard === undefined || this.firstCard.getId() === card.getId()) {
            this.firstCard = card;
            selections = [card];
        } else {
            this.numberOfTries++;
            selections = [this.firstCard, card];

            if (this.firstCard.isMatch(card)) {
                this.matches = this.matches.concat([this.firstCard.getId(), card.getId()]);
            }

            // Player has selected two cards, clear state since the turn is over
            this.firstCard = undefined;
        }
        return selections;
    }
}
/**
 * Class for playing classic concentration game.
 */
class Game {
    constructor(onlineGamePlay, type, numberOfCards, clickableClass, gameResetClass, scoreBoardPlayerPrefixClass) {
        validateRequiredParams(this.constructor, arguments, 'onlineGamePlay', 'type', 'numberOfCards', 'clickableClass',
            'gameResetClass', 'scoreBoardPlayerPrefixClass');
        this.gameBoard = new GameBoardBuilder()
            .withDeckType(type)
            .withNumberOfCards(numberOfCards)
            .withClickableClass(clickableClass).build();

        this.deckType = type;
        this.players = [];
        this.playerTurnIndex = 0;
        this.scoreBoard = undefined;
        this.gameResetClass = gameResetClass;
        this.scoreBoardPlayerPrefixClass = scoreBoardPlayerPrefixClass;
        this.turnCounter = 0;
        // Keep track of the card pair selections that are waiting to be flipped back over or removed after a match
        // attempt. This way if the player makes a new selection before the time delay they can proceed without having
        // to wait and the actions that would happen after the timeout will happen immediately.
        this.pendingFlipOrRemovel = new Set();
        this.numberOfCardsMatched = 0;
        this.numberOfCards = numberOfCards;
        this.onlineGamePlay = onlineGamePlay;
        this.matchPending = false;
    }

    /**
     * Play the game.
     * @param document the DOM document
     */
    play(document) {
        validateRequiredParams(this.play, arguments, 'document');

        let self = this;
        let gameId = getUrlParam('gameId');
        let playerId = getUrlParam('playerId');
        this.getGameBoard().getDeck().shuffleCards();

        if (gameId !== undefined) {

            let currentPlayer = playerId === undefined ? 1 : parseInt(playerId);
            this.onlineGamePlay.setCurrentPlayer(currentPlayer);

            if (playerId === undefined) {
                let cards = this.getGameBoard().getDeck().getCards();

                let cardIds = [];
                for (let card of cards) {
                    cardIds.push(card.getId());
                }

                this.onlineGamePlay.createGameRecord(gameId, this.players.length, this.deckType, this.numberOfCards, this.players, cardIds);
                let getUrl = window.location;
                let baseUrl = getUrl.protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[1];
                window.history.replaceState( {} , '', baseUrl + '?gameId=' + gameId + '&playerId=1');

            } else {
                let name = $('.playerName' + playerId).find('input').val();
                name = name.length > 0 ? name : 'Player ' + playerId;
                this.onlineGamePlay.setupPlayerAndDealCards(gameId, playerId, name,
                    function(cardId) {
                        return self.gameBoard.getDeck().getCardById(cardId);
                },
                    function(cards) {
                        self.gameBoard.deck.cards = cards;
                        self.gameBoard.renderGameBoard(document);
                });
            }
        } else {
            this.onlineGamePlay.setCurrentPlayer(1);
            this.onlineGamePlay.setAllPlayersReady(true);
            this.onlineGamePlay.setGameLogCaughtUp(true);
        }


        this.getScoreBoard().updateStats(this.getCurrentPlayer());
        this.getGameBoard().renderGameBoard(document);
    }

    /**
     * Handle the attempted flip of a card by a player.
     * @param card the card that a player attempted to flip
     */
    takePlayerTurn(card) {
        this.handlePendingFlipsOrRemovals();
        if (card.getIsFaceUp()) {
            return;
        }
        this.turnCounter++;
        card.setFaceUp();
        let chosenCards = this.getCurrentPlayer().takeTurn(card);
        if (chosenCards.length > 1) {
            this.pendingFlipOrRemovel.add(chosenCards);
        }
        if (chosenCards.length > 1) {
            this.matchPending = true;
        }
        this.doCardsMatch(chosenCards) ? this.handleMatch(chosenCards) : this.handleFailedMatch(chosenCards);
    }

    /**
     * Gets the game board used by this game.
     * @returns {GameBoard} the game board
     */
    getGameBoard() {
        return this.gameBoard;
    }

    /**
     * Gets the score board used by this game.
     * @returns {ScoreBoard} the score board
     */
    getScoreBoard() {
        return this.scoreBoard;
    }

    /**
     * Adds players to the game.
     * @param players array of Player objects to add
     */
    addPlayers(players) {
        validateRequiredParams(this.addPlayers, arguments, 'players');
        this.players = this.players.concat(players);
        this.scoreBoard = new ScoreBoard(this.players, this.scoreBoardPlayerPrefixClass);
    }

    /* private */
    getCurrentPlayer() {
        return this.players[this.playerTurnIndex];
    }

    /* private */
    nextTurn() {
        let isLastPlayer = this.playerTurnIndex >= this.players.length - 1;
        this.playerTurnIndex = isLastPlayer ? 0 : this.playerTurnIndex + 1;
        this.scoreBoard.updateStats(this.getCurrentPlayer());
    }

    /* private */
    isGameOver() {
        return this.numberOfCardsMatched >= this.numberOfCards;
    }

    /* private */
    handleGameOver() {
        this.pendingFlipOrRemovel = new Set();
        this.scoreBoard.displayWinners(this.getWinningPlayers());

        let gameId = getUrlParam('gameId');
        let playerId = parseInt(getUrlParam('playerId'));

        $('.' + this.gameResetClass).css('display', 'inline-block');
        if (gameId !== undefined) {
            this.onlineGamePlay.markGameCompleteForPlayer(gameId, playerId);

            $('.' + this.gameResetClass).find('input').prop('disabled', true);
            $('.' + this.gameResetClass).find('input').val('Waiting for game to wrap up for other players');

            this.onlineGamePlay.waitForGameWrapUp(gameId, playerId, function() {
                $('.gameOver').find('input').prop('disabled', false);
                $('.gameOver').find('input').val('Play again!');
            });
        }
    }

    /* private */
    getWinningPlayers() {
        let maxScore = Math.max.apply(Math,this.players.map(function(p){return p.getScore();}));
        return this.players.filter(player => player.getScore() === maxScore);
    }

    /* private */
    handleFailedMatch(cards) {
        if (cards.length < 2) {
            return;
        }
        let self = this;
        this.nextTurn();
        setTimeout(function() {
            self.pendingFlipOrRemovel.delete(cards);
            self.setSelectionFaceDown(cards);
            self.matchPending = false;
        }, CARD_FLIP_DELAY_MS)

    }

    /* private */
    handleMatch(cards) {
        this.scoreBoard.updateStats(this.getCurrentPlayer());
        let self = this;
        this.numberOfCardsMatched += 2;
        setTimeout(function () {
            self.getGameBoard().removeCards(cards);
            if (self.isGameOver()) {
                self.handleGameOver();
            }
            self.matchPending = false;
        }, CARD_FLIP_DELAY_MS);
    }

    /* private */
    setSelectionFaceDown(cards) {
        for (let card of cards) {
            card.setFaceDown();
        }
    }

    /* private */
    doCardsMatch(cards) {
        return cards.length > 1 && cards[0].isMatch(cards[1]);
    }

    /* private */
    handlePendingFlipsOrRemovals() {
        if (this.pendingFlipOrRemovel.size > 0) {
            for (let pendingMatches of this.pendingFlipOrRemovel) {
                if (this.doCardsMatch(pendingMatches)) {
                    this.getGameBoard().removeCards(pendingMatches);
                } else {
                    this.setSelectionFaceDown(pendingMatches);
                }
            }
        }
    }
}
// Set class names used in callbacks as constants since the class (this pointer) won't be available in the callback
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
        this.invitationClass = 'invitation';
        this.invitationLinkClass = 'invitationLink';

        this.scalingDimension = undefined;

        this.onlineGamePlay = new OnlineGamePlay();

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
            .withInvitationLInkClass(this.invitationLinkClass).build();
    }

    /**
     * Handle events related to the control flow of the forms used to configure and start the game.
     * @param document the DOM document
     */
    handleEvents(document) {

        // Handle specific settings for online game play
        this.handleOnlineGamePlay();

        // Handle changes to the number of players
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

        let deckMetaData = GameConfigController.getDeckMetadata(gameDetail['deckType']);
        img.attr('src', deckMetaData['image']);

        $('input[name="' + NUMBER_OF_CARDS_TO_USE_NAME + '"]').val(gameDetail['numberOfCards']);
        $('input[name="' + NUMBER_OF_CARDS_TO_USE_NAME + '"]').attr('disabled', true);

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
            self.waitForPlayers(getUrlParam('gameId'), parseInt(getUrlParam('playerId')))
        });
    }

    /* private */
    handleWaitTurnRestart() {
        let self = this;
        $('.' + this.waitLongerForTurnButtonClass).click(function(e) {
            $('.' + self.waitLongerForTurnContainer).css('display', 'none');
            self.pollForGameLog(getUrlParam('gameId'));
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
            if (parseInt($('.' + self.numPlayersSelectorClass).val()) === 1) {
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

                let numPlayers = parseInt($('.' + self.numPlayersSelectorClass).val());

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
                    $('.' + self.invitationLinkClass + i).css('display', 'block');
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
            if (gameId !== undefined && playerTurn !== parseInt(currentPlayer)) {
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

        let deckMetadata = GameConfigController.getDeckMetadata(this.getFormDeckType());
        input.val(deckMetadata['numberOfCards']);
        img.attr('src', deckMetadata['image']);
        img.attr('width', PREVIEW_IMG_WIDTH + 'px');
    }

    /* private */
    static getDeckMetadata(deckType) {
        let numberOfCards = undefined;
        let image = undefined;
        switch(deckType) {
            case 'picture':
                numberOfCards = PictureCardDeck.getNumberOfCardsInDeck();
                image = PictureCardDeck.getDeckImage();
                break;
            case 'playing':
                numberOfCards = PlayingCardDeck.getNumberOfCardsInDeck;
                image = PlayingCardDeck.getDeckImage();
                break;
            default:
                throw new Error(deckType +  ' is an unknown deck type');
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

        let gameId = getUrlParam('gameId');

        if (gameId !== undefined) {
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
        let gameId = getUrlParam('gameId');

        let card = this.getGame().getGameBoard().getDeck().getCardById(clickedCardId);


        if (gameId !== undefined && this.game.matchPending) {
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

        if (gameId !== undefined) {
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
        if (currentPlayer !== 1) {
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
class GameConfigView {
    constructor(gameOptionsFormClass, gameOptionsSubmitButtonClass, deckTypeSelectorClass,
                playerNameSubmitButtonClass, gameResetClass, numPlayersSelectorClass, numberOfCardsToUseName,
                scoreBoardPlayerPrefixClass, playerNamePrefixClass, nameInputPrefixClass, playerNameForm,
                scoreBoardForm, playOnlineCheckboxName, waitLongerContainerClass, waitLongerButtonClass,
                waitLongerForTurnContainer, waitLongerForTurnButtonClass, waitingContainerClass, waitingOnClass,
                invitationClass, invitationLinkClass) {
        validateRequiredParams(this.constructor, arguments, 'gameOptionsFormClass', 'gameOptionsSubmitButtonClass',
            'deckTypeSelectorClass', 'playerNameSubmitButtonClass', 'gameResetClass', 'numPlayersSelectorClass',
            'numberOfCardsToUseName', 'scoreBoardPlayerPrefixClass', 'playerNamePrefixClass', 'nameInputPrefixClass',
            'playerNameForm', 'scoreBoardForm', 'playOnlineCheckboxName', 'waitLongerContainerClass',
            'waitLongerButtonClass', 'waitLongerForTurnContainer', 'waitLongerForTurnButtonClass',
            'waitingContainerClass', 'waitingOnClass', 'invitationClass', 'invitationLinkClass');
        this.gameOptionsFormClass = gameOptionsFormClass;
        this.gameOptionsSubmitButtonClass = gameOptionsSubmitButtonClass;
        this.deckTypeSelectorClass = deckTypeSelectorClass;
        this.playerNameSubmitButtonClass = playerNameSubmitButtonClass;
        this.gameResetClass = gameResetClass;
        this.numPlayersSelectorClass = numPlayersSelectorClass;
        this.numberOfCardsToUseName = numberOfCardsToUseName;
        this.scoreBoardPlayerPrefixClass = scoreBoardPlayerPrefixClass;
        this.playerNamePrefixClass = playerNamePrefixClass;
        this.nameInputPrefixClass = nameInputPrefixClass;
        this.playerNameForm = playerNameForm;
        this.scoreBoardForm = scoreBoardForm;
        this.playOnlineCheckboxName = playOnlineCheckboxName;
        this.waitLongerContainerClass = waitLongerContainerClass;
        this.waitLongerButtonClass = waitLongerButtonClass;
        this.waitLongerForTurnContainer = waitLongerForTurnContainer;
        this.waitLongerForTurnButtonClass = waitLongerForTurnButtonClass;
        this.waitingContainerClass = waitingContainerClass;
        this.waitingOnClass = waitingOnClass;
        this.invitationClass = invitationClass;
        this.invitationLinkClass = invitationLinkClass;
    }

    /**
     * Generate the forms used to configure the game.
     * @param document the DOM document
     */
    buildGameControlForms(document) {
        validateRequiredParams(this.buildGameControlForms, arguments, 'document');
        this.withTitleTag(document)
            .withNavBar(document)
            .withGameOptionsForm(document)
            .withPlayerForm(document)
            .withScoreBoardContent(document)
        BODY_ELEMENT.appendChild(GAMEBOARD_ELEMENT);
    }

    /* private */
    withScoreBoardContent(document) {
        let div = new ElementBuilder(document)
            .withClass(this.scoreBoardForm)
            .withAttribute('style', 'display: none')
            .withTag(DIV_TAG).build();
        for (let i = 1; i <= MAX_PLAYERS; i++) {
            div.appendChild(new ElementBuilder(document).withTag(DIV_TAG)
                .withClass(this.scoreBoardPlayerPrefixClass + i)
                .withAttribute("style","display: none;")
                .withInnerText('Player ' + i + ': 0 matches').build());
        }

        let invitationDiv = new ElementBuilder(document).withTag(DIV_TAG)
            .withAttribute('style', 'display: none')
            .withClass(this.invitationClass).build();

        invitationDiv.appendChild(new ElementBuilder(document).withTag(STRONG_TAG)
            .withInnerText('Invitation Links').build());

        for (let i = 2; i <= MAX_PLAYERS; i++) {
            invitationDiv.appendChild(new ElementBuilder(document).withTag(DIV_TAG)
                .withAttribute('style', 'display: none')
                .withClass(this.invitationLinkClass + i).build())
        }

        div.appendChild(invitationDiv);

        let waitingDiv = new ElementBuilder(document)
            .withTag(DIV_TAG)
            .withClass(this.waitingContainerClass)
            .withAttribute('style', 'display: none').build()
            .appendChild(new ElementBuilder(document).withTag(STRONG_TAG)
                .withInnerText('Waiting for:').build());

        for (let i = 1; i <= MAX_PLAYERS; i++) {
            waitingDiv.appendChild(new ElementBuilder(document)
                .withTag(SPAN_TAG)
                .withClass(this.waitingOnClass + i).build());
        }

        div.appendChild(waitingDiv);

        let waitLongerDiv = new ElementBuilder(document).withTag(DIV_TAG)
            .withClass(this.waitLongerContainerClass)
            .withAttribute('style', 'display: none')
            .withInnerText('Gave up waiting   ').build()
            .appendChild(new ElementBuilder(document)
                .withTag(INPUT_TAG)
                .withClass(this.waitLongerButtonClass)
                .withAttribute('type', 'button')
                .withAttribute('value', 'Wait longer').build());

        div.appendChild(waitLongerDiv);

        let waitLongerForTurnContainer = new ElementBuilder(document).withTag(DIV_TAG)
            .withClass(this.waitLongerForTurnContainer)
            .withAttribute('style', 'display: none')
            .withInnerText('Gave up waiting for turn to be taken   ').build()
            .appendChild(new ElementBuilder(document)
                .withTag(INPUT_TAG)
                .withClass(this.waitLongerForTurnButtonClass)
                .withAttribute('type', 'button')
                .withAttribute('value', 'Wait longer').build());

        div.appendChild(waitLongerForTurnContainer);

        div.appendChild(new ElementBuilder(document)
            .withTag(DIV_TAG)
            .withClass(this.gameResetClass)
            .withAttribute('style', 'display: none;').build()
            .appendChild(new ElementBuilder(document)
                .withTag(INPUT_TAG)
                .withAttribute('type', 'button')
                .withAttribute('value', 'Play again!').build()));

        BODY_ELEMENT.appendChild(div);
        return this;
    }

    /* private */
    withTitleTag(document) {
        BODY_ELEMENT.appendChild(new ElementBuilder(document)
            .withTag(H2_TAG)
            .withInnerText('Classic Concentration Memory Game').build());
        return this;
    }

    /* private */
    withNavBar(document) {
        BODY_ELEMENT.appendChild(new ElementBuilder(document).withTag(DIV_TAG)
            .withClass('navBar').build()
            .appendChild(new ElementBuilder(document).withTag(ANCHOR_TAG)
                .withAttribute('href', '/concentration.html')
                .withInnerText('New Game').build()));
        return this;
    }

    /* private */
    withGameOptionsForm(document) {
        validateRequiredParams(this.withGameOptionsForm, arguments, 'document');

        let form = new ElementBuilder(document).withTag(FORM_TAG)
            .withClass(this.gameOptionsFormClass)
            // Force hard coded width that can be used as a reference to scale for mobile viewing
            .withAttribute('style', 'width: ' + PREVIEW_IMG_WIDTH + 'px')
            .build();
        this.withNumberOfPlayersSelect(document, form)
            .withPlayOnlineCheckbox(document, form)
            .withDeckTypeSelect(document, form)
            .withNumberOfCardsInput(document, form)
            .withGameOptionsSubmit(document, form)
            .withDeckPreviewImage(document, form)

        BODY_ELEMENT.appendChild(form);
        return this;
    }

    withPlayOnlineCheckbox(document, form) {
        let div = new ElementBuilder(document)
            .withTag(DIV_TAG).build()
            .appendChild(new ElementBuilder(document)
                .withTag(SPAN_TAG).withInnerText('Play online?').build())
            .appendChild(new ElementBuilder(document)
                .withTag(INPUT_TAG)
                .withAttribute('type', 'checkbox')
                .withAttribute('name', this.playOnlineCheckboxName).build());
        form.appendChild(div);
        return this;
    }

    /* private */
    withDeckPreviewImage(document, form) {
        form
            .appendChild(new ElementBuilder(document)
                .withTag(H3_TAG).build()
                .appendChild(new ElementBuilder(document)
                    .withTag(SPAN_TAG)
                    .withInnerText('Deck Preview').build()))
            .appendChild(new ElementBuilder(document)
                .withTag(IMAGE_TAG).build());
        return this;
    }

    /* private */
    withGameOptionsSubmit(document, form) {
        form
            .appendChild(new ElementBuilder(document)
                .withTag(SPAN_TAG).build()
                .appendChild(new ElementBuilder(document)
                    .withTag(INPUT_TAG)
                    .withClass(this.gameOptionsSubmitButtonClass)
                    .withAttribute("type", "button")
                    .withAttribute("value", "Play!").build()));
        return this;
    }

    /* private */
    withNumberOfCardsInput(document, form) {
        form
            .appendChild(new ElementBuilder(document).withTag(DIV_TAG).build()
                .appendChild(new ElementBuilder(document)
                    .withTag(SPAN_TAG)
                    .withInnerText('How many cards?').build())
                .appendChild(new ElementBuilder(document).withTag(INPUT_TAG)
                    .withAttribute("type", "text")
                    .withAttribute("name", this.numberOfCardsToUseName)
                    .withAttribute("size", "2").build()));
        return this;
    }

    /* private */
    withDeckTypeSelect(document, form) {
        let deckTypeSelect = new ElementBuilder(document)
                .withTag(SELECT_TAG)
                .withClass(this.deckTypeSelectorClass).build()
            .appendChild(new ElementBuilder(document)
                .withTag(OPTION_TAG)
                .withAttribute('value', 'playing')
                .withInnerText('Playing Deck').build())
            .appendChild(new ElementBuilder(document)
                .withTag(OPTION_TAG)
                .withAttribute('value', 'picture')
                .withInnerText('Picture Deck').build());

        form
            .appendChild(new ElementBuilder(document).withTag(DIV_TAG).build()
                .appendChild(new ElementBuilder(document)
                    .withTag(SPAN_TAG)
                    .withInnerText('What type of deck?').build())
                .appendChild(deckTypeSelect));
        return this;
    }

    /* private */
    withNumberOfPlayersSelect(document, form) {
        let numPlayersSelect = new ElementBuilder(document)
            .withTag(SELECT_TAG)
            .withClass(this.numPlayersSelectorClass).build();

        for (let i = 1; i <= MAX_PLAYERS; i++) {
            numPlayersSelect.appendChild(new ElementBuilder(document)

                .withTag(OPTION_TAG)
                .withAttribute('value', i)
                .withInnerText(i).build());
        }

        form
            .appendChild(new ElementBuilder(document).withTag(DIV_TAG).build()
                .appendChild(new ElementBuilder(document)
                    .withTag(SPAN_TAG)
                    .withInnerText('How many players?').build())
                .appendChild(numPlayersSelect))
        return this;
    }

    /* private */
    withPlayerForm(document) {
        validateRequiredParams(this.withPlayerForm, arguments, 'document');

        let form = new ElementBuilder(document)
            .withClass(this.playerNameForm)
            // Force hard coded width that can be used as a reference to scale for mobile viewing
            .withAttribute('style', 'display: none; width: ' + PLAYER_FORM_WIDTH + 'px')
            .withTag("form").build();

        for (let i = 1; i <= MAX_PLAYERS; i++) {
            form.appendChild(new ElementBuilder(document)
                .withTag(DIV_TAG)
                .withClass(this.playerNamePrefixClass + i)
                .withAttribute("style", "display: none;").build()
                .appendChild(new ElementBuilder(document).withTag(SPAN_TAG)
                .withInnerText("Player " + i + ' name:').build())
                .appendChild(new ElementBuilder(document)
                    .withTag(INPUT_TAG).withClass(this.nameInputPrefixClass + i)
                    .withAttribute("type", "text")
                    .build()))
        }

        form
            .appendChild(new ElementBuilder(document)
                .withTag(INPUT_TAG)
                .withClass(this.playerNameSubmitButtonClass)
                .withAttribute("style", "display: none")
                .withAttribute("type", "button")
                .withAttribute("name", "playerNames")
                .withAttribute("value", "submit").build());

        BODY_ELEMENT.appendChild(form);
        return this;
    }
}
class GameConfigViewBuilder {

    constructor() {
        this.gameOptionsSubmitButtonClass = undefined;
        this.gameOptionsFormClass = undefined;
        this.deckTypeSelectorClass = undefined;
        this.playerNameSubmitClass = undefined;
        this.gameResetClass = undefined;
        this.numPlayersSelectorClass = undefined;
        this.numberOfCardsToUseName = undefined;
        this.scoreBoardPlayerPrefixClass = undefined;
        this.playerNamePrefixClass = undefined;
        this.nameInputPrefixClass = undefined;
        this.playerNameForm = undefined;
        this.scoreBoardForm = undefined;
        this.playOnlineCheckboxName = undefined;
        this.waitLongerContainerClass = undefined;
        this.waitLongerButtonClass = undefined;
        this.waitLongerForTurnContainer = undefined;
        this.waitLongerForTurnButtonClass = undefined;
        this.waitingContainerClass = undefined;
        this.waitingOnClass = undefined;
        this.invitationClass = undefined;
        this.invitationLinkClass = undefined;

    }

    withPlayOnlineCheckboxName(playOnlineCheckboxName) {
        this.playOnlineCheckboxName = playOnlineCheckboxName;
        return this;
    }

    withScoreBoardForm(scoreBoardForm) {
        this.scoreBoardForm = scoreBoardForm;
        return this;
    }

    withPlayerNameForm(playerNameForm) {
        this.playerNameForm = playerNameForm;
        return this;
    }

    withNameInputPrefixClass(nameInputPrefixClass) {
        this.nameInputPrefixClass = nameInputPrefixClass;
        return this;
    }

    withPlayerNameSubmitClass(playerNameSubmitClass) {
        this.playerNameSubmitClass = playerNameSubmitClass;
        return this;
    }

    withDeckTypeSelectorClass(deckTypeClass) {
        this.deckTypeSelectorClass = deckTypeClass;
        return this;
    }

    withGameOptionsSubmitButtonClass(gameOptionsSubmitButtonClass) {
        this.gameOptionsSubmitButtonClass = gameOptionsSubmitButtonClass;
        return this;
    }

    withGameOptionsFormClass(gameOptionsFormClass) {
        this.gameOptionsFormClass = gameOptionsFormClass;
        return this;
    }

    withGameResetClass(gameResetClass) {
        this.gameResetClass = gameResetClass;
        return this;
    }

    withNumPlayersClass(numPlayersSelectorClass) {
        this.numPlayersSelectorClass = numPlayersSelectorClass;
        return this;
    }

    withNumberOfCardsToUseName(numberOfCards) {
        this.numberOfCardsToUseName = numberOfCards;
        return this;
    }

    withPlayerPrefixClass(prefix) {
        this.scoreBoardPlayerPrefixClass = prefix;
        return this;
    }

    withPlayerNamePrefixClass(prefix) {
        this.playerNamePrefixClass = prefix;
        return this;
    }

    withWaitLongerContainerClass(waitClass) {
        this.waitLongerContainerClass = waitClass;
        return this;
    }

    withWaitLongerButtonClass(waitButton) {
        this.waitLongerButtonClass = waitButton;
        return this;
    }

    withWaitLongerForTurnContainer(waitClass) {
        this.waitLongerForTurnContainer = waitClass;
        return this;
    }

    withWaitLongerForTurnButtonClass(waitButton) {
        this.waitLongerForTurnButtonClass = waitButton;
        return this;
    }

    withWaitingContainerClass(waitingContainerClass) {
        this.waitingContainerClass = waitingContainerClass;
        return this;
    }

    withWaitingOnClass(waitingOnClass) {
        this.waitingOnClass = waitingOnClass;
        return this;
    }

    withInvitationClass(invitationClass) {
        this.invitationClass = invitationClass;
        return this;
    }

    withInvitationLInkClass(invitationLinkClass) {
        this.invitationLinkClass = invitationLinkClass;
        return this;
    }

    build() {
        return new GameConfigView(this.gameOptionsFormClass, this.gameOptionsSubmitButtonClass,
            this.deckTypeSelectorClass, this.playerNameSubmitClass, this.gameResetClass, this.numPlayersSelectorClass,
            this.numberOfCardsToUseName, this.scoreBoardPlayerPrefixClass, this.playerNamePrefixClass,
            this.nameInputPrefixClass, this.playerNameForm, this.scoreBoardForm, this.playOnlineCheckboxName,
            this.waitLongerContainerClass, this.waitLongerButtonClass, this.waitLongerForTurnContainer,
            this.waitLongerForTurnButtonClass, this.waitingContainerClass, this.waitingOnClass, this.invitationClass,
            this.invitationLinkClass);
    }
}
class ScoreBoard {
    constructor(players, scoreBoardPlayerPrefixClass) {
        validateRequiredParams(this.constructor, 'players', 'scoreBoardPlayerPrefixClass')
        this.players = players;
        this.scoreBoardPlayerPrefixClass = scoreBoardPlayerPrefixClass;
    }

    /**
     * Highlights the player name of the current player.
     * @param player the player that should be highlighted in the score board
     */
    updateStats(highlightedPlayer) {
        for (let player of this.players) {
            let scoreBoardEntry = undefined;
            if (player.getPlayerNumber() === highlightedPlayer.getPlayerNumber()) {
                scoreBoardEntry = '<strong>&gt;&gt;' + player.getPlayerName() + '&lt;&lt;   </strong>';
            } else {
                scoreBoardEntry = player.getPlayerName();
            }
            scoreBoardEntry = scoreBoardEntry + ' ' + player.getScore() + ' matches in ' + player.getNumberOfTries()
                + ' turns';
            $('.' + this.scoreBoardPlayerPrefixClass + player.getPlayerNumber()).html(scoreBoardEntry);
        }
    }

    /**
     * Display the winning player on the scoreboard.
     * @param winningPlayers the array of winning player
     */
    displayWinners(winningPlayers) {
        for (let winningPlayer of winningPlayers) {
            let scoreBoardEntry = winningPlayer.getPlayerName() +
                ' <strong class="winner" style="color: #00ff00;"> is the winner!</strong> ' +
                    winningPlayer.getScore() + ' matches in ' + winningPlayer.getNumberOfTries() + ' turns';
            $('.' + this.scoreBoardPlayerPrefixClass + winningPlayer.getPlayerNumber()).html(scoreBoardEntry);
        }
    }

    /**
     * Hide the scoreboard.
     */
    hideScoreboard() {
        for (let player of this.players) {
            $('.' + this.scoreBoardPlayerPrefixClass + player.getPlayerNumber()).css('display', 'none');
        }
    }
}
