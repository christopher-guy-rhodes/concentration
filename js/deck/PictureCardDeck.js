const BIRD = 'BIRD';
const PENGUIN = 'PENGUIN';
const HORSE = 'HORSE';
const PANDA = 'PANDA';
const DOG = 'DOG';
const TORTOISE = 'TORTOISE';
const BEE = 'BEE';
const MONKEY = 'MONKEY'
const SQUIRREL = 'SQUIRREL';
const PIG = 'PIG';
const DRAGONFLY = 'DRAGONFLY';
const COCK = 'COCK';
const ELEPHANT = 'ELEPHANT';
const LION = 'LION';
const OSTRICH = 'OSTRICH';
const WOLF = 'WOLF';
const SNAIL = 'SNAIL';
const DEER = 'DEER';
const RABBIT = 'RABBIT';
const RACCOON = 'RACCOON';
const CATTLE = 'CATTLE';
const PEAFOWL = 'PEAFOWL';
const ANT = 'ANT';
const KANGAROO = 'KANGAROO';
const DUCK = 'DUCK';
const HIPPO = 'HIPPO';
const CAT = 'CAT';
const SHEEP = 'SHEEP';
const SHARK = 'SHARK';
const STARFISH ='STARFISH';
const FISH = 'FISH';
const FOX = 'FOX';
const GIRAFFE = 'GIRAFFE';
const OCTOPUS = 'OCTOPUS';
const CRAB = 'CRAB';
const OWL = 'OWL';

/**
 * Class that models a deck of picture cards.
 */
class PictureCardDeck extends Deck {
    static PICTURE_CARD_IMAGE = '../images/decks/picture_cards.png';

    constructor(numberOfCards, clickableClass) {
        super(PictureCardDeck.dealCards(numberOfCards, clickableClass),
            PictureCardDeck.getNumberOfCardsInDeck(),
            PlayingCardDeck.PLAYING_CARD_IMAGE);
        this.numberOfCards = numberOfCards;
    }

    validateNumberOfCards(numSelected) {
        let numCardsInDeck = PictureCardDeck.getNumberOfCardsInDeck();
        if (this.numberOfCards % 2 !== 0 || numSelected < 0 || numSelected > numCardsInDeck) {
            throw new Error("In order to play with a picture card deck you must use between 2 and " + numCardsInDeck +
                " cards. There must be an even number of cards.");
        }
    }

    /**
     * Get the maximum number of cards in the deck
     */
    static getNumberOfCardsInDeck() {
        let cardRows = PictureCardDeck.getAnimals();
        return 2 * cardRows.reduce(function(count, row) {
            return count + row.length;
        }, 0);
    }

    static getAnimals() {
        return [
            [BIRD, PENGUIN, HORSE, PANDA, DOG, TORTOISE],
            [BEE, MONKEY, SQUIRREL, PIG, DRAGONFLY, COCK],
            [ELEPHANT, LION, OSTRICH, WOLF, SNAIL, DEER],
            [RABBIT, RACCOON, CATTLE, PEAFOWL, ANT, KANGAROO],
            [DUCK, HIPPO, CAT, SHEEP, SHARK, STARFISH],
            [FISH, FOX, GIRAFFE, OCTOPUS, CRAB, OWL]
        ];
    }

    static dealCards(numberOfCards, clickableClass) {
        let cardRows = this.getAnimals();
        let cards = [];
        main_loop:
        for (let y = 0; y < cardRows.length; y++) {
            for (let x = 0; x < cardRows[y].length; x++) {
                let animal = cardRows[y][x];
                let card1 = new PictureCard(animal, "ONE", x, y, clickableClass);
                let card2 = new PictureCard(animal, "TWO", x, y, clickableClass);
                cards.push(card1);
                cards.push(card2);

                // Are there any cards left
                if (cards.length >= numberOfCards) {
                    break main_loop;
                }

                // Make sure we only use 1/6 the number of cards from each row so that there will be matches. For
                // example if there are 4 cards we want to grab two birds and two penguins.
                if ((x + 1) * 2 * cardRows.length >= numberOfCards) {
                    break;
                }
            }
        }
        return cards;
    }
}
