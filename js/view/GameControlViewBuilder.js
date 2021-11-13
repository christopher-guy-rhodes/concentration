class GameControlViewBuilder {

    constructor() {
        this.maxPlayers = undefined;
        this.nameInputPrefixClass = undefined;
        this.gameOptionsSubmitClass = undefined;
        this.deckTypeClass = undefined;
        this.playerNameSubmitClass = undefined;
        this.gameResetClass = undefined;
        this.numPlayersClass = undefined;
        this.numberOfCardsToUseName = undefined;
        this.playerPrefixClass = undefined;
        this.playerNamePrefixClass = undefined;
    }

    withPlayerNameSubmitClass(playerNameSubmitClass) {
        this.playerNameSubmitClass = playerNameSubmitClass;
        return this;
    }

    withDeckTypeClass(deckType) {
        this.deckTypeClass = deckType;
        return this;
    }

    withGameOptionsSubmitClass(gameOptionsSubmitClass) {
        this.gameOptionsSubmitClass = gameOptionsSubmitClass;
        return this;
    }

    withNameInputPrefixClass(nameInputPrefixClass) {
        this.nameInputPrefixClass = nameInputPrefixClass;
        return this;
    }

    withMaxPlayers(maxPlayers) {
        this.maxPlayers = maxPlayers;
        return this;
    }

    withGameResetClass(gameResetClass) {
        this.gameResetClass = gameResetClass;
        return this;
    }

    withNumPlayersClass(numPlayers) {
        this.numPlayersClass = numPlayers;
        return this;
    }

    withNumberOfCardsToUseName(numberOfCards) {
        this.numberOfCardsToUseName = numberOfCards;
        return this;
    }

    withPlayerPrefixClass(prefix) {
        this.playerPrefixClass = prefix;
        return this;
    }

    withPlayerNamePrefixClass(prefix) {
        this.playerNamePrefixClass = prefix;
        return this;
    }

    build() {
        return new GameControlView(this.maxPlayers, this.nameInputPrefixClass, this.gameOptionsSubmitClass,
            this.deckTypeClass, this.playerNameSubmitClass, this.gameResetClass, this.numPlayersClass,
            this.numberOfCardsToUseName, this.playerPrefixClass, this.playerNamePrefixClass);
    }
}
