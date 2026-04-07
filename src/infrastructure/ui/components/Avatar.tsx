import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { theme } from '../theme/theme';

export const Avatar = ({ isGuest = false, imageUri, size = 100 }) => {
  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
      {isGuest ? (
        <View style={[styles.guestContainer, { borderRadius: size / 2 }]}>
          <Text style={[styles.guestText]}>I</Text>
        </View>
      ) : (
        <Image
          source={{ uri: imageUri || 'https://xsgames.co/randomusers/assets/avatars/male/74.jpg' }}
          style={[styles.image, { borderRadius: size / 2 }]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 3,
    borderColor: theme.colors.buttonPrimaryBackground,
    shadowColor: theme.colors.buttonPrimaryBackground,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  guestContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.buttonSecondaryBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestText: {
    fontFamily: theme.typography.fontFamily.semiBold,
    fontSize: theme.typography.sizes.xxl,
    color: theme.colors.text,
  },
  image: {
    width: '100%',
    height: '100%',
  }
});
