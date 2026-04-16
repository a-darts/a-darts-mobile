// application/use-cases/AddScoreUseCase.ts
import { MatchX01 } from '../../domain/models/MatchX01';
import { IMatchX01Repository } from '../../domain/repositories/IMatchX01Repository';

export class AddScoreService {
    constructor(private readonly matchRepository: IMatchX01Repository) { }

    async execute(matchId: string, score: number): Promise<MatchX01> {
        // 1. Recuperamos la partida del repositorio
        const match = await this.matchRepository.getById(matchId);

        if (!match) {
            throw new Error(`No se encontró la partida con ID: ${matchId}`);
        }

        // 2. Ejecutamos la lógica de negocio (cambia el estado interno de las entidades)
        match.addThrow(score);

        // 3. Guardamos el estado actualizado
        await this.matchRepository.save(match);

        // 4. Devolvemos la entidad actualizada para que la UI se refresque
        return match;
    }
}
