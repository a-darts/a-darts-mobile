import { Board } from '../models/Board';

export interface IBoardRepository {
    saveBoard(board: Board): Promise<void>;
    getBoard(): Promise<Board | null>;
    deleteBoard(): Promise<void>;
}
