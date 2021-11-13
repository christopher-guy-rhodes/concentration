class GameControlView {
    constructor(maxPlayers, nameInputPrefixClass, gameOptionsSubmitClass, deckTypeClass, playerNameSubmitClass,
                    gameResetClass, numPlayersClass, numberOfCardsToUseName, playerPrefixClass, playerNamePrefixClass) {
        validateRequiredParams(this.constructor, arguments, 'maxPlayers', 'nameInputPrefixClass', 'gameOptionsSubmitClass',
            'deckTypeClass', 'playerNameSubmitClass', 'gameResetClass', 'numPlayersClass', 'numberOfCardsToUseName',
            'playerPrefixClass', 'playerNamePrefixClass');
        this.maxPlayers = maxPlayers;
        this.nameInputPrefixClass = nameInputPrefixClass;
        this.gameOptionsSubmitClass = gameOptionsSubmitClass;
        this.deckTypeClass = deckTypeClass;
        this.playerNameSubmitClass = playerNameSubmitClass;
        this.gameResetClass = gameResetClass;
        this.numPlayersClass = numPlayersClass;
        this.numberOfCardsToUseName = numberOfCardsToUseName;
        this.playerPrefixClass = playerPrefixClass;
        this.playerNamePrefixClass = playerNamePrefixClass;
    }

    renderForms(document) {
        this.renderContainers(document);
        this.renderPlayerForm();
        this.renderGameOptionsForm();
        this.renderScoreBoard();
        this.renderResetContent();
    }

    renderContainers(document) {
        let content =
            '<h2>Classic Concentration Memory Game</h2>' +
            '<div class="playerFormContent"></div>' +
            '<div class="gameOptionsContent"></div>' +
            '<div class="scoreBoardContent"></div>' +
            '<div class="resetContent"></div>';

        document.body.innerHTML = content;
    }

    renderPlayerForm() {
        let form = '<form method="GET" action="../game">';

        for (let i = 1; i <= this.maxPlayers; i++) {
            form +=
                '<div class="' + this.playerNamePrefixClass + i + '">' +
                'Player ' + i + ' name: <input class="' + this.nameInputPrefixClass + i + '" type="text"/>' +
                '</div>';
        }
        form += '<input class="' + this.playerNameSubmitClass + '" type="button" name="playerNames" value="submit"/>';
        form += '</form>';

        $('.playerFormContent').html(form);
    }

    renderGameOptionsForm() {
        let form =
            '<form class="gameOptionsForm" method="GET" action="./">' +
                '<input type="hidden" class="numPlayersSelected" value="0"/>' +
                'How many players?' +
                '<select class="' + this.numPlayersClass + '">';

        for (let i =1; i <= this.maxPlayers; i++) {
            form += '<option name="' + i + '" value="' + i + '">' + i + '</option>';
        }

        form +=
                '</select>' +
                '<br/><br/>What type of deck?' +
                '<select class="' + this.deckTypeClass + '">' +
                    '<option name="picture" value="picture">Picture Cards</option>' +
                    '<option name="playing" value="playing">Playing Cards</option>' +
                '</select>' +
                '<br/><br/>How many cards? <input type="text" name="' + this.numberOfCardsToUseName + '" size="4"/>' +
                '<br/><br/>' +
                '<input class="' + this.gameOptionsSubmitClass + '" type="button" name="sub" value="submit"/>' +
            '</form>';
        $('.gameOptionsContent').html(form);
    }

    renderScoreBoard() {
        let content = '';
        for (let i = 1; i < this.maxPlayers; i++) {
            content += '<div class="' + this.playerPrefixClass + i + '">Player ' + i + ': 0 matches</div>'
        }
        $('.scoreBoardContent').html(content);
    }

    renderResetContent() {
        let content = '<div class="' + this.gameResetClass + '">' +
            '<a href="#">Click to play again</a>' +
        '</div>';
        $('.resetContent').html(content);
    }

    getNameClassInputPrefix() {
        return this.nameInputPrefixClass;
    }
}
