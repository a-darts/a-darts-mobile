import { StyleSheet } from 'react-native';
import { theme } from '../../../theme/theme';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: theme.colors.background,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 10,
        color: theme.colors.text,
    },
    subtitle: {
        fontSize: 16,
        textAlign: 'center',
        color: theme.colors.textSecondary,
        marginBottom: 30,
    },
    waitingContainer: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: theme.colors.background,
    },
    loadingBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    waitingTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginTop: 20,
        marginBottom: 5,
    },
    waitingSubtitle: {
        fontSize: 18,
        color: theme.colors.activityIndicator,
        fontWeight: '500',
        marginBottom: 20,
    },
    waitingMessage: {
        fontSize: 16,
        textAlign: 'center',
        color: theme.colors.textSecondary,
        paddingHorizontal: 20,
        lineHeight: 24,
    },
    disconnectContainer: {
        paddingBottom: 40,
    },
    matchTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.activityIndicator,
        marginBottom: 20,
        textAlign: 'center',
    },
    matchCard: {
        backgroundColor: theme.colors.cardBackground,
        padding: 20,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: theme.colors.cardInactiveBorder,
    },
    playerText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginVertical: 10,
        textAlign: 'center',
    },
    vsText: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        fontWeight: 'bold',
    },
    configCard: {
        backgroundColor: theme.colors.cardBackground,
        padding: 15,
        borderRadius: 12,
        width: '100%',
        alignItems: 'center',
    },
    configText: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        marginVertical: 5,
    }
});
