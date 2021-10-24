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
     * Sets a card face down
     */
    setFaceDown() {
        this.cardImage.setFaceUp();
        this.isFaceUp = true;
        this.flip();
    }

    /**
     * Renders the card on the screen at grid position x, y
     * @param document the dom document
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
        return this.getRank() === otherCard.getRank() && this.isBlackSuit() === otherCard.isBlackSuit();
    }

    /**
     * Determine if the suit of the card is black (CLUB or SPADE)
     * @returns {boolean} true if the suit is black, false otherwise
     */
    isBlackSuit() {
        return this.suit === CLUBS || this.suit === SPADES;
    }

    /**
     * Flip a card over.
     */
    flip() {
        this.cardImage.flip();
        this.isFaceUp = !this.isFaceUp;
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

    getIsFaceUp() {
        return this.isFaceUp;
    }
}
