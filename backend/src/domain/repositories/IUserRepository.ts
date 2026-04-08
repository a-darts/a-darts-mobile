import { User } from '../models/User';

export interface IUserRepository {
    saveUser(user: User): Promise<void>;
    getUser(): Promise<User | null>;
    deleteUser(): Promise<void>;
}
