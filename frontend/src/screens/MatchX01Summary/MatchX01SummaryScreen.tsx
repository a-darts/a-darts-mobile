import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { theme } from '../../theme/theme';
import { styles } from './styles/MatchX01Summary.styles';

import { StatsCard } from '../../components/StatsCard';

import MatchX01ServiceFactory from '../../../../backend/src/infrastructure/factories/MatchX01ServiceFactory';
import { Button } from '../../components/Button';
import { CreateMatchX01Request } from '../../../../backend/src/application/dtos/CreateMatchX01Request';

import { Card } from '../../components/Card';


// Obtenemos los servicios y el repo desde la Factoría
const matchRepo = MatchX01ServiceFactory.getRepository();
const matchX01Service = MatchX01ServiceFactory.getMatchX01Service();

export const MatchX01SummaryScreen = ({ route, navigation }) => {
  const { matchId } = route.params;

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        const result = await matchRepo.getById(matchId);
        setMatch(result);
      } catch (error) {
        console.error("Error cargando estadísticas");
        // MIRAR que hacer
      } finally {
        setLoading(false);
      }
    };
    fetchMatchData();
  }, [matchId]);


  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  if (!match) return null;

  const winnerName = match.players[match.activePlayerIndex].name;

  const getBestValueColor = (currentValue, allPlayersValues) => {
    const max = Math.max(...allPlayersValues);
    const allSame = allPlayersValues.every(v => v === allPlayersValues[0]);
    if (max === 0 || allSame) return theme.colors.statsCardSuccessBorder;

    return currentValue === max ? theme.colors.statsCardSuccessBorder : theme.colors.statsCardErrorBorder;
  };

  const averages = match.players.map(p => p.stats.average);
  const hundreds = match.players.map(p => p.stats.hundredPlus);
  const hundredForties = match.players.map(p => p.stats.hundredFortyPlus);
  const oneEighties = match.players.map(p => p.stats.oneEighties);


  const handleReplay = async () => {
    // 3. Ejecutar el servicio con el DTO (request)
    const request: CreateMatchX01Request = {
      game: match.config.game,
      typeOfGame: match.config.typeOfGame,
      numSets: match.config.numSets,
      numLegs: match.config.numLegs,
      playerNames: match.config.playerNames,
    };
    const newMatch = await matchX01Service.createMatchX01(request);

    // 4. Navegar a la partida pasando el ID generado
    navigation.navigate('GameX01Screen', { matchId: newMatch.id });
  };

  const handleExit = () => {
    navigation.navigate('HomeScreen');
  };


  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
      >
        {match.players.length > 1 && (
          <Card style={styles.winnerCard}>
            <Text style={[styles.winnerText]}>
              ¡{winnerName} HA GANADO!
            </Text>
          </Card>
        )}

        <View style={styles.statsColumnsContainer}>
          {match.players.map((player, index) => (
            <View key={player.id || index} style={styles.playerColumn}>

              {match.players.length > 1 && (
                <Text style={styles.playerNameTitle} numberOfLines={1}>
                  {player.name}
                </Text>
              )}

              <StatsCard
                title="Media"
                content={player.stats.average.toFixed(2)}
                borderColor={getBestValueColor(player.stats.average, averages)}
                style={styles.card}
              />
              <StatsCard
                title="+100"
                content={player.stats.hundredPlus}
                borderColor={getBestValueColor(player.stats.hundredPlus, hundreds)}
                style={styles.card}
              />
              <StatsCard
                title="+140"
                content={player.stats.hundredFortyPlus}
                borderColor={getBestValueColor(player.stats.hundredFortyPlus, hundredForties)}
                style={styles.card}
              />
              <StatsCard
                title="180s"
                content={player.stats.oneEighties}
                borderColor={getBestValueColor(player.stats.oneEighties, oneEighties)}
                style={styles.card}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.buttonsContainer]}>
        <Button
          title="VOLVER A JUGAR"
          iconName="gps-fixed"
          variant='primary'
          size='large'
          onPress={handleReplay}
        />
        <Button
          title="SALIR"
          iconName="home"
          variant='secondary'
          size='large'
          onPress={handleExit}
        />
      </View>
    </View>
  );
};
