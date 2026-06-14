import { Board } from '../../../src/domain/models/Board';

describe('Board Entity', () => {
    describe('Constructor', () => {
        it('debería crear una instancia de Board con el shortId proporcionado', () => {
            const shortId = 'abc123';
            const board = new Board(shortId);

            expect(board).toBeInstanceOf(Board);
        });

        it('debería almacenar correctamente el shortId', () => {
            const shortId = 'xyz-789';
            const board = new Board(shortId);

            expect(board.shortId).toBe('xyz-789');
        });

        it('debería aceptar un shortId numérico como string', () => {
            const board = new Board('000001');
            expect(board.shortId).toBe('000001');
        });

        it('debería aceptar un shortId con caracteres especiales', () => {
            const board = new Board('board_01-A');
            expect(board.shortId).toBe('board_01-A');
        });
    });

    describe('Getter shortId', () => {
        it('el getter shortId debería devolver el mismo valor que se pasó al constructor', () => {
            const expected = 'test-id-42';
            const board = new Board(expected);

            expect(board.shortId).toBe(expected);
        });

        it('dos instancias con el mismo shortId deberían devolver el mismo valor', () => {
            const id = 'shared-id';
            const board1 = new Board(id);
            const board2 = new Board(id);

            expect(board1.shortId).toBe(board2.shortId);
        });

        it('dos instancias con distintos shortIds deberían devolver valores distintos', () => {
            const board1 = new Board('id-one');
            const board2 = new Board('id-two');

            expect(board1.shortId).not.toBe(board2.shortId);
        });
    });

    describe('Inmutabilidad', () => {
        it('el shortId no debería cambiar tras la creación (readonly)', () => {
            const board = new Board('immutable-id');
            const original = board.shortId;

            // No hay setter, simplemente verificamos que no cambia
            expect(board.shortId).toBe(original);
        });
    });
});
