/**
 * Class that represents any game card.
 */
class Card {
    constructor(id, x, y, faceDownX, faceDownY, width, height, image, clickableClass) {
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
            .withClickableClass(clickableClass)
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

    /**
     * Render this card at a particular position on the screen.
     * @param document the DOM document
     * @param x the x position to render the card
     * @param y the y position to render the card.
     */
    renderCard(document, x, y) {
        validateRequiredParams(this.renderCard, 'document', 'x', 'y');
        this.getCardImage().renderCssAndHtml(document,
            x * this.getCardImage().getWidth(),
            y * this.getCardImage().getHeight());
    }

    /* friend of GameBoard */
    getCardImage() {
        return this.cardImage;
    }
}
