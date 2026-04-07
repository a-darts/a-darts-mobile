import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';
import { Button } from '../components/Button';
import { Avatar } from '../components/Avatar';
import { Card } from '../components/Card';
import { theme } from '../theme/theme';

const DEFAULT_GAMES = [
  { id: '1', title: '501 · Al mejor de 3', players: '2 jugadores' },
  { id: '2', title: '501 · A ganar 1', players: '1 jugador' },
  { id: '3', title: '301 · A ganar 1', players: '1 jugador' },
];

export const HomeScreen = ({ route, navigation }) => {
  const { name } = route.params || {};
  const isGuest = !name;
  const username = isGuest ? 'INVITADO' : name;

  const [recentGames, setRecentGames] = useState([]);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const storedGames = await AsyncStorage.getItem('@recent_games');
      if (storedGames) {
        setRecentGames(JSON.parse(storedGames));
      } else {
        // Init with default mock data
        await AsyncStorage.setItem('@recent_games', JSON.stringify(DEFAULT_GAMES));
        setRecentGames(DEFAULT_GAMES);
      }
    } catch (e) {
      console.error(e);
      setRecentGames(DEFAULT_GAMES);
    }
  };

  const renderGameItem = ({ item }) => (
    <Card style={styles.gameCard}>
      <View style={styles.gameIconContainer}>
        <Feather name="rotate-ccw" size={20} color={theme.colors.textSecondary} />
      </View>
      <View style={styles.gameInfo}>
        <Text style={styles.gameTitle}>{item.title}</Text>
        <Text style={styles.gamePlayers}>{item.players}</Text>
      </View>
      <TouchableOpacity style={styles.playButton} activeOpacity={0.7}>
        <Feather name="play" size={20} color={theme.colors.textSecondary} />
      </TouchableOpacity>
    </Card>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

      {/* Top User Profile Section */}
      <Card style={styles.profileCard}>
        <Avatar isGuest={isGuest} />
        <Text style={[styles.usernameText, isGuest && styles.usernameTextGuest]}>{username}</Text>
      </Card>

      {/* Stats Section */}
      {/* {!isGuest && (
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>MEDIA</Text>
            <Text style={styles.statValue}>74.2</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={styles.statLabel}>TASA DE VICTORIA</Text>
            <Text style={styles.statValue}>68%</Text>
          </Card>
        </View>
      )} */}

      {/* New Game Button */}
      <View style={styles.newGameContainer}>
        <Button
          title="Nueva Partida"
          iconName="target"
          onPress={() => navigation.navigate('ConfigX01')}
        />
      </View>

      {/* Recent Games */}
      <View style={styles.recentGamesContainer}>
        <Text style={styles.sectionTitle}>PARTIDAS RECIENTES</Text>
        <FlatList
          data={recentGames}
          keyExtractor={item => item.id}
          renderItem={renderGameItem}
          scrollEnabled={false}
          contentContainerStyle={styles.listContainer}
        />
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: theme.spacing.lg,
  },

  // Profile Card
  profileCard: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  usernameText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.xl,
    color: theme.colors.buttonPrimaryBackground, // Glow color
    marginTop: theme.spacing.sm,
    letterSpacing: 1,
  },
  usernameTextGuest: {
    marginTop: theme.spacing.sm,
  },

  // Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  statCard: {
    flex: 1,
    marginHorizontal: theme.spacing.xs,
    padding: theme.spacing.md,
  },
  statLabel: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.xxl,
    color: theme.colors.text,
  },

  // New Game
  newGameContainer: {
    marginBottom: theme.spacing.xl,
    marginTop: theme.spacing.md,
  },

  // Recent Games
  recentGamesContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  listContainer: {
    gap: theme.spacing.md,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  gameIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text,
    marginBottom: 4,
  },
  gamePlayers: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textSecondary,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
