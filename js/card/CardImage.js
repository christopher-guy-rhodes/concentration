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

        // Override the offsets to the single face down card image if the card is face down
        let imgOffsetX = this.isFaceUp ? this.imgOffsetX : this.faceDownCardXOffset;
        let imgOffsetY = this.isFaceUp ? this.imgOffsetY : this.faceDownCardYOffset;

        let frontCss = this.getCss('FRONT', this.imgOffsetX, this.imgOffsetY, xPixelOffset, yPixelOffset);
        let backCss = this.getCss('BACK', this.faceDownCardXOffset, this.faceDownCardYOffset, xPixelOffset, yPixelOffset);

        let styleSheet = document.createElement("style");
        styleSheet.innerText = frontCss + backCss;
        document.head.appendChild(styleSheet);

        let frontDiv = document.createElement("div");
        frontDiv.id = this.id + '-FRONT';

        let backDiv = document.createElement("div");
        backDiv.id = this.id + '-BACK';

        // Create a div in the body with the class name and a "clickable" class to handle on click events

        $('#' + this.id).remove();

        let parentDiv = document.createElement("div");
        parentDiv.className = this.clickableClass;
        parentDiv.id = this.id;

        parentDiv.appendChild(frontDiv);
        parentDiv.appendChild(backDiv);

        document.body.appendChild(parentDiv);
    }

    getCss(suffix, offsetX, offsetY, xPixelOffset, yPixelOffset) {
        let rotateY = suffix === 'FRONT' ? '-180' : '0';
        return '#' + this.id + '-' + suffix + '{' + "\n" +
        '\theight: ' + this.height + 'px' + ";\n" +
        '\twidth: ' + this.width + 'px' + ";\n" +
        '\tbackground-image: url(' + this.image + ')' + ";\n" +
        '\tbackground-position: ' + offsetX + 'px ' + offsetY + 'px' + ";\n" +
        '\tposition: absolute' + ";\n" +
        '\ttop: ' + (yPixelOffset + HEADER_HEIGHT) + 'px' + ";\n" +
        '\tleft: ' + xPixelOffset + 'px' + ";\n" +
        '\ttransform: perspective(600px) rotateY(' + rotateY + 'deg)' + ";\n" +
        '\tbackface-visibility: hidden' + ";\n" +
        '\ttransition: transform .5s linear 0s;' + ";\n" +
        '}' + "\n"
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
        $('#' + id + '-FRONT').css('transform', 'perspective(600px) rotateY(' + rotateYFront + 'deg)');
        $('#' + id + '-BACK').css('transform', 'perspective(600px) rotateY(' + rotateYBack + 'deg)');
    }
}
