import React, { createContext, useContext, useState, useEffect } from 'react';
import SocketClientService from '../services/SocketClientService';
import BoardServiceFactory from '../../../backend/src/infrastructure/factories/BoardServiceFactory';

const boardService = BoardServiceFactory.getInstance();

interface BoardContextType {
    boardShortId: string;
    setBoardShortId: (id: string) => void;
    isConnected: boolean;
    setIsConnected: (val: boolean) => void;
    isBootstrapping: boolean;
    disconnectBoard: () => Promise<void>;
    assignedMatchId: string | null;
    setAssignedMatchId: (id: string | null) => void;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export const BoardProvider = ({ children }: any) => {
    const [boardShortId, setBoardShortId] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [isBootstrapping, setIsBootstrapping] = useState(true);
    const [assignedMatchId, setAssignedMatchId] = useState<string | null>(null);

    useEffect(() => {
        const loadSavedBoardId = async () => {
            try {
                const savedBoard = await boardService.getBoard();
                if (savedBoard) {
                    setBoardShortId(savedBoard.shortId);
                    SocketClientService.connect(savedBoard.shortId);
                    setIsConnected(true);
                }
            } catch (error) {
                console.error('Error al leer el ID de la diana:', error);
            } finally {
                setIsBootstrapping(false);
            }
        };
        loadSavedBoardId();
    }, []);

    useEffect(() => {
        if (!isConnected) {
            setAssignedMatchId(null);
            return;
        }

        const unsubscribeAssigned = SocketClientService.onMatchAssigned((data: { matchId: string }) => {
            console.log(`[BoardContext] ¡Partido asignado detectado globalmente!: ${data.matchId}`);
            setAssignedMatchId(data.matchId);
        });

        const unsubscribeUnassigned = SocketClientService.onMatchUnassigned(() => {
            console.log('[BoardContext] Partido desasignado por el administrador.');
            setAssignedMatchId(null);
        });

        const unsubscribeCancelled = SocketClientService.onMatchCancelled(() => {
            console.log('[BoardContext] Partido cancelado por el administrador.');
            setAssignedMatchId(null);
        });

        return () => {
            unsubscribeAssigned();
            unsubscribeUnassigned();
            unsubscribeCancelled();
        };
    }, [isConnected]);

    const disconnectBoard = async () => {
        try {
            SocketClientService.disconnect();
            setIsConnected(false);
            setAssignedMatchId(null);
            await boardService.deleteBoard();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <BoardContext.Provider value={{
            boardShortId,
            setBoardShortId,
            isConnected,
            setIsConnected,
            isBootstrapping,
            disconnectBoard,
            assignedMatchId,
            setAssignedMatchId,
        }}>
            {children}
        </BoardContext.Provider>
    );
};

export const useBoard = () => {
    const context = useContext(BoardContext);
    if (!context) throw new Error('useBoard debe usarse dentro de un BoardProvider');
    return context;
};
