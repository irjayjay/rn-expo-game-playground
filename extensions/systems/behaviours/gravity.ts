import { Behavior } from '@/extensions/types';
import Matter from 'matter-js';

/// Returns a function that applies grav force to the body it's added to.
export const gravityBehavior = (
  gravityCenter: Matter.Vector,
  strength: number,
  radius: number
): Behavior => {
  return (body: Matter.Body, delta: number, context: any): void => {
    const dx = gravityCenter.x - body.position.x;
    const dy = gravityCenter.y - body.position.y;
    const distSq = dx * dx + dy * dy;

    console.log('Gravity Behavior', { dx, dy, distSq, radius });

    if (distSq > radius * radius || distSq < 1e-6) return;

    const dist = Math.sqrt(distSq);
    const force = (body.mass * strength) / distSq;
    console.log('Applying force', { force, dx, dy });

    Matter.Body.applyForce(body, body.position, {
      x: (dx / dist) * force,
      y: (dy / dist) * force,
    });
  };
};
