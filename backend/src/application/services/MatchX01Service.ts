import { MatchX01 } from '../../domain/models/MatchX01';
import { MatchX01Config } from '../../domain/models/MatchX01Config';
import { IMatchX01Repository } from '../../domain/repositories/IMatchX01Repository';
import { CreateMatchX01Request } from '../dtos/CreateMatchX01Request';

export class MatchX01Service {
    constructor(private readonly matchRepository: IMatchX01Repository) { }

    async createMatchX01(request: CreateMatchX01Request): Promise<MatchX01> {
        // 1. Generamos un ID único para la partida
        const id = Math.random().toString(36).substring(2, 15);

        // 2. Creamos el objeto de valor de configuración
        const config = new MatchX01Config(
            request.game,
            request.typeOfGame,
            request.numSets,
            request.numLegs,
            request.playerNames,
        );

        // 3. Usamos el Factory Method del Dominio para crear la entidad
        const match = MatchX01.create(id, config);

        // 4. Persistimos en el repositorio
        await this.matchRepository.save(match);

        return match;
    }

    async addThrow(matchId: string, score: number, dartsUsed: number = 3): Promise<MatchX01> {
        // 1. Recuperamos la partida del repositorio
        const match = await this.matchRepository.getById(matchId);

        if (!match) {
            throw new Error(`No se encontró la partida con ID: ${matchId}`);
        }

        // 2. Ejecutamos la lógica de negocio (cambia el estado interno de las entidades)
        match.addThrow(score, dartsUsed);

        // 3. Guardamos el estado actualizado
        await this.matchRepository.save(match);

        // 4. Devolvemos la entidad actualizada para que la UI se refresque
        return match;
    }

    async undoLastThrow(matchId: string): Promise<MatchX01> {
        const match = await this.matchRepository.getById(matchId);
        if (!match) throw new Error("Match not found");

        match.undoLastThrow();
        await this.matchRepository.save(match);
        return match;
    }

    async swapStartingPlayer(matchId: string): Promise<MatchX01> {
        const match = await this.matchRepository.getById(matchId);
        if (!match) throw new Error('Partida no encontrada');

        match.swapStartingPlayer();

        await this.matchRepository.save(match);
        return match;
    }
}
