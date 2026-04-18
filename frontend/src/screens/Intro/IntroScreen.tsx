import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { theme } from '../../theme/theme';

const videoSource = require('../../../assets/scoreo_animation.mp4');

export const IntroScreen = () => {
    const navigation = useNavigation();

    // 1. Inicializamos el reproductor
    const player = useVideoPlayer(videoSource, (player) => {
        player.loop = false;
        player.play();
    });

    const handleNavigation = () => {
        navigation.dispatch(
            CommonActions.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            })
        );
    };

    // 2. Escuchamos cuando el video termina
    useEffect(() => {
        const subscription = player.addListener('playToEnd', () => {
            handleNavigation();
        });

        return () => {
            subscription.remove();
        };
    }, [player]);

    return (
        <View style={styles.container}>
            {/* 3. Usamos VideoView en lugar de Video */}
            <VideoView
                player={player}
                style={styles.video}
                contentMode="contain" // Equivale a ResizeMode.CONTAIN
                nativeControls={false} // Quitamos los controles de play/pausa
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    video: {
        width: '80%',
        aspectRatio: 1,
    },
});
