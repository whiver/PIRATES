/******************************************************************************
    This file is part of PIRATES.

    PIRATES is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    PIRATES is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with PIRATES.  If not, see <http://www.gnu.org/licenses/>.
*******************************************************************************/

game.PlayScreen = me.ScreenObject.extend({
    /**
     *  action to perform on state change
     */
    onResetEvent: function() {
		//Map init
        me.levelDirector.loadLevel("area01");
		
        // reset the score
        game.data.score = 0;

        // Add the players
        this.players = {
            "wsh": new game.Player(170, 235, {frameheight: 32, framewidth: 30, image: "pirates", width: 30, height:32}),
            "adri": new game.OtherPlayer(500, 235, {frameheight: 32, framewidth: 30, image: "pirates", width: 30, height:32})
        }
        me.game.world.addChild(this.players.wsh);
        me.game.world.addChild(this.players.adri);

        // add our HUD to the game world
        this.HUD = new game.HUD.Container();
        me.game.world.addChild(this.HUD);
    },

    /**
     *  action to perform when leaving this screen (state change)
     */
    onDestroyEvent: function() {
        // remove the HUD from the game world
        me.game.world.removeChild(this.HUD);
    }
});
