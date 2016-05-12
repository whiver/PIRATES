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

(function(){
  "use strict";

  /** Represent a Treasure */
  class Treasure {

    /**
     * Create a Treasure
     */
    constructor(x, y, points){
      this.points = points;
      this.collected = false;

      this.pos = {
        x: x,
        y: y
      };
    }


  }

  exports.Treasure = Treasure;
})();
