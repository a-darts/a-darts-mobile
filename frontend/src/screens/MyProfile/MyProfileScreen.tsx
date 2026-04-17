import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Button } from '../../components/Button';
import { Avatar } from '../../components/Avatar';
import { Card } from '../../components/Card';
import { TextInput } from '../../components/TextInput';
import { theme } from '../../theme/theme';
import { useAuth } from '../../utils/AuthContext';

export const MyProfileScreen = ({ navigation }) => {
    const { user, updateUser, logout } = useAuth();
    const [alias, setAlias] = useState(user?.name || '');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setAlias(user.name);
        }
    }, [user]);

    const handleSave = async () => {
        if (!alias.trim()) {
            Alert.alert("Error", "El alias no puede estar vacío");
            return;
        }

        setIsSaving(true);
        try {
            await updateUser(alias.trim());
            Alert.alert("Éxito", "Perfil actualizado correctamente");
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "No se pudo actualizar el perfil");
        } finally {
            setIsSaving(false);
        }
    };


    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
        >
            {/* User Info Card */}
            <Card style={styles.profileCard}>
                <Avatar
                    imageUri={require('../../../assets/dart_shape.png')}
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
    }
});
