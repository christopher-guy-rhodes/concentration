// Choose players and play the game
let game = new Game();
$('.numPlayers').change(function() {
    let players = [];
    for (let i = 0; i < this.value; i++) {
        players.push(new Player('Player ' + (i + 1), (i + 1)));
        $('.player' + (i + 1)).css('display', 'block')
    }
    game.addPlayers(players);
    game.play(document);
});

$(document).on('click', '.clickable', function (e) {
    if (!game.getIsFlippingLocked()) {
        let clickedCardId = $(e.target).attr('class').replace('clickable ', '');
        game.takePlayerTurn(game.getGameBoard().getDeck().getCardById(clickedCardId));
    }
});

$('.gameOver').click(function() {
    if (!game.getIsFlippingLocked()) {
        game.getScoreBoard().hideScoreboard();
        $('.gameOver').css('display', 'none');
        $('.numPlayers').val("");
        game.selectPlayers();
    }
});

game.selectPlayers();
