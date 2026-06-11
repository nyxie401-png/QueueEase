import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useAuthStore } from '../../stores/authStore';
import { apiGet } from '../../services/api';
import { Colors, Spacing, Radius, Shadow, Typography } from '../../theme';
import Card from '../../components/ui/Card';
import QueuePositionCard from '../../components/ui/QueuePositionCard';

const PatientDashboard = ({ navigation }: any) => {
  const user = useAuthStore((s) => s.user);
  const [queueData, setQueueData] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const firstName = user?.fullName?.split(' ')[0] ?? 'Patient';

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await apiGet<any>('/queues/current');
      if (res.data) setQueueData(res.data);
      else setQueueData(null);
    } catch {
      setQueueData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const QUICK_ACTIONS = [
    { icon: '📅', label: 'Book a Slot', screen: 'BookAppointment', color: Colors.primaryLight },
    { icon: '👥', label: 'Live Queue', screen: 'QueueStatus', color: '#E0E7FF' },
    { icon: '🤖', label: 'AI Assist', screen: 'Chatbot', color: '#FEF3C7' },
    { icon: '🔔', label: 'Alerts', screen: 'Notifications', color: '#FCE7F3' },
  ];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.headerBg}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.name}>{firstName} 👋</Text>
          </View>
          <TouchableOpacity
            style={styles.avatarBtn}
            onPress={() => navigation.navigate('Profile')}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {firstName.charAt(0).toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Clinic info banner */}
        <View style={styles.clinicBanner}>
          <View style={styles.clinicDot} />
          <Text style={styles.clinicText}>Dr. Silva — Nugegoda Clinic</Text>
          <View style={styles.openPill}>
            <Text style={styles.openText}>Open</Text>
          </View>
        </View>
      </View>

      <View style={styles.body}>
        {/* Queue Card */}
        {loading ? (
          <Card style={styles.loadingCard}>
            <Text style={styles.loadingText}>Loading your queue status...</Text>
          </Card>
        ) : queueData ? (
          <QueuePositionCard
            position={queueData.position}
            estimatedWait={queueData.estimatedWait}
            status="Waiting"
          />
        ) : (
          <Card style={styles.emptyQueueCard}>
            <Text style={styles.emptyQueueIcon}>🗓️</Text>
            <Text style={styles.emptyQueueTitle}>No Active Booking</Text>
            <Text style={styles.emptyQueueSub}>
              Book a queue slot to get started. Check back once confirmed.
            </Text>
            <TouchableOpacity
              style={styles.bookNowBtn}
              onPress={() => navigation.navigate('BookAppointment')}>
              <Text style={styles.bookNowText}>Book Now</Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {QUICK_ACTIONS.map((a) => (
            <TouchableOpacity
              key={a.screen}
              style={[styles.actionCard, { backgroundColor: a.color }]}
              onPress={() => navigation.navigate(a.screen)}
              activeOpacity={0.8}>
              <Text style={styles.actionIcon}>{a.icon}</Text>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Card */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Tips for a smooth visit</Text>
          <View style={styles.tipsList}>
            {[
              'Arrive 5 min before your predicted time',
              'A push alert will notify you 15 min prior',
              'Cancel early if your plans change',
              'Use AI Assist for clinic hours & FAQs',
            ].map((tip, i) => (
              <View key={i} style={styles.tipRow}>
                <View style={styles.tipDot} />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPage },
  headerBg: {
    backgroundColor: Colors.primary,
    paddingBottom: 24,
    paddingTop: 52,
    paddingHorizontal: Spacing.xl,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.75)', fontWeight: '500' },
  name: { fontSize: 24, fontWeight: '800', color: '#FFFFFF', marginTop: 2 },
  avatarBtn: {},
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  clinicBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
  },
  clinicDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#6EE7B7' },
  clinicText: { flex: 1, fontSize: 13, color: 'rgba(255,255,255,0.9)', fontWeight: '500' },
  openPill: { backgroundColor: '#6EE7B7', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
  openText: { fontSize: 11, fontWeight: '700', color: '#065F46' },

  body: { padding: Spacing.xl, gap: 20 },

  loadingCard: { alignItems: 'center', padding: 30 },
  loadingText: { color: Colors.textMuted, fontSize: 14 },

  emptyQueueCard: { alignItems: 'center', padding: 28 },
  emptyQueueIcon: { fontSize: 44, marginBottom: 12 },
  emptyQueueTitle: { ...Typography.h3, marginBottom: 8 },
  emptyQueueSub: { ...Typography.body, textAlign: 'center', marginBottom: 18 },
  bookNowBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 12,
    paddingHorizontal: 28,
  },
  bookNowText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  sectionTitle: { ...Typography.h4, marginBottom: 4, marginTop: 4 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: {
    width: '46%',
    borderRadius: Radius.lg,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  actionIcon: { fontSize: 28 },
  actionLabel: { fontSize: 13, fontWeight: '600', color: Colors.textPrimary, textAlign: 'center' },

  infoCard: { borderLeftWidth: 3, borderLeftColor: Colors.primary, padding: 16 },
  infoTitle: { fontSize: 13, fontWeight: '700', color: Colors.textPrimary, marginBottom: 12 },
  tipsList: { gap: 8 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  tipDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primary, marginTop: 6 },
  tipText: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
});

export default PatientDashboard;
