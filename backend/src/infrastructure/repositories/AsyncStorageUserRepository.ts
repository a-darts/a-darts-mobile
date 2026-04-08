import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../../domain/models/User';
import { UserRepository } from '../../domain/repositories/UserRepository';

export class AsyncStorageUserRepository implements UserRepository {
    private readonly USER_KEY = '@user_data';

    async saveUser(user: User): Promise<void> {
        await AsyncStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }

    async getUser(): Promise<User | null> {
        const data = await AsyncStorage.getItem(this.USER_KEY);
        if (!data) return null;
        const parsed = JSON.parse(data);
        return new User(parsed.name);
    }

    async deleteUser(): Promise<void> {
        await AsyncStorage.removeItem(this.USER_KEY);
    }
}
