import { useState, useEffect, useRef } from 'react';
import SocketClientService from '../../../services/SocketClientService';
import { Alert } from 'react-native';
import { GameTypes } from '../../../../../backend/src/domain/enums/GameTypes';
import { MatchX01Config } from '../../../../../backend/src/domain/models/MatchX01Config';
import { MatchX01 } from '../../../../../backend/src/domain/models/MatchX01';
import MatchX01ServiceFactory from '../../../../../backend/src/infrastructure/factories/MatchX01ServiceFactory';
import BoardServiceFactory from '../../../../../backend/src/infrastructure/factories/BoardServiceFactory';
import { CreateMatchX01RequestDTO } from '../../../../../backend/src/application/dtos/MatchX01DTOs';
import { SaveBoardRequestDTO } from '../../../../../backend/src/application/dtos/BoardDTOs';
import { useBoard } from '../../../utils/BoardContext';


const boardService = BoardServiceFactory.getInstance();
const matchX01Service = MatchX01ServiceFactory.getMatchX01Service();

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.0.44:3000';

export const useCompetitionModeConfig = (navigation: any) => {
    const {
        boardShortId,
        setBoardShortId,
        isConnected,
        setIsConnected,
        isBootstrapping,
        disconnectBoard
    } = useBoard();

    const [assignedMatchId, setAssignedMatchId] = useState<string | null>(null);
    const [matchInfo, setMatchInfo] = useState<any>(null);
    const [tournamentInfo, setTournamentInfo] = useState<any>(null);
    const [isLoadingMatch, setIsLoadingMatch] = useState(false);
    const [isMatchCancelled, setIsMatchCancelled] = useState(false);

    const matchInfoRef = useRef<any>(null);
    const tournamentInfoRef = useRef<any>(null);

    useEffect(() => {
        if (!isConnected) {
            setAssignedMatchId(null);
            setMatchInfo(null);
            setTournamentInfo(null);
            return;
        }

        const unsubscribeAssigned = SocketClientService.onMatchAssigned(async (data: { matchId: string }) => {
            setAssignedMatchId(data.matchId);
            setIsLoadingMatch(true);
            try {
                const { matchDetails, tournamentDetails } = await fetchMatchAndTournamentData(data.matchId);
                updateMatchDataStates(matchDetails, tournamentDetails);
            } catch (error) {
                Alert.alert('Error de Red', 'Fallo al descargar detalles del partido.');
            } finally {
                setIsLoadingMatch(false);
            }
        });

        const unsubscribeUnassigned = SocketClientService.onMatchUnassigned(() => {
            setAssignedMatchId(null);
            setMatchInfo(null);
            setTournamentInfo(null);
        });

        const unsubscribeCancelled = SocketClientService.onMatchCancelled(() => {
            setAssignedMatchId(null);
            setMatchInfo(null);
            setTournamentInfo(null);
        });

        const socket = SocketClientService.socket;
        if (socket) {
            socket.on('match_started_confirmed', async (data: { matchId: string }) => {
                await handleMatchEvent(data.matchId);
            });

            socket.on('match_restored', async (data: { matchId: string, historyThrows: any[] }) => {
                await handleMatchEvent(data.matchId, data.historyThrows);
            });

            socket.on('match_cancelled', async (data: { matchId: string }) => {
                await handleMatchCancelled();
            });
        }

        return () => {
            unsubscribeAssigned();
            unsubscribeUnassigned();
            unsubscribeCancelled();
            if (socket) {
                socket.off('match_started_confirmed');
                socket.off('match_restored');
                socket.off('match_cancelled');
            }
        };
    }, [isConnected]);

    const updateMatchDataStates = (matchDetails: any, tournamentDetails: any) => {
        setMatchInfo(matchDetails);
        setTournamentInfo(tournamentDetails);
        matchInfoRef.current = matchDetails;
        tournamentInfoRef.current = tournamentDetails;
    };

    const fetchMatchAndTournamentData = async (matchId: string) => {
        const matchRes = await fetch(`${API_URL}/api/matches/${matchId}`);
        if (!matchRes.ok) throw new Error(`HTTP Error`);
        const matchData = await matchRes.json();
        const actualMatchData = matchData.data || matchData;

        let tInfo = null;
        if (actualMatchData?.tournamentId) {
            const tournamentRes = await fetch(`${API_URL}/api/tournaments/${actualMatchData.tournamentId}`);
            if (tournamentRes.ok) {
                const tournamentData = await tournamentRes.json();
                tInfo = tournamentData.data || tournamentData;
            }
        }
        return { matchDetails: actualMatchData, tournamentDetails: tInfo?.info || tInfo };
    };

    const handleConnect = async () => {
        const cleanId = boardShortId.trim();
        if (!cleanId) return;
        try {
            SocketClientService.connect(cleanId);
            setIsConnected(true);

            const request: SaveBoardRequestDTO = {
                shortId: cleanId,
            };
            await boardService.saveBoard(request);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDisconnect = async () => {
        await disconnectBoard();
    };

    const handleMatchEvent = async (matchId: string, historyThrows?: any[]) => {
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

            if (historyThrows && Array.isArray(historyThrows)) {
                historyThrows.forEach((t: any) => {
                    const score = typeof t === 'number' ? t : t.score;
                    const darts = t.dartsUsed !== undefined ? t.dartsUsed : 3;
                    match.addThrow(score, darts);
                });
            }

            // Guardamos en el repositorio de la capa de aplicación/infraestructura
            const request: CreateMatchX01RequestDTO = {
                id: matchId,
                game: config.game,
                typeOfGame: config.typeOfGame,
                numSets: config.numSets,
                numLegs: config.numLegs,
                playerNames: config.playerNames,
            };
            await matchX01Service.createMatchX01(request);

            SocketClientService.setMatchId(matchId);

            navigation.navigate('GameX01Screen', {
                matchId: matchId,
                playerNames: config.playerNames,
                game: config.game,
                numSets: config.numSets,
                numLegs: config.numLegs,
                typeOfGame: config.typeOfGame,
                historyThrows: historyThrows,
                isCompetitionMode: true,
            });
        } catch (error) {
            Alert.alert('Error', 'No se pudo procesar la partida.');
        } finally {
            setIsLoadingMatch(false);
        }
    };

    const handleMatchCancelled = async () => {
        setIsMatchCancelled(true);

        // 1. Limpiamos los estados reactivos para vaciar la interfaz
        setAssignedMatchId(null);
        setMatchInfo(null);
        setTournamentInfo(null);

        matchInfoRef.current = null;
        tournamentInfoRef.current = null;
    };

    const handleStartMatch = async () => {
        if (!assignedMatchId) return;
        setIsLoadingMatch(true);
        try {
            await fetch(`${API_URL}/api/matches/${assignedMatchId}/start`, { method: 'POST' });
        } catch (error) {
            Alert.alert('Error', 'No se pudo enviar la orden de inicio.');
        } finally {
            setIsLoadingMatch(false);
        }
    };

    return {
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
        isMatchCancelled,
        setIsMatchCancelled,
    };
};
