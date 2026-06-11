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

type UserRole = 'patient' | 'doctor' | 'receptionist';

const ROLES: { key: UserRole; label: string; desc: string }[] = [
  { key: 'patient', label: 'Patient', desc: 'Book and track queue' },
  { key: 'doctor', label: 'Doctor', desc: 'Manage consultations' },
  { key: 'receptionist', label: 'Receptionist', desc: 'Manage clinic queue' },
];

const RegisterScreen = ({ navigation }: any) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('patient');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const register = useAuthStore((state) => state.register);

  const validate = () => {
    if (!fullName.trim()) { Toast.error('Full name is required'); return false; }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { Toast.error('Enter a valid email'); return false; }
    if (!phone.trim() || phone.length < 9) { Toast.error('Enter a valid phone number'); return false; }
    if (!password || password.length < 8) { Toast.error('Password must be at least 8 characters'); return false; }
    if (password !== confirmPassword) { Toast.error('Passwords do not match'); return false; }
    return true;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await register({ email: email.trim().toLowerCase(), password, fullName: fullName.trim(), phone: phone.trim(), role });
      Toast.success('Account created successfully!');
    } catch {
      Toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* Back */}
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back to sign in</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join QueueEase and skip the waiting room.</Text>

        {/* Role Picker */}
        <Text style={styles.sectionLabel}>I am a...</Text>
        <View style={styles.roleGrid}>
          {ROLES.map((r) => (
            <TouchableOpacity
              key={r.key}
              style={[styles.roleCard, role === r.key && styles.roleCardActive]}
              onPress={() => setRole(r.key)}
              activeOpacity={0.8}>
              <Text style={[styles.roleLabel, role === r.key && styles.roleLabelActive]}>{r.label}</Text>
              <Text style={[styles.roleDesc, role === r.key && styles.roleDescActive]}>{r.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.divider} />

        <InputField label="Full name" placeholder="Nimal Perera" value={fullName} onChangeText={setFullName} editable={!loading} />
        <InputField label="Email address" placeholder="you@example.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" editable={!loading} />
        <InputField label="Phone number" placeholder="+94 77 123 4567" value={phone} onChangeText={setPhone} keyboardType="phone-pad" editable={!loading} />
        <InputField
          label="Password"
          placeholder="Min. 8 characters"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPw}
          editable={!loading}
          rightIcon={<Text style={styles.showHide}>{showPw ? 'Hide' : 'Show'}</Text>}
          onRightIconPress={() => setShowPw(!showPw)}
        />
        <InputField
          label="Confirm password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showPw}
          editable={!loading}
        />

        <PrimaryButton title="Create Account" onPress={handleRegister} loading={loading} style={styles.btn} />

        <View style={styles.loginWrap}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: Colors.bgPage },
  content: { padding: Spacing.xl, paddingTop: 52, paddingBottom: 40 },
  back: { marginBottom: 24 },
  backText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },
  title: { ...Typography.h1, marginBottom: 6 },
  subtitle: { ...Typography.body, marginBottom: 24 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 10 },
  roleGrid: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  roleCard: {
    flex: 1,
    borderRadius: Radius.md,
    padding: 12,
    backgroundColor: Colors.bgCard,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  roleCardActive: { borderColor: Colors.primary, backgroundColor: Colors.accentSoft },
  roleLabel: { fontSize: 14, fontWeight: '600', color: Colors.textSecondary, marginBottom: 3 },
  roleLabelActive: { color: Colors.primary },
  roleDesc: { fontSize: 11, color: Colors.textMuted },
  roleDescActive: { color: Colors.primaryDark },
  divider: { height: 1, backgroundColor: Colors.border, marginBottom: 20 },
  showHide: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  btn: { marginTop: 8 },
  loginWrap: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  loginText: { fontSize: 14, color: Colors.textSecondary },
  loginLink: { fontSize: 14, fontWeight: '700', color: Colors.primary },
});

export default RegisterScreen;
