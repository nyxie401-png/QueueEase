import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import Toast from '../../services/toast';
import { Colors, Spacing, Radius, Typography } from '../../theme';
import InputField from '../../components/ui/InputField';
import PrimaryButton from '../../components/ui/PrimaryButton';

type RoleType = 'patient' | 'doctor' | 'receptionist';

const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<RoleType>('patient');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const validate = () => {
    if (!email.trim()) { Toast.error('Email is required'); return false; }
    if (!/\S+@\S+\.\S+/.test(email)) { Toast.error('Enter a valid email'); return false; }
    if (!password) { Toast.error('Password is required'); return false; }
    if (password.length < 6) { Toast.error('Password must be at least 6 characters'); return false; }
    return true;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      Toast.success('Welcome back!');
    } catch {
      Toast.error('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const ROLES: { key: RoleType; label: string; emoji: string }[] = [
    { key: 'patient', label: 'Patient', emoji: '🧑‍⚕️' },
    { key: 'doctor', label: 'Doctor / Staff', emoji: '👨‍⚕️' },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🏥</Text>
            </View>
            <View>
              <Text style={styles.appName}>QueueEase</Text>
              <Text style={styles.tagline}>Smart Clinic Queues</Text>
            </View>
          </View>
          <Text style={styles.welcomeTitle}>Welcome back</Text>
          <Text style={styles.welcomeSub}>
            Skip the wait. Book your spot, track your turn — from anywhere.
          </Text>
        </View>

        {/* Role Toggle */}
        <View style={styles.roleToggle}>
          {ROLES.map((r) => (
            <TouchableOpacity
              key={r.key}
              style={[styles.roleBtn, role === r.key && styles.roleBtnActive]}
              onPress={() => setRole(r.key)}
              activeOpacity={0.8}>
              <Text style={[styles.roleBtnText, role === r.key && styles.roleBtnTextActive]}>
                {r.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Form */}
        <View style={styles.form}>
          <InputField
            label="Email address"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!loading}
          />
          <InputField
            label="Password"
            placeholder="••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            editable={!loading}
            rightIcon={
              <Text style={styles.showHide}>{showPassword ? 'Hide' : 'Show'}</Text>
            }
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          <TouchableOpacity style={styles.forgotWrap} onPress={() => Toast.success('Reset link sent to your email')}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          <PrimaryButton
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
          />
        </View>

        {/* Register Link */}
        <View style={styles.registerWrap}>
          <Text style={styles.registerText}>New here? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={loading}>
            <Text style={styles.registerLink}>Create account</Text>
          </TouchableOpacity>
        </View>

        {/* Demo hint */}
        <View style={styles.demoCard}>
          <Text style={styles.demoTitle}>Demo Credentials</Text>
          <Text style={styles.demoText}>Patient: patient@queueease.lk / Pass@123</Text>
          <Text style={styles.demoText}>Admin: admin@queueease.lk / Admin@123</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: Colors.bgPage },
  content: { padding: Spacing.xl, paddingTop: 48, paddingBottom: 32 },

  header: { marginBottom: 28 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 28 },
  logoCircle: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoEmoji: { fontSize: 26 },
  appName: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary },
  tagline: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },

  welcomeTitle: { ...Typography.h1, marginBottom: 8 },
  welcomeSub: { ...Typography.body, lineHeight: 22 },

  roleToggle: {
    flexDirection: 'row',
    backgroundColor: Colors.bgMuted,
    borderRadius: Radius.md,
    padding: 4,
    marginBottom: 24,
  },
  roleBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  roleBtnActive: {
    backgroundColor: Colors.bgCard,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  roleBtnText: { fontSize: 14, fontWeight: '500', color: Colors.textMuted },
  roleBtnTextActive: { color: Colors.textPrimary, fontWeight: '600' },

  form: { gap: 0 },
  showHide: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  forgotWrap: { alignSelf: 'flex-end', marginBottom: 20, marginTop: 2 },
  forgotText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },

  registerWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: { fontSize: 14, color: Colors.textSecondary },
  registerLink: { fontSize: 14, fontWeight: '700', color: Colors.primary },

  demoCard: {
    marginTop: 28,
    backgroundColor: Colors.infoLight,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: Colors.info,
  },
  demoTitle: { fontSize: 12, fontWeight: '700', color: Colors.info, marginBottom: 4 },
  demoText: { fontSize: 12, color: Colors.info, lineHeight: 18 },
});

export default LoginScreen;
