let game = undefined;
let numberOfPlayers = undefined;
let deckType = undefined;

// Handle number of players, deck type and number of cards selections
$('.gameOptionsSubmit').click(function(e) {

    numberOfPlayers = $('.numPlayers').val();
    for (let i = 0; i < numberOfPlayers; i++) {
        $('.playerName' + (i + 1)).css('display', 'block');
    }

    let numCards = $('input[name="numberOfCardsToUse"]').val();

    $('.gameOptionsForm').css('display', 'none');
    $('.playerNameSubmit').css('display', 'block');

    try {
        deckType = $('.deckType').val();
        game = new Game(deckType, numCards);
    } catch (error) {
        alert(error.message);
        console.log("%o", error);
        $('.gameOptionsForm').css('display', 'block');
        $('.playerNameSubmit').css('display', 'none');
        for (let i = 0; i < numberOfPlayers; i++) {
            $('.playerName' + (i + 1)).css('display', 'none');
        }
    }
});

// Update the number of cards to use based on the deck
$('.deckType').change(function(e) {
   if (deckType === 'picture') {
       $('input[name="numberOfCardsToUse"]').val(PictureCardDeck.getNumberOfCardsInDeck());
   } else {
       $('input[name="numberOfCardsToUse"]').val(PlayingCardDeck.getNumberOfCardsInDeck());
   }
});

// Add players and start the game
$('.playerNameSubmit').click(function(e) {
    let names = ['.name1', '.name2', '.name3', '.name4'];
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
    let card = game.getGameBoard().getDeck().getCardById(clickedCardId);
    if (!card.getIsFaceUp()) {
        game.takePlayerTurn(card);
    }
});

// Handle a game restart click
$('.gameOver').click(function() {
    game.getScoreBoard().hideScoreboard();
    $('.gameOver').css('display', 'none');
    $('.deckType options[value="' + deckType + '"]');
    $('.numPlayers option[value="'+ numberOfPlayers + '"]').attr('selected','selected');
    $('.gameOptionsForm').css('display','block');
});

$('.gameOptionsForm').css('display','block');
$('input[name="numberOfCardsToUse"]').val('72');
