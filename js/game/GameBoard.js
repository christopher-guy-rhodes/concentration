
const DECK_IMAGE = '\'../images/deck.png\'';

/**
 * Main class to render card game
 */
class GameBoard {
    constructor(numberOfRows, numberOfCardsPerRow) {
        this.deck = new Deck();

        this.numberOfRows = numberOfRows;
        this.numberOfCardsPerRow = numberOfCardsPerRow;

        if (this.numberOfRows * this.numberOfCardsPerRow !== this.deck.getNumberOfCards()) {
            throw new Error("Found " + this.numberOfRows * this.numberOfCardsPerRow + ' cards but was expecting '
                + this.deck.getNumberOfCards());
        }

        this.gridPositions = [];
        for (let y = 0; y < this.numberOfRows; y++) {
            for (let x = 0; x < this.numberOfCardsPerRow; x++) {
                this.gridPositions.push({x : x, y : y});
            }
        }
    }

    /**
     * Renders the shuffled deck on the screen
     * @param document the dom document
     */
    renderGameBoard(document) {
        validateRequiredParams(this.renderGameBoard, 'document');
        this.deck.shuffleCards();
        this.cards = this.deck.dealCards();

        let gridPositionIndex = 0;
        for (let card of this.cards) {
            card.setFaceDown();
            $('.' + card.getId()).css('display', 'block');
            let x = this.gridPositions[gridPositionIndex]['x'];
            let y = this.gridPositions[gridPositionIndex]['y'];
            card.render(document, x, y);

            gridPositionIndex++;

        }
    }

    /**
     * Get the deck used for the game board.
     * @returns {Deck}
     */
    getDeck() {
        return this.deck;
    }
}
