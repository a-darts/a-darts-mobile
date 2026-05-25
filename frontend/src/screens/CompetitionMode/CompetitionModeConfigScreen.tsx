import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import SocketClientService from '../../services/SocketClientService';
import { Button } from '../../components/Button';
import { theme } from '../../theme/theme';
import { MatchX01 } from '../../../../backend/src/domain/models/MatchX01';
import MatchX01ServiceFactory from '../../../../backend/src/infrastructure/factories/MatchX01ServiceFactory';
import { MatchX01Config } from '../../../../backend/src/domain/models/MatchX01Config';
import { GameTypes } from '../../../../backend/src/domain/enums/GameTypes';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.44:3000';

export const CompetitionModeConfigScreen = ({ navigation }: any) => {
    const [boardId, setBoardId] = useState('');
    const [isConnected, setIsConnected] = useState(false);

    const [assignedMatchId, setAssignedMatchId] = useState<string | null>(null);
    const [matchInfo, setMatchInfo] = useState<any>(null);
    const [tournamentInfo, setTournamentInfo] = useState<any>(null);
    const [isLoadingMatch, setIsLoadingMatch] = useState(false);

    useEffect(() => {
        if (isConnected) {
            SocketClientService.onMatchAssigned(async (matchId) => {
                setAssignedMatchId(matchId);
                await fetchMatchDetails(matchId);
            });

            SocketClientService.onMatchStarted((matchId) => {
                // Notificamos inicio y avanzamos
                handleMatchStartedEvent(matchId);
            });
        }

        return () => {
            SocketClientService.offMatchAssigned();
            SocketClientService.offMatchStarted();
        };
    }, [isConnected, matchInfo, tournamentInfo]);

    const fetchMatchDetails = async (matchId: string) => {
        setIsLoadingMatch(true);
        try {
            const matchRes = await fetch(`${API_URL}/api/matches/${matchId}`);
            if (!matchRes.ok) throw new Error('No se pudo obtener el partido');
            const matchData = await matchRes.json();

            setMatchInfo(matchData.data);

            if (matchData.data.tournamentId) {
                const tournamentRes = await fetch(`${API_URL}/api/tournaments/${matchData.data.tournamentId}`);
                if (tournamentRes.ok) {
                    const tournamentData = await tournamentRes.json();
                    setTournamentInfo(tournamentData.data.info);
                }
            }
        } catch (error) {
            console.error('Error obteniendo detalles del partido:', error);
            // Si quieres alertar: Alert.alert('Error', 'No se pudieron cargar los detalles del partido.');
        } finally {
            setIsLoadingMatch(false);
        }
    };

    const handleConnect = () => {
        if (!boardId.trim()) {
            return;
        }

        // Conectar al socket usando el boardId
        SocketClientService.connect(boardId.trim());
        setIsConnected(true);
    };

    const handleMatchStartedEvent = async (matchId: string) => {
        if (!matchInfo || !tournamentInfo) return;

        try {
            // 2. Crear partido local
            const playerNames = [
                matchInfo.participant1?.alias || 'Jugador 1',
                matchInfo.participant2?.alias || 'Jugador 2'
            ];

            const mappedGameType = tournamentInfo.gameType === 'BEST_OF' ? GameTypes.BestOf : GameTypes.FirstTo;

            const config = new MatchX01Config(
                parseInt(tournamentInfo.game) || 501,
                mappedGameType,
                tournamentInfo.numSets || 1,
                tournamentInfo.numLegs || 1,
                playerNames
            );

            const match = MatchX01.create(matchId, config);

            // 3. Guardarlo en el respositorio asincrono
            await MatchX01ServiceFactory.getRepository().save(match);

            // 4. Set the matchId in the socket service so it can emit throws
            SocketClientService.setMatchId(matchId);

            // 5. Navegar
            navigation.navigate('GameX01Screen', {
                matchId: matchId,
                playerNames: config.playerNames,
                game: config.game,
                numSets: config.numSets,
                numLegs: config.numLegs,
                typeOfGame: config.typeOfGame
            });
        } catch (error) {
            console.error('Error al instanciar el partido localmente:', error);
            Alert.alert('Error', 'No se pudo crear el partido. Revisa la configuración del torneo.');
        } finally {
            setIsLoadingMatch(false);
        }
    };

    const handleStartMatch = async () => {
        if (!assignedMatchId) return;
        console.log("Asigned match id:", assignedMatchId);
        setIsLoadingMatch(true);
        try {
            // 1. Notificar al backend web que empezamos (esto disparará el evento match_started)
            await fetch(`${API_URL}/api/matches/${assignedMatchId}/start`, {
                method: 'POST',
            });
            // NOTA: No navegamos aquí. Navegaremos cuando recibamos el evento 'match_started'
        } catch (error) {
            console.error('Error iniciando el partido:', error);
            setIsLoadingMatch(false);
        }
    };

    if (isConnected) {
        if (assignedMatchId && (matchInfo || isLoadingMatch)) {
            return (
                <View style={styles.waitingContainer}>
                    <View style={styles.loadingBox}>
                        {isLoadingMatch ? (
                            <ActivityIndicator size="large" color={theme.colors.activityIndicator} />
                        ) : (
                            <>
                                <Text style={styles.matchTitle}>¡Partido Asignado!</Text>

                                <View style={styles.matchCard}>
                                    <Text style={styles.playerText}>{matchInfo?.participant1?.alias || 'Jugador 1'}</Text>
                                    <Text style={styles.vsText}>VS</Text>
                                    <Text style={styles.playerText}>{matchInfo?.participant2?.alias || 'Jugador 2'}</Text>
                                </View>

                                {tournamentInfo && (
                                    <View style={styles.configCard}>
                                        <Text style={styles.configText}>Modalidad: {tournamentInfo.game}</Text>
                                        <Text style={styles.configText}>
                                            {tournamentInfo.gameType === 'BestOf' ? 'Al mejor de' : 'Primero a'}: {tournamentInfo.numSets} Sets, {tournamentInfo.numLegs} Legs
                                        </Text>
                                    </View>
                                )}

                                <View style={{ marginTop: 30, width: '100%' }}>
                                    <Button
                                        title="Iniciar Partida"
                                        onPress={handleStartMatch}
                                        variant="primary"
                                        size="large"
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
    },
    matchTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.activityIndicator,
        marginBottom: 20,
        textAlign: 'center',
    },
    matchCard: {
        backgroundColor: theme.colors.cardBackground,
        padding: 20,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: theme.colors.cardInactiveBorder,
    },
    playerText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginVertical: 10,
        textAlign: 'center',
    },
    vsText: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        fontWeight: 'bold',
    },
    configCard: {
        backgroundColor: theme.colors.cardBackground,
        padding: 15,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    configText: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        marginVertical: 5,
    }
});
