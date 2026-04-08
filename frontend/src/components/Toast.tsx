import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { theme } from '../theme/theme';

export const Toast = ({ visible, title, description, type = 'error', onFinished }) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Aparecer
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }).start();

            // Desaparecer automáticamente tras 1.2s
            const timer = setTimeout(() => {
                Animated.timing(fadeAnim, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }).start(() => onFinished());
            }, 1200);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    if (!visible) return null;

    const isSuccess = type === 'success';

    return (
        <Animated.View style={[
            styles.toastContainer,
            { opacity: fadeAnim, borderColor: isSuccess ? theme.colors.toastBorderSuccess : theme.colors.toastBorderError }
        ]}>
            <Text style={styles.toastText}>{title}</Text>
            {description && <Text style={styles.toastSubText}>{description}</Text>}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    toastContainer: {
        position: 'absolute',
        top: '40%',
        left: '10%',
        right: '10%',
        backgroundColor: theme.colors.toastBackground,
        borderRadius: 12,
        borderWidth: 2,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
        elevation: 10,
        shadowColor: theme.colors.toastShadow,
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    toastText: {
        color: theme.colors.toastText,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.sizes.lg,
        textAlign: 'center',
    },
    toastSubText: {
        color: theme.colors.toastTextSecondary,
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.sizes.sm,
        marginTop: 4,
        textAlign: 'center',
    },
});
