/**
 * Class that represents a playing card.
 */
class PictureCard extends Card {
    constructor(animal, number, x, y, clickableClass) {
        super(animal + '-' + number,
            x,
            y,
            0,
            6,
            116,
            114,
            PictureCardDeck.PICTURE_CARD_IMAGE, clickableClass);
        validateRequiredParams(this.constructor, arguments, 'animal', 'number', 'x', 'y', 'clickableClass');
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
