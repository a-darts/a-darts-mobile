import { User } from '../../../src/domain/models/User';

describe('User Entity', () => {
    it('debería crear un usuario con el nombre proporcionado', () => {
        const user = new User('John');
        expect(user.name).toBe('John');
    });

    it('debería asignar "Jugador" si el nombre está vacío', () => {
        const user = new User('');
        expect(user.name).toBe('Jugador');
    });
});
