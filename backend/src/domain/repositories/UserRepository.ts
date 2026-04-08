import { User } from '../models/User';

export interface UserRepository {
    saveUser(user: User): Promise<void>;
    getUser(): Promise<User | null>;
    deleteUser(): Promise<void>;
}
