import { MatchX01 } from '../../domain/models/MatchX01';
import { PlayerX01 } from '../../domain/models/PlayerX01';
import { ThrowX01 } from '../../domain/models/ThrowX01';
import { MatchX01Config } from '../../domain/models/MatchX01Config';
import { MatchX01DTO, MatchX01SnapshotDTO, PlayerDTO, ThrowDTO } from '../persistence/MatchX01DTO';

export class MatchX01Mapper {
    // -------------------------------------------------------------------------
    // toDomain
    // -------------------------------------------------------------------------

    static toDomain(raw: any): MatchX01 {
        const c = raw.config || {};
        const config = new MatchX01Config(
            c._game ?? c.game ?? 501,
            c._typeOfGame ?? c.typeOfGame,
            c._numSets ?? c.numSets ?? 1,
            c._numLegs ?? c.numLegs ?? 1,
            c._playerNames ?? c.playerNames ?? [],
        );

        const players = (raw.players || []).map((p: any) => {
            const throwData = p._throws ?? p.throws ?? [];
            const throws = throwData.map((t: any) =>
                new ThrowX01(
                    t._score ?? t.score,
                    t._remainingScore ?? t.remainingScore,
                    t._dartCount ?? t.dartCount,
                )
            );
            return PlayerX01.restore(
                p.id,
                p.name,
                p._remainingScore ?? p.remainingScore,
                p._numSetsWon ?? p.numSetsWon,
                p._numLegsWon ?? p.numLegsWon,
                throws,
            );
        });

        const history = (raw.history ?? []).map(
            (s: MatchX01SnapshotDTO) => MatchX01Mapper.snapshotDTOtoSnapshot(s)
        );

        return MatchX01.restore(
            raw.id,
            config,
            players,
            raw.activePlayerIndex ?? 0,
            raw.startingPlayerIndexForLeg ?? 0,
            raw.startingPlayerIndexForSet ?? 0,
            raw.status ?? 'PLAYING',
            history,
        );
    }

    // -------------------------------------------------------------------------
    // toPersistence
    // -------------------------------------------------------------------------

    static toPersistence(domain: MatchX01): MatchX01DTO {
        const cfg = domain.config as any;
        return {
            id: domain.id,
            config: {
                game: cfg._game ?? cfg.game,
                typeOfGame: cfg._typeOfGame ?? cfg.typeOfGame,
                numSets: cfg._numSets ?? cfg.numSets,
                numLegs: cfg._numLegs ?? cfg.numLegs,
                playerNames: cfg._playerNames ?? cfg.playerNames,
            },
            players: domain.players.map(MatchX01Mapper.playerX01toDTO),
            activePlayerIndex: domain.activePlayerIndex,
            startingPlayerIndexForLeg: domain.startingPlayerIndexForLeg,
            startingPlayerIndexForSet: domain.startingPlayerIndexForSet,
            status: domain.status,
            history: domain.history.map(MatchX01Mapper.snapshotToDTO),
        };
    }

    // -------------------------------------------------------------------------
    // Helpers privados reutilizables
    // -------------------------------------------------------------------------

    private static throwDTOtoThrowX01(t: ThrowDTO): ThrowX01 {
        return new ThrowX01(t.score, t.remainingScore, t.dartCount);
    }

    private static throwX01toDTO(t: ThrowX01): ThrowDTO {
        return {
            score: t.score,
            remainingScore: t.remainingScore,
            dartCount: t.dartCount,
        };
    }

    private static playerDTOtoPlayerX01(p: PlayerDTO): PlayerX01 {
        const throws = p.throws.map(MatchX01Mapper.throwDTOtoThrowX01);
        return PlayerX01.restore(
            p.id,
            p.name,
            p.remainingScore,
            p.numSetsWon,
            p.numLegsWon,
            throws,
        );
    }

    private static playerX01toDTO(p: PlayerX01): PlayerDTO {
        return {
            id: p.id,
            name: p.name,
            remainingScore: p.remainingScore,
            numSetsWon: p.numSetsWon,
            numLegsWon: p.numLegsWon,
            throws: p.throws.map(MatchX01Mapper.throwX01toDTO),
        };
    }

    private static snapshotDTOtoSnapshot(s: MatchX01SnapshotDTO) {
        return {
            players: s.players.map(p => MatchX01Mapper.playerDTOtoPlayerX01(p).snapshot()),
            activePlayerIndex: s.activePlayerIndex,
            startingPlayerIndexForLeg: s.startingPlayerIndexForLeg,
            startingPlayerIndexForSet: s.startingPlayerIndexForSet,
            status: s.status,
        };
    }

    private static snapshotToDTO(s: ReturnType<MatchX01['history'][number] extends infer T ? () => T : never>): MatchX01SnapshotDTO;
    private static snapshotToDTO(s: {
        players: ReturnType<PlayerX01['snapshot']>[];
        activePlayerIndex: number;
        startingPlayerIndexForLeg: number;
        startingPlayerIndexForSet: number;
        status: 'PLAYING' | 'FINISHED';
    }): MatchX01SnapshotDTO {
        return {
            players: s.players.map(p => ({
                id: p.id,
                name: p.name,
                remainingScore: p.remainingScore,
                numSetsWon: p.numSetsWon,
                numLegsWon: p.numLegsWon,
                throws: p.throws.map(t => ({
                    score: t.score,
                    remainingScore: t.remainingScore,
                    dartCount: t.dartCount,
                })),
            })),
            activePlayerIndex: s.activePlayerIndex,
            startingPlayerIndexForLeg: s.startingPlayerIndexForLeg,
            startingPlayerIndexForSet: s.startingPlayerIndexForSet,
            status: s.status,
        };
    }
}
