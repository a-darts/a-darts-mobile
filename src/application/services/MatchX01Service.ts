import { IMatchX01Repository } from '../../domain/ports/IMatchX01Repository';
import { MatchX01Config } from '../../domain/models/MatchX01Config';
import { MatchX01 } from '../../domain/models/MatchX01';

export class MatchX01Service {
    // Inyectamos la dependencia en el constructor
    constructor(private repository: IMatchX01Repository) { }

    async saveMatch(match: MatchX01): Promise<void> {
        await this.repository.save(match);
    }
}
