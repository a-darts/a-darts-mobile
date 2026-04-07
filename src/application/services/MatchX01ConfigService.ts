import { IMatchX01ConfigRepository } from '../../domain/ports/IMatchX01ConfigRepository';
import { MatchX01Config } from '../../domain/models/MatchX01Config';

export class MatchX01ConfigService {
    // Inyectamos la dependencia en el constructor
    constructor(private repository: IMatchX01ConfigRepository) { }

    async saveMatchConfig(config: MatchX01Config): Promise<void> {
        await this.repository.save(config);
    }

    async getMatchConfig(): Promise<MatchX01Config | null> {
        return await this.repository.get();
    }
}
