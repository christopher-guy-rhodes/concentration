class Card {

    constructor(rank, suit) {
        this.id = rank + '-' + suit;
        this.rank = rank;
        this.suit = suit;
        //this.x = x;
        //this.y = y;


        /*
            if (IMAGE_OFFSETS[this.id] === undefined) {
            throw new Error("Could not find image offset for card " + this.id);
        }

        this.cardImage = new CardImageBuilder()
            .withId(this.id)
            .withWidth(CARD_WIDTH)
            .withHeight(CARD_HEIGHT)
            .withImage(DECK_IMAGE)
            .withX(x * CARD_WIDTH)
            .withY(y * CARD_HEIGHT)
            .withImgOffsetX(-1* IMAGE_OFFSETS[this.id]['x'] * CARD_WIDTH)
            .withImgOffsetY(-1 * IMAGE_OFFSETS[this.id]['y'] * CARD_HEIGHT)
            .build();

         */
    }

    getId() {
        return this.id;
    }

    getRank() {
        return this.rank;
    }

    getSuit() {
        return this.suit;
    }

    //renderCard(document) {
    //    this.cardImage.renderCardCss(document);
    //}
}
