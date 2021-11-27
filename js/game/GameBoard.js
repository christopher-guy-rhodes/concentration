/**
 * Main class to render card game
 */
class GameBoard {
    constructor(numberOfCards, deckType, clickableClass) {
        validateRequiredParams(this.constructor, arguments, 'numberOfCards', 'deckType', 'clickableClass');
        this.numberOfCards = numberOfCards;
        this.deckType = deckType;
        this.clickableClass = clickableClass;

        this.deck = this.getDeckByType(deckType, numberOfCards);


        this.numberOfRows = this.getNumOfRowsThatMakesBiggestRectangle();
        this.numberOfCardsPerRow = this.numberOfCards / this.numberOfRows;
    }

    /**
     * Renders the shuffled deck on the grid.
     * @param document the dom document
     */
    renderGameBoard(document) {
        validateRequiredParams(this.renderGameBoard, arguments, 'document');

        let cards = this.deck.getCards();
        let gridPositions = this.buildGrid();

        let gridPositionIndex = 0;
        for (let card of cards) {
            card.setFaceDown();
            $('.' + card.getId()).css('display', 'block');
            let x = gridPositions[gridPositionIndex]['x'];
            let y = gridPositions[gridPositionIndex]['y'];
            card.renderCard(document, x, y);
            gridPositionIndex++;
        }
    }

    /**
     * Get the number of cards used on the game board
     * @returns {number}
     */
    getNumberOfCards() {
        return this.numberOfCards;
    }

    /**
     * Remove a set of cards from the game board.
     * @param card1 the fist card
     * @param card2 the second matching card
     */
    removeCards(cards) {
        for (let card of cards) {
            $('#' + card.getId()).css('display', 'none');
        }
    }

    /**
     * Get the deck used for the game board.
     * @returns {Deck}
     */
    getDeck() {
        return this.deck;
    }

    /**
     * Get the number of rows on the game bord.
     * @returns {number} the number of rows
     */
    getNumberOfRows() {
        return this.numberOfRows;
    }

    /**
     * Get the number of cards per row on the game bord.
     * @returns {number} the number of cards per row
     */

    getNumberOfCardsPerRow() {
        return this.numberOfCardsPerRow;
    }

    /* private */
    getDeckByType(deckType, numberOfCards) {
        let deck = undefined;
        switch(deckType) {
            case 'picture':
                deck = new PictureCardDeck(numberOfCards, this.clickableClass);
                break;
            case 'playing':
            default :
                deck = new PlayingCardDeck(numberOfCards, this.clickableClass);
        }

        return deck;
    }

    /* private */
    buildGrid() {
        let gridPositions = [];
        for (let y = 0; y < this.numberOfRows; y++) {
            for (let x = 0; x < this.numberOfCardsPerRow; x++) {
                gridPositions.push({x : x, y : y});
            }
        }
        return gridPositions;
    }

    /* private */
    getNumOfRowsThatMakesBiggestRectangle() {
        // Let n be the number of cards n = a*b . We want to minimize b - a so that a and b are as large as possible.
        // It follows that a is the largest divisor that is less than or equal to the square root.
        let a = Math.floor(Math.sqrt(this.numberOfCards));
        while(this.numberOfCards % a !== 0) {
            a--;
        }
        return a;
    }
}
