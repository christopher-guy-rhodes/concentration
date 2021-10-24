// Set the scale for viewing in mobile browsers so it will fit on the screen
let viewportMeta = document.querySelector('meta[name="viewport"]');
let width = $(window).width();
let height = $(window).height();
let scalingDimension = width;
viewportMeta.content = viewportMeta.content.replace(/initial-scale=[^,]+/,
    'initial-scale=' + (scalingDimension / (NUMBER_OF_CARDS_PER_ROW * CARD_WIDTH)));
