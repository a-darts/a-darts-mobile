import { BoardService } from '../../application/services/BoardService';
import { IBoardRepository } from '../../domain/repositories/IBoardRepository';
import { AsyncStorageBoardRepository } from '../repositories/AsyncStorageBoardRepository';

export default class BoardServiceFactory {
    private static instance: BoardService | null = null;
    private static repository: IBoardRepository | null = null;

    private static getRepository(): IBoardRepository {
        if (!this.repository) {
            this.repository = new AsyncStorageBoardRepository();
        }
        return this.repository;
    }

    public static getInstance(): BoardService {
        if (!this.instance) {
            this.instance = new BoardService(this.getRepository());
        }
        return this.instance;
    }
}
