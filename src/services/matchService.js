import AsyncStorage from '@react-native-async-storage/async-storage';

export const getMatchConfig = async () => {
    const stored = await AsyncStorage.getItem('@current_match_config');
    return stored ? JSON.parse(stored) : null;
};
