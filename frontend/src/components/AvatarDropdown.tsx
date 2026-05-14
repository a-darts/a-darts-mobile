import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TouchableWithoutFeedback, Switch } from 'react-native';
import { useAuth } from '../utils/AuthContext';
import { useSettings } from '../utils/SettingsContext';
import { theme } from '../theme/theme';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export const AvatarDropdown = () => {
    const { user, logout } = useAuth();
    const { showAverage, setShowAverage } = useSettings();
    const [showMenu, setShowMenu] = useState(false);
    const navigation = useNavigation<any>();

    const initial = user ? (user.name ? user.name.charAt(0).toUpperCase() : '?') : 'I';

    const handleLogout = async () => {
        setShowMenu(false);
        await logout();

        // Redirigir al Login
        navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
        });
    };

    const handleMyProfile = () => {
        setShowMenu(false);
        navigation.navigate('MyProfileScreen');
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowMenu(true)}
                style={styles.avatarButton}
            >
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initial}</Text>
                </View>
            </TouchableOpacity>

            <Modal
                visible={showMenu}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowMenu(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowMenu(false)}>
                    <View style={styles.modalOverlay}>
                        <TouchableWithoutFeedback>
                            <View style={styles.menuContainer}>
                                {user && (
                                    <View style={styles.userInfo}>
                                        <Text style={styles.userNameText}>{user.name}</Text>
                                        <View style={styles.divider} />
                                    </View>
                                )}

                                {user && (
                                    <TouchableOpacity
                                        style={styles.menuItem}
                                        onPress={handleMyProfile}
                                    >
                                        <Feather name="user" size={18} color={theme.colors.avatarDropdownIcon} />
                                        <Text style={styles.menuItemText}>Mi perfil</Text>
                                    </TouchableOpacity>
                                )}

                                <View style={styles.divider} />

                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionHeaderText}>AJUSTES</Text>
                                </View>

                                <View style={styles.settingsItem}>
                                    <Text style={styles.settingsItemText}>Ver media</Text>
                                    <Switch
                                        value={showAverage}
                                        onValueChange={setShowAverage}
                                        trackColor={{ false: '#3E3E3E', true: theme.colors.buttonPrimaryBackground }}
                                        thumbColor={'#FFFFFF'}
                                        ios_backgroundColor="#3E3E3E"
                                        style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                                    />
                                </View>

                                <View style={styles.divider} />

                                {user && (
                                    <TouchableOpacity
                                        style={[styles.menuItem, styles.logoutItem]}
                                        onPress={handleLogout}
                                    >
                                        <Feather name="log-out" size={18} color={theme.colors.avatarDropdownCloseIcon} />
                                        <Text style={[styles.menuItemText, { color: theme.colors.avatarDropdownCloseText }]}>Cerrar sesión</Text>
                                    </TouchableOpacity>
                                )}

                                {!user && (
                                    <TouchableOpacity
                                        style={[styles.menuItem, styles.logoutItem]}
                                        onPress={() => { setShowMenu(false); navigation.navigate('Login'); }}
                                    >
                                        <Feather name="log-in" size={18} color={theme.colors.avatarDropdownIcon} />
                                        <Text style={styles.menuItemText}>Iniciar sesión</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginRight: 16,
    },
    avatarButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.avatarBackground,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.avatarBorder,
    },
    avatar: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: theme.colors.avatarText,
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: theme.typography.sizes.sm,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'flex-start',
        alignItems: 'flex-end',
    },
    menuContainer: {
        marginTop: 64,
        marginRight: theme.spacing.md,
        backgroundColor: theme.colors.avatarDropdownBackground,
        borderRadius: 12,
        width: 180,
        paddingVertical: 10,
        elevation: 10,
        borderWidth: 1,
        borderColor: theme.colors.avatarDropdownBorder,
    },
    userInfo: {
        paddingHorizontal: 15,
        paddingBottom: 5,
    },
    userNameText: {
        color: theme.colors.avatarDropdownText,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 14,
        marginBottom: 8,
    },
    divider: {
        height: 1,
        backgroundColor: theme.colors.avatarDropdownDivider,
        marginVertical: 4,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 15,
    },
    menuItemText: {
        color: theme.colors.avatarDropdownText,
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 14,
        marginLeft: 12,
    },
    logoutItem: {
        marginTop: 2,
    },
    sectionHeader: {
        paddingHorizontal: 15,
        paddingTop: 8,
        paddingBottom: 4,
    },
    sectionHeaderText: {
        color: theme.colors.textSecondary,
        fontFamily: theme.typography.fontFamily.bold,
        fontSize: 10,
        letterSpacing: 1,
    },
    settingsItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 4,
        paddingHorizontal: 15,
    },
    settingsItemText: {
        color: theme.colors.avatarDropdownText,
        fontFamily: theme.typography.fontFamily.medium,
        fontSize: 14,
    }
});
