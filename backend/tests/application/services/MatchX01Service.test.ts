import { MatchX01Service } from '../../../src/application/services/MatchX01Service';
import { IMatchX01Repository } from '../../../src/domain/repositories/IMatchX01Repository';
import { MatchX01Config } from '../../../src/domain/models/MatchX01Config';
import { MatchX01 } from '../../../src/domain/models/MatchX01';
import { GameTypes } from '../../../src/domain/enums/GameTypes';
import { GameStatus } from '../../../src/domain/enums/GameStatus';
import { CreateMatchX01RequestDTO } from '../../../src/application/dtos/MatchX01DTOs';

// ---------------------------------------------------------------------------
// Mock del repositorio
// ---------------------------------------------------------------------------

const makeMockRepo = (): jest.Mocked<IMatchX01Repository> => ({
    save: jest.fn().mockResolvedValue(undefined),
    getById: jest.fn().mockResolvedValue(null),
    delete: jest.fn().mockResolvedValue(undefined),
    saveRecentConfig: jest.fn().mockResolvedValue(undefined),
    getRecentConfigs: jest.fn().mockResolvedValue([]),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const baseDTO = (): CreateMatchX01RequestDTO => ({
    game: 301,
    typeOfGame: GameTypes.FIRST_TO,
    numSets: 1,
    numLegs: 1,
    playerNames: ['Alice', 'Bob'],
});

// ---------------------------------------------------------------------------
// Suites
// ---------------------------------------------------------------------------

describe('MatchX01Service', () => {
    let mockRepo: jest.Mocked<IMatchX01Repository>;
    let service: MatchX01Service;

    beforeEach(() => {
        mockRepo = makeMockRepo();
        service = new MatchX01Service(mockRepo);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // -------------------------------------------------------------------------
    // createMatchX01
    // -------------------------------------------------------------------------

    describe('createMatchX01()', () => {
        it('debería crear una partida válida con los datos del DTO', async () => {
            const result = await service.createMatchX01(baseDTO());

            expect(result).toBeInstanceOf(MatchX01);
            expect(result.players).toHaveLength(2);
            expect(result.players[0].name).toBe('Alice');
            expect(result.players[1].name).toBe('Bob');
            expect(result.status).toBe(GameStatus.PLAYING);
        });

        it('debería usar el ID proporcionado en el DTO si viene definido', async () => {
            const dto = { ...baseDTO(), id: 'my-custom-id' };

            const result = await service.createMatchX01(dto);

            expect(result.id).toBe('my-custom-id');
        });

        it('debería generar un ID automático si no se proporciona en el DTO', async () => {
            const dto = baseDTO(); // sin id

            const result = await service.createMatchX01(dto);

            expect(result.id).toBeDefined();
            expect(result.id.length).toBeGreaterThan(0);
        });

        it('debería persistir la partida en el repositorio', async () => {
            await service.createMatchX01(baseDTO());

            expect(mockRepo.save).toHaveBeenCalledTimes(1);
            expect(mockRepo.save).toHaveBeenCalledWith(expect.any(MatchX01));
        });

        it('debería guardar la configuración reciente en el repositorio', async () => {
            await service.createMatchX01(baseDTO());

            expect(mockRepo.saveRecentConfig).toHaveBeenCalledTimes(1);
            expect(mockRepo.saveRecentConfig).toHaveBeenCalledWith(expect.any(MatchX01Config));
        });

        it('debería restaurar el historial de tiradas si se proporciona como array de números', async () => {
            const dto: CreateMatchX01RequestDTO = {
                ...baseDTO(),
                historyThrows: [60, 45],
            };

            const result = await service.createMatchX01(dto);

            // Cada tiro pasa de un jugador al otro; el historial tiene 2 entradas
            expect(result.players[0].throws.length).toBeGreaterThan(1);
        });

        it('debería restaurar el historial de tiradas si se proporciona como array de objetos {score, dartsUsed}', async () => {
            const dto: CreateMatchX01RequestDTO = {
                ...baseDTO(),
                historyThrows: [
                    { score: 60, dartsUsed: 3 },
                    { score: 45, dartsUsed: 2 },
                ],
            };

            const result = await service.createMatchX01(dto);

            expect(result.players[0].throws.length).toBeGreaterThan(1);
        });

        it('debería ignorar historyThrows si no es un array', async () => {
            const dto: CreateMatchX01RequestDTO = {
                ...baseDTO(),
                historyThrows: undefined,
            };

            // No debería lanzar error
            const result = await service.createMatchX01(dto);
            expect(result).toBeInstanceOf(MatchX01);
        });

        it('debería propagar el error si el repositorio falla al guardar', async () => {
            mockRepo.save.mockRejectedValueOnce(new Error('Disk full'));

            await expect(service.createMatchX01(baseDTO())).rejects.toThrow('Disk full');
        });
    });

    // -------------------------------------------------------------------------
    // getRecentConfigs
    // -------------------------------------------------------------------------

    describe('getRecentConfigs()', () => {
        it('debería devolver array vacío si no hay configuraciones recientes', async () => {
            mockRepo.getRecentConfigs.mockResolvedValueOnce([]);

            const result = await service.getRecentConfigs();

            expect(result).toEqual([]);
        });

        it('debería devolver las configuraciones recientes del repositorio', async () => {
            const configs = [
                new MatchX01Config(301, GameTypes.FIRST_TO, 1, 1, ['Alice', 'Bob']),
                new MatchX01Config(501, GameTypes.BEST_OF, 1, 3, ['Carlos']),
            ];
            mockRepo.getRecentConfigs.mockResolvedValueOnce(configs);

            const result = await service.getRecentConfigs();

            expect(result).toHaveLength(2);
            expect(result[0]).toBeInstanceOf(MatchX01Config);
            expect(result[0].game).toBe(301);
        });

        it('debería delegar completamente en el repositorio', async () => {
            await service.getRecentConfigs();

            expect(mockRepo.getRecentConfigs).toHaveBeenCalledTimes(1);
        });
    });

    // -------------------------------------------------------------------------
    // addThrow
    // -------------------------------------------------------------------------

    describe('addThrow()', () => {
        it('debería lanzar error si la partida no existe', async () => {
            mockRepo.getById.mockResolvedValueOnce(null);

            await expect(service.addThrow('non-existent', 60)).rejects.toThrow(
                'No se encontró la partida con ID: non-existent'
            );
        });

        it('debería añadir el tiro a la partida y persistirla', async () => {
            const config = new MatchX01Config(301, GameTypes.FIRST_TO, 1, 1, ['Alice', 'Bob']);
            const match = MatchX01.create('match-1', config);
            mockRepo.getById.mockResolvedValueOnce(match);

            const result = await service.addThrow('match-1', 60, 3);

            expect(result).toBeInstanceOf(MatchX01);
            expect(mockRepo.save).toHaveBeenCalledTimes(1);
            expect(mockRepo.save).toHaveBeenCalledWith(match);
        });

        it('debería usar dartsUsed = 3 por defecto si no se especifica', async () => {
            const config = new MatchX01Config(301, GameTypes.FIRST_TO, 1, 1, ['Alice', 'Bob']);
            const match = MatchX01.create('match-1', config);
            const addThrowSpy = jest.spyOn(match, 'addThrow');
            mockRepo.getById.mockResolvedValueOnce(match);

            await service.addThrow('match-1', 60);

            expect(addThrowSpy).toHaveBeenCalledWith(60, 3);
        });

        it('debería usar el dartsUsed proporcionado', async () => {
            const config = new MatchX01Config(301, GameTypes.FIRST_TO, 1, 1, ['Alice', 'Bob']);
            const match = MatchX01.create('match-1', config);
            const addThrowSpy = jest.spyOn(match, 'addThrow');
            mockRepo.getById.mockResolvedValueOnce(match);

            await service.addThrow('match-1', 45, 2);

            expect(addThrowSpy).toHaveBeenCalledWith(45, 2);
        });

        it('debería devolver la entidad actualizada tras el tiro', async () => {
            const config = new MatchX01Config(301, GameTypes.FIRST_TO, 1, 1, ['Alice', 'Bob']);
            const match = MatchX01.create('match-1', config);
            mockRepo.getById.mockResolvedValueOnce(match);

            const result = await service.addThrow('match-1', 60);

            // Después del tiro de Alice (60), le toca a Bob (índice 1)
            expect(result.activePlayerIndex).toBe(1);
            expect(result.players[0].remainingScore).toBe(241);
        });
    });

    // -------------------------------------------------------------------------
    // undoLastThrow
    // -------------------------------------------------------------------------

    describe('undoLastThrow()', () => {
        it('debería lanzar error si la partida no existe', async () => {
            mockRepo.getById.mockResolvedValueOnce(null);

            await expect(service.undoLastThrow('ghost-match')).rejects.toThrow('Match not found');
        });

        it('debería deshacer el último tiro y persistir la partida', async () => {
            const config = new MatchX01Config(301, GameTypes.FIRST_TO, 1, 1, ['Alice', 'Bob']);
            const match = MatchX01.create('match-1', config);
            match.addThrow(60); // Alice tira, ahora toca Bob

            mockRepo.getById.mockResolvedValueOnce(match);

            const result = await service.undoLastThrow('match-1');

            // Después del undo, vuelve a ser turno de Alice
            expect(result.activePlayerIndex).toBe(0);
            expect(result.players[0].remainingScore).toBe(301);
            expect(mockRepo.save).toHaveBeenCalledTimes(1);
        });

        it('debería devolver la entidad de partida actualizada', async () => {
            const config = new MatchX01Config(301, GameTypes.FIRST_TO, 1, 1, ['Alice', 'Bob']);
            const match = MatchX01.create('match-1', config);
            mockRepo.getById.mockResolvedValueOnce(match);

            const result = await service.undoLastThrow('match-1');

            expect(result).toBeInstanceOf(MatchX01);
        });
    });

    // -------------------------------------------------------------------------
    // editThrow
    // -------------------------------------------------------------------------

    describe('editThrow()', () => {
        it('debería lanzar error si la partida no existe', async () => {
            mockRepo.getById.mockResolvedValueOnce(null);

            await expect(service.editThrow('no-match', 'player-1', 0, 50)).rejects.toThrow(
                'Partida no encontrada'
            );
        });

        it('debería editar el tiro y persistir la partida', async () => {
            const config = new MatchX01Config(301, GameTypes.FIRST_TO, 1, 1, ['Alice', 'Bob']);
            const match = MatchX01.create('match-1', config);
            match.addThrow(60); // Alice tira 60
            const aliceId = match.players[0].id;

            mockRepo.getById.mockResolvedValueOnce(match);

            const editThrowSpy = jest.spyOn(match, 'editThrow');
            const result = await service.editThrow('match-1', aliceId, 1, 80);

            expect(editThrowSpy).toHaveBeenCalledWith(aliceId, 1, 80);
            expect(mockRepo.save).toHaveBeenCalledTimes(1);
            expect(result).toBeInstanceOf(MatchX01);
        });

        it('debería devolver la entidad actualizada', async () => {
            const config = new MatchX01Config(301, GameTypes.FIRST_TO, 1, 1, ['Alice', 'Bob']);
            const match = MatchX01.create('match-1', config);
            match.addThrow(60);
            const aliceId = match.players[0].id;

            mockRepo.getById.mockResolvedValueOnce(match);

            const result = await service.editThrow('match-1', aliceId, 1, 80);
            expect(result).toBe(match);
        });
    });

    // -------------------------------------------------------------------------
    // swapStartingPlayer
    // -------------------------------------------------------------------------

    describe('swapStartingPlayer()', () => {
        it('debería lanzar error si la partida no existe', async () => {
            mockRepo.getById.mockResolvedValueOnce(null);

            await expect(service.swapStartingPlayer('no-match')).rejects.toThrow(
                'Partida no encontrada'
            );
        });

        it('debería intercambiar el jugador inicial y persistir', async () => {
            const config = new MatchX01Config(301, GameTypes.FIRST_TO, 1, 1, ['Alice', 'Bob']);
            const match = MatchX01.create('match-1', config);
            mockRepo.getById.mockResolvedValueOnce(match);

            const swapSpy = jest.spyOn(match, 'swapStartingPlayer');
            const result = await service.swapStartingPlayer('match-1');

            expect(swapSpy).toHaveBeenCalledTimes(1);
            expect(mockRepo.save).toHaveBeenCalledTimes(1);
            expect(result).toBeInstanceOf(MatchX01);
        });

        it('debería cambiar el jugador activo al del otro equipo', async () => {
            const config = new MatchX01Config(301, GameTypes.FIRST_TO, 1, 1, ['Alice', 'Bob']);
            const match = MatchX01.create('match-1', config);
            expect(match.activePlayerIndex).toBe(0); // Alice empieza

            mockRepo.getById.mockResolvedValueOnce(match);

            const result = await service.swapStartingPlayer('match-1');

            expect(result.activePlayerIndex).toBe(1); // Ahora Bob
        });
    });
});
