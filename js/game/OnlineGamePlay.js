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
                console.log('==> game detail: %o',gameDetail);
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
        console.log('load game for player ' + playerId + ' game id ' + gameId);
        this.get(gameId, function(err, data) {
            if (err) {
                alert('Error polling for players ' + err.message + ', see console log for details');
                console.log('error: %o', err);
            } else {
                let gameDetail = JSON.parse(data.Body.toString('utf-8'));
                console.log('gameDetail %o', gameDetail);
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
                        $('.playerName' + pid).find('input').val(name + ' (game owner)');
                        $('.playerName' + pid).find('input').attr('disabled', true);
                    } else {
                        $('.playerName' + pid).find('input').val('');
                    }
                }
            }
        })
    }

    logCardFlip(gameId, currentPlayer, cardId) {
        let self = this;
        this.get(gameId + '-log', function (err, data) {
            if  (err) {
                alert('Error polling for players ' + err.message + ', see console log for details');
                console.log('error: %o', err);
            } else {
                let gameLog = JSON.parse(data.Body.toString('utf-8'));
                console.log('==> found game log: %o', gameLog);
                gameLog.push({player : currentPlayer, cardId : cardId});
                self.put(gameId + '-log', JSON.stringify(gameLog), function (err) {
                    console.log('==> error writing to game log %o', err);
                });
            }
        })
    }

    async pollForPlayersReady(gameId, gameController, count = 0) {
        console.log('count ' + count);
        await this.sleep(5000);

        if (count >= 60) {
            alert('Waited ' + (60*5 / 60) + ' minutes for players to join, giving up');
            return;
        }

        let self = this;
        this.get(gameId, function(err, data) {
            if (err) {
                alert('Error polling for players ' + err.message + ', see console log for details');
                console.log('error: %o', err);
            } else {
                let gameDetail = JSON.parse(data.Body.toString('utf-8'));
                console.log('==> game detail: %o', gameDetail);
                let playerIds = Object.keys(gameDetail.players);
                let allPlayersReady = true;
                for (let id of playerIds) {
                    if (gameDetail.players[id]['ready'] === false) {
                        allPlayersReady = false;
                    } else {
                        gameController.game.players[id - 1]['playerName'] = gameDetail.players[id]['playerName'];
                        console.log('want to update player ' + id + ', players: %o', gameController.game.players);
                        let name = gameDetail.players[id]['playerName'] + ' 0 matches in 0 turns';
                        let nameOnForm = $('.player' + id).text().replace(/(<([^>]+)>)/gi, "");
                        nameOnForm = nameOnForm.replace('>>', '');
                        nameOnForm = nameOnForm.replace('<<', '');
                        nameOnForm = nameOnForm.replace(/\s\s+/g, ' ');
                        if (name !== nameOnForm) {
                            console.log('setting ' + nameOnForm + ' to ' + name);

                            console.log('==> currentPlayer %o', $('.currentPlayer'));
                            console.log($('input[name=currentPlayer]').val()  + '!== ' + id)
                            alert(gameDetail.players[id]['playerName'] + ' has joined!');

                            console.log('"' + name + '" !== "' + nameOnForm + '"');
                            if ($('input[name=currentPlayer]').val() !== id) {
                                if (id === '1') {

                                    $('.player' + id).html('<strong>&gt;&gt;' + gameDetail.players[id]['playerName'] + '&lt;&lt;</strong> 0 matches in 0 turns');
                                } else {
                                    $('.player' + id).text(name);

                                }
                                $('.name' + id).val(gameDetail.players[id]['playerName']);
                            }

                        }
                    }
                }
                console.log('==> players: %o', gameDetail.players);
                if (!allPlayersReady) {
                    count++;
                    self.pollForPlayersReady(gameId, gameController, count);
                } else {
                    console.log('all players are ready');
                    $('input[name=allPlayersReady]').val(1);

                    self.pollForGameLog(gameId, gameController);
                }
            }
        });
    }

    async pollForGameLog(gameId, gameController) {
        await this.sleep(5000);

        let self = this;

        this.get(gameId + '-log', async function (err, data) {
            if (err) {
                alert('Error polling for players ' + err.message + ', see console log for details');
                console.log('error: %o', err);
            } else {
                let gameLog = JSON.parse(data.Body.toString('utf-8'));

                let index = $('input[name=gameLogReadIndex]').val();
                let currentPlayer = $('input[name=currentPlayer]').val();
                let playCatchUp = index === '0';
                //if (playCatchUp) {
                //    console.log('playing catch up on game log %o',gameLog);
                //}
                if (index < gameLog.length) {
                    for (let i = index; i < gameLog.length; i++) {
                        let logEntry = gameLog[i];
                        console.log('processing entry: %o of %o', logEntry, gameLog);
                        let replayCurrentPlayerHistory = playCatchUp && !(index === '0' && currentPlayer === '1');
                        if (!replayCurrentPlayerHistory && currentPlayer === logEntry['player']) {
                        } else {
                            console.log('replaying click from ' + logEntry['player'] + ' of ' + logEntry['cardId']);
                            gameController.handleCardClick(logEntry['cardId'], logEntry['player'], false);
                            await self.sleep(2000);
                        }
                        index++

                    }
                    console.log('==> marking new index as ' + (index));
                    $('input[name=gameLogReadIndex]').val(index);
                }

                if (!gameController.game.isGameOver()) {
                    self.pollForGameLog(gameId, gameController);
                }
            }
        });


    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
