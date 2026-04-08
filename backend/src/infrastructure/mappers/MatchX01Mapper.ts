import { MatchX01 } from '../../domain/models/MatchX01';
import { PlayerX01 } from '../../domain/models/PlayerX01';
import { ThrowX01 } from '../../domain/models/ThrowX01';
import { MatchX01Config } from '../../domain/models/MatchX01Config';
import { MatchX01DTO } from '../persistence/MatchX01DTO';

export class MatchX01Mapper {
    // static toDomain(raw: MatchX01DTO): MatchX01 {
    //     const config = new MatchX01Config(
    //         raw.config.game,
    //         raw.config.typeOfGame as any,
    //         raw.config.numSets,
    //         raw.config.numLegs,
    //         raw.config.playerNames
    //     );

    //     const players = raw.players.map(p => {
    //         const throws = p.throws.map(t =>
    //             new ThrowX01(t.score, t.remainingScore, t.dartCount)
    //         );
    //         return PlayerX01.restore(
    //             p.id,
    //             p.name,
    //             p.remainingScore,
    //             p.numSetsWon,
    //             p.numLegsWon,
    //             throws
    //         );
    //     });

    //     return MatchX01.restore(
    //         raw.id,
    //         config,
    //         players,
    //         raw.activePlayerIndex,
    //         raw.status
    //     );
    // }
    static toDomain(raw: any): MatchX01 {
        // 1. Rehidratar Configuración con fallback a nulo/vacío
        const c = raw.config || {};
        const config = new MatchX01Config(
            c._game ?? c.game ?? 501,
            c._typeOfGame ?? c.typeOfGame,
            c._numSets ?? c.numSets ?? 1,
            c._numLegs ?? c.numLegs ?? 1,
            c._playerNames ?? c.playerNames ?? [] // Si ambos fallan, enviamos array vacío para evitar el crash
        );

        // 2. Rehidratar Jugadores (asegurando que throws sea un array)
        const players = (raw.players || []).map((p: any) => {
            const throwData = p._throws ?? p.throws ?? [];
            const throws = throwData.map((t: any) =>
                new ThrowX01(
                    t._score ?? t.score,
                    t._remainingScore ?? t.remainingScore,
                    t._dartCount ?? t.dartCount
                )
            );

            return PlayerX01.restore(
                p.id,
                p.name,
                p.remainingScore,
                p.numSetsWon,
                p.numLegsWon,
                throws
            );
        });

        // 3. Rehidratar Partida
        return MatchX01.restore(
            raw.id,
            config,
            players,
            raw.activePlayerIndex ?? 0,
            raw.startingPlayerIndexForLeg ?? 0,
            raw.startingPlayerIndexForSet ?? 0,
            raw.status ?? 'PLAYING'
        );
    }

    static toPersistence(domain: MatchX01): MatchX01DTO {
        return {
            id: domain.id,
            config: {
                game: (domain.config as any).game,
                typeOfGame: (domain.config as any).typeOfGame,
                numSets: (domain.config as any).numSets,
                numLegs: (domain.config as any).numLegs,
                playerNames: (domain.config as any).playerNames,
            },
            players: domain.players.map(p => ({
                id: p.id,
                name: p.name,
                remainingScore: p.remainingScore,
                numSetsWon: p.numSetsWon,
                numLegsWon: p.numLegsWon,
                throws: p.throws.map(t => ({
                    score: (t as any).score,
                    remainingScore: (t as any).remainingScore,
                    dartCount: (t as any).dartCount,
                })),
            })),
            activePlayerIndex: (domain as any).activePlayerIndex,
            startingPlayerIndexForLeg: (domain as any)._startingPlayerIndexForLeg ?? 0,
            startingPlayerIndexForSet: (domain as any)._startingPlayerIndexForSet ?? 0,
            status: domain.status,
        };
    }
}
