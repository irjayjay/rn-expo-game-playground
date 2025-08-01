export interface MatterEntity {
    body: Matter.Body;
    renderer: React.ComponentType<any>;
    [key: string]: any;
}

export type GameEntities = {
    physics: { engine: Matter.Engine; world: Matter.World }
    ball: MatterEntity
    paddle: MatterEntity
};

/// Behaviours are run during physics loop for each body.
export type Behavior = (body: Matter.Body, delta: number, context: any) => void;
