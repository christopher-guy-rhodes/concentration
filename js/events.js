// TODO: this is a mess, clean it up and add validation

// Choose player names
let game = undefined;
$('.numPlayersSub').click(function(e) {

    let value = $('.numPlayers').val();
    $('.numPlayersSelected').val(value);
    for (let i = 0; i < value; i++) {
        $('.playerName' + (i + 1)).css('display', 'block');
    }

    let numCards = $('input[name="numberOfCardsToUse"]').val();


    $('.playerForm').css('display', 'none');
    $('.playerNameSubmit').css('display', 'block');


    try {
        let type = $('.deckType').val();
        game = new Game(type, numCards);
    } catch (error) {
        alert(error.message);
        console.log("%o", error);
        $('.playerForm').css('display', 'block');
        $('.playerNameSubmit').css('display', 'none');
        for (let i = 0; i < value; i++) {
            $('.playerName' + (i + 1)).css('display', 'none');
        }
    }
});

$('.deckType').change(function(e) {
   let type = $(this).find("option:selected").attr('name');
   if (type === 'picture') {
       $('input[name="numberOfCardsToUse"]').val(72);
   } else {
       $('input[name="numberOfCardsToUse"]').val(52);
   }
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
    console.log('cardId ' + clickedCardId);
    let card = game.getGameBoard().getDeck().getCardById(clickedCardId);
    if (!card.getIsFaceUp()) {
        game.takePlayerTurn(card);
    }
});

// Handle a game restart click
$('.gameOver').click(function() {
    game.getScoreBoard().hideScoreboard();
    $('.gameOver').css('display', 'none');
    $('.numPlayers option[value="1"]').attr('selected','selected')
    $('.playerForm').css('display','block');
});

$('.playerForm').css('display','block');
$('input[name="numberOfCardsToUse"]').val('72');
