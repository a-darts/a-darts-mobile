import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStorageMatchX01Repository } from '../../../src/infrastructure/repositories/AsyncStorageMatchX01Repository';
import { MatchX01 } from '../../../src/domain/models/MatchX01';
import { MatchX01Config } from '../../../src/domain/models/MatchX01Config';
import { MatchX01Mapper } from '../../../src/infrastructure/mappers/MatchX01Mapper';
import { GameTypes } from '../../../src/domain/enums/GameTypes';

// ---------------------------------------------------------------------------
// Mock de AsyncStorage
// ---------------------------------------------------------------------------

jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
}));

const mockStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeConfig = (game = 301) =>
    new MatchX01Config(game, GameTypes.FIRST_TO, 1, 1, ['Alice', 'Bob']);

const makeMatch = (id = 'match-1', game = 301) =>
    MatchX01.create(id, makeConfig(game));

// ---------------------------------------------------------------------------
// Suites
// ---------------------------------------------------------------------------

describe('AsyncStorageMatchX01Repository', () => {
    const PREFIX = '@match_';
    const RECENT_KEY = '@recent_games';
    let repo: AsyncStorageMatchX01Repository;

    beforeEach(() => {
        repo = new AsyncStorageMatchX01Repository();
        jest.clearAllMocks();
        jest.spyOn(console, 'error').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // -------------------------------------------------------------------------
    // save
    // -------------------------------------------------------------------------

    describe('save()', () => {
        it('debería serializar la partida y guardarla con la clave correcta', async () => {
            mockStorage.setItem.mockResolvedValueOnce(undefined as any);
            const match = makeMatch('abc-123');

            await repo.save(match);

            expect(mockStorage.setItem).toHaveBeenCalledTimes(1);
            const [key, value] = mockStorage.setItem.mock.calls[0];
            expect(key).toBe(`${PREFIX}abc-123`);
            const parsed = JSON.parse(value as string);
            expect(parsed.id).toBe('abc-123');
        });

        it('debería lanzar error con mensaje legible si AsyncStorage falla', async () => {
            mockStorage.setItem.mockRejectedValueOnce(new Error('disk full'));
            const match = makeMatch();

            await expect(repo.save(match)).rejects.toThrow('Could not save match state');
        });

        it('debería incluir todos los campos del DTO en el JSON guardado', async () => {
            mockStorage.setItem.mockResolvedValueOnce(undefined as any);
            const match = makeMatch('m-full');
            match.addThrow(60); // genera historial

            await repo.save(match);

            const [, value] = mockStorage.setItem.mock.calls[0];
            const parsed = JSON.parse(value as string);
            expect(parsed).toHaveProperty('config');
            expect(parsed).toHaveProperty('players');
            expect(parsed).toHaveProperty('status');
            expect(parsed).toHaveProperty('history');
        });
    });

    // -------------------------------------------------------------------------
    // getById
    // -------------------------------------------------------------------------

    describe('getById()', () => {
        it('debería devolver null si no existe la clave en AsyncStorage', async () => {
            mockStorage.getItem.mockResolvedValueOnce(null);

            const result = await repo.getById('no-exist');

            expect(result).toBeNull();
            expect(mockStorage.getItem).toHaveBeenCalledWith(`${PREFIX}no-exist`);
        });

        it('debería reconstruir el MatchX01 desde el JSON almacenado', async () => {
            const match = makeMatch('m-get');
            const dto = MatchX01Mapper.toPersistence(match);
            mockStorage.getItem.mockResolvedValueOnce(JSON.stringify(dto));

            const result = await repo.getById('m-get');

            expect(result).toBeInstanceOf(MatchX01);
            expect(result?.id).toBe('m-get');
        });

        it('debería devolver null y logear error si el JSON está corrupto', async () => {
            mockStorage.getItem.mockResolvedValueOnce('{ corrupted json :::');

            const result = await repo.getById('bad-json');

            expect(result).toBeNull();
            expect(console.error).toHaveBeenCalled();
        });

        it('debería devolver null si AsyncStorage lanza excepción', async () => {
            mockStorage.getItem.mockRejectedValueOnce(new Error('IO error'));

            const result = await repo.getById('err-id');

            expect(result).toBeNull();
        });

        it('debería preservar el estado (score) al hacer un round-trip save → getById', async () => {
            const match = makeMatch('rt-1');
            match.addThrow(100); // Alice pasa de 301 a 201

            const dto = MatchX01Mapper.toPersistence(match);
            mockStorage.setItem.mockResolvedValueOnce(undefined as any);
            await repo.save(match);

            mockStorage.getItem.mockResolvedValueOnce(JSON.stringify(dto));
            const restored = await repo.getById('rt-1');

            expect(restored?.players[0].remainingScore).toBe(201);
        });
    });

    // -------------------------------------------------------------------------
    // delete
    // -------------------------------------------------------------------------

    describe('delete()', () => {
        it('debería llamar a removeItem con la clave correcta', async () => {
            mockStorage.removeItem.mockResolvedValueOnce(undefined as any);

            await repo.delete('match-del');

            expect(mockStorage.removeItem).toHaveBeenCalledWith(`${PREFIX}match-del`);
        });

        it('debería devolver undefined al completarse correctamente', async () => {
            mockStorage.removeItem.mockResolvedValueOnce(undefined as any);

            const result = await repo.delete('m-1');

            expect(result).toBeUndefined();
        });

        it('debería propagar la excepción si AsyncStorage falla', async () => {
            mockStorage.removeItem.mockRejectedValueOnce(new Error('Cannot delete'));

            await expect(repo.delete('err-id')).rejects.toThrow('Cannot delete');
        });
    });

    // -------------------------------------------------------------------------
    // saveRecentConfig
    // -------------------------------------------------------------------------

    describe('saveRecentConfig()', () => {
        it('debería guardar la primera config cuando el almacenamiento está vacío', async () => {
            mockStorage.getItem.mockResolvedValueOnce(null);
            mockStorage.setItem.mockResolvedValueOnce(undefined as any);

            const config = makeConfig();
            await repo.saveRecentConfig(config);

            expect(mockStorage.setItem).toHaveBeenCalledWith(RECENT_KEY, expect.any(String));
            const saved = JSON.parse(mockStorage.setItem.mock.calls[0][1] as string);
            expect(saved).toHaveLength(1);
        });

        it('debería agregar la nueva config al principio de la lista', async () => {
            const existingConfig = makeConfig(501);
            const existingDTO = MatchX01Mapper.configToDTO(existingConfig);
            mockStorage.getItem.mockResolvedValueOnce(JSON.stringify([existingDTO]));
            mockStorage.setItem.mockResolvedValueOnce(undefined as any);

            const newConfig = makeConfig(301);
            await repo.saveRecentConfig(newConfig);

            const saved = JSON.parse(mockStorage.setItem.mock.calls[0][1] as string);
            expect(saved[0].game).toBe(301);
            expect(saved[1].game).toBe(501);
        });

        it('debería eliminar duplicados (misma config ya guardada) antes de insertar', async () => {
            const config = makeConfig(301);
            const existingDTO = MatchX01Mapper.configToDTO(config);
            mockStorage.getItem.mockResolvedValueOnce(JSON.stringify([existingDTO]));
            mockStorage.setItem.mockResolvedValueOnce(undefined as any);

            await repo.saveRecentConfig(config);

            const saved = JSON.parse(mockStorage.setItem.mock.calls[0][1] as string);
            expect(saved).toHaveLength(1); // no duplicado
        });

        it('debería limitar la lista a un máximo de 3 configuraciones', async () => {
            const dtos = [
                MatchX01Mapper.configToDTO(makeConfig(501)),
                MatchX01Mapper.configToDTO(makeConfig(701)),
                MatchX01Mapper.configToDTO(makeConfig(401)),
            ];
            mockStorage.getItem.mockResolvedValueOnce(JSON.stringify(dtos));
            mockStorage.setItem.mockResolvedValueOnce(undefined as any);

            const newConfig = makeConfig(301);
            await repo.saveRecentConfig(newConfig);

            const saved = JSON.parse(mockStorage.setItem.mock.calls[0][1] as string);
            expect(saved).toHaveLength(3);
            expect(saved[0].game).toBe(301); // la nueva va primero
        });

        it('debería no lanzar si AsyncStorage.getItem falla (captura silenciosa)', async () => {
            mockStorage.getItem.mockRejectedValueOnce(new Error('Read error'));

            // No debería rechazar, el error se captura internamente
            await expect(repo.saveRecentConfig(makeConfig())).resolves.toBeUndefined();
            expect(console.error).toHaveBeenCalled();
        });

        it('debería no lanzar si AsyncStorage.setItem falla (captura silenciosa)', async () => {
            mockStorage.getItem.mockResolvedValueOnce(null);
            mockStorage.setItem.mockRejectedValueOnce(new Error('Write error'));

            await expect(repo.saveRecentConfig(makeConfig())).resolves.toBeUndefined();
            expect(console.error).toHaveBeenCalled();
        });
    });

    // -------------------------------------------------------------------------
    // getRecentConfigs
    // -------------------------------------------------------------------------

    describe('getRecentConfigs()', () => {
        it('debería devolver un array vacío si no hay configs guardadas', async () => {
            mockStorage.getItem.mockResolvedValueOnce(null);

            const result = await repo.getRecentConfigs();

            expect(result).toEqual([]);
            expect(mockStorage.getItem).toHaveBeenCalledWith(RECENT_KEY);
        });

        it('debería deserializar y devolver las configs almacenadas', async () => {
            const configs = [
                makeConfig(301),
                makeConfig(501),
            ];
            const dtos = configs.map(c => MatchX01Mapper.configToDTO(c));
            mockStorage.getItem.mockResolvedValueOnce(JSON.stringify(dtos));

            const result = await repo.getRecentConfigs();

            expect(result).toHaveLength(2);
            expect(result[0].game).toBe(301);
            expect(result[1].game).toBe(501);
        });

        it('debería devolver un array vacío si el JSON está corrupto', async () => {
            mockStorage.getItem.mockResolvedValueOnce('INVALID_JSON{{');

            const result = await repo.getRecentConfigs();

            expect(result).toEqual([]);
            expect(console.error).toHaveBeenCalled();
        });

        it('debería devolver un array vacío si AsyncStorage lanza excepción', async () => {
            mockStorage.getItem.mockRejectedValueOnce(new Error('storage error'));

            const result = await repo.getRecentConfigs();

            expect(result).toEqual([]);
        });

        it('debería preservar el round-trip saveRecentConfig → getRecentConfigs', async () => {
            const config = makeConfig(401);
            const dto = MatchX01Mapper.configToDTO(config);

            // Simular que guardamos y luego leemos
            mockStorage.getItem
                .mockResolvedValueOnce(null)           // primera llamada en saveRecentConfig
                .mockResolvedValueOnce(JSON.stringify([dto])); // segunda llamada en getRecentConfigs
            mockStorage.setItem.mockResolvedValueOnce(undefined as any);

            await repo.saveRecentConfig(config);
            const result = await repo.getRecentConfigs();

            expect(result[0].game).toBe(401);
        });
    });
});
