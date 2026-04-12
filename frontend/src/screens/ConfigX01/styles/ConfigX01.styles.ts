import { StyleSheet } from 'react-native';
import { theme } from '../../../theme/theme';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingBottom: theme.spacing.xl,
    },
    scrollContent: {
        padding: theme.spacing.lg,
    },
    section: {
        marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    steppersRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xl,
    },
    errorText: {
        marginTop: theme.spacing.sm,
        color: theme.colors.textError,
        fontSize: theme.typography.sizes.sm,
        fontFamily: theme.typography.fontFamily.semiBold,
    },

    player2Row: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    player2Input: {
        flex: 1,
    },
    removePlayerBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 34,
        marginLeft: theme.spacing.sm,
        borderWidth: 1,
        borderColor: theme.colors.buttonErrorBorder,
        borderRadius: theme.borderRadius.round,
    },
    addPlayerBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-start',
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.buttonPrimaryBackground,
        borderRadius: theme.borderRadius.xl,
    },
    addPlayerText: {
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.buttonPrimaryBackground,
        marginLeft: theme.spacing.sm,
    },
    footer: {
        padding: theme.spacing.lg,
        paddingBottom: theme.spacing.xl,
        paddingTop: theme.spacing.md,
    },
});
