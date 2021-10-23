class CardImage {
    constructor(id, width, height, image, x, y, imgOffsetX, imgOffsetY) {
        validateRequiredParams(this.constructor, arguments, 'id', 'height', 'width', 'image', 'x', 'y', 'imgOffsetX',
            'imgOffsetY');
        this.id = id;
        this.height = height;
        this.width = width;
        this.image = image;
        this.x = x;
        this.y = y;
        this.imgOffsetX = imgOffsetX;
        this.imgOffsetY = imgOffsetY;
    }

    renderCardCss(document) {
        let css = '.' + this.id + ' {' + "\n" +
            '\theight: ' + this.height + 'px' + ";\n" +
            '\twidth: ' + this.width + 'px' + ";\n" +
            '\tbackground-image: url(' + this.image + ')' + ";\n" +
            '\tbackground-position: ' + this.imgOffsetX + 'px ' + this.imgOffsetY + 'px' + ";\n" +
            '\tposition: absolute' + ";\n" +
            '\ttop: ' + (this.y + 75) + 'px' + ";\n" +
            '\tleft: ' + this.x + 'px' + ";\n" +
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
