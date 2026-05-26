import { MatchX01Config } from '../../../src/domain/models/MatchX01Config';
import { GameTypes } from '../../../src/domain/enums/GameTypes';

describe('MatchX01Config Value Object', () => {
    const validParams = {
        game: 501,
        typeOfGame: GameTypes.FIRST_TO,
        numSets: 3,
        numLegs: 5,
        playerNames: ['Michael van Gerwen', 'Gary Anderson']
    };

    it('debería instanciarse correctamente con valores válidos', () => {
        const config = new MatchX01Config(
            validParams.game,
            validParams.typeOfGame,
            validParams.numSets,
            validParams.numLegs,
            validParams.playerNames
        );

        expect(config.game).toBe(501);
        expect(config.typeOfGame).toBe(GameTypes.FIRST_TO);
        expect(config.numSets).toBe(3);
        expect(config.numLegs).toBe(5);
        expect(config.playerNames).toEqual(validParams.playerNames);
    });

    it('debería mantener la inmutabilidad del array de nombres de jugadores', () => {
        const names = ['P1', 'P2'];
        const config = new MatchX01Config(301, GameTypes.BEST_OF, 1, 3, names);

        // Intentamos modificar el array original
        names.push('P3');

        // La config no debería haberse visto afectada porque usamos el spread operator [...] en el constructor
        expect(config.playerNames).toHaveLength(2);
        expect(config.playerNames).not.toContain('P3');
    });

    it('el getter playerNames debería devolver una copia para evitar mutaciones externas', () => {
        const config = new MatchX01Config(301, GameTypes.BEST_OF, 1, 3, ['P1', 'P2']);

        // Intentamos modificar el array obtenido por el getter
        const namesFromGetter = config.playerNames;
        namesFromGetter.push('P3');

        // El estado interno de la clase debe permanecer intacto
        expect(config.playerNames).toHaveLength(2);
    });

    it('debería recuperar correctamente el tipo de juego (enum)', () => {
        const configFirstTo = new MatchX01Config(501, GameTypes.FIRST_TO, 1, 1, ['P1']);
        const configBestOf = new MatchX01Config(501, GameTypes.BEST_OF, 1, 1, ['P1']);

        expect(configFirstTo.typeOfGame).toBe(GameTypes.FIRST_TO);
        expect(configBestOf.typeOfGame).toBe(GameTypes.BEST_OF);
    });
});
