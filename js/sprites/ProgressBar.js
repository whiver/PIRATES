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

    init: function (v, w, h) {
      me.Renderable.prototype.init.apply(this, [v.x, v.y, w, h]);
      // flag to know if we need to refresh the display
      this.invalidate = false;

      // default progress bar height
      this.barHeight = 4;

      // current progress
      this.progress = 0;
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
      renderer.setColor("black");
      renderer.fillRect(0, (this.height / 2) - (this.barHeight / 2), this.width, this.barHeight);

      renderer.setColor("#55aa00");
      renderer.fillRect(2, (this.height / 2) - (this.barHeight / 2), this.progress, this.barHeight);

      renderer.setColor("white");
    }
  });
})();