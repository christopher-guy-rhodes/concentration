/**
 * Class that represents a playing card.
 */
class PictureCard extends Card {
    constructor(animal, number, x, y) {
        super(animal + '-' + number, x, y, 0, 6, 167, 164, PictureCardDeck.PICTURE_CARD_IMAGE);
        this.animal = animal;
        this.number = number;
    }

    /**
     * Determines if the other card is a match with this card.
     * @param otherCard the other card to compare to this card for a match
     */
    isMatch(otherCard) {
        return this.animal === otherCard.animal;
    }
}
