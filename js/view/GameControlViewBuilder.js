class GameControlViewBuilder {

    constructor() {
        this.gameOptionsSubmitButtonClass = undefined;
        this.gameOptionsFormClass = undefined;
        this.deckTypeClass = undefined;
        this.playerNameSubmitClass = undefined;
        this.gameResetClass = undefined;
        this.numPlayersSelectClass = undefined;
        this.numberOfCardsToUseName = undefined;
        this.scoreBoardPlayerPrefixClass = undefined;
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

    withNumPlayersClass(numPlayersSelectClass) {
        this.numPlayersSelectClass = numPlayersSelectClass;
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

    build() {
        return new GameControlView(this.gameOptionsFormClass, this.gameOptionsSubmitButtonClass,
            this.deckTypeClass, this.playerNameSubmitClass, this.gameResetClass, this.numPlayersSelectClass,
            this.numberOfCardsToUseName, this.scoreBoardPlayerPrefixClass, this.playerNamePrefixClass);
    }
}
