import { User } from '../../domain/models/User';
import { IUserRepository } from '../../domain/ports/IUserRepository';

export class UserService {
    // Inyectamos la dependencia en el constructor
    constructor(private userRepository: IUserRepository) { }

    async login(name: string): Promise<User> {
        const newUser = new User(name.trim() || 'Jugador');
        await this.userRepository.saveUser(newUser);
        return newUser;
    }

    async getCurrentUser(): Promise<User | null> {
        return await this.userRepository.getUser();
    }
}
