import { IMatchX01Repository } from '../../domain/repositories/IMatchX01Repository';
import { AsyncStorageMatchX01Repository } from '../repositories/AsyncStorageMatchX01Repository';
import { CreateMatchX01Service } from '../../application/services/CreateMatchX01Service';
import { AddScoreService } from '../../application/services/AddScoreService';
import { UndoScoreService } from '../../application/services/UndoScoreService';

export default class MatchX01ServiceFactory {
    private static repository: IMatchX01Repository | null = null;
    private static createService: CreateMatchX01Service | null = null;
    private static addScoreService: AddScoreService | null = null;
    private static undoScoreService: UndoScoreService | null = null;

    // Obtenemos el repositorio (Singleton)
    public static getRepository(): IMatchX01Repository {
        if (!this.repository) {
            this.repository = new AsyncStorageMatchX01Repository();
        }
        return this.repository;
    }

    // Servicio para CREAR partidas
    public static getCreateMatchService(): CreateMatchX01Service {
        if (!this.createService) {
            this.createService = new CreateMatchX01Service(this.getRepository());
        }
        return this.createService;
    }

    // Servicio para AÑADIR puntuación
    public static getAddScoreService(): AddScoreService {
        if (!this.addScoreService) {
            this.addScoreService = new AddScoreService(this.getRepository());
        }
        return this.addScoreService;
    }

    // Servicio para DESHACER puntuación
    public static getUndoScoreService(): UndoScoreService {
        if (!this.undoScoreService) {
            this.undoScoreService = new UndoScoreService(this.getRepository());
        }
        return this.undoScoreService;
    }
}
