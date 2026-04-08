import { MatchX01 } from '../../../src/domain/models/MatchX01';
import { MatchX01Config } from '../../../src/domain/models/MatchX01Config';
import { PlayerX01 } from '../../../src/domain/models/PlayerX01';
import { GameTypes } from '../../../src/domain/enums/GameTypes';

describe('MatchX01 Entity', () => {
    let config: MatchX01Config;
    const MATCH_ID = 'match-1';

    beforeEach(() => {
        // Configuramos una partida rápida de 301 para los tests
        config = new MatchX01Config(301, GameTypes.FirstTo, 1, 1, ['Alice', 'Bob']);
    });

    describe('Creation & Restore', () => {
        it('debería crear una partida nueva con los jugadores inicializados', () => {
            const match = MatchX01.create(MATCH_ID, config);

            expect(match.id).toBe(MATCH_ID);
            expect(match.players).toHaveLength(2);
            expect(match.players[0].name).toBe('Alice');
            expect(match.activePlayerIndex).toBe(0);
            expect(match.status).toBe('PLAYING');
        });

        it('debería restaurar una partida a un estado específico (Rehidratación)', () => {
            const p1 = PlayerX01.create('id1', 'Alice', 301);
            const p2 = PlayerX01.create('id2', 'Bob', 301);

            const match = MatchX01.restore(MATCH_ID, config, [p1, p2], 1, 0, 0, 'PLAYING');

            expect(match.activePlayerIndex).toBe(1);
            expect(match.activePlayer.name).toBe('Bob');
        });
    });

    describe('Turn Management (addThrow)', () => {
        it('debería cambiar el turno al siguiente jugador tras un tiro', () => {
            const match = MatchX01.create(MATCH_ID, config);

            expect(match.activePlayer.name).toBe('Alice');
            match.addThrow(60);

            expect(match.activePlayer.name).toBe('Bob');
            match.addThrow(40);

            expect(match.activePlayer.name).toBe('Alice');
        });

        it('debería finalizar la partida cuando un jugador llega a 0', () => {
            const match = MatchX01.create(MATCH_ID, config);

            match.addThrow(180);
            match.addThrow(180);
            match.addThrow(121); // Alice gana

            expect(match.status).toBe('FINISHED');
        });

        it('no debería permitir añadir tiros si la partida ya ha finalizado', () => {
            const match = MatchX01.create(MATCH_ID, config);

            match.addThrow(180);
            match.addThrow(180);
            match.addThrow(121); // Alice gana

            const p2InitialScore = match.players[1].remainingScore;
            match.addThrow(60); // Intento de tiro de Bob

            expect(match.players[1].remainingScore).toBe(p2InitialScore);
            expect(match.status).toBe('FINISHED');
        });

        it('debería ignorar puntuaciones inválidas en addThrow (score < 0 o > 180)', () => {
            const match = MatchX01.create(MATCH_ID, config);
            const initialScore = match.activePlayer.remainingScore;

            match.addThrow(-10);
            match.addThrow(181);

            // El score no debe haber cambiado y el turno no debe haber pasado
            expect(match.activePlayer.remainingScore).toBe(initialScore);
            expect(match.activePlayerIndex).toBe(0);
        });
    });

    describe('Undo Logic (undoLastThrow)', () => {
        it('debería retroceder el turno y eliminar el tiro del jugador anterior', () => {
            const match = MatchX01.create(MATCH_ID, config);

            match.addThrow(100); // Turno de Alice (ahora toca Bob)
            expect(match.activePlayerIndex).toBe(1);

            match.undoLastThrow();

            expect(match.activePlayerIndex).toBe(0);
            expect(match.activePlayer.remainingScore).toBe(301);
            expect(match.activePlayer.throws).toHaveLength(1); // Solo el tiro inicial
        });

        it('debería manejar correctamente el undo cuando el turno es del primer jugador', () => {
            const match = MatchX01.create(MATCH_ID, config);

            match.addThrow(60); // Alice
            match.addThrow(40); // Bob (ahora vuelve a tocar Alice)

            match.undoLastThrow(); // Debería volver a ser turno de Bob

            expect(match.activePlayerIndex).toBe(1);
            expect(match.activePlayer.remainingScore).toBe(301);
        });

        it('no debería ejecutar undo si el jugador anterior no tiene tiros suficientes', () => {
            const match = MatchX01.create(MATCH_ID, config);
            // Alice tira (ahora toca Bob)
            match.addThrow(60);
            // Bob no ha tirado nada aún (solo tiene el tiro inicial de 0). 
            // Si hacemos Undo ahora, vuelve a Alice.
            match.undoLastThrow();
            expect(match.activePlayerIndex).toBe(0);

            // Pero si intentamos hacer Undo cuando Alice no ha tirado nada...
            match.undoLastThrow();
            // Se queda en 0 porque el if (throws.length > 1) protege el tiro inicial
            expect(match.activePlayerIndex).toBe(0);
        });

        it('debería retornar prematuramente en undoLastThrow si el estado es FINISHED', () => {
            const match = MatchX01.create(MATCH_ID, config);

            match.addThrow(180);
            match.addThrow(180);
            match.addThrow(121); // Alice gana la partida

            expect(match.status).toBe('FINISHED');

            const lastActiveIndex = match.activePlayerIndex;

            // Intentamos hacer undo (esto activará el 'return' de la línea 80)
            match.undoLastThrow();

            // Verificamos que no ha cambiado nada (porque pusiste un return vacío ahí)
            expect(match.status).toBe('FINISHED');
            expect(match.activePlayerIndex).toBe(lastActiveIndex);
        });
    });

    describe('Game Rules (BestOf vs FirstTo)', () => {
        it('debería calcular correctamente el objetivo en modo BestOf', () => {
            // BestOf 3 significa que hay que ganar 2 (3/2 + 1 = 2)
            const bestOfConfig = new MatchX01Config(301, GameTypes.BestOf, 1, 3, ['Alice', 'Bob']);
            const match = MatchX01.create(MATCH_ID, bestOfConfig);

            // Alice gana Leg 1
            match.addThrow(180); // Alice
            match.addThrow(10); // Bob
            match.addThrow(121); // Alice gana Leg 1

            expect(match.status).toBe('PLAYING'); // No ha terminado porque necesita 2
            expect(match.players[0].numLegsWon).toBe(1);

            // Bob gana Leg 2
            match.addThrow(180); // Bob
            match.addThrow(10); // Alice
            match.addThrow(121); // Bob gana Leg 2

            expect(match.status).toBe('PLAYING'); // No ha terminado porque necesita 2
            expect(match.players[1].numLegsWon).toBe(1);

            // Alice gana Leg 3
            match.addThrow(180); // Alice
            match.addThrow(10); // Bob
            match.addThrow(121); // Alice gana Leg 3

            expect(match.status).toBe('FINISHED');
            expect(match.players[0].numLegsWon).toBe(0);
            expect(match.players[1].numLegsWon).toBe(0);
            expect(match.players[0].numSetsWon).toBe(1);
            expect(match.players[1].numSetsWon).toBe(0);
        });
    });

    describe('Complex Match Flow (Sets and Legs Rotation)', () => {
        it('debería manejar la victoria de un Set y rotar el inicio del siguiente Set', () => {
            // Config: FirstTo 2 Sets, cada Set FirstTo 2 Legs
            const complexConfig = new MatchX01Config(301, GameTypes.FirstTo, 2, 1, ['Alice', 'Bob']);
            const match = MatchX01.create(MATCH_ID, complexConfig);

            // Set 1
            match.addThrow(180); // Alice
            match.addThrow(180); // Bob
            match.addThrow(121); // Alice gana 1 Leg -> Alice gana 1 Set

            expect(match.status).toBe('PLAYING');
            expect(match.players[0].numSetsWon).toBe(1);
            expect(match.players[1].numSetsWon).toBe(0);

            // Set 2
            expect(match.startingPlayerIndexForSet).toBe(1);
            expect(match.activePlayerIndex).toBe(1);
            expect(match.activePlayer.name).toBe('Bob');
        });

        it('debería finalizar la partida al ganar el número de Sets objetivo', () => {
            const setConfig = new MatchX01Config(101, GameTypes.FirstTo, 2, 1, ['Alice', 'Bob']);
            const match = MatchX01.create(MATCH_ID, setConfig);

            // Alice gana Set 1
            match.addThrow(101);
            // Bob gana Set 1
            match.addThrow(101);
            // Alice gana Set 2
            match.addThrow(101);

            expect(match.status).toBe('FINISHED');
            expect(match.players[0].numSetsWon).toBe(2);
        });
    });

    describe('Getters Coverage', () => {
        it('debería devolver una copia defensiva de la configuración', () => {
            const match = MatchX01.create(MATCH_ID, config);

            const retrievedConfig = match.config;

            // 1. Verificamos que los datos coinciden
            expect(retrievedConfig.game).toBe(config.game);

            // 2. Verificamos que es una instancia de la clase (TS ya no falla aquí)
            expect(retrievedConfig).toBeInstanceOf(MatchX01Config);

            // 3. Verificamos que es una COPIA
            expect(retrievedConfig).not.toBe(config);
        });

        it('debería devolver el índice del jugador activo', () => {
            const match = MatchX01.create(MATCH_ID, config);
            expect(match.activePlayerIndex).toBe(0);

            match.addThrow(60);
            expect(match.activePlayerIndex).toBe(1);
        });

        it('debería devolver los índices de rotación iniciales', () => {
            const match = MatchX01.create(MATCH_ID, config);

            // Cubre líneas 186, 187 y específicamente la 188
            expect(match.startingPlayerIndexForLeg).toBe(0);
            expect(match.startingPlayerIndexForSet).toBe(0);
        });
    });
});
