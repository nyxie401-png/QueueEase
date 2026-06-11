import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useAuthStore } from '../stores/authStore';
import Toast from '../services/toast';
import { Colors, Spacing, Radius, Typography, Shadow } from '../theme';
import Card from '../components/ui/Card';

const MENU_ITEMS = [
  { icon: '🔔', label: 'Notifications', screen: 'Notifications' },
  { icon: '📋', label: 'Booking history', screen: 'BookingHistory' },
  { icon: '🔒', label: 'Privacy & security', screen: 'Privacy' },
  { icon: '❓', label: 'Help & support', screen: 'Help' },
];

const ProfileScreen = ({ navigation }: any) => {
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      Toast.success('Signed out');
    } catch {
      Toast.error('Sign out failed');
    }
  };

  const initials = user?.fullName
    ? user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      {/* Avatar section */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user?.fullName ?? 'User'}</Text>
        <Text style={styles.email}>{user?.email} · {user?.phone}</Text>
        <View style={styles.badgeRow}>
          <View style={styles.verifiedBadge}>
            <Text style={styles.verifiedText}>✓ Verified</Text>
          </View>
          <View style={styles.visitsBadge}>
            <Text style={styles.visitsText}>12 visits</Text>
          </View>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { value: '12', label: 'Bookings' },
          { value: '1', label: 'Active' },
          { value: '8', label: 'Saved' },
        ].map((s) => (
          <Card key={s.label} style={styles.statCard}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </Card>
        ))}
      </View>

      {/* Menu */}
      <View style={styles.menu}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.label}
            style={styles.menuItem}
            onPress={() => Toast.success(`${item.label} — coming soon`)}
            activeOpacity={0.8}>
            <View style={styles.menuIcon}>
              <Text style={styles.menuEmoji}>{item.icon}</Text>
            </View>
            <Text style={styles.menuLabel}>{item.label}</Text>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Role badge */}
      <View style={styles.roleCard}>
        <Text style={styles.roleLabel}>Account type</Text>
        <View style={styles.rolePill}>
          <Text style={styles.rolePillText}>{(user?.role ?? 'patient').toUpperCase()}</Text>
        </View>
      </View>

      {/* Sign out */}
      <TouchableOpacity style={styles.signOutBtn} onPress={handleLogout} activeOpacity={0.85}>
        <Text style={styles.signOutText}>↩  Sign out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPage },
  content: { paddingBottom: 32 },

  avatarSection: { alignItems: 'center', paddingTop: 32, paddingBottom: 28, borderBottomWidth: 1, borderBottomColor: Colors.border, marginBottom: 20 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  avatarText: { fontSize: 30, fontWeight: '800', color: Colors.primary },
  name: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  email: { fontSize: 13, color: Colors.textMuted, marginBottom: 12 },
  badgeRow: { flexDirection: 'row', gap: 8 },
  verifiedBadge: {
    backgroundColor: Colors.successLight,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  verifiedText: { fontSize: 12, fontWeight: '600', color: Colors.success },
  visitsBadge: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  visitsText: { fontSize: 12, fontWeight: '600', color: Colors.primaryDark },

  statsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: Spacing.xl, marginBottom: 20 },
  statCard: { flex: 1, alignItems: 'center', padding: 14 },
  statValue: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary },
  statLabel: { fontSize: 12, color: Colors.textMuted, marginTop: 3 },

  menu: { paddingHorizontal: Spacing.xl, gap: 10, marginBottom: 20 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 14,
    ...Shadow.card,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.bgMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuEmoji: { fontSize: 18 },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  menuArrow: { fontSize: 20, color: Colors.textMuted },

  roleCard: {
    marginHorizontal: Spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  roleLabel: { fontSize: 14, color: Colors.textSecondary },
  rolePill: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  rolePillText: { fontSize: 11, fontWeight: '700', color: Colors.primaryDark, letterSpacing: 0.8 },

  signOutBtn: {
    marginHorizontal: Spacing.xl,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.error,
    backgroundColor: Colors.errorLight,
  },
  signOutText: { fontSize: 15, fontWeight: '700', color: Colors.error },
});

export default ProfileScreen;
