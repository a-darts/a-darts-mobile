import { StyleSheet } from 'react-native';
import { theme } from '../../../theme/theme';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.lg,
    },
    header: {
        alignItems: 'center',
        marginVertical: 16,
    },
    title: {
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.sizes.xxxl,
        color: theme.colors.text,
    },
    logoImage: {
        width: 180,
        height: 50,
        marginTop: 10,
    },
    form: {
        flex: 1,
    },
    buttonContainer: {
        marginTop: theme.spacing.md,
        gap: theme.spacing.xl,
    },
    separatorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: theme.spacing.sm,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: theme.colors.line,
    },
    separatorText: {
        color: theme.colors.textSecondary,
        paddingHorizontal: theme.spacing.md,
        fontFamily: theme.typography.fontFamily.regular,
    },
    errorText: {
        color: theme.colors.textError,
        fontSize: theme.typography.sizes.sm,
        fontFamily: theme.typography.fontFamily.regular,
        marginTop: theme.spacing.xs,
        textAlign: 'center',
    },
});
