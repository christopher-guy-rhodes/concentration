/**
 * Builder for the CardImage object.
 */
class CardImageBuilder {
    constructor() {
        this.id = undefined;
        this.height = undefined;
        this.width = undefined;
        this.image = undefined;
        this.isFaceUp = false;
        this.imgOffsetX = undefined;
        this.imgOffsetY = undefined;
        this.faceDownOffsetX = undefined;
        this.faceDownOffsetY = undefined;
    }

    withId(id) {
        validateRequiredParams(this.withId, arguments, 'id');
        this.id = id;
        return this;
    }

    withHeight(height) {
        validateRequiredParams(this.withHeight, arguments, 'height');
        this.height = height;
        return this;
    }

    withWidth(width) {
        validateRequiredParams(this.withWidth, arguments, 'width');
        this.width = width;
        return this;
    }

    withImage(image) {
        validateRequiredParams(this.withImage, arguments, 'image');
        this.image = image;
        return this;
    }

    withImgOffsetX(imgOffsetX) {
        validateRequiredParams(this.withImage, arguments, 'image');
        this.imgOffsetX = imgOffsetX;
        return this;
    }

    withImgOffsetY(imgOffsetY) {
        validateRequiredParams(this.withImgOffsetY, arguments, 'imgOffsetY');
        this.imgOffsetY = imgOffsetY;
        return this;
    }

    withFaceDownOffsetX(x) {
        this.faceDownOffsetX = x;
        return this;
    }

    withFaceDownOffsetY(y) {
        this.faceDownOffsetY = y;
        return this;
    }

    build() {
        return new CardImage(this.id, this.width, this.height, this.image, this.isFaceUp, this.imgOffsetX,
            this.imgOffsetY, this.faceDownOffsetX, this.faceDownOffsetY);
    }
}
