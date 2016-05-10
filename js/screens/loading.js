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

game.LoadingScreen = me.ScreenObject.extend({
  onResetEvent: function () {
    // background color
    me.game.world.addChild(new me.ColorLayer("background", "#202020", 0), 0);

    me.loader.load({
      name   : "title",
      type   : "image",
      src    : "data/img/sprites/title.svg"
    }, function () {
      me.game.world.addChild(new me.Sprite(me.video.renderer.getWidth() / 2, me.video.renderer.getHeight() / 4, {
        image: me.loader.getImage("title")
      }));
    });

    // progress bar
    var progressBar = new game.ProgressBar(
      new me.Vector2d(),
      me.video.renderer.getWidth(),
      me.video.renderer.getHeight()
    );

    this.loaderHdlr = me.event.subscribe(
      me.event.LOADER_PROGRESS,
      progressBar.onProgressUpdate.bind(progressBar)
    );

    this.resizeHdlr = me.event.subscribe(
      me.event.VIEWPORT_ONRESIZE,
      progressBar.resize.bind(progressBar)
    );

    me.game.world.addChild(progressBar, 1);
  },

  // destroy object at end of loading
  onDestroyEvent : function () {
    // cancel the callback
    me.event.unsubscribe(this.loaderHdlr);
    me.event.unsubscribe(this.resizeHdlr);
    this.loaderHdlr = this.resizeHdlr = null;
  }
});