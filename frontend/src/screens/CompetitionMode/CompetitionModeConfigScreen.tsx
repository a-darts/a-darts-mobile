import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator } from 'react-native';
import SocketClientService from '../../services/SocketClientService';
import { Button } from '../../components/Button';
import { theme } from '../../theme/theme';

export const CompetitionModeConfigScreen = ({ navigation }: any) => {
    const [boardId, setBoardId] = useState('');
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (isConnected) {
            SocketClientService.onMatchAssigned((matchId) => {
                navigation.navigate('GameX01Screen', { matchId });
            });
        }

        return () => {
            SocketClientService.offMatchAssigned();
        };
    }, [isConnected, navigation]);

    const handleConnect = () => {
        if (!boardId.trim()) {
            return;
        }

        // Conectar al socket usando el boardId
        SocketClientService.connect(boardId.trim());
        setIsConnected(true);
    };

    if (isConnected) {
        return (
            <View style={styles.waitingContainer}>
                <View style={styles.loadingBox}>
                    <ActivityIndicator size="large" color={theme.colors.activityIndicator} />
                    <Text style={styles.waitingTitle}>Diana Emparejada</Text>
                    <Text style={styles.waitingSubtitle}>ID: {boardId}</Text>

                    <Text style={styles.waitingMessage}>
                        Esperando a que el administrador asigne un partido desde el panel web...
                    </Text>
                </View>

                <View style={styles.disconnectContainer}>
                    <Button
                        title="Desconectar"
                        onPress={() => {
                            SocketClientService.disconnect();
                            setIsConnected(false);
                        }}
                        variant="secondary"
                    />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Modo Competición</Text>
            <Text style={styles.subtitle}>Empareja esta tablet con una diana</Text>

            <TextInput
                style={styles.input}
                placeholder="ID de la Diana (Ej: uuid...)"
                value={boardId}
                onChangeText={setBoardId}
                autoCapitalize="none"
                placeholderTextColor={theme.colors.inputPlaceholder}
            />

            <Button
                title="Conectar"
                onPress={handleConnect}
                variant="primary"
                size="large"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: theme.colors.background,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: theme.colors.text,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        color: theme.colors.textSecondary,
        marginBottom: 30,
    },
    input: {
        borderWidth: 1,
        borderColor: theme.colors.inputBorder,
        borderRadius: 12,
        padding: 15,
        fontSize: 18,
        marginBottom: 25,
        textAlign: 'center',
        color: theme.colors.inputText,
        backgroundColor: theme.colors.inputBackground,
    },
    waitingContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: theme.colors.background,
    },
    loadingBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    waitingTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginTop: 20,
        marginBottom: 5,
    },
    waitingSubtitle: {
        fontSize: 18,
        color: theme.colors.activityIndicator,
        fontWeight: '500',
        marginBottom: 20,
    },
    waitingMessage: {
        fontSize: 16,
        textAlign: 'center',
        color: theme.colors.textSecondary,
        paddingHorizontal: 20,
        lineHeight: 24,
    },
    disconnectContainer: {
        paddingBottom: 40,
    }
});
