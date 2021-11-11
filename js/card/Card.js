/**
 * Class that represents any game card.
 */
class Card {
    constructor(id, x, y, faceDownX, faceDownY, width, height, image) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.image = image;
        this.isFaceUp = false;

        this.cardImage = new CardImageBuilder()
            .withId(this.id)
            .withWidth(width)
            .withHeight(height)
            .withImage(image)
            .withImgOffsetX(-1 * x * width)
            .withImgOffsetY(-1 * y * height)
            .withFaceDownOffsetX(faceDownX)
            .withFaceDownOffsetY(faceDownY)
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
