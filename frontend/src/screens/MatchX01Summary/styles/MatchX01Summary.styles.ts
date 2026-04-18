import { StyleSheet } from 'react-native';
import { theme } from '../../../theme/theme';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingBottom: theme.spacing.xl,
    },
    contentContainer: {
        padding: theme.spacing.lg,
    },
    winnerCard: {
        alignItems: 'center',
        paddingVertical: theme.spacing.lg,
        marginBottom: theme.spacing.md,
    },
    winnerText: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.sizes.lg,
        color: theme.colors.buttonPrimaryBackground,
        letterSpacing: 1,
    },
    statsColumnsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: theme.spacing.lg,
    },
    playerColumn: {
        flex: 1,
        alignItems: 'stretch',
        maxWidth: 240,
    },
    playerNameTitle: {
        color: theme.colors.text,
        fontSize: theme.typography.sizes.md,
        fontWeight: 'bold',
        fontFamily: theme.typography.fontFamily.medium,
        textAlign: 'center',
        marginBottom: theme.spacing.sm,
    },
    text: {
        color: theme.colors.text,
        fontSize: theme.typography.sizes.md,
        textAlign: 'center',
    },
    card: {
        marginVertical: theme.spacing.xs,
    },
    buttonsContainer: {
        padding: theme.spacing.lg,
        paddingBottom: theme.spacing.xl,
        paddingTop: theme.spacing.md,
        gap: theme.spacing.md,
    },
});
