import { StyleSheet } from 'react-native';
import { theme } from '../../../theme/theme';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    contentContainer: {
        padding: theme.spacing.lg,
    },
    profileCard: {
        alignItems: 'center',
        paddingVertical: theme.spacing.xl,
        marginBottom: theme.spacing.md,
    },
    welcomeText: {
        fontFamily: theme.typography.fontFamily.title,
        fontSize: theme.typography.sizes.xl,
        color: theme.colors.text,
        marginTop: theme.spacing.sm,
        letterSpacing: 1,
    },
    usernameText: {
        fontFamily: theme.typography.fontFamily.title,
        fontSize: theme.typography.sizes.xl,
        color: theme.colors.buttonPrimaryBackground,
        marginTop: theme.spacing.sm,
        letterSpacing: 1,
    },
    usernameTextGuest: {
        marginTop: theme.spacing.sm,
    },
    newGameContainer: {
        marginBottom: theme.spacing.xl,
        marginTop: theme.spacing.md,
    },
    recentGamesContainer: {
        flex: 1,
    },
    sectionTitle: {
        fontFamily: theme.typography.fontFamily.title,
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
