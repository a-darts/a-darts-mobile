import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { theme } from '../../theme/theme';
import { styles } from './styles/MatchX01Summary.styles';


export const MatchX01SummaryScreen = ({ route, navigation }) => {
  const { matchId } = route.params;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text>MatchX01SummaryScreen</Text>

    </ScrollView>
  );
};
