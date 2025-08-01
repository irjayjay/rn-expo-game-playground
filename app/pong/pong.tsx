
import Matter from '@/extensions/matter-ext';
import { BehaviorSystem } from '@/extensions/systems/behaviours';
import { gravityBehavior } from '@/extensions/systems/behaviours/gravity';
import React, { useCallback, useRef } from 'react';
import { Dimensions, PanResponder, PanResponderInstance, StyleSheet, View } from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import { GameEntities, MatterEntity } from '../../extensions/types';

const { width: WIDTH, height: HEIGHT } = Dimensions.get('window');
const BALL_SIZE = 20;
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 20;

const BallStyle = (props: { size?: number, color?: string }) => {
    return {
        position: 'absolute',
        width: props.size ?? BALL_SIZE,
        height: props.size ?? BALL_SIZE,
        borderRadius: props.size ?? BALL_SIZE / 2,
        backgroundColor: props.color ?? '#fff',
    }
}

// Generates the actual component rendered
const BallRender = (props: { size: number, style?: {}, options?: Matter.IBodyDefinition }): React.FC<{ body: Matter.Body }> => ({ body }) => {
    const x = body.position.x - props.size / 2;
    const y = body.position.y - props.size / 2;
    return <View style={[props.style ?? styles.ball, { left: x, top: y }]} />;
}

// Internal entity we use to contain our object's data
const BallEntity = (props: {
    size?: number,
    location?: { x: number, y: number },
    style?: {},
    options?: {}
}): MatterEntity => {
    const size = props.size ?? BALL_SIZE;
    const style = props.style ?? {}

    const ball = Matter.Bodies.circle(
        props.location?.x ?? WIDTH / 2,
        props.location?.y ?? HEIGHT / 2,
        size / 2,
        {
            restitution: 1,
            frictionAir: 0,
            friction: 0,
            inertia: Infinity,
            mass: 1,
        }
    );
    ball.hasNoGravity = true;
    if (props.options) {
        for (const key in props.options) {
            if (props.options.hasOwnProperty(key)) {
                (ball as any)[key] = (props.options as any)[key];
            }
        }
    }

    return { body: ball, renderer: BallRender({ size, style: { ...BallStyle({ size }), ...style } }) }
}

// Defining the ball.
const ballInstance = BallEntity({ size: BALL_SIZE, location: { x: WIDTH / 2, y: HEIGHT / 2 } });
// Defining the paddle.
const paddleInstance = BallEntity({
    size: PADDLE_WIDTH,
    location: { x: WIDTH / 2, y: HEIGHT - 50 },
    options: {
        isStatic: true,
        behaviors: [
            gravityBehavior({ x: WIDTH / 2, y: HEIGHT / 2 }, 1, 200) // Example gravity behavior
        ],
    }
});

const SPEED = 4;

export default function Pong() {
    const engine = useRef(Matter.Engine.create({ enableSleeping: false })).current;
    const world = engine.world;


    const movement = useRef<{ x: number, y: number }>({ x: 0, y: 0 }); // -1 = left, 1 = right, 0 = still


    Matter.Events.on(engine, 'beforeUpdate', function () {
        // Keeping this to remind myself we have access to it.
    });

    React.useEffect(() => {
        // Arrow key controls for the paddle
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft' || e.key === 'a') movement.current = { x: -1, y: movement.current.y }
            if (e.key === 'ArrowRight' || e.key === 'd') movement.current = { x: 1, y: movement.current.y }
            if (e.key === 'ArrowUp' || e.key === 'w') movement.current = { x: movement.current.x, y: -1 }
            if (e.key === 'ArrowDown' || e.key === 's') movement.current = { x: movement.current.x, y: 1 }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft' || e.key === 'a') {
                movement.current = { x: movement.current.x === 1 ? 1 : 0, y: movement.current.y }
            }
            if (e.key === 'ArrowRight' || e.key === 'd') {
                movement.current = { x: movement.current.x === -1 ? -1 : 0, y: movement.current.y }
            }
            if (e.key === 'ArrowUp' || e.key === 'w') {
                movement.current = { x: movement.current.x, y: movement.current.y === 1 ? 1 : 0 }
            }
            if (e.key === 'ArrowDown' || e.key === 's') {
                movement.current = { x: movement.current.x, y: movement.current.y === -1 ? -1 : 0 }
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // Sets paddle position based on physics updates
    const physics = useCallback((entities: GameEntities, { time }: { time: { delta: number } }) => {
        const move = { x: movement.current.x * SPEED, y: movement.current.y * SPEED };
        // 
        if (move.x !== 0 || move.y !== 0) {
            Matter.Body.setPosition(paddleInstance.body, {
                x: entities.paddle.body.position.x + move.x,
                y: entities.paddle.body.position.y + move.y,
            });
        }

        Matter.Engine.update(entities.physics.engine, time.delta);
        return entities;
    }, []);

    const walls = [
        Matter.Bodies.rectangle(+10, HEIGHT / 2, 20, HEIGHT, { isStatic: true }), // Left
        Matter.Bodies.rectangle(WIDTH / 2, +10, WIDTH, 20, { isStatic: true }), // Top
        Matter.Bodies.rectangle(WIDTH - 10, HEIGHT / 2, 20, HEIGHT, { isStatic: true }), // Right
        Matter.Bodies.rectangle(WIDTH / 2, HEIGHT - 10, WIDTH, 20, { isStatic: true }) // Bottom
    ];

    Matter.World.add(world, [ballInstance.body, paddleInstance.body, ...walls]);
    Matter.Body.setVelocity(ballInstance.body, { x: 0, y: 10 });

    const panResponder: PanResponderInstance = PanResponder.create({
        onMoveShouldSetPanResponder: () => true,
        onPanResponderMove: (_, gestureState) => {
            Matter.Body.setPosition(paddleInstance.body, {
                x: gestureState.moveX,
                y: gestureState.moveY,
            });
        },
    });

    return (
        <View style={styles.container}
            {...panResponder.panHandlers}
            // Required on web:
            onStartShouldSetResponder={() => true}
            onResponderMove={(e) => {
                const x = e.nativeEvent.pageX;
                const y = e.nativeEvent.pageY;
                Matter.Body.setPosition(paddleInstance.body, { x, y });
            }}>
            <GameEngine
                systems={[physics, BehaviorSystem]}
                entities={{
                    physics: { engine, world },
                    ball: ballInstance,// BallObject({ size: BALL_SIZE, location: { x: WIDTH / 2, y: HEIGHT / 2 } }),
                    paddle: paddleInstance,// { body: paddle, renderer: BallRender(120) },
                }}
                style={styles.game}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#000' },
    game: { flex: 1 },
    ball: {
        position: 'absolute',
        width: BALL_SIZE,
        height: BALL_SIZE,
        borderRadius: BALL_SIZE / 2,
        backgroundColor: '#fff',
    },
    paddle: {
        position: 'absolute',
        width: PADDLE_WIDTH,
        height: PADDLE_HEIGHT,
        backgroundColor: '#fff',
    },
});
