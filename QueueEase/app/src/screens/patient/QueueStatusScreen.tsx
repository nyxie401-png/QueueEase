import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { apiGet, apiPost } from '../../services/api';
import Toast from '../../services/toast';
import { useAuthStore } from '../../stores/authStore';
import { Colors, Spacing, Radius, Typography, Shadow } from '../../theme';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const QueueStatusScreen = ({ navigation }: any) => {
  const user = useAuthStore((s) => s.user);
  const [queue, setQueue] = useState<any>(null);
  const [ahead, setAhead] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    startPulse();
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 900, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
  };

  const loadData = async () => {
    try {
      const res = await apiGet<any>('/queues/current');
      if (res.data) {
        setQueue(res.data);
        setAhead(res.data.ahead ?? []);
      }
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  };

  const handleCancel = async () => {
    if (!queue) return;
    setCancelling(true);
    try {
      await apiPost('/queues/cancel', { queueId: queue.id });
      Toast.success('Booking cancelled');
      setQueue(null);
      setAhead([]);
    } catch {
      Toast.error('Could not cancel. Please try again.');
    } finally { setCancelling(false); }
  };

  const MOCK_AHEAD = [
    { id: '1', name: 'Asanka D.', position: 3, status: 'IN ROOM', isCurrent: true },
    { id: '2', name: 'Nimal P.', position: 4, status: 'Waiting', isCurrent: false },
    { id: '3', name: 'Tharushi K.', position: 5, status: 'Waiting', isCurrent: false },
    { id: '4', name: 'Ravi S.', position: 6, status: 'Waiting', isCurrent: false },
    { id: '5', name: 'You', position: 7, status: 'You', isCurrent: false, isMe: true },
  ];

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading queue status...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} tintColor={Colors.primary} />}
      showsVerticalScrollIndicator={false}>

      {/* Clinic info */}
      <Card style={styles.clinicCard}>
        <View style={styles.clinicRow}>
          <View style={styles.clinicInfo}>
            <Text style={styles.clinicName}>Dr. Silva — General Physician</Text>
            <Text style={styles.clinicLoc}>📍 Nugegoda Clinic</Text>
          </View>
          <Badge variant="open" />
        </View>
        <View style={styles.timeRow}>
          <View style={styles.timeBlock}>
            <Text style={styles.timeLabel}>SCHEDULED</Text>
            <Text style={styles.timeValue}>9:00 AM</Text>
          </View>
          <View style={[styles.timeBlock, styles.actualBlock]}>
            <Text style={[styles.timeLabel, { color: Colors.success }]}>ACTUAL START</Text>
            <Text style={[styles.timeValue, { color: Colors.success }]}>9:18 AM</Text>
          </View>
        </View>
      </Card>

      {/* Notification alert */}
      <View style={styles.alertCard}>
        <Text style={styles.alertIcon}>🔔</Text>
        <View style={styles.alertBody}>
          <Text style={styles.alertTitle}>We'll notify you</Text>
          <Text style={styles.alertSub}>Push alert 15 min before your turn so you can travel just-in-time.</Text>
        </View>
      </View>

      {/* Queue list */}
      <Text style={styles.sectionTitle}>QUEUE AHEAD OF YOU</Text>
      <View style={styles.queueList}>
        {MOCK_AHEAD.map((item) => (
          <Animated.View
            key={item.id}
            style={[
              styles.queueItem,
              item.isMe && styles.queueItemMe,
              item.isCurrent && styles.queueItemCurrent,
              item.isMe && { transform: [{ scale: pulseAnim }] },
            ]}>
            <View style={[styles.positionBadge, item.isMe && styles.positionBadgeMe, item.isCurrent && styles.positionBadgeCurrent]}>
              <Text style={[styles.positionText, (item.isMe || item.isCurrent) && styles.positionTextWhite]}>
                {item.position}
              </Text>
            </View>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemName, item.isMe && { color: Colors.primary, fontWeight: '700' }]}>
                {item.name}
              </Text>
              <Text style={styles.itemStatus}>
                {item.status === 'IN ROOM' ? '🩺 Being seen now' : item.isMe ? '⏳ Your turn' : `⏱ Predicted`}
              </Text>
            </View>
            {item.status === 'IN ROOM' && (
              <View style={styles.inRoomChip}>
                <Text style={styles.inRoomText}>IN ROOM</Text>
              </View>
            )}
          </Animated.View>
        ))}
      </View>

      {/* Cancel */}
      <TouchableOpacity
        style={styles.cancelBtn}
        onPress={handleCancel}
        disabled={cancelling}
        activeOpacity={0.8}>
        <Text style={styles.cancelText}>
          {cancelling ? 'Cancelling...' : '✕  Cancel booking'}
        </Text>
      </TouchableOpacity>
      <View style={{ height: 32 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPage },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: Colors.textMuted, fontSize: 15 },

  clinicCard: { margin: Spacing.xl, marginBottom: Spacing.md },
  clinicRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  clinicInfo: {},
  clinicName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
  clinicLoc: { fontSize: 13, color: Colors.textMuted },
  timeRow: { flexDirection: 'row', gap: 12 },
  timeBlock: {
    flex: 1,
    backgroundColor: Colors.bgMuted,
    borderRadius: Radius.sm,
    padding: 12,
  },
  actualBlock: { backgroundColor: Colors.successLight },
  timeLabel: { fontSize: 10, fontWeight: '700', color: Colors.textMuted, letterSpacing: 0.8, marginBottom: 4 },
  timeValue: { fontSize: 20, fontWeight: '700', color: Colors.textPrimary },

  alertCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF3C7',
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginHorizontal: Spacing.xl,
    marginBottom: Spacing.xl,
    gap: 12,
  },
  alertIcon: { fontSize: 22 },
  alertBody: { flex: 1 },
  alertTitle: { fontSize: 14, fontWeight: '700', color: '#92400E', marginBottom: 4 },
  alertSub: { fontSize: 13, color: '#92400E', lineHeight: 18 },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1,
    paddingHorizontal: Spacing.xl,
    marginBottom: 12,
  },
  queueList: { paddingHorizontal: Spacing.xl, gap: 10 },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
    ...Shadow.card,
  },
  queueItemMe: {
    borderColor: Colors.primary,
    borderWidth: 2,
    backgroundColor: Colors.accentSoft,
  },
  queueItemCurrent: {
    backgroundColor: Colors.successLight,
    borderColor: Colors.success,
  },
  positionBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.bgMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  positionBadgeMe: { backgroundColor: Colors.primary },
  positionBadgeCurrent: { backgroundColor: Colors.success },
  positionText: { fontSize: 16, fontWeight: '700', color: Colors.textSecondary },
  positionTextWhite: { color: '#FFFFFF' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginBottom: 3 },
  itemStatus: { fontSize: 12, color: Colors.textMuted },
  inRoomChip: {
    backgroundColor: Colors.success,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  inRoomText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },

  cancelBtn: {
    marginHorizontal: Spacing.xl,
    marginTop: 24,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.error,
    backgroundColor: Colors.errorLight,
  },
  cancelText: { fontSize: 15, fontWeight: '700', color: Colors.error },
});

export default QueueStatusScreen;
