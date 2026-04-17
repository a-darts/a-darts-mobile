import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../../../backend/src/domain/models/User';
import UserServiceFactory from '../../../backend/src/infrastructure/factories/UserServiceFactory';

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (name: string) => Promise<void>;
    logout: () => Promise<void>;
    updateUser: (name: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const userService = UserServiceFactory.getInstance();

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            try {
                const currentUser = await userService.getCurrentUser();
                setUser(currentUser);
            } catch (error) {
                console.error("Error initializing auth:", error);
            } finally {
                setIsLoading(false);
            }
        };
        initAuth();
    }, []);

    const login = async (name: string) => {
        try {
            const newUser = await userService.login(name);
            setUser(newUser);
        } catch (error) {
            console.error("Error logging in:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await userService.logout();
            setUser(null);
        } catch (error) {
            console.error("Error logging out:", error);
            throw error;
        }
    };

    const updateUser = async (name: string) => {
        try {
            const updatedUser = await userService.updateUser(name);
            setUser(updatedUser);
        } catch (error) {
            console.error("Error updating user:", error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
