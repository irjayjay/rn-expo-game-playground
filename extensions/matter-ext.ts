import Matter, { Body, Engine } from "matter-js";
import { Behavior } from "./types";


// 🔁 Extend Body type to include our custom property
declare module "matter-js" {
    interface Body {
        hasNoGravity?: boolean;
        behaviors?: Behavior[];
    }
}

// ✅ Backup the original Engine.update
const originalUpdate = Engine.update;

// ✅ Override Engine.update with custom logic
Engine.update = function (
    engine: Matter.Engine,
    delta?: number,
    correction?: number
) {
    const gravity = engine.world.gravity;

    for (const body of engine.world.bodies) {
        if (body.hasNoGravity) {
            const gravityForce = {
                x: body.mass * gravity.x * gravity.scale,
                y: body.mass * gravity.y * gravity.scale,
            };

            Body.applyForce(body, body.position, {
                x: -gravityForce.x,
                y: -gravityForce.y,
            });
        }
    }

    // Call the original update method
    return originalUpdate.call(this, engine, delta, correction);
};

// ✅ Export patched Matter so you can import it instead of vanilla Matter
export default Matter;
