import { Board } from '../../domain/models/Board';
import { IBoardRepository } from '../../domain/repositories/IBoardRepository';
import { SaveBoardRequestDTO } from '../dtos/BoardDTOs';

export class BoardService {
    constructor(private readonly boardRepository: IBoardRepository) { }

    async saveBoard(request: SaveBoardRequestDTO): Promise<Board> {
        // 1. Create the Board entity using the provided shortId
        const board = new Board(request.shortId);

        // 2. Save the Board entity to the repository
        await this.boardRepository.saveBoard(board);

        // 3. Return the saved Board entity
        return board;
    }

    async getBoard(): Promise<Board | null> {
        return await this.boardRepository.getBoard();
    }

    async deleteBoard(): Promise<void> {
        await this.boardRepository.deleteBoard();
    }
}
