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
