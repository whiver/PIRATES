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
 * Character entity. Defines the global behavior of all characters, playable or not.
 */
game.Character = me.Entity.extend({
  /**
   * constructor
   * @param {number} x        The x position of the character
   * @param {number} y        The y position of the character
   * @param {number} id       The server's ID of the character
   * @param {object} settings Additional properties to be passed to the entity
   */
  init:function (x, y, id) {
    var settings = {
      frameheight: 32,
      framewidth: 30,
      image: "pirates",
      width: 30,
      height:32
    };
    
    // call the constructor
    this._super(me.Entity, 'init', [x, y , settings]);
    
    // Character's properties
    this.playerId = id;
    this.weapon = {};
    this.characterRenderable = this.renderable;
    this.attacking = false;
    this.hit = false;

    // set the default horizontal & vertical speed (accel vector)
    this.body.setVelocity(2, 2);
    this.body.gravity = 0;
    this.body.collisionType = me.collision.types.PLAYER_OBJECT;

    // Replace the renderable part by a container to allow rendering multiple shapes
    this.renderable = new me.Container(0,  0, settings.width, settings.height);
    this.renderable.addChild(this.characterRenderable);
    this.renderable.autoSort = false;
  },

  /**
   * Add a weapon sprite to the character
   */
  setWeapon: function () {
    "use strict";

    // Remove the existing weapon if any
    if (this.weapon !== undefined) {
      this.renderable.removeChild(this.weapon);
    }

    this.weapon = new game.Sword();
    this.renderable.addChild(this.weapon);

    this.weapon.isRenderable = false;
  },

  /**
   * Make the player attack, including its animation and the hitbox
   */
  attack: function () {
    "use strict";
    if (!this.attacking) {
      var attackAnimation;
      this.attacking = true;

      // Debug assertions
      if (me.game.HASH.debug === true) {
        console.info("Attacking...");
        console.assert(this.weapon !== undefined, "The weapon should be defined.", this);
        console.assert(this.weapon.defaultWeaponPos !== undefined,
          "The default position of the weapon should be defined.",
          this.weapon);
      }

      // Update the weapon's position to fit the player
      // FIXME Position is hard-coded
      if (this.body.vel.x < 0) {
        // Facing left
        this.weapon.flipX(true);
        this.weapon.pos.x = this.weapon.defaultWeaponPos.x - 17;
        this.weapon.pos.y = this.weapon.defaultWeaponPos.y;
        this.body.shapes[this.weapon.bodyIndex] = this.weapon.defaultHitboxPos.left;
        this.body.updateBounds();
        attackAnimation = "attack_hor";
      } else if (this.body.vel.x > 0) {
        // Facing right
        this.weapon.flipX(false);
        this.weapon.pos.x = this.weapon.defaultWeaponPos.x;
        this.weapon.pos.y = this.weapon.defaultWeaponPos.y;
        this.body.shapes[this.weapon.bodyIndex] = this.weapon.defaultHitboxPos.right;
        this.body.updateBounds();
        attackAnimation = "attack_hor";
      } else if (this.body.vel.y > 0) {
        // Facing bottom
        this.weapon.flipX(false);
        this.weapon.flipY(true);
        this.weapon.pos.x = this.weapon.defaultWeaponPos.x - 5;
        this.weapon.pos.y = this.weapon.defaultWeaponPos.y + 10;
        this.body.shapes[this.weapon.bodyIndex] = this.weapon.defaultHitboxPos.bottom;
        this.body.updateBounds();
        attackAnimation = "attack_ver";
      } else if (this.body.vel.y < 0) {
        // Facing top
        this.weapon.flipX(false);
        this.weapon.flipY(false);
        this.weapon.pos.x = this.weapon.defaultWeaponPos.x - 5;
        this.weapon.pos.y = this.weapon.defaultWeaponPos.y - 5;
        this.body.shapes[this.weapon.bodyIndex] = this.weapon.defaultHitboxPos.top;
        this.body.updateBounds();
          attackAnimation = "attack_ver";
      } else {
        // Player is not moving: we keep the same attack parameters
        attackAnimation = this.weapon.current.name;
      }
      
      this.weapon.isRenderable = true;

      // Run the attack animation
      this.weapon.setCurrentAnimation(attackAnimation, function () {
        // After the animation, hide the sprite and disable the hitbox
        this.weapon.isRenderable = false;
        // Disable the hitbox
        this.attacking = false;
        this.hit = false;
      }.bind(this));

      // Reset the animation, else the animation do not start at the first frame, though it should...
      this.weapon.setAnimationFrame(0);
    }
  },
  
  /**
   * Hurts the player by dealing it some damages
   */
  hurt: function () {
    this.characterRenderable.flicker(300);
  },

  /**
   * collision handler
   * (called when colliding with other objects)
   */
  onCollision : function (response, other) {
    if(other instanceof game.Character){
      return false;
    }

    // Make all other objects solid
    return true;
  },

  /**
   * Kill the player, displaying the corresponding animation, then respawn it at the given location
   * @param {number} respawnX   The X position of the respawn
   * @param {number} respawnY   The Y position of the respawn
     */
  die: function (respawnX, respawnY) {
    "use strict";
    if (me.game.HASH.debug === true) {
      console.info("Player " + this.playerId + " died.");
    }

    // TODO Add this animation
    //this.characterRenderable.setCurrentAnimation("die");
    this.pos.x = respawnX;
    this.pos.y = respawnY;
  },
  
  /**
   * FIXME: Due to a MelonJS bug, we must overwrite the Entity's update
   * method, since it directly calls those from Container, which causes
   * the renderable to remain invisible
   * @ignore
   */
  update: function (dt) {
    this.renderable._super(me.Renderable, "update", [dt]);
    var isDirty = false;
    var isFloating = false;
    var isPaused = me.state.isPaused();
    var viewport = me.game.viewport;
    var globalFloatingCounter = 0;

    // Update container's absolute position
    this.renderable._absPos.setV(this.renderable.pos);
    if (this.renderable.ancestor) {
      this.renderable._absPos.add(this.renderable.ancestor._absPos);
    }

    for (var i = this.renderable.children.length, obj; i--, (obj = this.renderable.children[i]);) {
      if (isPaused && (!obj.updateWhenPaused)) {
        // skip this object
        continue;
      }

      if (obj.isRenderable) {
        isFloating = (globalFloatingCounter > 0 || obj.floating);
        if (isFloating) {
          globalFloatingCounter++;
        }
        // check if object is visible
        //~ obj.inViewport = isFloating || viewport.isVisible(this.getBounds());
        obj.inViewport = true;

        // update our object
        isDirty = ((obj.inViewport || obj.alwaysUpdate) && obj.update(dt)) || isDirty;

        // Update child's absolute position
        obj._absPos.setV(this._absPos).add(obj.pos);

        if (globalFloatingCounter > 0) {
          globalFloatingCounter--;
        }
      }
      else {
        // just directly call update() for non renderable object
        isDirty = obj.update(dt) || isDirty;
      }
    }

    return isDirty;
  }
});
