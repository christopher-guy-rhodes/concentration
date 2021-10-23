/**
 * Handles image rendering for a particular card using a single image that has all the cards
 */
class CardImage {
    constructor(id, width, height, image, imgOffsetX, imgOffsetY) {
        validateRequiredParams(this.constructor, arguments, 'id', 'height', 'width', 'image', 'imgOffsetX',
            'imgOffsetY');
        this.id = id;
        this.height = height;
        this.width = width;
        this.image = image;
        this.imgOffsetX = imgOffsetX;
        this.imgOffsetY = imgOffsetY;
    }

    /**
     * Creates the css  and html needed to display a single card from the image with all the cards given a particular x
     * and y offset into the image.
     * @param document the dom document
     * @param xPixelOffset the number of pixels to offset horizontally to find the card
     * @param yPixelOffset the number of pixels to offset vertically to find the card
     */
    renderCssAndHtml(document, xPixelOffset, yPixelOffset) {
        validateRequiredParams(this.renderCssAndHtml, arguments, 'document', 'xPixelOffset', 'yPixelOffset');
        let css = '.' + this.id + ' {' + "\n" +
            '\theight: ' + this.height + 'px' + ";\n" +
            '\twidth: ' + this.width + 'px' + ";\n" +
            '\tbackground-image: url(' + this.image + ')' + ";\n" +
            '\tbackground-position: ' + this.imgOffsetX + 'px ' + this.imgOffsetY + 'px' + ";\n" +
            '\tposition: absolute' + ";\n" +
            '\ttop: ' + yPixelOffset + 'px' + ";\n" +
            '\tleft: ' + xPixelOffset + 'px' + ";\n" +
            '}' + "\n";

        let html = '<div class="' + this.id + '"/>';

        let styleSheet = document.createElement("style");
        styleSheet.type = "text/css";
        styleSheet.innerText = css;
        document.head.appendChild(styleSheet);

        let myDiv = document.createElement("div");
        myDiv.className = this.id;
        document.body.appendChild(myDiv);
    }
}
