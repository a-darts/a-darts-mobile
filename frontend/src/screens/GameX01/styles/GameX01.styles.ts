import { StyleSheet } from 'react-native';
import { theme } from '../../../theme/theme';

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.sm,
        paddingBottom: theme.spacing.xxl,
    },
    headerRow: {
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.sm,
        // gap: theme.spacing.sm,
        marginTop: theme.spacing.xs,
    },
    spacer: {
        flex: 1,
    },

    // Player cards
    playerCard: {
        flex: 4,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: theme.colors.cardInactiveBorder,
        borderRadius: theme.borderRadius.lg,
        paddingVertical: theme.spacing.lg,
        backgroundColor: theme.colors.cardInactiveBackground,
    },
    playerCardActive: {
        borderColor: theme.colors.cardActiveBorder,
        backgroundColor: theme.colors.cardActiveBackground,
        shadowColor: theme.colors.cardActiveShadow,
        shadowOpacity: 0.5,
        shadowRadius: 15,
        elevation: 8,
    },
    playerName: {
        color: theme.colors.text,
        fontFamily: theme.typography.fontFamily.semiBold,
        marginBottom: 4,
        fontSize: theme.typography.sizes.sm,
    },
    scoreLeftText: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 44,
    },
    scoreActiveText: {
        color: theme.colors.buttonPrimaryBackground,
    },

    // Stats card (centre)
    statsCard: {
        flex: 2,
        backgroundColor: theme.colors.cardBackground,
        borderRadius: theme.borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.md,
    },
    statsRowText: {
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: theme.typography.sizes.md,
        color: theme.colors.text,
    },
    statsHighlight: {
        color: theme.colors.text,
    },
    statsSep: {
        color: theme.colors.textSecondary,
    },
    statsLabel: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.sizes.xs,
        letterSpacing: 2,
        marginTop: 2,
    },

    // Throws table
    tableContainer: {
        flex: 1,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.sm,
    },
    tableRowSecondary: {
        flex: 4,
        flexDirection: 'row',
    },
    tableCol: {
        flex: 1,
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.text,
    },
    tableScore: {
        color: theme.colors.textSecondary,
    },
    tableRemaining: {
        color: theme.colors.text,
    },
    textRight: {
        textAlign: 'right',
        paddingRight: theme.spacing.sm,
    },
    textLeft: {
        textAlign: 'left',
        paddingLeft: theme.spacing.sm,
    },
    tableDartCount: {
        width: 44,
        backgroundColor: theme.colors.cardBackground,
        color: theme.colors.textSecondary,
        paddingVertical: 6,
        borderRadius: theme.borderRadius.md,
        textAlign: 'center',
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.sizes.sm,
    },

    // Controls
    controlsArea: {
        backgroundColor: theme.colors.cardBackground,
        borderTopLeftRadius: theme.borderRadius.lg,
        borderTopRightRadius: theme.borderRadius.lg,
        padding: theme.spacing.sm,
    },
    controlBarRow: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
        marginBottom: theme.spacing.md,
    },
    inputBox: {
        flex: 2,
        backgroundColor: theme.colors.inputBoxBackground,
        borderRadius: theme.borderRadius.md,
        borderBottomWidth: 1,
        borderColor: theme.colors.buttonPrimaryBackground,
        justifyContent: 'center',
        paddingHorizontal: theme.spacing.md,
    },
    inputText: {
        color: theme.colors.inputText,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.sizes.xl,
    },
    topControlBtn: {
        flex: 2,
        borderWidth: 1,
        borderColor: theme.colors.buttonPrimaryBackground,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
    },
    topControlText: {
        color: theme.colors.buttonPrimaryBackground,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.sizes.sm,
    },

    swapButton: {
        padding: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.buttonTertiaryBackground,
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.buttonTertiaryBorder,
    },
    swapButtonIcon: {
        color: theme.colors.buttonTertiaryIcon,
    },
});
