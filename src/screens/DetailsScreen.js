import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from '../components/Button';
import { theme } from '../theme/theme';

export const DetailsScreen = ({ route, navigation }) => {
  const { name } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Details Screen</Text>
      {name ? (
        <Text style={styles.text}>Welcome, {name}!</Text>
      ) : (
        <Text style={styles.text}>Welcome, Guest!</Text>
      )}
      
      <View style={styles.buttonContainer}>
        <Button 
          title="Go Back"
          variant="secondary"
          onPress={() => navigation.goBack()}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.sizes.xxl,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  text: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.sizes.lg,
    color: theme.colors.textSecondary,
  },
  buttonContainer: {
    marginTop: theme.spacing.xl,
    width: '100%',
  }
});
