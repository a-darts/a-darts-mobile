import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { theme } from '../../theme/theme';
import { styles } from './styles/MatchX01Summary.styles';

import { StatsCard } from '../../components/StatsCard';

import MatchX01ServiceFactory from '../../../../backend/src/infrastructure/factories/MatchX01ServiceFactory';

// Obtenemos los servicios y el repo desde la Factoría (fuera del hook)
const matchRepo = MatchX01ServiceFactory.getRepository();

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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.statsColumnsContainer}>
        {match.players.map((player, index) => (
          <View key={player.id || index} style={styles.playerColumn}>
            {/* Nombre del jugador centrado sobre su columna */}
            <Text style={styles.playerNameTitle} numberOfLines={1}>
              {player.name}
            </Text>

            <StatsCard
              title="Media"
              content={player.stats.average.toFixed(2)}
              style={styles.card}
            />
            <StatsCard
              title="+100"
              content={player.stats.hundredPlus}
              style={styles.card}
            />
            <StatsCard
              title="+140"
              content={player.stats.hundredFortyPlus}
              style={styles.card}
            />
            <StatsCard
              title="180s"
              content={player.stats.oneEighties}
              style={styles.card}
            />
          </View>
        ))}
      </View>
    </ScrollView>
  );
};
