import { BoardService } from '../../../src/application/services/BoardService';
import { IBoardRepository } from '../../../src/domain/repositories/IBoardRepository';
import { Board } from '../../../src/domain/models/Board';
import { SaveBoardRequestDTO } from '../../../src/application/dtos/BoardDTOs';

// ---------------------------------------------------------------------------
// Mock del repositorio
// ---------------------------------------------------------------------------

const makeMockRepo = (): jest.Mocked<IBoardRepository> => ({
    saveBoard: jest.fn().mockResolvedValue(undefined),
    getBoard: jest.fn().mockResolvedValue(null),
    deleteBoard: jest.fn().mockResolvedValue(undefined),
});

// ---------------------------------------------------------------------------
// Suites
// ---------------------------------------------------------------------------

describe('BoardService', () => {
    let mockRepo: jest.Mocked<IBoardRepository>;
    let service: BoardService;

    beforeEach(() => {
        mockRepo = makeMockRepo();
        service = new BoardService(mockRepo);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // -------------------------------------------------------------------------
    // saveBoard
    // -------------------------------------------------------------------------

    describe('saveBoard()', () => {
        it('debería crear un Board con el shortId del DTO y persistirlo', async () => {
            const dto: SaveBoardRequestDTO = { shortId: 'abc-123' };

            const result = await service.saveBoard(dto);

            expect(result).toBeInstanceOf(Board);
            expect(result.shortId).toBe('abc-123');
            expect(mockRepo.saveBoard).toHaveBeenCalledTimes(1);
            expect(mockRepo.saveBoard).toHaveBeenCalledWith(expect.any(Board));
        });

        it('debería pasar la instancia correcta de Board al repositorio', async () => {
            const dto: SaveBoardRequestDTO = { shortId: 'short-99' };

            const result = await service.saveBoard(dto);

            const boardPassedToRepo = mockRepo.saveBoard.mock.calls[0][0];
            expect(boardPassedToRepo.shortId).toBe('short-99');
            expect(boardPassedToRepo).toBe(result);
        });

        it('debería propagar el error si el repositorio falla al guardar', async () => {
            mockRepo.saveBoard.mockRejectedValueOnce(new Error('Storage error'));
            const dto: SaveBoardRequestDTO = { shortId: 'fail-id' };

            await expect(service.saveBoard(dto)).rejects.toThrow('Storage error');
        });

        it('debería devolver un Board con el shortId correcto aunque sea un ID vacío', async () => {
            const dto: SaveBoardRequestDTO = { shortId: '' };

            const result = await service.saveBoard(dto);

            expect(result.shortId).toBe('');
            expect(mockRepo.saveBoard).toHaveBeenCalledTimes(1);
        });
    });

    // -------------------------------------------------------------------------
    // getBoard
    // -------------------------------------------------------------------------

    describe('getBoard()', () => {
        it('debería devolver null si el repositorio no tiene ningún board guardado', async () => {
            mockRepo.getBoard.mockResolvedValueOnce(null);

            const result = await service.getBoard();

            expect(result).toBeNull();
            expect(mockRepo.getBoard).toHaveBeenCalledTimes(1);
        });

        it('debería devolver el Board existente si el repositorio lo tiene', async () => {
            const stored = new Board('stored-42');
            mockRepo.getBoard.mockResolvedValueOnce(stored);

            const result = await service.getBoard();

            expect(result).toBeInstanceOf(Board);
            expect(result?.shortId).toBe('stored-42');
        });

        it('debería delegar completamente en el repositorio (sin lógica adicional)', async () => {
            await service.getBoard();

            expect(mockRepo.getBoard).toHaveBeenCalledTimes(1);
            expect(mockRepo.saveBoard).not.toHaveBeenCalled();
            expect(mockRepo.deleteBoard).not.toHaveBeenCalled();
        });

        it('debería propagar el error si el repositorio falla al obtener', async () => {
            mockRepo.getBoard.mockRejectedValueOnce(new Error('Read error'));

            await expect(service.getBoard()).rejects.toThrow('Read error');
        });
    });

    // -------------------------------------------------------------------------
    // deleteBoard
    // -------------------------------------------------------------------------

    describe('deleteBoard()', () => {
        it('debería llamar al repositorio para eliminar el board', async () => {
            await service.deleteBoard();

            expect(mockRepo.deleteBoard).toHaveBeenCalledTimes(1);
        });

        it('debería devolver undefined al eliminar correctamente', async () => {
            const result = await service.deleteBoard();

            expect(result).toBeUndefined();
        });

        it('debería delegar completamente en el repositorio (sin efectos secundarios)', async () => {
            await service.deleteBoard();

            expect(mockRepo.saveBoard).not.toHaveBeenCalled();
            expect(mockRepo.getBoard).not.toHaveBeenCalled();
            expect(mockRepo.deleteBoard).toHaveBeenCalledTimes(1);
        });

        it('debería propagar el error si el repositorio falla al eliminar', async () => {
            mockRepo.deleteBoard.mockRejectedValueOnce(new Error('Delete error'));

            await expect(service.deleteBoard()).rejects.toThrow('Delete error');
        });
    });
});
