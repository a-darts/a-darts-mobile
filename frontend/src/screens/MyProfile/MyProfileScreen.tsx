import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { Avatar } from '../../components/Avatar';
import { Card } from '../../components/Card';
import { TextInput } from '../../components/TextInput';
import { theme } from '../../theme/theme';
import { useAuth } from '../../utils/AuthContext';

import { Toast } from '../../components/Toast';

type ToastState = {
    visible: boolean;
    title: string;
    description?: string;
    type: 'error' | 'success';
    mode: 'auto' | 'manual';
    onCloseAction?: () => void;
};

export const MyProfileScreen = ({ navigation }) => {
    const { user, updateUser, logout } = useAuth();
    const [alias, setAlias] = useState(user?.name || '');
    const [isSaving, setIsSaving] = useState(false);

    const [toast, setToast] = useState<ToastState>({
        visible: false,
        title: '',
        description: '',
        type: 'error',
        mode: 'auto',
    });

    useEffect(() => {
        if (user) {
            setAlias(user.name);
        }
    }, [user]);

    const handleSave = async () => {
        if (!alias.trim()) {
            setToast({
                visible: true,
                title: 'Alias obligatorio',
                description: 'El alias no puede estar vacío',
                type: 'error',
                mode: 'auto',
            });
            return;
        }

        setIsSaving(true);
        try {
            await updateUser(alias.trim());
            setToast({
                visible: true,
                title: '¡Actualizado!',
                description: 'Tu perfil ha sido actualizado correctamente',
                type: 'success',
                mode: 'auto',
            });
        } catch (error) {
            console.error(error);
            setToast({
                visible: true,
                title: 'Error',
                description: 'No se pudo actualizar el perfil',
                type: 'error',
                mode: 'auto',
            });
        } finally {
            setIsSaving(false);
        }
    };


    return (
        <View style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.contentContainer}
            >
                {/* User Info Card */}
                <Card style={styles.profileCard}>
                    <Avatar
                        imageUri={require('../../../assets/dart_shape.gif')}
                    />
                    <Text style={styles.usernameText}>
                        {user?.name || 'Invitado'}
                    </Text>
                    <Text style={styles.userIdText}>ID: {user?.id || 'N/A'}</Text>
                </Card>

                {/* Edit Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>EDITAR PERFIL</Text>
                    <TextInput
                        description="Alias"
                        placeholder="Tu nombre de jugador"
                        iconName="user"
                        value={alias}
                        onChangeText={setAlias}
                    />

                    <Button
                        title={isSaving ? "GUARDANDO..." : "GUARDAR CAMBIOS"}
                        variant="primary"
                        size="large"
                        iconName="save"
                        onPress={handleSave}
                        disabled={isSaving || alias === user?.name}
                        style={styles.saveButton}
                    />
                </View>
            </ScrollView>
            {toast.visible && (
                <View style={styles.overlay} />
            )}
            <Toast
                visible={toast.visible}
                title={toast.title}
                description={toast.description}
                type={toast.type}
                mode={toast.mode}
                onFinished={() => setToast(prev => ({ ...prev, visible: false }))}
            />
        </View>
    );
};

const styles = StyleSheet.create({
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
        marginBottom: theme.spacing.lg,
    },
    usernameText: {
        fontFamily: theme.typography.fontFamily.semiBold,
        fontSize: 24,
        color: theme.colors.text,
        marginTop: theme.spacing.sm,
    },
    userIdText: {
        fontFamily: theme.typography.fontFamily.regular,
        fontSize: 12,
        color: theme.colors.textSecondary,
        marginTop: 4,
    },
    section: {
        marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
        fontFamily: theme.typography.fontFamily.title,
        fontSize: theme.typography.sizes.md,
        color: theme.colors.text,
        marginBottom: theme.spacing.sm,
    },
    saveButton: {
        marginTop: theme.spacing.xl,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 998,
    },
});
