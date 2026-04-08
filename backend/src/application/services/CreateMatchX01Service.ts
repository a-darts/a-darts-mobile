import { MatchX01 } from '../../domain/models/MatchX01';
import { MatchX01Config } from '../../domain/models/MatchX01Config';
import { IMatchX01Repository } from '../../domain/repositories/IMatchX01Repository';
import { CreateMatchX01Request } from '../dtos/CreateMatchX01Request';

export class CreateMatchX01Service {
    constructor(private readonly matchRepository: IMatchX01Repository) { }

    async execute(request: CreateMatchX01Request): Promise<MatchX01> {
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
}
