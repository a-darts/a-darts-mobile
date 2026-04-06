// domain/services/MatchService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MatchX01Config } from '../models/MatchX01Config';
import { IMatchX01Config } from '../Ports';

const STORAGE_KEY = '@current_match_config';

export class MatchService {
    /**
     * Guarda la configuración en el almacenamiento local.
     */
    static async saveConfig(config: MatchX01Config): Promise<void> {
        const dto = config.toDTO();
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(dto));
    }

    /**
     * Recupera la configuración y la devuelve como objeto de DOMINIO (clase).
     */
    static async getConfig(): Promise<MatchX01Config | null> {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        if (!data) return null;

        const dto: IMatchX01Config = JSON.parse(data);

        // Re-hidratamos la clase para recuperar sus métodos y validaciones
        return new MatchX01Config(
            dto.game,
            dto.typeOfGame,
            dto.numSets,
            dto.numLegs,
            dto.numPlayers,
            dto.playerNames
        );
    }

    static async clearConfig(): Promise<void> {
        await AsyncStorage.removeItem(STORAGE_KEY);
    }
}
