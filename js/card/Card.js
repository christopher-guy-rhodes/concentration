/**
 * Class that represents any game card.
 */
class Card {
    constructor(id, x, y, image) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.image = image;
        this.isFaceUp = false;

        this.cardImage = new CardImageBuilder()
            .withId(this.id)
            .withWidth(CARD_WIDTH)
            .withHeight(CARD_HEIGHT)
            .withImage(image)
            .withImgOffsetX(x)
            .withImgOffsetY(y)
            .build();
    }

    /**
     * Get the id of the card.
     * @returns {string} the card id
     */
    getId() {
        return this.id;
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
     * Determines if the card is face up.
     * @returns {boolean} true if the card is face up, false otherwise
     */
    getIsFaceUp() {
        return this.isFaceUp;
    }

    /* friend of GameBoard */
    getCardImage() {
        return this.cardImage;
    }
}
