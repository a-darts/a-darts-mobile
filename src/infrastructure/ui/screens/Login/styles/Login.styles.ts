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
        marginTop: 10,
    },
});
