// domain/services/MatchService.ts
import { IMatchX01Repository } from '../ports/IMatchX01Repository';
import { MatchX01Config } from '../models/MatchX01Config';

export class MatchService {
    // Inyectamos la dependencia en el constructor
    constructor(private repository: IMatchX01Repository) { }

    async saveMatchConfig(config: MatchX01Config): Promise<void> {
        await this.repository.save(config);
    }

    async getMatchConfig(): Promise<MatchX01Config | null> {
        return await this.repository.get();
    }
}