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
            $('.player' + player.getPlayerNumber()).html(scoreBoardEntry);
        }
    }

    /**
     * Display the winning player on the scoreboard.
     * @param winningPlayers the array of winning player
     */
    displayWinners(winningPlayers) {
        for (let winningPlayer of winningPlayers) {
            let scoreBoardEntry = winningPlayer.getPlayerName() + ' <strong class="winner"> is the winner!</strong> ' +
                winningPlayer.getScore() + ' matches';
            $('.player' + winningPlayer.getPlayerNumber()).html(scoreBoardEntry);
        }
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
