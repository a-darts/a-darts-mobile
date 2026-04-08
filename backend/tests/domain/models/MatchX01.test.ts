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
            expect(match.activePlayer.remainingScore).toBe(0);
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

        it('no debería hacer nada si no hay tiros para deshacer', () => {
            const match = MatchX01.create(MATCH_ID, config);
            const initialIndex = match.activePlayerIndex;

            match.undoLastThrow();

            expect(match.activePlayerIndex).toBe(initialIndex);
            expect(match.activePlayer.throws).toHaveLength(1);
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
    });
});
