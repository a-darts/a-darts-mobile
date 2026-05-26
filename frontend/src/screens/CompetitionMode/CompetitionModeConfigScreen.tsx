import React, { useState, useEffect, useRef } from 'react';
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

    // Guardamos referencias mutables de los datos para evitar cierres de JS obsoletos en eventos asíncronos
    const matchInfoRef = useRef<any>(null);
    const tournamentInfoRef = useRef<any>(null);

    const updateMatchDataStates = (matchDetails: any, tournamentDetails: any) => {
        setMatchInfo(matchDetails);
        setTournamentInfo(tournamentDetails);
        matchInfoRef.current = matchDetails;
        tournamentInfoRef.current = tournamentDetails;
    };

    const fetchMatchAndTournamentData = async (matchId: string) => {
        console.log(`[HTTP Fetch] Solicitando datos para matchId: ${matchId} a ${API_URL}`);
        try {
            const matchRes = await fetch(`${API_URL}/api/matches/${matchId}`);
            if (!matchRes.ok) throw new Error(`HTTP Error de match: ${matchRes.status}`);

            const matchData = await matchRes.json();
            console.log('[HTTP Fetch] Respuesta matchData recibida con éxito');

            // Adaptabilidad defensiva por si la respuesta no viene envuelta en .data
            const actualMatchData = matchData.data || matchData;

            let tInfo = null;
            if (actualMatchData && actualMatchData.tournamentId) {
                console.log(`[HTTP Fetch] Buscando torneo asociado ID: ${actualMatchData.tournamentId}`);
                const tournamentRes = await fetch(`${API_URL}/api/tournaments/${actualMatchData.tournamentId}`);
                if (tournamentRes.ok) {
                    const tournamentData = await tournamentRes.json();
                    const actualTournamentData = tournamentData.data || tournamentData;
                    tInfo = actualTournamentData.info || actualTournamentData;
                }
            }
            return { matchDetails: actualMatchData, tournamentDetails: tInfo };
        } catch (error) {
            console.error('[HTTP Fetch] Error crítico en la solicitud de datos:', error);
            throw error;
        }
    };

    useEffect(() => {
        // Función auxiliar para verificar si el socket está listo y asignarle los eventos
        const setupSocketListeners = () => {
            const socket = SocketClientService.socket;
            if (!socket) return;

            // Limpiamos listeners previos para evitar duplicados si hay re-renders
            socket.off('match_assigned');
            socket.off('match_started');
            socket.off('match_restored');

            // 1. Escucha de asignación
            socket.on('match_assigned', async (data: { matchId: string }) => {
                console.log(`[Pantalla] ¡Evento match_assigned detectado directamente! ID: ${data.matchId}`);

                // Forzamos el cambio de estado de React de manera inmediata
                setAssignedMatchId(data.matchId);
                setIsLoadingMatch(true);

                try {
                    const { matchDetails, tournamentDetails } = await fetchMatchAndTournamentData(data.matchId);
                    updateMatchDataStates(matchDetails, tournamentDetails);
                } catch (error) {
                    console.error('[Pantalla] Error al procesar HTTP tras la asignación:', error);
                    Alert.alert('Error de Red', 'Se asignó el partido pero falló la descarga de detalles.');
                } finally {
                    setIsLoadingMatch(false);
                }
            });

            // 2. Escucha de inicio
            socket.on('match_started', async (data: { matchId: string }) => {
                console.log(`[Pantalla] Evento match_started detectado para ID: ${data.matchId}`);
                await handleMatchStartedEvent(data.matchId);
            });

            // 3. Escucha de restauración
            socket.on('match_restored', async (data: { matchId: string, historyThrows: any[] }) => {
                console.log(`[Pantalla] Evento match_restored detectado para ID: ${data.matchId}`);
                await handleMatchRestoredEvent(data.matchId, data.historyThrows);
            });
        };

        // Ejecutamos la configuración inicial
        setupSocketListeners();

        // Pequeño intervalo de control por si el socket tarda milisegundos en instanciarse tras dar al botón "Conectar"
        const interval = setInterval(() => {
            if (SocketClientService.socket && !SocketClientService.socket.hasListeners('match_assigned')) {
                setupSocketListeners();
            }
        }, 1000);

        return () => {
            clearInterval(interval);
            const socket = SocketClientService.socket;
            if (socket) {
                socket.off('match_assigned');
                socket.off('match_started');
                socket.off('match_restored');
            }
        };
    }, [isConnected]);

    const handleConnect = () => {
        if (!boardId.trim()) return;
        SocketClientService.connect(boardId.trim());
        setIsConnected(true);
    };

    const handleMatchStartedEvent = async (matchId: string) => {
        setIsLoadingMatch(true);
        try {
            // Usamos la referencia mutable para leer el valor en tiempo real libre de cierres obsoletos
            let currentMatchInfo = matchInfoRef.current;
            let currentTournamentInfo = tournamentInfoRef.current;

            if (!currentMatchInfo || !currentTournamentInfo) {
                console.log('[Match Start] Estados locales vacíos en inicio rápido. Ejecutando fetch de emergencia...');
                const { matchDetails, tournamentDetails } = await fetchMatchAndTournamentData(matchId);
                currentMatchInfo = matchDetails;
                currentTournamentInfo = tournamentDetails;
                updateMatchDataStates(currentMatchInfo, currentTournamentInfo);
            }

            if (!currentMatchInfo || !currentTournamentInfo) {
                throw new Error('Imposible recuperar los metadatos esenciales del partido para instanciar el dominio.');
            }

            const playerNames = [
                currentMatchInfo.participant1?.alias || 'Jugador 1',
                currentMatchInfo.participant2?.alias || 'Jugador 2'
            ];

            const mappedGameType = currentTournamentInfo.gameType === 'BEST_OF' ? GameTypes.BEST_OF : GameTypes.FIRST_TO;

            const config = new MatchX01Config(
                parseInt(currentTournamentInfo.game) || 501,
                mappedGameType,
                currentTournamentInfo.numSets || 1,
                currentTournamentInfo.numLegs || 1,
                playerNames
            );

            const match = MatchX01.create(matchId, config);
            await MatchX01ServiceFactory.getRepository().save(match);
            SocketClientService.setMatchId(matchId);

            setIsLoadingMatch(false);

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
            Alert.alert('Error', 'No se pudo iniciar el partido de dardos.');
        } finally {
            setIsLoadingMatch(false);
        }
    };

    const handleMatchRestoredEvent = async (matchId: string, historyThrows: any[]) => {
        setIsLoadingMatch(true);
        try {
            let currentMatchInfo = matchInfoRef.current;
            let currentTournamentInfo = tournamentInfoRef.current;

            if (!currentMatchInfo || !currentTournamentInfo) {
                const { matchDetails, tournamentDetails } = await fetchMatchAndTournamentData(matchId);
                currentMatchInfo = matchDetails;
                currentTournamentInfo = tournamentDetails;
                updateMatchDataStates(currentMatchInfo, currentTournamentInfo);
            }

            const playerNames = [
                currentMatchInfo.participant1?.alias || 'Jugador 1',
                currentMatchInfo.participant2?.alias || 'Jugador 2'
            ];
            const mappedGameType = currentTournamentInfo.gameType === 'BEST_OF' ? GameTypes.BEST_OF : GameTypes.FIRST_TO;

            const config = new MatchX01Config(
                parseInt(currentTournamentInfo.game) || 501,
                mappedGameType,
                currentTournamentInfo.numSets || 1,
                currentTournamentInfo.numLegs || 1,
                playerNames
            );

            const match = MatchX01.create(matchId, config);

            if (Array.isArray(historyThrows) && historyThrows.length > 0) {
                historyThrows.forEach((t: any) => {
                    const score = typeof t === 'number' ? t : t.score;
                    const darts = t.dartsUsed !== undefined ? t.dartsUsed : 3;
                    match.addThrow(score, darts);
                });
            }

            await MatchX01ServiceFactory.getRepository().save(match);
            SocketClientService.setMatchId(matchId);
            setIsLoadingMatch(false);

            navigation.navigate('GameX01Screen', {
                matchId: matchId,
                playerNames: config.playerNames,
                game: config.game,
                numSets: config.numSets,
                numLegs: config.numLegs,
                typeOfGame: config.typeOfGame,
                historyThrows: historyThrows
            });

        } catch (error) {
            console.error('Error al auto-restaurar el partido localmente:', error);
            Alert.alert('Error', 'No se pudo restaurar la partida en curso.');
        } finally {
            setIsLoadingMatch(false);
        }
    };

    const handleStartMatch = async () => {
        if (!assignedMatchId) return;
        setIsLoadingMatch(true);
        try {
            await fetch(`${API_URL}/api/matches/${assignedMatchId}/start`, {
                method: 'POST',
            });
        } catch (error) {
            console.error('Error iniciando el partido por HTTP:', error);
            Alert.alert('Error', 'No se pudo enviar la orden de inicio al servidor.');
        } finally {
            setIsLoadingMatch(false);
        }
    };

    // --- RENDERIZADO DE INTERFAZ ---
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
