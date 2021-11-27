// Game config
const CARD_FLIP_DELAY_MS = 1500;
const MAX_PLAYERS = 4;
const PREVIEW_IMG_WIDTH = 1300;
const PLAYER_FORM_WIDTH = 1000;

// DOM constants
const BODY_TAG = 'body';
const HEAD_TAG = 'head';
const FORM_TAG = 'form';
const H2_TAG = 'h2';
const H3_TAG = 'h3';
const DIV_TAG = 'div';
const INPUT_TAG = 'input';
const SELECT_TAG = 'select';
const OPTION_TAG = 'option';
const BREAK_TAG = 'br';
const ANCHOR_TAG = 'a';
const STYLE_TAG = 'style';
const SPAN_TAG = 'span';
const IMAGE_TAG = 'img';
const PARAGRAPH_TAG = 'p';
const STRONG_TAG = 'strong';

// Css constants
const FRONT_ID_SUFFIX = 'FRONT';
const BACK_ID_SUFFIX = 'BACK';

// Top level DOM elements
const GAMEBOARD_ELEMENT = new ElementBuilder(document).withTag(DIV_TAG)
    .withAttribute('style', 'display : none')
    .withClass('gameBoard').build();
const BODY_ELEMENT = new ElementBuilder(document).withTag(BODY_TAG).build();
const HEAD_ELEMENT = new ElementBuilder(document).withTag(HEAD_TAG).build();
