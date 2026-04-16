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
    statsColumnsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: theme.spacing.lg,
    },
    playerColumn: {
        flex: 1,
        alignItems: 'stretch',
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
    }
});
