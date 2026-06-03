import { StyleSheet, Dimensions, Platform } from 'react-native';
import { theme } from '../../../theme/theme';

const { width, height } = Dimensions.get('window');
const aspectRatio = height / width;
const isTablet = aspectRatio < 1.6 && width > 600;

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.sm,
    },
    headerRow: {
        flexDirection: 'row',
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.sm,
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
        backgroundColor: theme.colors.cardInactiveBackground,
        paddingHorizontal: theme.typography.sizes.xs,
        paddingVertical: theme.spacing.md,
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
        fontSize: theme.typography.sizes.sm,
    },
    scoreLeftText: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: isTablet ? theme.typography.sizes.leftScore * 2 : theme.typography.sizes.leftScore,
    },
    scoreActiveText: {
        color: theme.colors.buttonPrimaryBackground,
    },
    averageText: {
        color: theme.colors.textSecondary,
        fontSize: theme.typography.sizes.xxs,
    },

    // Stats card (centre)
    statsCard: {
        flex: 2,
        // backgroundColor: theme.colors.cardBackground,
        borderRadius: theme.borderRadius.lg,
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.sm,
        marginHorizontal: theme.spacing.sm,
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
        fontSize: isTablet ? theme.typography.sizes.xxl : theme.typography.sizes.sm,
        color: theme.colors.text,
    },
    tableScore: {
        color: theme.colors.text,
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
        width: 56,
        backgroundColor: theme.colors.cardBackground,
        color: theme.colors.textSecondary,
        paddingVertical: 6,
        borderRadius: theme.borderRadius.md,
        textAlign: 'center',
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: isTablet ? theme.typography.sizes.xl : theme.typography.sizes.sm,
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
        marginBottom: theme.spacing.sm,
    },
    buttonsRow: {
        flex: 9,
        flexDirection: 'row',
        gap: theme.spacing.sm,
    },
    inputBox: {
        flex: 2,
        minHeight: 48,
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
        fontSize: theme.typography.sizes.lg,
    },
    topControlBtn: {
        flex: 1,
        borderWidth: 1,
        borderColor: theme.colors.buttonPrimaryBackground,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },

    swapButton: {
        flexDirection: 'row',
        padding: theme.spacing.sm,
        margin: theme.spacing.sm,
        gap: theme.spacing.sm,
        alignSelf: 'center',
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

    toastButtonsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        gap: theme.spacing.md,
    },
    overlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 998,
    },

    suspensionOverlay: {
        ...StyleSheet.absoluteFill,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        zIndex: 1000,
        elevation: 20,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    suspensionCard: {
        backgroundColor: theme.colors.toastBackground,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: theme.colors.toastBorderError,
        padding: 32,
        alignItems: 'center',
        width: '100%',
        shadowColor: theme.colors.toastBorderError,
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    suspensionIcon: {
        fontSize: 52,
        marginBottom: 16,
    },
    suspensionTitle: {
        color: theme.colors.toastText,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: theme.typography.sizes.lg,
        textAlign: 'center',
        marginBottom: 12,
    },
    suspensionSubtitle: {
        color: theme.colors.toastTextSecondary,
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: theme.typography.sizes.sm,
        textAlign: 'center',
        lineHeight: 22,
    },
});
