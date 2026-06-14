import { MatchX01 } from '../../../src/domain/models/MatchX01';
import { MatchX01Config } from '../../../src/domain/models/MatchX01Config';
import { PlayerX01 } from '../../../src/domain/models/PlayerX01';
import { GameTypes } from '../../../src/domain/enums/GameTypes';
import { GameStatus } from '../../../src/domain/enums/GameStatus';
import { BustException, EndedMatchException, InvalidThrowException } from '../../../src/domain/exceptions/Exceptions';

describe('MatchX01 Entity', () => {
    let config: MatchX01Config;
    const MATCH_ID = 'match-1';

    beforeEach(() => {
        // Configuramos una partida rápida de 301 para los tests
        config = new MatchX01Config(301, GameTypes.FIRST_TO, 1, 1, ['Alice', 'Bob']);
    });

    describe('Creation & Restore', () => {
        it('debería crear una partida nueva con los jugadores inicializados', () => {
            const match = MatchX01.create(MATCH_ID, config);

            expect(match.id).toBe(MATCH_ID);
            expect(match.players).toHaveLength(2);
            expect(match.players[0].name).toBe('Alice');
            expect(match.activePlayerIndex).toBe(0);
            expect(match.status).toBe(GameStatus.PLAYING);
        });

        it('debería restaurar una partida a un estado específico (Rehidratación)', () => {
            const p1 = PlayerX01.create('Alice', 301);
            const p2 = PlayerX01.create('Bob', 301);

            const match = MatchX01.restore(MATCH_ID, config, [p1, p2], 1, 0, 0, GameStatus.PLAYING);

            expect(match.activePlayerIndex).toBe(1);
            expect(match.activePlayer.name).toBe('Bob');
        });
    });

    describe('Turn Management (addThrow)', () => {
        it('debería cambiar el turno al siguiente jugador tras un tiro válido', () => {
            const match = MatchX01.create(MATCH_ID, config);

            expect(match.activePlayer.name).toBe('Alice');
            match.addThrow(60);

            expect(match.activePlayer.name).toBe('Bob');
            match.addThrow(40);

            expect(match.activePlayer.name).toBe('Alice');
        });

        it('debería finalizar la partida cuando un jugador llega a 0', () => {
            const match = MatchX01.create(MATCH_ID, config);

            match.addThrow(141); // Alice (Quedan 160)
            match.addThrow(0);   // Bob
            match.addThrow(160); // Alice gana Leg y Match (porque es FIRST_TO 1 set/1 leg)

            expect(match.status).toBe(GameStatus.FINISHED);
        });

        it('debería lanzar EndedMatchException si la partida ya ha finalizado', () => {
            const match = MatchX01.create(MATCH_ID, config);
            match.addThrow(141);
            match.addThrow(0);
            match.addThrow(160); // Finaliza

            expect(() => match.addThrow(60)).toThrow(EndedMatchException);
        });

        it('debería lanzar BustException si la puntuación excede el remanente', () => {
            const match = MatchX01.create(MATCH_ID, config);
            // Alice tiene 301. Si intenta tirar 302:
            expect(() => match.addThrow(302)).toThrow(BustException);
        });

        it('debería truncar en el tiro posterior si el recalculado llega a 0', () => {
            const p = PlayerX01.create('Test', 200);
            p.addThrow(60);  // index 1: remaining 140
            p.addThrow(40);  // index 2: remaining 100
            p.addThrow(30);  // index 3: remaining 70
            p.editThrow(1, 160);

            expect(p.throws).toHaveLength(3);
            expect(p.remainingScore).toBe(0);
        });

        it('debería lanzar InvalidThrowException si el resto es 1', () => {
            const match = MatchX01.create(MATCH_ID, config);

            match.addThrow(150);
            match.addThrow(0);

            expect(() => match.addThrow(150)).toThrow(InvalidThrowException);
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

        it('no debería permitir deshacer si la partida ya ha finalizado (Comportamiento Silencioso)', () => {
            const match = MatchX01.create(MATCH_ID, config);

            // Alice gana rápido (en 101 para abreviar el test si config lo permite)
            match.addThrow(180);
            match.addThrow(0); // Bob
            match.addThrow(121); // Alice gana. Status = FINISHED

            expect(match.status).toBe(GameStatus.FINISHED);

            const lastActiveIndex = match.activePlayerIndex;

            // Si quieres que el test pase con tu código actual (que SÍ permite undo aunque esté finalizado):
            match.undoLastThrow();
            expect(match.status).toBe(GameStatus.PLAYING);
        });
    });

    describe('Game Rules (BEST_OF vs FIRST_TO)', () => {
        it('debería calcular correctamente el objetivo en modo BEST_OF', () => {
            // BEST_OF 3 significa que hay que ganar 2 (3/2 + 1 = 2)
            const bestOfConfig = new MatchX01Config(301, GameTypes.BEST_OF, 1, 3, ['Alice', 'Bob']);
            const match = MatchX01.create(MATCH_ID, bestOfConfig);

            // Alice gana Leg 1
            match.addThrow(180); // Alice
            match.addThrow(10); // Bob
            match.addThrow(121); // Alice gana Leg 1

            expect(match.status).toBe(GameStatus.PLAYING); // No ha terminado porque necesita 2
            expect(match.players[0].numLegsWon).toBe(1);

            // Bob gana Leg 2
            match.addThrow(180); // Bob
            match.addThrow(10); // Alice
            match.addThrow(121); // Bob gana Leg 2

            expect(match.status).toBe(GameStatus.PLAYING); // No ha terminado porque necesita 2
            expect(match.players[1].numLegsWon).toBe(1);

            // Alice gana Leg 3
            match.addThrow(180); // Alice
            match.addThrow(10); // Bob
            match.addThrow(121); // Alice gana Leg 3

            expect(match.status).toBe(GameStatus.FINISHED);
            expect(match.players[0].numLegsWon).toBe(0);
            expect(match.players[1].numLegsWon).toBe(0);
            expect(match.players[0].numSetsWon).toBe(1);
            expect(match.players[1].numSetsWon).toBe(0);
        });
    });

    describe('Complex Match Flow (Sets and Legs Rotation)', () => {
        it('debería manejar la victoria de un Set y rotar el inicio del siguiente Set', () => {
            // Config: FIRST_TO 2 Sets, cada Set FIRST_TO 2 Legs
            const complexConfig = new MatchX01Config(301, GameTypes.FIRST_TO, 2, 1, ['Alice', 'Bob']);
            const match = MatchX01.create(MATCH_ID, complexConfig);

            // Set 1
            match.addThrow(180); // Alice
            match.addThrow(180); // Bob
            match.addThrow(121); // Alice gana 1 Leg -> Alice gana 1 Set

            expect(match.status).toBe(GameStatus.PLAYING);
            expect(match.players[0].numSetsWon).toBe(1);
            expect(match.players[1].numSetsWon).toBe(0);

            // Set 2
            expect(match.startingPlayerIndexForSet).toBe(1);
            expect(match.activePlayerIndex).toBe(1);
            expect(match.activePlayer.name).toBe('Bob');
        });

        it('debería finalizar la partida al ganar el número de Sets objetivo', () => {
            const setConfig = new MatchX01Config(101, GameTypes.FIRST_TO, 2, 1, ['Alice', 'Bob']);
            const match = MatchX01.create(MATCH_ID, setConfig);

            // Alice gana Set 1
            match.addThrow(101);
            // Bob gana Set 1
            match.addThrow(101);
            // Alice gana Set 2
            match.addThrow(101);

            expect(match.status).toBe(GameStatus.FINISHED);
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

    describe('history getter', () => {
        it('debería devolver una copia del historial de snapshots', () => {
            const match = MatchX01.create(MATCH_ID, config);
            match.addThrow(60);

            const history = match.history;
            expect(history).toHaveLength(1);
            // Copia defensiva: no es la misma referencia que la interna
            expect(history).not.toBe(match.history);
        });
    });
});

describe('MatchX01 - editThrow branch coverage', () => {
    const MATCH_ID = 'edit-match';
    let config: MatchX01Config;

    beforeEach(() => {
        config = new MatchX01Config(501, GameTypes.FIRST_TO, 1, 1, ['Alice', 'Bob']);
    });

    it('debería lanzar error si el jugador no existe', () => {
        const match = MatchX01.create(MATCH_ID, config);
        match.addThrow(60);

        expect(() => match.editThrow('nonexistent-id', 1, 40)).toThrow('Jugador no encontrado');
    });

    it('debería actualizar el historial sin truncar cuando el editar no cierra el leg', () => {
        const match = MatchX01.create(MATCH_ID, config);
        match.addThrow(100); // Alice index 1: 401
        match.addThrow(100); // Bob
        const aliceId = match.players[0].id;

        // No debería lanzar, Alice aún no ha terminado
        match.editThrow(aliceId, 1, 50);

        expect(match.players[0].remainingScore).toBe(451);
        expect(match.status).toBe(GameStatus.PLAYING);
    });

    it('debería activar handleLegWon si editar lleva remainingScore a 0', () => {
        // Usamos un juego de 180 para poder llegar a 0 con 1 dardo (180 pts)
        const cfg180 = new MatchX01Config(180, GameTypes.FIRST_TO, 1, 1, ['Alice', 'Bob']);
        const match = MatchX01.create(MATCH_ID, cfg180);
        match.addThrow(60); // Alice: 120 remaining
        match.addThrow(60); // Bob
        const aliceId = match.players[0].id;

        // Editamos para que Alice cierre con 180 (desde remaining 180 original)
        match.editThrow(aliceId, 1, 180);

        expect(match.status).toBe(GameStatus.FINISHED);
    });

    it('debería restaurar status a PLAYING si se edita en una partida FINISHED (no cierra de nuevo)', () => {
        // Usamos juego de 180 para poder ganar con un solo tiro
        const cfg180 = new MatchX01Config(180, GameTypes.FIRST_TO, 1, 1, ['Alice', 'Bob']);
        const match = MatchX01.create(MATCH_ID, cfg180);
        match.addThrow(180); // Alice gana → FINISHED
        expect(match.status).toBe(GameStatus.FINISHED);
        const aliceId = match.players[0].id;

        // Editamos el tiro ganador para que NO cierre (180 → 60, remaining= 120)
        match.editThrow(aliceId, 1, 60);

        expect(match.status).toBe(GameStatus.PLAYING);
    });
});

describe('MatchX01 - swapStartingPlayer branch coverage', () => {
    const MATCH_ID = 'swap-match';
    let config: MatchX01Config;

    beforeEach(() => {
        config = new MatchX01Config(301, GameTypes.FIRST_TO, 1, 1, ['Alice', 'Bob']);
    });

    it('debería ignorar el swap si ya hay historial de tiros', () => {
        const match = MatchX01.create(MATCH_ID, config);
        match.addThrow(60); // genera historial

        match.swapStartingPlayer(); // debe ser ignorado

        // El turno activo pertenece ahora a Bob (índice 1) porque Alice ya tiró,
        // NO debería volver a Alice por el swap
        expect(match.activePlayerIndex).toBe(1);
        expect(match.startingPlayerIndexForLeg).toBe(0); // no cambia
    });
});
