import { MatchX01 } from '../../domain/models/MatchX01';
import { PlayerX01 } from '../../domain/models/PlayerX01';
import { ThrowX01 } from '../../domain/models/ThrowX01';
import { MatchX01Config } from '../../domain/models/MatchX01Config';
import { MatchX01DTO, MatchX01ConfigDTO, MatchX01SnapshotDTO, PlayerDTO, ThrowDTO, PlayerX01StatsDTO } from '../persistence/MatchX01DTO';
import { GameStatus } from '../../domain/enums/GameStatus';
import { PlayerX01Stats } from '../../domain/models/PlayerX01Stats';

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

        const players = (raw.players || []).map((p: any) =>
            MatchX01Mapper.playerDTOtoPlayerX01(p as PlayerDTO)
        );

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
            status: domain.status.toString(),
            history: domain.history.map(MatchX01Mapper.snapshotToDTO),
        };
    }

    // -------------------------------------------------------------------------
    // Helpers privados reutilizables
    // -------------------------------------------------------------------------

    private static throwDTOtoThrowX01(t: ThrowDTO): ThrowX01 {
        return new ThrowX01(
            t.score,
            t.remainingScore,
            t.dartCount,
        );
    }

    private static throwX01toDTO(t: ThrowX01): ThrowDTO {
        return {
            score: t.score,
            remainingScore: t.remainingScore,
            dartCount: t.dartCount,
        };
    }

    private static playerX01StatsDTOtoPlayerX01Stats(p: PlayerX01StatsDTO): PlayerX01Stats {
        return new PlayerX01Stats(
            p.hundredPlus,
            p.hundredFortyPlus,
            p.oneEighties,
            p.average,
            p.totalScore,
            p.totalDarts,
        );
    }

    private static playerX01StatstoPlayerX01StatsDTO(p: PlayerX01Stats): PlayerX01StatsDTO {
        return {
            hundredPlus: p.hundredPlus,
            hundredFortyPlus: p.hundredFortyPlus,
            oneEighties: p.oneEighties,
            average: p.average,
            totalScore: p.totalScore,
            totalDarts: p.totalDarts,
        };
    }

    private static playerDTOtoPlayerX01(p: PlayerDTO): PlayerX01 {
        const throwData = p.throws ?? [];
        const throws = throwData.map((t: any) => MatchX01Mapper.throwDTOtoThrowX01(t));

        const statsData = p.stats;
        const stats = statsData
            ? MatchX01Mapper.playerX01StatsDTOtoPlayerX01Stats(statsData)
            : new PlayerX01Stats();

        return PlayerX01.restore(
            p.id,
            p.name,
            p.remainingScore,
            p.numSetsWon,
            p.numLegsWon,
            throws,
            stats,
        );
    }

    private static playerX01toDTO(p: PlayerX01): PlayerDTO {
        return {
            id: p.id,
            name: p.name,
            remainingScore: p.remainingScore,
            numSetsWon: p.numSetsWon,
            numLegsWon: p.numLegsWon,
            throws: p.throws.map(t => MatchX01Mapper.throwX01toDTO(t)),
            stats: MatchX01Mapper.playerX01StatstoPlayerX01StatsDTO(p.stats),
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

    private static snapshotToDTO(s: {
        players: ReturnType<PlayerX01['snapshot']>[];
        activePlayerIndex: number;
        startingPlayerIndexForLeg: number;
        startingPlayerIndexForSet: number;
        status: GameStatus;
    }): MatchX01SnapshotDTO {
        return {
            players: s.players.map((pSnapshot: any) => {
                const player = PlayerX01.fromSnapshot(pSnapshot);
                return MatchX01Mapper.playerX01toDTO(player);
            }),
            activePlayerIndex: s.activePlayerIndex,
            startingPlayerIndexForLeg: s.startingPlayerIndexForLeg,
            startingPlayerIndexForSet: s.startingPlayerIndexForSet,
            status: s.status.toString(),
        };
    }
}
