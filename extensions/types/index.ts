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

export type Behavior = (body: Matter.Body, delta: number, context: any) => void;
