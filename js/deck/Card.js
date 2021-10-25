/**
 * Class that represents a playing card.
 */
class Card {
    constructor(rank, suit) {
        this.id = rank + '-' + suit;
        this.rank = rank;
        this.suit = suit;
        this.isFaceUp = false;
        this.cardImage = new CardImageBuilder()
            .withId(this.id)
            .withWidth(CARD_WIDTH)
            .withHeight(CARD_HEIGHT)
            .withImage(DECK_IMAGE)
            .withImgOffsetX(-1 * IMAGE_OFFSETS[this.id]['x'] * CARD_WIDTH)
            .withImgOffsetY(-1 * IMAGE_OFFSETS[this.id]['y'] * CARD_HEIGHT)
            .build()
    }

    /**
     * Renders the card on the screen at grid position x, y.
     * @param document the DOM document
     * @param x the x coordinate in the grid to render the card at
     * @param y the y coordinate in the grid to render the card at
     */
    render(document, x, y) {
        validateRequiredParams(this.render, arguments, 'document', 'x', 'y');
        this.cardImage.renderCssAndHtml(document, x * CARD_WIDTH, y * CARD_HEIGHT);
    }

    /**
     * Determines if the other card is a match with this card.
     * @param otherCard the other card to compare to this card for a match
     */
    isMatch(otherCard) {
        // if it is the same card it is not a match
        return this.getId() !== otherCard.getId() &&
            // if it has the same color and rank it is a match
            this.getRank() === otherCard.getRank() && this.isBlackSuit() === otherCard.isBlackSuit();
    }

    /**
     * Determine if the suit of the card is black (CLUB or SPADE).
     * @returns {boolean} true if the suit is black, false otherwise
     */
    isBlackSuit() {
        return this.suit === CLUBS || this.suit === SPADES;
    }

    /**
     * Sets a card face down.
     */
    setFaceDown() {
        this.cardImage.setFaceDown();
        this.isFaceUp = false;
    }

    /**
     * Sets a card face up.
     */
    setFaceUp() {
        this.cardImage.setFaceUp();
        this.isFaceUp = true;
    }

    /**
     * Get the id of the card.
     * @returns {string} the card id
     */
    getId() {
        return this.id;
    }

    /**
     * Get the card rank e.g. A, J, K, TWO
     * @returns {String} the card rank
     */
    getRank() {
        return this.rank;
    }

    /**
     * Get the suit of the card e.g. SPADES, DIAMONDS
     * @returns {String} the card suit
     */
    getSuit() {
        return this.suit;
    }

    /**
     * Determines if the card is face up.
     * @returns {boolean} true if the card is face up, false otherwise
     */
    getIsFaceUp() {
        return this.isFaceUp;
    }
}
