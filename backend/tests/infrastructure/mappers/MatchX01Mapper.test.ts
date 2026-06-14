import { MatchX01Mapper } from '../../../src/infrastructure/mappers/MatchX01Mapper';
import { MatchX01 } from '../../../src/domain/models/MatchX01';
import { MatchX01Config } from '../../../src/domain/models/MatchX01Config';
import { PlayerX01 } from '../../../src/domain/models/PlayerX01';
import { GameTypes } from '../../../src/domain/enums/GameTypes';
import { GameStatus } from '../../../src/domain/enums/GameStatus';

// ---------------------------------------------------------------------------
// Helpers para construir DTOs mínimos válidos
// ---------------------------------------------------------------------------

const makePlayerDTO = (overrides: Partial<any> = {}) => ({
    id: 'p-1',
    name: 'Alice',
    remainingScore: 301,
    numSetsWon: 0,
    numLegsWon: 0,
    throws: [{ score: 0, remainingScore: 301, dartCount: 0 }],
    stats: {
        hundredPlus: 0,
        hundredFortyPlus: 0,
        oneEighties: 0,
        average: 0,
        totalScore: 0,
        totalDarts: 0,
    },
    ...overrides,
});

const makeConfigDTO = (overrides: Partial<any> = {}) => ({
    game: 301,
    typeOfGame: GameTypes.FIRST_TO,
    numSets: 1,
    numLegs: 1,
    playerNames: ['Alice', 'Bob'],
    ...overrides,
});

const makeMatchDTO = (overrides: Partial<any> = {}) => ({
    id: 'match-1',
    config: makeConfigDTO(),
    players: [makePlayerDTO(), makePlayerDTO({ id: 'p-2', name: 'Bob' })],
    activePlayerIndex: 0,
    startingPlayerIndexForLeg: 0,
    startingPlayerIndexForSet: 0,
    status: 'PLAYING',
    history: [],
    ...overrides,
});

// ---------------------------------------------------------------------------
// Suites
// ---------------------------------------------------------------------------

describe('MatchX01Mapper', () => {

    // -------------------------------------------------------------------------
    // configToDomain
    // -------------------------------------------------------------------------

    describe('configToDomain()', () => {
        it('debería mapear un DTO con claves públicas a MatchX01Config', () => {
            const dto = makeConfigDTO();

            const config = MatchX01Mapper.configToDomain(dto);

            expect(config).toBeInstanceOf(MatchX01Config);
            expect(config.game).toBe(301);
            expect(config.typeOfGame).toBe(GameTypes.FIRST_TO);
            expect(config.numSets).toBe(1);
            expect(config.numLegs).toBe(1);
            expect(config.playerNames).toEqual(['Alice', 'Bob']);
        });

        it('debería usar claves privadas (_game, etc.) si están presentes', () => {
            const raw = {
                _game: 501,
                _typeOfGame: GameTypes.BEST_OF,
                _numSets: 2,
                _numLegs: 3,
                _playerNames: ['Carlos', 'Diana'],
            };

            const config = MatchX01Mapper.configToDomain(raw);

            expect(config.game).toBe(501);
            expect(config.typeOfGame).toBe(GameTypes.BEST_OF);
            expect(config.numSets).toBe(2);
            expect(config.numLegs).toBe(3);
            expect(config.playerNames).toEqual(['Carlos', 'Diana']);
        });

        it('debería usar valores por defecto cuando faltan campos', () => {
            const config = MatchX01Mapper.configToDomain({});

            expect(config.game).toBe(501);
            expect(config.numSets).toBe(1);
            expect(config.numLegs).toBe(1);
            expect(config.playerNames).toEqual([]);
        });
    });

    // -------------------------------------------------------------------------
    // configToDTO
    // -------------------------------------------------------------------------

    describe('configToDTO()', () => {
        it('debería convertir un MatchX01Config a DTO plano', () => {
            const config = new MatchX01Config(301, GameTypes.FIRST_TO, 1, 1, ['Alice', 'Bob']);

            const dto = MatchX01Mapper.configToDTO(config);

            expect(dto.game).toBe(301);
            expect(dto.typeOfGame).toBe(GameTypes.FIRST_TO);
            expect(dto.numSets).toBe(1);
            expect(dto.numLegs).toBe(1);
            expect(dto.playerNames).toEqual(['Alice', 'Bob']);
        });

        it('el round-trip configToDTO → configToDomain debería preservar los datos', () => {
            const original = new MatchX01Config(501, GameTypes.BEST_OF, 2, 3, ['X', 'Y', 'Z']);

            const dto = MatchX01Mapper.configToDTO(original);
            const restored = MatchX01Mapper.configToDomain(dto);

            expect(restored.game).toBe(original.game);
            expect(restored.typeOfGame).toBe(original.typeOfGame);
            expect(restored.numSets).toBe(original.numSets);
            expect(restored.numLegs).toBe(original.numLegs);
            expect(restored.playerNames).toEqual(original.playerNames);
        });
    });

    // -------------------------------------------------------------------------
    // toDomain
    // -------------------------------------------------------------------------

    describe('toDomain()', () => {
        it('debería construir un MatchX01 desde un DTO con status PLAYING (string)', () => {
            const dto = makeMatchDTO({ status: 'PLAYING' });

            const match = MatchX01Mapper.toDomain(dto);

            expect(match).toBeInstanceOf(MatchX01);
            expect(match.id).toBe('match-1');
            expect(match.status).toBe(GameStatus.PLAYING);
            expect(match.players).toHaveLength(2);
        });

        it('debería construir un MatchX01 con status FINISHED', () => {
            const dto = makeMatchDTO({ status: 'FINISHED' });

            const match = MatchX01Mapper.toDomain(dto);

            expect(match.status).toBe(GameStatus.FINISHED);
        });

        it('debería manejar status como número (legacy)', () => {
            const dto = makeMatchDTO({ status: String(GameStatus.PLAYING) });

            const match = MatchX01Mapper.toDomain(dto);

            expect(match.status).toBe(GameStatus.PLAYING);
        });

        it('debería usar activePlayerIndex y startingPlayerIndex del DTO', () => {
            const dto = makeMatchDTO({
                activePlayerIndex: 1,
                startingPlayerIndexForLeg: 1,
                startingPlayerIndexForSet: 1,
            });

            const match = MatchX01Mapper.toDomain(dto);

            expect(match.activePlayerIndex).toBe(1);
            expect(match.startingPlayerIndexForLeg).toBe(1);
            expect(match.startingPlayerIndexForSet).toBe(1);
        });

        it('debería usar 0 como valor por defecto para los índices cuando no están en el DTO', () => {
            const dto = { ...makeMatchDTO() };
            delete (dto as any).activePlayerIndex;
            delete (dto as any).startingPlayerIndexForLeg;
            delete (dto as any).startingPlayerIndexForSet;

            const match = MatchX01Mapper.toDomain(dto);

            expect(match.activePlayerIndex).toBe(0);
        });

        it('debería reconstruir el historial de snapshots si viene en el DTO', () => {
            const snapshot = {
                players: [makePlayerDTO(), makePlayerDTO({ id: 'p-2', name: 'Bob' })],
                activePlayerIndex: 0,
                startingPlayerIndexForLeg: 0,
                startingPlayerIndexForSet: 0,
                status: 'PLAYING',
            };
            const dto = makeMatchDTO({ history: [snapshot] });

            const match = MatchX01Mapper.toDomain(dto);

            expect(match.history).toHaveLength(1);
        });

        it('debería manejar status FINISHED en una snapshot del historial', () => {
            const snapshot = {
                players: [makePlayerDTO(), makePlayerDTO({ id: 'p-2', name: 'Bob' })],
                activePlayerIndex: 0,
                startingPlayerIndexForLeg: 0,
                startingPlayerIndexForSet: 0,
                status: 'FINISHED',
            };
            const dto = makeMatchDTO({ history: [snapshot] });

            // No debería lanzar excepción
            const match = MatchX01Mapper.toDomain(dto);
            expect(match.history).toHaveLength(1);
        });

        it('debería manejar players sin throws (array vacío)', () => {
            const dto = makeMatchDTO({
                players: [makePlayerDTO({ throws: [] }), makePlayerDTO({ id: 'p-2', name: 'Bob', throws: [] })],
            });

            const match = MatchX01Mapper.toDomain(dto);

            expect(match.players[0].throws).toHaveLength(0);
        });

        it('debería manejar players sin stats (null/undefined) usando PlayerX01Stats por defecto', () => {
            const playerNoStats = { ...makePlayerDTO(), stats: undefined };
            const dto = makeMatchDTO({ players: [playerNoStats, makePlayerDTO({ id: 'p-2', name: 'Bob' })] });

            // No debería lanzar
            const match = MatchX01Mapper.toDomain(dto);
            expect(match.players[0]).toBeTruthy();
        });

        it('debería reconstruir el config desde el DTO del match', () => {
            const dto = makeMatchDTO({ config: makeConfigDTO({ game: 501 }) });

            const match = MatchX01Mapper.toDomain(dto);

            expect(match.config.game).toBe(501);
        });
    });

    // -------------------------------------------------------------------------
    // toPersistence
    // -------------------------------------------------------------------------

    describe('toPersistence()', () => {
        it('debería serializar un MatchX01 a DTO plano', () => {
            const config = new MatchX01Config(301, GameTypes.FIRST_TO, 1, 1, ['Alice', 'Bob']);
            const match = MatchX01.create('match-abc', config);

            const dto = MatchX01Mapper.toPersistence(match);

            expect(dto.id).toBe('match-abc');
            expect(dto.config.game).toBe(301);
            expect(dto.players).toHaveLength(2);
            expect(dto.activePlayerIndex).toBe(0);
            expect(dto.status).toBe(String(GameStatus.PLAYING));
            expect(dto.history).toEqual([]);
        });

        it('el round-trip toPersistence → toDomain debería preservar el estado completo', () => {
            const config = new MatchX01Config(301, GameTypes.FIRST_TO, 1, 1, ['Alice', 'Bob']);
            const match = MatchX01.create('roundtrip-id', config);
            match.addThrow(60); // Alice tira

            const dto = MatchX01Mapper.toPersistence(match);
            const restored = MatchX01Mapper.toDomain(dto);

            expect(restored.id).toBe(match.id);
            expect(restored.activePlayerIndex).toBe(match.activePlayerIndex);
            expect(restored.status).toBe(match.status);
            expect(restored.players[0].remainingScore).toBe(match.players[0].remainingScore);
            expect(restored.history).toHaveLength(match.history.length);
        });

        it('debería serializar el historial de snapshots si existe', () => {
            const config = new MatchX01Config(301, GameTypes.FIRST_TO, 1, 1, ['Alice', 'Bob']);
            const match = MatchX01.create('match-hist', config);
            match.addThrow(60);
            match.addThrow(45);

            const dto = MatchX01Mapper.toPersistence(match);

            expect(dto.history.length).toBeGreaterThan(0);
            expect(dto.history[0]).toHaveProperty('players');
            expect(dto.history[0]).toHaveProperty('activePlayerIndex');
            expect(dto.history[0]).toHaveProperty('status');
        });

        it('debería serializar correctamente el config con claves privadas', () => {
            const config = new MatchX01Config(501, GameTypes.BEST_OF, 2, 5, ['A', 'B']);
            const match = MatchX01.create('m2', config);

            const dto = MatchX01Mapper.toPersistence(match);

            expect(dto.config.game).toBe(501);
            expect(dto.config.typeOfGame).toBe(GameTypes.BEST_OF);
            expect(dto.config.numSets).toBe(2);
            expect(dto.config.numLegs).toBe(5);
            expect(dto.config.playerNames).toEqual(['A', 'B']);
        });

        it('debería serializar las stats de los jugadores', () => {
            const config = new MatchX01Config(301, GameTypes.FIRST_TO, 1, 1, ['Alice', 'Bob']);
            const match = MatchX01.create('m3', config);

            const dto = MatchX01Mapper.toPersistence(match);

            expect(dto.players[0].stats).toBeDefined();
            expect(dto.players[0].stats).toHaveProperty('hundredPlus');
            expect(dto.players[0].stats).toHaveProperty('average');
        });
    });
});
