import { MatchX01 } from "../../domain/models/MatchX01";
import { MatchX01Repository } from "../../domain/repositories/MatchX01Repository";

export class UndoScoreService {
    constructor(private readonly matchRepository: MatchX01Repository) { }

    async execute(matchId: string): Promise<MatchX01> {
        const match = await this.matchRepository.getById(matchId);
        if (!match) throw new Error("Match not found");

        match.undoLastThrow();
        await this.matchRepository.save(match);
        return match;
    }
}
