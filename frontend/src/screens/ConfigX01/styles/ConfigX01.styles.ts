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
        fontFamily: theme.typography.fontFamily.title,
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
        alignItems: 'center',
    },
    player2Input: {
        flex: 1,
    },
    removePlayerBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        marginLeft: theme.spacing.sm,
        borderWidth: 1,
        borderRadius: theme.borderRadius.round,
        borderColor: theme.colors.buttonRemoveBorder,
        backgroundColor: theme.colors.buttonRemoveBackground,
    },
    addPlayerBtn: {
        alignSelf: 'flex-start',
    },
    footer: {
        padding: theme.spacing.lg,
        paddingBottom: theme.spacing.xl,
        paddingTop: theme.spacing.md,
    },
});
