const CARD_HEIGHT = 570;
const CARD_WIDTH = 390;
const DECK_IMAGE = '\'../images/deck.png\'';

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

    renderGameBoard(document) {
        this.cards = this.deck.getShuffledCards();

        let gridPositionIndex = 0;
        for (let card of this.cards) {
            this.cardImage = new CardImageBuilder()
                .withId(card.getId())
                .withWidth(CARD_WIDTH)
                .withHeight(CARD_HEIGHT)
                .withImage(DECK_IMAGE)
                .withX(this.gridPositions[gridPositionIndex]['x'] * CARD_WIDTH)
                .withY(this.gridPositions[gridPositionIndex]['y'] * CARD_HEIGHT)
                .withImgOffsetX(-1 * IMAGE_OFFSETS[card.getId()]['x'] * CARD_WIDTH)
                .withImgOffsetY(-1 * IMAGE_OFFSETS[card.getId()]['y'] * CARD_HEIGHT)
                .build();

            this.cardImage.renderCardCss(document);

            gridPositionIndex++;

        }
    }
}
