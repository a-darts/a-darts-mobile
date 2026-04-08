import { UserService } from '../../application/services/UserService';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { AsyncStorageUserRepository } from '../repositories/AsyncStorageUserRepository';

export default class UserServiceFactory {
    private static instance: UserService | null = null;
    private static repository: IUserRepository | null = null;

    private static getRepository(): IUserRepository {
        if (!this.repository) {
            this.repository = new AsyncStorageUserRepository();
        }
        return this.repository;
    }

    public static getInstance(): UserService {
        if (!this.instance) {
            this.instance = new UserService(this.getRepository());
        }
        return this.instance;
    }
}
