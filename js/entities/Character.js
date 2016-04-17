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
        this.renderable.autoSort = false;

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

        this.weapon.isRenderable = false;

        // Add the collision shape and store its index to find it later
        this.weapon.bodyIndex = this.body.addShape(this.weapon.defaultHitboxPos.right) - 1;
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
