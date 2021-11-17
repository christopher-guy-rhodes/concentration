/**
 * Handles image rendering for a particular card using a single image that has all the cards.
 */
class CardImage {
    constructor(id, width, height, image, isFaceUp, imgOffsetX, imgOffsetY, faceDownOffsetX, faceDownOffsetY,
                clickableClass) {
        validateRequiredParams(this.constructor, arguments, 'id', 'height', 'width', 'image', 'imgOffsetX','imgOffsetY',
            'faceDownOffsetX', 'faceDownOffsetY', 'clickableClass');
        this.id = id;
        this.height = height;
        this.width = width;
        this.image = image;
        this.isFaceUp = isFaceUp;
        this.imgOffsetX = imgOffsetX;
        this.imgOffsetY = imgOffsetY;
        this.faceDownCardXOffset = -1 * (faceDownOffsetX * width);
        this.faceDownCardYOffset = -1 * (faceDownOffsetY * height);
        this.clickableClass = clickableClass;
    }

    /**
     * Creates the css and html needed to display a single card from the big image with all the cards given a particular
     * x and y offset into the image.
     * @param document the DOM document
     * @param xPixelOffset the number of pixels to offset horizontally to find the card
     * @param yPixelOffset the number of pixels to offset vertically to find the card
     */
    renderCssAndHtml(document, xPixelOffset, yPixelOffset) {
        validateRequiredParams(this.renderCssAndHtml, arguments, 'document', 'xPixelOffset', 'yPixelOffset');

        HEAD_ELEMENT.appendChild(this.getCssElement(document,
            FRONT_ID_SUFFIX,
            this.imgOffsetX,
            this.imgOffsetY,
            xPixelOffset,
            yPixelOffset));
        HEAD_ELEMENT.appendChild(this.getCssElement(document,
            BACK_ID_SUFFIX,
            this.faceDownCardXOffset,
            this.faceDownCardYOffset,
            xPixelOffset,
            yPixelOffset));

        // remove the node before creating to handle redraw events
        $('#' + this.id).remove();

        GAMEBOARD_ELEMENT.appendChild(new ElementBuilder(document)
            .withTag(DIV_TAG)
            .withClass(this.clickableClass)
            .withId(this.id).build()
            .appendChild(new ElementBuilder(document)
                .withTag(DIV_TAG)
                .withId(this.id + '-FRONT').build())
            .appendChild(new ElementBuilder(document)
                .withTag(DIV_TAG)
                .withId(this.id + '-BACK').build()));

    }

    getCssElement(document, suffix, offsetX, offsetY, xPixelOffset, yPixelOffset) {
        let rotateY = suffix === FRONT_ID_SUFFIX ? '-180' : '0';

        return new ElementBuilder(document).withTag(STYLE_TAG)
            .withInnerText('#' + this.id + '-' + suffix + '{' +
                'height: ' + this.height + 'px;' +
                'width: ' + this.width + 'px;' +
                'background-image: url(' + this.image + ');' +
                'background-position: ' + offsetX + 'px ' + offsetY + 'px;' +
                'position: absolute;' +
                'top: ' + (yPixelOffset + HEADER_HEIGHT) + 'px;' +
                'left: ' + xPixelOffset + 'px;' +
                'transform: rotateY(' + rotateY + 'deg);' +
                'backface-visibility: hidden;' +
                'transition: transform .5s linear 0s;' +
            '}').build();
    }

    /**
     * Sets the card face down.
     */
    setFaceDown() {
        this.setOffset(this.faceDownCardXOffset, this.faceDownCardYOffset);
        this.isFaceUp = false;
        $(this).attr('data-click-state', 0);
        this.animateFlip(this.id, true);
    }

    /**
     * Sets the card face up.
     */
    setFaceUp() {
        this.setOffset(this.imgOffsetX, this.imgOffsetY);
        this.isFaceUp = true;
        $(this).attr('data-click-state', 1)
        this.animateFlip(this.id, false);
    }

    /**
     * Get the height of the card
     * @returns {number}
     */
    getWidth() {
        return this.width;
    }

    /**
     * Get the width of the card
     * @returns {number}
     */
    getHeight() {
        return this.height;
    }

    /* private */
    setOffset(xOffset, yOffset) {
        $('.' + this.id).css('background-position', xOffset + 'px ' + yOffset + 'px');
    }

    /* private */
    animateFlip(id, isFlippingToFront) {
        let rotateYFront = isFlippingToFront ? '-180' : '0';
        let rotateYBack = isFlippingToFront ? '0' : '180';
        $('#' + id + '-FRONT').css('transform', 'rotateY(' + rotateYFront + 'deg)');
        $('#' + id + '-BACK').css('transform', 'rotateY(' + rotateYBack + 'deg)');
    }
}
