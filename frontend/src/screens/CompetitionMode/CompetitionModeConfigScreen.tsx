import React from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';
import { theme } from '../../theme/theme';
import { styles } from './styles/CompetitionModeConfig.styles';

// Importas el hook personalizado
import { useCompetitionModeConfig } from './hooks/useCompetitionModeConfig';

export const CompetitionModeConfigScreen = ({ navigation }: any) => {
    const {
        boardShortId,
        setBoardShortId,
        isConnected,
        isBootstrapping,
        assignedMatchId,
        matchInfo,
        tournamentInfo,
        isLoadingMatch,
        handleConnect,
        handleDisconnect,
        handleStartMatch,
        fetchMatchAndTournamentData,
        updateMatchDataStates,
        setIsLoadingMatch,
    } = useCompetitionModeConfig(navigation);

    if (isBootstrapping) {
        return (
            <View style={styles.waitingContainer}>
                <ActivityIndicator size="large" color={theme.colors.activityIndicator} />
            </View>
        );
    }

    if (isConnected) {
        if (assignedMatchId) {
            return (
                <View style={styles.waitingContainer}>
                    <View style={styles.loadingBox}>
                        {isLoadingMatch ? (
                            <>
                                <ActivityIndicator size="large" color={theme.colors.activityIndicator} />
                                <Text style={[styles.waitingSubtitle, { marginTop: 15 }]}>Sincronizando datos...</Text>
                            </>
                        ) : !matchInfo ? (
                            <>
                                <Text style={styles.matchTitle}>Error de Datos</Text>
                                <Text style={styles.waitingMessage}>No se ha podido leer la información del partido {assignedMatchId}.</Text>
                                <View style={{ marginTop: 20, width: '80%' }}>
                                    <Button
                                        title="Forzar Reintento"
                                        onPress={async () => {
                                            setIsLoadingMatch(true);
                                            try {
                                                const { matchDetails, tournamentDetails } = await fetchMatchAndTournamentData(assignedMatchId);
                                                updateMatchDataStates(matchDetails, tournamentDetails);
                                            } catch {
                                                Alert.alert('Error', 'Sigue fallando la conexión HTTP.');
                                            } finally {
                                                setIsLoadingMatch(false);
                                            }
                                        }}
                                        variant="primary"
                                    />
                                </View>
                            </>
                        ) : (
                            <>
                                <Text style={styles.matchTitle}>¡Partido Asignado!</Text>
                                {matchInfo.status === "PENDING" && (
                                    <View style={{ marginBottom: 24 }}>
                                        <Text style={[styles.waitingMessage, { textAlign: 'center' }]}>
                                            Esperando al otro rival...
                                        </Text>
                                        <ActivityIndicator size="large" color={theme.colors.activityIndicator} />
                                    </View>
                                )}
                                        
                                <View style={styles.matchCard}>
                                    <Text style={styles.playerText}>{matchInfo?.participant1?.alias || 'Jugador 1'}</Text>
                                    <Text style={styles.vsText}>VS</Text>
                                    <Text style={styles.playerText}>{matchInfo?.participant2?.alias || 'Jugador 2'}</Text>
                                </View>

                                {tournamentInfo && (
                                    <View style={styles.configCard}>
                                        <Text style={styles.configText}>Modalidad: {tournamentInfo.game}</Text>
                                        <Text style={styles.configText}>
                                            {tournamentInfo.gameType === 'BEST_OF' ? 'Al mejor de' : 'Primero a'}: {tournamentInfo.numSets} Sets, {tournamentInfo.numLegs} Legs
                                        </Text>
                                    </View>
                                )}

                                <View style={{ display: 'flex', flexDirection: 'column', width: '100%', marginTop: 30, gap: 24 }}>
                                    {matchInfo.status === "READY" && (
                                        <Button
                                            title="INICIAR PARTIDA"
                                            onPress={handleStartMatch}
                                            variant="primary"
                                            size="large"
                                            iconName="play-arrow"
                                        />
                                    )}
                                    <Button
                                        title="DESCONECTAR"
                                        iconName="link-off"
                                        onPress={handleDisconnect}
                                        variant="secondary"
                                    />
                                </View>
                            </>
                        )}
                    </View>
                </View>
            );
        }

        return (
            <View style={styles.waitingContainer}>
                <View style={styles.loadingBox}>
                    <ActivityIndicator size="large" color={theme.colors.activityIndicator} />
                    <Text style={styles.waitingTitle}>Diana Emparejada</Text>
                    <Text style={styles.waitingSubtitle}>ID: {boardShortId}</Text>
                    <Text style={styles.waitingMessage}>
                        Esperando a que el administrador asigne un partido...
                    </Text>
                </View>
                <View style={styles.disconnectContainer}>
                    <Button
                        title="DESCONECTAR"
                        iconName="link-off"
                        onPress={handleDisconnect}
                        variant="secondary"
                    />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Modo Competición</Text>
            <Text style={styles.subtitle}>Empareja esta tablet con una diana del servidor introduciendo su ID</Text>

            <TextInput
                description="ID de la diana"
                label="(Ej: SXXX-D001)"
                value={boardShortId}
                onChangeText={setBoardShortId}
                autoCapitalize="none"
            />

            <Button
                title="CONECTAR"
                onPress={handleConnect}
                variant="primary"
                size="large"
                iconName="link"
            />
        </View>
    );
};
