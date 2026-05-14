import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsContextType {
    showAverage: boolean;
    setShowAverage: (value: boolean) => Promise<void>;
    askDartsOnCheckout: boolean;
    setAskDartsOnCheckout: (value: boolean) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [showAverage, setShowAverageState] = useState(true);
    const [askDartsOnCheckout, setAskDartsOnCheckoutState] = useState(true);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const storedShowAverage = await AsyncStorage.getItem('showAverage');
                if (storedShowAverage !== null) {
                    setShowAverageState(storedShowAverage === 'true');
                }

                const storedAskDarts = await AsyncStorage.getItem('askDartsOnCheckout');
                if (storedAskDarts !== null) {
                    setAskDartsOnCheckoutState(storedAskDarts === 'true');
                }
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        };
        loadSettings();
    }, []);

    const setShowAverage = async (value: boolean) => {
        try {
            setShowAverageState(value);
            await AsyncStorage.setItem('showAverage', value.toString());
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    };

    const setAskDartsOnCheckout = async (value: boolean) => {
        try {
            setAskDartsOnCheckoutState(value);
            await AsyncStorage.setItem('askDartsOnCheckout', value.toString());
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    };

    return (
        <SettingsContext.Provider value={{
            showAverage,
            setShowAverage,
            askDartsOnCheckout,
            setAskDartsOnCheckout
        }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
