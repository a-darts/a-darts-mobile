import { UserService } from '../../application/services/UserService';
import { AsyncStorageUserRepository } from '../adapters/AsyncStorageUserRepository';

export default class UserServiceFactory {
    private static instance: UserService | null = null;

    public static getInstance(): UserService {
        if (!this.instance) {
            const repository = new AsyncStorageUserRepository();
            this.instance = new UserService(repository);
        }

        return this.instance;
    }
}
