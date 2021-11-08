const A = 'A';
const TWO = 'TWO';
const THREE = 'THREE';
const FOUR = 'FOUR';
const FIVE = 'FIVE';
const SIX = 'SIX';
const SEVEN = 'SEVEN';
const EIGHT = 'EIGHT';
const NINE = 'NINE';
const TEN = 'TEN';
const J = 'J';
const K = 'K';
const Q = 'Q';

const SPADES = 'SPADES';
const HEARTS = 'HEARTS';
const DIAMONDS = 'DIAMONDS';
const CLUBS = 'CLUBS';

const NUMBER_OF_CARDS_PER_ROW = 13;
const NUMBER_OF_ROWS = 4;

const CARD_HEIGHT = 146;
const CARD_WIDTH = 100;
const HEADER_HEIGHT = 160;
const FACE_DOWN_CARD_X_OFFSET = -1 * (0 * CARD_WIDTH);
const FACE_DOWN_CARD_Y_OFFSET = -1 * (4 * CARD_HEIGHT);
const CARD_FLIP_DELAY_MS = 1500;

const IMAGE_OFFSETS = {
    'A-SPADES'       : {x : 0,  y: 0},
    'TWO-SPADES'     : {x : 1,  y: 0},
    'THREE-SPADES'   : {x : 2,  y: 0},
    'FOUR-SPADES'    : {x : 3,  y: 0},
    'FIVE-SPADES'    : {x:  4,  y: 0},
    'SIX-SPADES'     : {x : 5,  y: 0},
    'SEVEN-SPADES'   : {x : 6,  y: 0},
    'EIGHT-SPADES'   : {x : 7,  y: 0},
    'NINE-SPADES'    : {x : 8,  y: 0},
    'TEN-SPADES'     : {x : 9,  y: 0},
    'J-SPADES'       : {x : 10, y: 0},
    'Q-SPADES'       : {x : 11, y: 0},
    'K-SPADES'       : {x : 12, y: 0},

    'A-HEARTS'       : {x : 0,  y: 1},
    'TWO-HEARTS'     : {x : 1,  y: 1},
    'THREE-HEARTS'   : {x : 2,  y: 1},
    'FOUR-HEARTS'    : {x : 3,  y: 1},
    'FIVE-HEARTS'    : {x: 4,   y: 1},
    'SIX-HEARTS'     : {x : 5,  y: 1},
    'SEVEN-HEARTS'   : {x : 6,  y: 1},
    'EIGHT-HEARTS'   : {x : 7,  y: 1},
    'NINE-HEARTS'    : {x : 8,  y: 1},
    'TEN-HEARTS'     : {x : 9,  y: 1},
    'J-HEARTS'       : {x : 10, y: 1},
    'Q-HEARTS'       : {x : 11, y: 1},
    'K-HEARTS'       : {x : 12, y: 1},

    'A-DIAMONDS'     : {x : 0,  y: 2},
    'TWO-DIAMONDS'   : {x : 1,  y: 2},
    'THREE-DIAMONDS' : {x : 2,  y: 2},
    'FOUR-DIAMONDS'  : {x : 3,  y: 2},
    'FIVE-DIAMONDS'  : {x : 4,  y: 2},
    'SIX-DIAMONDS'   : {x : 5,  y: 2},
    'SEVEN-DIAMONDS' : {x : 6,  y: 2},
    'EIGHT-DIAMONDS' : {x : 7,  y: 2},
    'NINE-DIAMONDS'  : {x : 8,  y: 2},
    'TEN-DIAMONDS'   : {x : 9,  y: 2},
    'J-DIAMONDS'     : {x : 10, y: 2},
    'Q-DIAMONDS'     : {x : 11, y: 2},
    'K-DIAMONDS'     : {x : 12, y: 2},

    'A-CLUBS'        : {x : 0,  y: 3},
    'TWO-CLUBS'      : {x : 1,  y: 3},
    'THREE-CLUBS'    : {x : 2,  y: 3},
    'FOUR-CLUBS'     : {x : 3,  y: 3},
    'FIVE-CLUBS'     : {x : 4,  y: 3},
    'SIX-CLUBS'      : {x : 5,  y: 3},
    'SEVEN-CLUBS'    : {x : 6,  y: 3},
    'EIGHT-CLUBS'    : {x : 7,  y: 3},
    'NINE-CLUBS'     : {x : 8,  y: 3},
    'TEN-CLUBS'      : {x : 9,  y: 3},
    'J-CLUBS'        : {x : 10, y: 3},
    'Q-CLUBS'        : {x : 11, y: 3},
    'K-CLUBS'        : {x : 12, y: 3},
};


