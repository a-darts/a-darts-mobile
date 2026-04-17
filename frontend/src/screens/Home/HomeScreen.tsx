import React from 'react';
import { View, Text, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { Avatar } from '../../components/Avatar';
import { Card } from '../../components/Card';
import { theme } from '../../theme/theme';

import { useHome } from './hooks/useHome';
import { styles } from './styles/Home.styles';

export const HomeScreen = ({ route, navigation }) => {
  const { username, isGuest, recentGames, handlePlayRecentGame } = useHome(route);

  const onPressPlayRecent = async (config) => {
    const matchId = await handlePlayRecentGame(config);
    if (matchId) {
      navigation.navigate('GameX01Screen', { matchId });
    }
  };

  const renderGameItem = ({ item }) => {
    return (
      <Card style={styles.gameCard}>
        <View style={styles.gameIconContainer}>
          <Feather name="rotate-ccw" size={20} color={theme.colors.textSecondary} />
        </View>
        <View style={styles.gameInfo}>
          <Text style={styles.gameTitle}>
            {item.title}
          </Text>
          <Text style={styles.gamePlayers}>
            {item.numPlayers} {item.numPlayers > 1 ? 'jugadores' : 'jugador'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.playButton}
          activeOpacity={0.7}
          onPress={() => onPressPlayRecent(item.config)}
        >
          <Feather name="play" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </Card>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>

      {/* Top User Profile Section */}
      <Card style={styles.profileCard}>
        <Avatar
          isGuest={isGuest}
          imageUri={require('../../../assets/dart_shape.png')}
        />
        <Text style={[styles.usernameText, isGuest && styles.usernameTextGuest]}>
          {username.toUpperCase()}
        </Text>
      </Card>

      {/* New Game Button */}
      <View style={styles.newGameContainer}>
        <Button
          title="NUEVA PARTIDA"
          iconName="gps-fixed"
          variant='primary'
          size='large'
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
