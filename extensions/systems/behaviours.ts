import { MatterEntity } from '@/extensions/types';
import { GameEngineUpdateEventOptionType } from 'react-native-game-engine';

type EntityMap = Record<string, MatterEntity>;

// Allows separate entities/Objects to have their own behaviors
export const BehaviorSystem = (
    entities: EntityMap,
    { time }: GameEngineUpdateEventOptionType
): EntityMap => {
    for (const entity of Object.values(entities)) {
        const body = entity.body;
        if (!body?.behaviors) continue;

        for (const behavior of body.behaviors) {
            behavior(body, time.delta, { entity, entities });
        }
    }

    return entities;
};