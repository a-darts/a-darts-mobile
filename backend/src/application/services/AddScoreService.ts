// application/use-cases/AddScoreUseCase.ts
import { MatchX01 } from '../../domain/models/MatchX01';
import { MatchX01Repository } from '../../domain/repositories/MatchX01Repository';

export class AddScoreService {
    constructor(private readonly matchRepository: MatchX01Repository) { }

    async execute(matchId: string, score: number): Promise<MatchX01> {
        // 1. Recuperamos la partida del repositorio
        const match = await this.matchRepository.getById(matchId);

        if (!match) {
            throw new Error(`No se encontró la partida con ID: ${matchId}`);
        }

        // 2. Ejecutamos la lógica de negocio (cambia el estado interno de las entidades)
        // Aquí se lanza el Error('Bust')
        try {
            match.addThrow(score);
        } catch (error: any) {
            // MIRAR: Manejar el 'Bust' aquí o relanzarlo para que la UI lo pinte
            throw error;
        }

        // 3. Guardamos el estado actualizado
        await this.matchRepository.save(match);

        // 4. Devolvemos la entidad actualizada para que la UI se refresque
        return match;
    }
}
