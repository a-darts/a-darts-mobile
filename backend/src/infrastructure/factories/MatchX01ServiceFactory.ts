import { IMatchX01Repository } from '../../domain/repositories/IMatchX01Repository';
import { AsyncStorageMatchX01Repository } from '../repositories/AsyncStorageMatchX01Repository';
import { MatchX01Service } from '../../application/services/MatchX01Service';

export default class MatchX01ServiceFactory {
    private static repository: IMatchX01Repository | null = null;
    private static matchX01Service: MatchX01Service | null = null;

    // Obtenemos el repositorio (Singleton)
    public static getRepository(): IMatchX01Repository {
        if (!this.repository) {
            this.repository = new AsyncStorageMatchX01Repository();
        }
        return this.repository;
    }

    // Obtenemos el servicio (Singleton)
    public static getMatchX01Service(): MatchX01Service {
        if (!this.matchX01Service) {
            this.matchX01Service = new MatchX01Service(this.getRepository());
        }
        return this.matchX01Service;
    }
}
