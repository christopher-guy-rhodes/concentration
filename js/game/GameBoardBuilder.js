/**
 * Builder for the GameBoard object.
 */
class GameBoardBuilder {
    constructor() {
        this.numberOfRows = undefined;
        this.numberOfCardsPerRow = undefined;
        this.deckType = undefined;
    }

    withDeckType(type) {
        this.deckType = type;
        return this;
    }

    withNumberOfRows(numberOfRows) {
        validateRequiredParams(this.withNumberOfRows, arguments, 'numberOfRows');
        this.numberOfRows = numberOfRows;
        return this;
    }

    withNumberOfCardsPerRow(numberOfCardsPerRow) {
        validateRequiredParams(this.withNumberOfCardsPerRow, arguments, 'numberOfCardsPerRow');
        this.numberOfCardsPerRow = numberOfCardsPerRow;
        return this;
    }

    build() {
        if (this.numberOfRows === undefined || this.numberOfCardsPerRow === undefined) {
            throw new Error("GameBoardBuilder: numberOfRows and numberOfCardsPerRow are required arguments");
        }
        return new GameBoard(this.deckType, this.numberOfRows, this.numberOfCardsPerRow);
    }
}
