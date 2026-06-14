import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStorageBoardRepository } from '../../../src/infrastructure/repositories/AsyncStorageBoardRepository';
import { Board } from '../../../src/domain/models/Board';

// ---------------------------------------------------------------------------
// Mock de AsyncStorage
// ---------------------------------------------------------------------------

jest.mock('@react-native-async-storage/async-storage', () => ({
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
}));

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

// ---------------------------------------------------------------------------
// Suites
// ---------------------------------------------------------------------------

describe('AsyncStorageBoardRepository', () => {
    const BOARD_KEY = '@board_short_id';
    let repo: AsyncStorageBoardRepository;

    beforeEach(() => {
        repo = new AsyncStorageBoardRepository();
        jest.clearAllMocks();
    });

    // -------------------------------------------------------------------------
    // saveBoard
    // -------------------------------------------------------------------------

    describe('saveBoard()', () => {
        it('debería guardar el shortId del Board en AsyncStorage con la clave correcta', async () => {
            mockAsyncStorage.setItem.mockResolvedValueOnce(undefined as any);
            const board = new Board('abc-123');

            await repo.saveBoard(board);

            expect(mockAsyncStorage.setItem).toHaveBeenCalledTimes(1);
            expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(BOARD_KEY, 'abc-123');
        });

        it('debería usar la clave @board_short_id fija independientemente del shortId', async () => {
            mockAsyncStorage.setItem.mockResolvedValueOnce(undefined as any);
            const board = new Board('other-id');

            await repo.saveBoard(board);

            expect(mockAsyncStorage.setItem).toHaveBeenCalledWith('@board_short_id', 'other-id');
        });

        it('debería propagar el error si AsyncStorage.setItem falla', async () => {
            mockAsyncStorage.setItem.mockRejectedValueOnce(new Error('Storage full'));
            const board = new Board('x');

            await expect(repo.saveBoard(board)).rejects.toThrow('Storage full');
        });
    });

    // -------------------------------------------------------------------------
    // getBoard
    // -------------------------------------------------------------------------

    describe('getBoard()', () => {
        it('debería devolver null si no hay ningún Board guardado', async () => {
            mockAsyncStorage.getItem.mockResolvedValueOnce(null);

            const result = await repo.getBoard();

            expect(result).toBeNull();
            expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(BOARD_KEY);
        });

        it('debería devolver null si AsyncStorage devuelve una cadena vacía', async () => {
            mockAsyncStorage.getItem.mockResolvedValueOnce('');

            const result = await repo.getBoard();

            expect(result).toBeNull();
        });

        it('debería reconstruir un Board con el shortId almacenado', async () => {
            mockAsyncStorage.getItem.mockResolvedValueOnce('stored-id');

            const result = await repo.getBoard();

            expect(result).toBeInstanceOf(Board);
            expect(result?.shortId).toBe('stored-id');
        });

        it('debería usar siempre la clave @board_short_id para leer', async () => {
            mockAsyncStorage.getItem.mockResolvedValueOnce(null);

            await repo.getBoard();

            expect(mockAsyncStorage.getItem).toHaveBeenCalledWith('@board_short_id');
        });

        it('debería propagar el error si AsyncStorage.getItem falla', async () => {
            mockAsyncStorage.getItem.mockRejectedValueOnce(new Error('Read error'));

            await expect(repo.getBoard()).rejects.toThrow('Read error');
        });
    });

    // -------------------------------------------------------------------------
    // deleteBoard
    // -------------------------------------------------------------------------

    describe('deleteBoard()', () => {
        it('debería llamar a removeItem con la clave correcta', async () => {
            mockAsyncStorage.removeItem.mockResolvedValueOnce(undefined as any);

            await repo.deleteBoard();

            expect(mockAsyncStorage.removeItem).toHaveBeenCalledTimes(1);
            expect(mockAsyncStorage.removeItem).toHaveBeenCalledWith('@board_short_id');
        });

        it('debería devolver undefined al eliminar correctamente', async () => {
            mockAsyncStorage.removeItem.mockResolvedValueOnce(undefined as any);

            const result = await repo.deleteBoard();

            expect(result).toBeUndefined();
        });

        it('debería propagar el error si AsyncStorage.removeItem falla', async () => {
            mockAsyncStorage.removeItem.mockRejectedValueOnce(new Error('Delete error'));

            await expect(repo.deleteBoard()).rejects.toThrow('Delete error');
        });
    });

    // -------------------------------------------------------------------------
    // Flujo integrado: save → get → delete
    // -------------------------------------------------------------------------

    describe('Flujo completo (save → get → delete)', () => {
        it('debería guardar, recuperar y eliminar el board correctamente', async () => {
            mockAsyncStorage.setItem.mockResolvedValueOnce(undefined as any);
            mockAsyncStorage.getItem.mockResolvedValueOnce('flow-id');
            mockAsyncStorage.removeItem.mockResolvedValueOnce(undefined as any);
            mockAsyncStorage.getItem.mockResolvedValueOnce(null);

            const board = new Board('flow-id');

            await repo.saveBoard(board);
            const retrieved = await repo.getBoard();
            expect(retrieved?.shortId).toBe('flow-id');

            await repo.deleteBoard();
            const afterDelete = await repo.getBoard();
            expect(afterDelete).toBeNull();
        });
    });
});
