import { User } from '../../domain/models/User';
import { IUserRepository } from '../../domain/repositories/IUserRepository';

export class UserService {
    // Inyectamos la dependencia en el constructor
    constructor(private userRepository: IUserRepository) { }

    async login(name: string): Promise<User> {
        const newUser = User.create(name.trim() || 'Jugador');
        await this.userRepository.saveUser(newUser);
        return newUser;
    }

    async logout(): Promise<void> {
        await this.userRepository.deleteUser();
    }

    async getCurrentUser(): Promise<User | null> {
        return await this.userRepository.getUser();
    }

    async updateUser(name: string): Promise<User> {
        const currentUser = await this.getCurrentUser();
        if (!currentUser) {
            throw new Error("No hay usuario autenticado para actualizar");
        }
        
        currentUser.name = name.trim() || 'Jugador';
        await this.userRepository.saveUser(currentUser);
        return currentUser;
    }
}
