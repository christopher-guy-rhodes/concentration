// Choose player names
let game = new Game();
$('.numPlayers').change(function() {
    $('.numPlayersSelected').val(this.value);
    for (let i = 0; i < this.value; i++) {
        $('.playerName' + (i + 1)).css('display', 'block');
    }
    $('.playerForm').css('display', 'none');
    $('.playerNameSubmit').css('display', 'block');
});

// Add players and start the game
$('.playerNameSubmit').click(function(e) {
    let names = ['.name1', '.name2', '.name3', '.name4'];
    let numberOfPlayers = $('.numPlayersSelected').val();
    let players = [];
    for (let i = 0; i < numberOfPlayers; i++) {
        let name = names[i];
        let playerName = $(name).val();
        if (playerName.trim().length < 1) {
            playerName = 'Player ' + (i + 1);
        }
        players.push(new Player(playerName, (i + 1)));
        $('.player' + (i + 1)).css('display', 'block');
        $('.playerName' + (i + 1)).css('display', 'none');
    }
    $('.playerNameSubmit').css('display', 'none');
    game.addPlayers(players);
    game.play(document);
});


// Handle a card click
$(document).on('click', '.clickable', function (e) {
    let clickedCardId = $(e.target).attr('class').replace('clickable ', '');
    console.log('is this card face up?');
    let card = game.getGameBoard().getDeck().getCardById(clickedCardId);
    if (!card.getIsFaceUp()) {
        game.takePlayerTurn(card);
    }
});

// Handle a game restart click
$('.gameOver').click(function() {
    game.getScoreBoard().hideScoreboard();
    $('.gameOver').css('display', 'none');
    $('.numPlayers').val("");
    $('.playerForm').css('display','block');
});

$('.playerForm').css('display','block');
