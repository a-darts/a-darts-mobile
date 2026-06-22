import { StyleSheet } from 'react-native';
import { theme } from '../../../theme/theme';
import { isTablet } from '../../../utils/device';

export const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    keypadRow: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        marginTop: theme.spacing.sm,
    },
    keyBtn: {
        flex: 1,
        paddingVertical: theme.spacing.md,
        backgroundColor: theme.colors.keyBackground,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.keyBorder,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fastBtnContainer: {
        flex: isTablet ? 3 : 2,
        flexDirection: 'row',
        gap: theme.spacing.sm,
    },
    fastBtn: {
        flex: 1,
        paddingVertical: theme.spacing.md,
        backgroundColor: theme.colors.keyBackground,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.keyBorder,
        alignItems: 'center',
        justifyContent: 'center',
    },
    separator: {
        width: theme.spacing.md,
    },
    keyNum: {
        color: theme.colors.keyText,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.sizes.lg,
    },
    fastNum: {
        color: theme.colors.keyTextSecondary,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.sizes.lg,
    },
    gameShotBtnText: {
        color: theme.colors.keyTextSecondary,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.sizes.lg,
    },
});
