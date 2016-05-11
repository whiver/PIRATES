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

(function () {
  // a basic progress bar object
  game.ProgressBar = me.Renderable.extend({

    /**
     * Constructor
     * @param {me.Vector2D} v The position of the middle of the progress bar in the screen
     * @param {number}  w     The width of the progress bar
     * @param {number}  h     The height of the progress bar
     * @param {string}  color1  The color of the progress
     * @param {string}  color2  The color of the background
     * @param {boolean} leftToRight Should the bar progress to the right?
     */
    init: function (v, w, h, color1, color2, leftToRight) {
      me.Renderable.prototype.init.apply(this, [v.x, v.y, w, h]);
      // flag to know if we need to refresh the display
      this.invalidate = false;

      // current progress
      this.progress = 0;

      // Colors of the progress bar
      if (color1 === undefined) {
        color1 = "black";

        if (color2 === undefined) {
          color2 = "#55aa00";
        }
      }
      this.colors = [color1, color2];
      this.ltr = leftToRight !== false;
    },

    // make sure the screen is refreshed every frame
    onProgressUpdate: function (progress) {
      this.progress = ~~(progress * this.width);
      this.invalidate = true;
    },

    // make sure the screen is refreshed every frame
    update: function () {
      if (this.invalidate === true) {
        // clear the flag
        this.invalidate = false;
        // and return true
        return true;
      }
      // else return false
      return false;
    },

    // draw function
    draw: function (renderer) {
      // draw the progress bar
      renderer.setColor(this.colors[0]);
      renderer.fillRect(this.pos.x - this.width / 2, this.pos.y - this.height / 2, this.width, this.height);

      renderer.setColor(this.colors[1]);

      if (this.ltr) {
        renderer.fillRect(this.pos.x - this.width / 2, this.pos.y - this.height / 2, this.progress, this.height);
      } else {
        renderer.fillRect(this.pos.x + this.width / 2 - this.progress, this.pos.y - this.height / 2, this.progress, this.height);
      }

      renderer.setColor("white");
    }
  });
})();