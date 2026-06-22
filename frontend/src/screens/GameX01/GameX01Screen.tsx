import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGameX01 } from './hooks/useGameX01';
import { useKeypad } from './hooks/useKeypad';
import { GameTable } from './components/GameTable';
import { Keypad } from './components/Keypad';
import { Toast } from '../../components/Toast';
import { styles } from './styles/GameX01.styles';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/TextInput';
import { useSettings } from '../../utils/SettingsContext';
import { GameStatus } from '../../../../backend/src/domain/enums/GameStatus';
import SocketClientService from '../../services/SocketClientService';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';


const { width, height } = Dimensions.get('window');
const aspectRatio = height / width;
const isTablet = aspectRatio < 1.6 && width > 600;


export const GameX01Screen = ({ navigation, route }: any) => {
  const {
    match, inputValue, toast, setToast, scrollViewRef,
    handleKeyPress, handleBackspace, handleUndo, submitScore,
    handleEnter, handleEnterRemaining, handleGameShot, handleCheckout,
    handleSwapStartingPlayer,
    editingThrow, setEditingThrow, handleEditThrowPress, handleSaveEdit,
    isCompetitionMode,
  } = useGameX01(navigation, route);

  const { showAverage } = useSettings();

  const {
    isBogeyNumber,
    canCheckoutWithDarts,
  } = useKeypad();

  const isLeaving = useRef(false);

  const [isMatchSuspended, setIsMatchSuspended] = useState(false);
  const [isMatchCancelled, setIsMatchCancelled] = useState(false);

  useEffect(() => {
    const unsubSuspended = SocketClientService.onMatchSuspended(() => {
      setIsMatchSuspended(true);
    });
    const unsubResumed = SocketClientService.onMatchResumed(() => {
      setIsMatchSuspended(false);
    });
    const unsubCancelled = SocketClientService.onMatchCancelled(() => {
      setIsMatchCancelled(true);
    });
    const unsubUnassigned = SocketClientService.onMatchUnassigned((data) => {
      if (data.matchId === match?.id) {
        setToast({
          visible: true,
          title: 'Partida asignada a otra diana',
          description: 'El administrador ha movido esta partida a otra diana. Contacta con él si necesitas ayuda.',
          type: 'error',
          mode: 'manual',
          showCloseButton: false,
          // onCloseAction: () => {
          //   isLeaving.current = true;
          //   navigation.navigate('CompetitionModeConfigScreen');
          // }
        });
      }
    });

    return () => {
      unsubSuspended();
      unsubResumed();
      unsubCancelled();
      unsubUnassigned();
    };
  }, [match?.id]);

  // Si el usuario pulsa atrás, se le pide una segunda confirmación de la acción
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      if (isLeaving.current) {
        return;
      }

      if (e.data.action.type === 'RESET' || match?.status === 'FINISHED') {
        return;
      }

      e.preventDefault();

      setToast({
        visible: true,
        title: '¿Salir de la partida?',
        description: 'Si sales ahora, perderás el progreso del juego actual.',
        type: 'error',
        mode: 'manual',
        showCloseButton: false,
        onCloseAction: () => {
          isLeaving.current = true;
          if (isCompetitionMode) {
            navigation.navigate('CompetitionModeConfig');
          } else {
            navigation.navigate('HomeScreen');
          }
        }
      });
    });

    return unsubscribe;
  }, [navigation, match?.status]);

  const handleExit = () => {
    navigation.navigate('CompetitionModeConfig');
  };

  if (!match) {
    return <View style={styles.container} />;
  }

  const { players, activePlayer } = match;
  const activeIndex = (match as any).activePlayerIndex;

  const p1 = players[0];
  const p2 = players.length > 1 ? players[1] : null;

  const canSwapStartingPlayer =
    players.length > 1 && match.history.length === 0;

  const canUndoLastThrow = match.history.length !== 0;


  const scoreInput = parseInt(inputValue, 10);
  const newRemaining = activePlayer.remainingScore - scoreInput;
  const isLeftScoreButtonDisabled =
    inputValue === '' ||
    !canCheckoutWithDarts(scoreInput, 3) ||
    !canCheckoutWithDarts(newRemaining, 3);


  return (
    <SafeAreaView style={[styles.container]} edges={['bottom']}>
      {isMatchSuspended && (
        <View style={styles.suspensionOverlay}>
          <View style={styles.suspensionCard}>
            <MaterialIcons name="pause" size={48} color={theme.colors.textError} />
            <Text style={styles.suspensionTitle}>Partida suspendida</Text>
            <Text style={styles.suspensionSubtitle}>
              El administrador ha pausado este partido.{'\n\n'}
              Contacta con él si necesitas ayuda.
            </Text>
          </View>
        </View>
      )}
      {isMatchCancelled && (
        <View style={styles.suspensionOverlay}>
          <View style={styles.suspensionCard}>
            <MaterialIcons name="cancel" size={48} color={theme.colors.textError} />
            <Text style={styles.suspensionTitle}>Partida cancelada</Text>
            <Text style={styles.suspensionSubtitle}>
              El administrador ha cancelado esta partida.{'\n\n'}
              Contacta con él si necesitas ayuda.
            </Text>
            <View style={styles.suspensionButton}>
              <Button
                title="VOLVER A LA ESPERA"
                iconName={"refresh"}
                variant={'primary'}
                size='large'
                onPress={handleExit}
              />
            </View>
          </View>
        </View>
      )}
      {toast.visible && (
        <View style={styles.overlay} />
      )}
      <Toast
        visible={toast.visible}
        title={toast.title}
        description={toast.description ?? ''}
        type={toast.type}
        mode={toast.mode}
        showCloseButton={toast.showCloseButton}
        onFinished={() => {
          setToast(prev => ({ ...prev, visible: false }))
          if (toast.onCloseAction) {
            toast.onCloseAction();
          }
        }}
      >
        {toast.title === '¿Con cuántos dardos has cerrado?' && (
          <View style={styles.toastButtonsContainer}>
            {[1, 2, 3].map((num) => {
              const isDisabled = !canCheckoutWithDarts(activePlayer.remainingScore, num);
              return (
                <Button
                  key={num}
                  title={num.toString()}
                  variant='secondary'
                  size="normal"
                  disabled={isDisabled}
                  onPress={() => { handleCheckout(activePlayer.remainingScore, num) }}
                />
              );
            })}
          </View>
        )}
        {toast.title === '¿Salir de la partida?' && (
          <View style={styles.toastButtonsContainer}>
            <Button
              title="NO, QUEDARSE"
              variant='error'
              size="normal"
              iconName="close"
              onPress={() => setToast(prev => ({ ...prev, visible: false }))}
            />
            <Button
              title="SÍ, SALIR"
              variant='primary'
              size="normal"
              iconName="check"
              onPress={() => {
                setToast(prev => ({ ...prev, visible: false }));
                if (toast.onCloseAction) {
                  toast.onCloseAction();
                }
              }}
            />
          </View>
        )}
        {toast.title === 'Editar tirada' && editingThrow && (
          <View style={{ width: '100%', marginTop: 10 }}>
            <TextInput
              value={editingThrow.score}
              onChangeText={(text) => setEditingThrow({ ...editingThrow, score: text })}
              keyboardType="numeric"
              autoFocus
            />
            <View style={styles.toastButtonsContainer}>
              <Button
                title="CAMBIAR"
                variant='primary'
                size="normal"
                iconName="check"
                onPress={handleSaveEdit}
              />
            </View>
          </View>
        )}
        {toast.title === 'Partida asignada a otra diana' && (
          <View style={{ marginTop: 10 }}>
            <Button
              title="VOLVER A LA ESPERA"
              iconName={"refresh"}
              variant={'primary'}
              size='large'
              onPress={handleExit}
            />
          </View>
        )}
      </Toast>

      {/* Header */}
      <View style={styles.headerRow}>
        {/* Jugador 1 */}
        <View style={[styles.playerCard, activeIndex === 0 && styles.playerCardActive]}>
          <Text
            style={styles.playerName}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {p1.name}
          </Text>
          <Text style={[styles.scoreLeftText, activeIndex === 0 && styles.scoreActiveText]}>
            {p1.remainingScore}
          </Text>
          {showAverage && (
            <Text style={styles.averageText}>
              MEDIA: {p1.stats.average}
            </Text>
          )}
        </View>

        {/* Marcador central  */}
        <View style={styles.statsCard}>
          <Text style={styles.statsRowText}>
            {p1.numLegsWon}
            {p2 && (
              <Text> - {p2?.numLegsWon ?? 0}</Text>
            )}
          </Text>
          <Text style={styles.statsLabel}>LEGS</Text>
          <Text style={[styles.statsRowText, { marginTop: 10 }]}>
            {p1.numSetsWon}
            {p2 && (
              <Text> - {p2?.numSetsWon ?? 0}</Text>
            )}
          </Text>
          <Text style={styles.statsLabel}>SETS</Text>
        </View>

        {/* Jugador 2 */}
        {p2 && (
          <View style={[styles.playerCard, activeIndex === 1 && styles.playerCardActive]}>
            <Text
              style={styles.playerName}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {p2.name}
            </Text>
            <Text style={[styles.scoreLeftText, activeIndex === 1 && styles.scoreActiveText]}>
              {p2.remainingScore}
            </Text>
            {showAverage && (
              <Text style={styles.averageText}>
                MEDIA: {p2.stats.average}
              </Text>
            )}
          </View>
        )}
      </View>

      <GameTable
        p1={p1}
        p2={p2}
        scrollViewRef={scrollViewRef}
        onEditThrow={handleEditThrowPress}
      />

      {canSwapStartingPlayer && (
        <Button
          title='Jugador inicial'
          iconName='swap-horiz'
          variant='tertiary'
          size={isTablet ? 'large' : 'normal'}
          onPress={handleSwapStartingPlayer}
          style={styles.swapButton}
        />
      )}

      {/* Controls Area */}
      <View style={[styles.controlsArea]}>
        <View style={styles.controlBarRow}>
          <View style={styles.buttonsRow}>
            <Button
              title='RESTO'
              variant='tertiary'
              size={isTablet ? 'large' : 'small'}
              onPress={handleEnterRemaining}
              disabled={isLeftScoreButtonDisabled}
              style={styles.topControlBtn}
            />
            <Button
              title='DESHACER'
              variant='tertiary'
              size={isTablet ? 'large' : 'small'}
              onPress={handleUndo}
              disabled={!canUndoLastThrow}
              style={styles.topControlBtn}
            />
          </View>
          <View style={styles.spacer} />
          <View style={styles.inputBox}>
            <Text style={styles.inputText}>
              {inputValue}
            </Text>
          </View>
        </View>

        <Keypad
          onKeyPress={handleKeyPress}
          onBackspace={handleBackspace}
          onEnter={handleEnter}
          onFastScore={submitScore}
          onGameShot={handleGameShot}
          onCheckout={handleCheckout}
          remainingScore={activePlayer.remainingScore}
        />
      </View>
    </SafeAreaView>
  );
};
