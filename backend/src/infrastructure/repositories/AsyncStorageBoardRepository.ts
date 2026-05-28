import AsyncStorage from '@react-native-async-storage/async-storage';
import { IBoardRepository } from '../../domain/repositories/IBoardRepository';
import { Board } from '../../domain/models/Board';

export class AsyncStorageBoardRepository implements IBoardRepository {
    private readonly BOARD_KEY = '@board_short_id';

    async saveBoard(board: Board): Promise<void> {
        await AsyncStorage.setItem(this.BOARD_KEY, board.shortId);
    }

    async getBoard(): Promise<Board | null> {
        const shortId = await AsyncStorage.getItem(this.BOARD_KEY);
        if (!shortId) return null;
        return new Board(shortId);
    }

    async deleteBoard(): Promise<void> {
        await AsyncStorage.removeItem(this.BOARD_KEY);
    }
}
