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

/**
* Player Entity
*/
game.Player = game.Character.extend({


  /**
   * Constructor
   * @param {number} x   The initial X position of the player
   * @param {number} y   The initial Y position of the player
   * @param {number} hp  The number of HP the player begin with
   * @param {number} id  The ID of the player
   * @param {object} settings
   */
  init:function (x, y, hp, id) {
    "use strict";
    
    // call the constructor
    this._super(game.Character, 'init', [x, y, id]);

    // define a basic walking animation (using all frames)
    this.characterRenderable.addAnimation("downWalk",  [0, 1, 2]);
    this.characterRenderable.addAnimation("upWalk",  [36, 37, 38]);
    this.characterRenderable.addAnimation("sideWalk",  [24, 25, 26]);

    // define a standing animation (using the first frame)
    this.characterRenderable.addAnimation("stand", [1]);
    // set the standing animation as default
    this.characterRenderable.setCurrentAnimation("stand");
    
    // ensure the player is updated even when outside of the viewport
    this.alwaysUpdate = true;

    // Add the weapon
    this.setWeapon();
    
    // Add the healthbar
    this.lifebar = {
      life: this.renderable.addChild(
        new me.Sprite(0, -18, {image: me.loader.getImage("lifebar")})
      ),
      
      dmg: this.renderable.addChild(
        new me.Sprite(1, -18, {image: me.loader.getImage("lifebar_dmg")})
      ),
      
      lifeWidth: 28,
    }
    
    // Hide the damage bar at the beginning
    this.lifebar.dmg.scale(0.1, 1);
    
    // HP support
    Object.defineProperty(this, "hpMax", {
      value: hp
    });
    var currentHp = this.hpMax;
    
    // Update the lifebar at every modification
    Object.defineProperty(this, "hp", {
      set: function (val) {
        currentHp = val;
        
        if (currentHp === this.hpMax) {
          this.lifebar.dmg.alpha = 0;
          this.lifebar.dmg.pos.x = 1;
        } else {
          this.lifebar.dmg.alpha = 1;
          var sizeRatio = 1 - val / this.hpMax;
          this.lifebar.dmg.scale(sizeRatio, 1);
          this.lifebar.dmg.pos.x = (this.lifebar.lifeWidth - (this.lifebar.lifeWidth * sizeRatio)) / 2;
        }
        
      },
      get: function () {
        return currentHp;
      }
    });
    
  },
  
  /**
   * Add a weapon to the player, including its graphics & collision mask
   */
  setWeapon: function () {
    this._super(game.Character, 'setWeapon');
    
    // Add the collision shape and store its index to find it later
    this.weapon.bodyIndex = this.body.addShape(this.weapon.defaultHitboxPos.right) - 1;
  },
  
  /** @inheritdoc */
  die: function (respawnX, respawnY) {
    this._super(game.Character, 'die', [respawnX, respawnY]);
    
    /* We must notify the server that we do have received the respawn
     * task: until the server get this confirmation, it will ignore
     * this client's update to prevent the player from skipping the
     * respawn between to updates
     */
    socket.emit('spawned');
    if (me.game.HASH.debug === true) {
      console.info("Respawn confirmation sent to server.");
    }
  },

  /**
  * update the entity
  */
  update : function (dt) {
    //Go left
    if (me.input.isKeyPressed('left')) {
      // flip the sprite on horizontal axis
      this.characterRenderable.flipX(true);
      // update the entity velocity
      this.body.vel.x -= this.body.accel.x * me.timer.tick;
      // change to the walking animation
      if (!this.characterRenderable.isCurrentAnimation("sideWalk")) {
        this.characterRenderable.setCurrentAnimation("sideWalk");
      }
    //Go right
    } else if (me.input.isKeyPressed('right')) {
      // unflip the sprite
      this.characterRenderable.flipX(false);
      // update the entity velocity
      this.body.vel.x += this.body.accel.x * me.timer.tick;
      // change to the walking animation
      if (!this.characterRenderable.isCurrentAnimation("sideWalk")) {
        this.characterRenderable.setCurrentAnimation("sideWalk");
      }
    }
    //Doesn't move on x axis
    else {
      this.body.vel.x = 0;
    }

    //Go up
    if (me.input.isKeyPressed('up')){
      this.body.vel.y -= this.body.accel.y * me.timer.tick;
      // change to the walking animation
      if (!this.characterRenderable.isCurrentAnimation("upWalk") && !me.input.isKeyPressed('right') && !me.input.isKeyPressed('left')) {
        this.characterRenderable.setCurrentAnimation("upWalk");
      }
    //Go down
    } else if (me.input.isKeyPressed('down')){
      this.body.vel.y += this.body.accel.y * me.timer.tick;
      // change to the walking animation
      if (!this.characterRenderable.isCurrentAnimation("downWalk") && !me.input.isKeyPressed('right') && !me.input.isKeyPressed('left')) {
        this.characterRenderable.setCurrentAnimation("downWalk");
      }
    //Doesn't move on y axis
    } else {
      this.body.vel.y = 0;
    }

    //Stand animation
    if(!me.input.isKeyPressed('up') && !me.input.isKeyPressed('down') && !me.input.isKeyPressed('left') && !me.input.isKeyPressed('right')){
      this.characterRenderable.setCurrentAnimation("stand");
    }

    if (me.input.isKeyPressed('attack')) {
      this.attack();
    }

    // apply physics to the body (this moves the entity)
    this.body.update(dt);

    // handle collisions against other shapes
    me.collision.check(this);

    // return true if we moved or if the renderable was updated
    return (this._super(game.Character, 'update', [dt]) || this.body.vel.x !== 0 || this.body.vel.y !== 0);
  },
  
  onCollision: function (response, other) {
    if(other instanceof game.Character){
      if (!!this.attacking && !this.hit && response.indexShapeB === this.weapon.bodyIndex) {
        // We hit another player
        if (me.game.HASH.debug === true) {
          console.log("Hit:", "Player 1:", response.a, "Player 2:", response.b, "Details:", response );
        }
        
        // Prevent further hits on this attack
        this.hit = true;

        // Send the attack action to the server for the next update
        if (me.game.HASH.debug === true) {
          if (me.state.current().updatePayload.attack !== undefined) {
            console.warn("An attack has already been reported by this player since the last update.");
          }
        }
        
        me.state.current().updatePayload.attack = other.playerId;
      }

      return false;
    }
    
    return true;
  }
});
