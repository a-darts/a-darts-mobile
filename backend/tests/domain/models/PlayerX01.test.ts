import { PlayerX01 } from '../../../src/domain/models/PlayerX01';
import { ThrowX01 } from '../../../src/domain/models/ThrowX01';

describe('PlayerX01 Entity', () => {
    const PLAYER_ID = 'player-123';
    const PLAYER_NAME = 'Gerwyn Price';
    const INITIAL_SCORE = 501;

    describe('Creation (Factory Methods)', () => {
        it('debería crearse correctamente usando el método create', () => {
            const player = PlayerX01.create(PLAYER_NAME, INITIAL_SCORE);

            expect(player.name).toBe(PLAYER_NAME);
            expect(player.remainingScore).toBe(INITIAL_SCORE);
            expect(player.numLegsWon).toBe(0);
            expect(player.numSetsWon).toBe(0);
            expect(player.throws).toHaveLength(1);
            expect(player.throws[0].score).toBe(0);
        });

        it('debería rehidratarse correctamente usando el método restore', () => {
            const historicThrows = [
                new ThrowX01(0, 501, 0),
                new ThrowX01(60, 441, 3)
            ];
            const player = PlayerX01.restore(PLAYER_ID, PLAYER_NAME, 441, 1, 2, historicThrows);

            expect(player.remainingScore).toBe(441);
            expect(player.numSetsWon).toBe(1);
            expect(player.numLegsWon).toBe(2);
            expect(player.throws).toHaveLength(2);
        });
    });

    describe('addThrow (Game Logic)', () => {
        it('debería actualizar el remainingScore y añadir un nuevo Throw', () => {
            const player = PlayerX01.create(PLAYER_NAME, INITIAL_SCORE);
            player.addThrow(100);

            expect(player.remainingScore).toBe(401);
            expect(player.throws).toHaveLength(2);
            expect(player.throws[1].score).toBe(100);
            expect(player.throws[1].dartCount).toBe(3);
        });

        it('debería lanzar error "Bust" si la puntuación excede el restante', () => {
            const player = PlayerX01.create(PLAYER_NAME, 40);

            // Intentar restar 45 dejando -5
            expect(() => player.addThrow(45)).toThrow('Puntuación inválida');
            expect(player.remainingScore).toBe(40);
        });

        it('debería lanzar error "Bust" si el restante es exactamente 1', () => {
            const player = PlayerX01.create(PLAYER_NAME, 40);

            expect(() => player.addThrow(39)).toThrow('El resto no puede ser 1');
            expect(player.remainingScore).toBe(40);
        });

        it('debería permitir llegar a exactamente 0', () => {
            const player = PlayerX01.create(PLAYER_NAME, 40);
            player.addThrow(40);

            expect(player.remainingScore).toBe(0);
        });
    });

    describe('Win Logic (Legs and Sets)', () => {
        it('debería incrementar el contador de legs ganados', () => {
            const player = PlayerX01.create(PLAYER_NAME, INITIAL_SCORE);
            player.winLeg();
            expect(player.numLegsWon).toBe(1);
        });

        it('debería incrementar sets ganados y resetear legs a cero', () => {
            const player = PlayerX01.create(PLAYER_NAME, INITIAL_SCORE);
            player.winLeg();
            player.winLeg();

            player.winSet();

            expect(player.numSetsWon).toBe(1);
            expect(player.numLegsWon).toBe(0); // Regla de negocio: reset legs al ganar set
        });
    });

    describe('Reset Logic (New Leg/Set)', () => {
        it('debería resetear la puntuación y los tiros para un nuevo Leg', () => {
            const player = PlayerX01.create(PLAYER_NAME, INITIAL_SCORE);
            player.addThrow(100);
            player.winLeg();

            player.resetForNewLeg(301); // Cambiamos a un juego de 301

            expect(player.remainingScore).toBe(301);
            expect(player.throws).toHaveLength(1);
            expect(player.throws[0].score).toBe(0);
            expect(player.numLegsWon).toBe(1); // El contador de legs no debe tocarse aquí
        });

        it('debería resetear legs, puntuación y tiros para un nuevo Set', () => {
            const player = PlayerX01.create(PLAYER_NAME, INITIAL_SCORE);
            player.winLeg();
            player.winLeg();

            player.resetForNewSet(501);

            expect(player.numLegsWon).toBe(0);
            expect(player.remainingScore).toBe(501);
            expect(player.throws).toHaveLength(1);
        });
    });

    describe('Dart Count Calculation', () => {
        it('debería calcular correctamente el número de dardos acumulados (múltiplos de 3)', () => {
            const player = PlayerX01.create(PLAYER_NAME, INITIAL_SCORE);

            player.addThrow(60); // 1º tiro real -> index 1 -> 1 * 3 = 3 dardos
            player.addThrow(40); // 2º tiro real -> index 2 -> 2 * 3 = 6 dardos

            const throws = player.throws;
            expect(throws[1].dartCount).toBe(3);
            expect(throws[2].dartCount).toBe(6);
        });
    });
});

describe('ThrowX01 Value Object', () => {
    it('debería lanzar error si el score es mayor a 180', () => {
        expect(() => new ThrowX01(181, 320, 3)).toThrow('Puntuación inválida');
    });

    it('debería lanzar error si el remainingScore es menor que 0', () => {
        expect(() => new ThrowX01(181, -1, 3)).toThrow('Puntuación inválida');
    });

    it('debería lanzar error si el score es negativo', () => {
        expect(() => new ThrowX01(-1, 501, 3)).toThrow('La puntuación no puede ser menor que 0');
    });

    it('debería lanzar error si el remainingScore es 1', () => {
        expect(() => new ThrowX01(39, 1, 3)).toThrow('El resto no puede ser 1');
    });

    it('debería lanzar error si el dartCount no es múltiplo de 3', () => {
        expect(() => new ThrowX01(60, 441, 4)).toThrow('Número de dardos de la tirada inválido');
    });

    it('debería crear una instancia válida con datos correctos', () => {
        const t = new ThrowX01(140, 361, 6);
        expect(t.score).toBe(140);
        expect(t.remainingScore).toBe(361);
        expect(t.dartCount).toBe(6);
    });
});
