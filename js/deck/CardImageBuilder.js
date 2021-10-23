class CardImageBuilder {
    constructor() {
        this.id = undefined;
        this.height = undefined;
        this.width = undefined;
        this.image = undefined;
        this.x = undefined;
        this.y = undefined;
        this.imgOffsetX = undefined;
        this.imgOffsetY = undefined;
    }

    withId(id) {
        this.id = id;
        return this;
    }

    withHeight(height) {
        this.height = height;
        return this;
    }

    withWidth(width) {
        this.width = width;
        return this;
    }

    withImage(image) {
        this.image = image;
        return this;
    }

    withX(x) {
        this.x = x;
        return this;
    }

    withY(y) {
        this.y = y;
        return this;
    }

    withImgOffsetX(imgOffsetX) {
        this.imgOffsetX = imgOffsetX;
        return this;
    }

    withImgOffsetY(imgOffsetY) {
        this.imgOffsetY = imgOffsetY;
        return this;
    }

    build() {
        return new CardImage(this.id, this.width, this.height, this.image, this.x, this.y, this.imgOffsetX,
            this.imgOffsetY);
    }
}
