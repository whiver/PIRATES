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
     */
    init:function (x, y, settings) {
        // call the constructor
        this._super(me.Entity, 'init', [x, y , settings]);

        // set the default horizontal & vertical speed (accel vector)
        this.body.setVelocity(2, 2);

        this.body.gravity = 0;
        this.body.collisionType = me.collision.types.PLAYER_OBJECT;

        // ensure the player is updated even when outside of the viewport
        this.alwaysUpdate = true;

        this.attacking = false;

        // Replace the renderable part by a container to allow rendering multiple shapes
        this.characterRenderable = this.renderable;
        this.renderable = new me.Container(0,  0, settings.width, settings.height);
        this.renderable.addChild(this.characterRenderable);

        this.weapon = {};
    },

    /**
     * Add a weapon to the player, including its graphics & collision mask
     */
    setWeapon: function () {
        "use strict";

        // Remove the existing weapon if any
        if (this.weapon !== undefined) {
            this.renderable.removeChild(this.weapon);
        }

        this.weapon = new game.Sword();
        this.renderable.addChild(this.weapon);

        this.weapon.alpha = 0;

        // Set the anchor point of the weapon in the middle to ease flipping
        this.weapon.anchorPoint.set(0.5, 0.5);

        // Add the collision shape and store its index to find it later
        this.weapon.bodyIndex = this.body.addShape(new me.Rect(18, 4, 12, 24)) - 1;
    },

    /**
     * Make the player attack, including its animation and the hitbox
     */
    attack: function () {
        "use strict";
        if (!this.attacking) {
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
            if (this.body.vel.x < 0) {
                this.weapon.flipX(true);
            } else if (this.body.vel.x > 0) {
                this.weapon.flipX(false);
            }

            this.weapon.alpha = 1;

            // Run the attack animation
            this.weapon.setCurrentAnimation("attack", function () {
                // After the animation, hide the sprite and disable the hitbox
                this.weapon.alpha = 0;
                // Disable the hitbox
                this.attacking = false;
            }.bind(this));

            // Reset the animation, else the animation do not start at the first frame, though it should...
            this.weapon.setAnimationFrame(0);
        }
    },

    /**
     * collision handler
     * (called when colliding with other objects)
     */
    onCollision : function (response, other) {
        if(other instanceof game.Character){
            if (response.indexShapeB === this.weapon.bodyIndex && this.attacking) {
                // We hit another player
                if (me.game.HASH.debug === true) {
                    console.log("Hit:", "Player 1:", response.a, "Player 2:", response.b, "Details:", response );
                }
                other.characterRenderable.flicker(300);

                // TODO Hurting player
            }

            return false;
        }

        // Make all other objects solid
        return true;
    }
});
