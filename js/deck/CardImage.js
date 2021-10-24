/**
 * Handles image rendering for a particular card using a single image that has all the cards.
 */
class CardImage {
    constructor(id, width, height, image, isFaceUp, imgOffsetX, imgOffsetY) {
        validateRequiredParams(this.constructor, arguments, 'id', 'height', 'width', 'image', 'imgOffsetX',
            'imgOffsetY');
        this.id = id;
        this.height = height;
        this.width = width;
        this.image = image;
        this.isFaceUp = isFaceUp;
        this.imgOffsetX = imgOffsetX;
        this.imgOffsetY = imgOffsetY;
    }

    /**
     * Set the card image face down when rendering.
     */
    setFaceUp() {
        this.isFaceUp = true;
    }

    /**
     * Creates the css  and html needed to display a single card from the big image with all the cards given a
     * particular x and y offset into the image.
     * @param document the DOM document
     * @param xPixelOffset the number of pixels to offset horizontally to find the card
     * @param yPixelOffset the number of pixels to offset vertically to find the card
     */
    renderCssAndHtml(document, xPixelOffset, yPixelOffset) {
        validateRequiredParams(this.renderCssAndHtml, arguments, 'document', 'xPixelOffset', 'yPixelOffset');

        // Override the offsets to the single face down card image if the card is face down
        let imgOffsetX = this.isFaceUp ? this.imgOffsetX : FACE_DOWN_CARD_X_OFFSET;
        let imgOffsetY = this.isFaceUp ? this.imgOffsetY : FACE_DOWN_CARD_Y_OFFSET;

        // Generate the css to render a the cared with the given dimensions and offset
        let css = '.' + this.id + ' {' + "\n" +
            '\theight: ' + this.height + 'px' + ";\n" +
            '\twidth: ' + this.width + 'px' + ";\n" +
            '\tbackground-image: url(' + this.image + ')' + ";\n" +
            '\tbackground-position: ' + imgOffsetX + 'px ' + imgOffsetY + 'px' + ";\n" +
            '\tposition: absolute' + ";\n" +
            '\ttop: ' + (yPixelOffset + HEADER_HEIGHT) + 'px' + ";\n" +
            '\tleft: ' + xPixelOffset + 'px' + ";\n" +
            '}' + "\n";

        let styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = css;
        document.head.appendChild(styleSheet);

        // Create a div in the body with the class name and a "clickable" class to handle on click events
        let myDiv = document.createElement("div");
        myDiv.className = 'clickable ' + this.id;
        document.body.appendChild(myDiv);
    }

    /**
     * Fips a card over.
     */
    flip() {
        let imgOffsetX = this.isFaceUp ? FACE_DOWN_CARD_X_OFFSET : this.imgOffsetX;
        let imgOffsetY = this.isFaceUp ? FACE_DOWN_CARD_Y_OFFSET : this.imgOffsetY;
        $('.' + this.id).css('background-position', imgOffsetX + 'px ' + imgOffsetY + 'px');
        this.isFaceUp = !this.isFaceUp;
    }
}
