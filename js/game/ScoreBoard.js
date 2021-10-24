class ScoreBoard {
    constructor(players) {
        this.players = players;
    }

    /**
     * Highlights the player name of the current player.
     * @param playerNumber the player number to highlight
     */
    updateStats(playerNumber) {
        for (let player of this.players) {
            let scoreBoardEntry = undefined;
            if (player.getPlayerNumber() === playerNumber) {
                scoreBoardEntry = '<strong>&gt;&gt;' + player.getPlayerName() + '&lt;&lt;   </strong>';
            } else {
                scoreBoardEntry = player.getPlayerName();
            }
            scoreBoardEntry = scoreBoardEntry + ' ' + player.getScore() + ' matches';
            console.log('updating ' + player.getPlayerNumber() + ' with ' + scoreBoardEntry);
            $('.player' + player.getPlayerNumber()).html(scoreBoardEntry);
        }
    }

    /**
     * Display the winning player on the scoreboard.
     * @param winningPlayer the winning player
     */
    displayWinner(winningPlayer) {
        let scoreBoardEntry = winningPlayer.getPlayerName() + ' <strong class="winner"> is the winner!</strong>';
        $('.player' + winningPlayer.getPlayerNumber()).html(scoreBoardEntry);
    }

    /**
     * Hide the scoreboard.
     */
    hideScoreboard() {
        for (let player of this.players) {
            $('.player' + player.getPlayerNumber()).css('display', 'none');
        }
    }
}
