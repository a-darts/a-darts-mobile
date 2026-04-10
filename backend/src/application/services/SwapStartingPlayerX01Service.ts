import { MatchX01 } from '../../domain/models/MatchX01';
import { IMatchX01Repository } from '../../domain/repositories/IMatchX01Repository';

export class SwapStartingPlayerX01Service {
    constructor(private readonly matchRepository: IMatchX01Repository) { }

    async execute(matchId: string): Promise<MatchX01> {
        const match = await this.matchRepository.getById(matchId);
        if (!match) throw new Error('Partida no encontrada');

        match.swapStartingPlayer();

        await this.matchRepository.save(match);
        return match;
    }
}
