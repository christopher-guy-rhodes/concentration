class OnlineGamePlay extends Dao {
    constructor() {
        super();
    }

    createGameRecord(gameId, numberOfPlayers, deckType, numberOfCards, playersInput) {
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
            {numberOfPlayers : numberOfPlayers, deckType : deckType, numberOfCards: numberOfCards, players: players}));
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
                    $('.playerName' + pid).find('input').val(name);
                    if (pid !== playerId) {
                        $('.playerName' + pid).find('input').attr('disabled', true);
                    } else {
                        $('.playerName' + pid).find('input').val('');
                    }
                }
            }
        })
    }

    async pollForPlayersReady(gameId, count = 0) {
        console.log('count ' + count)
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
                        let name = gameDetail.players[id]['playerName'] + ' 0 matches in 0 turns';
                        let nameOnForm = $('.player' + id).text();
                        if (name !== nameOnForm) {
                            if($('input[name=currentPlayer]').val() !== id) {
                                console.log('setting ' + nameOnForm + ' to ' + name);

                                console.log('==> currentPlayer %o', $('.currentPlayer'));
                                console.log($('input[name=currentPlayer]').val()  + '!== ' + id)
                                alert(gameDetail.players[id]['playerName'] + ' has joined!');
                                $('.player' + id).text(name);

                            }
                        }
                    }
                }
                console.log('==> players: %o', gameDetail.players);
                if (!allPlayersReady) {
                    count++;
                    self.pollForPlayersReady(gameId, count);
                } else {
                    console.log('all players are ready');
                    $('input[name=allPlayersReady]').val(1);
                }
            }
        });
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
