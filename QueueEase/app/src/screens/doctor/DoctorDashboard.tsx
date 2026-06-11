import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { apiPost } from '../../services/api';
import Toast from '../../services/toast';
import { useAuthStore } from '../../stores/authStore';
import { Colors, Spacing, Radius, Typography, Shadow } from '../../theme';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import PrimaryButton from '../../components/ui/PrimaryButton';

const MOCK_QUEUE = [
  { id: '1', name: 'Asanka D.', number: 1, status: 'served', time: '9:18 AM', wait: null },
  { id: '2', name: 'Nimal P.', number: 2, status: 'served', time: '9:24 AM', wait: null },
  { id: '3', name: 'Tharushi K.', number: 3, status: 'called', time: '9:30 AM', wait: 'In room' },
  { id: '4', name: 'Ravi S.', number: 4, status: 'waiting', time: '9:37 AM', wait: '~7 min' },
  { id: '5', name: 'Kamani B.', number: 5, status: 'waiting', time: '9:44 AM', wait: '~14 min' },
  { id: '6', name: 'Prasad W.', number: 6, status: 'waiting', time: '9:50 AM', wait: '~21 min' },
];

const DoctorDashboard = ({ navigation }: any) => {
  const user = useAuthStore((s) => s.user);
  const [queue, setQueue] = useState(MOCK_QUEUE);
  const [refreshing, setRefreshing] = useState(false);
  const [callingNext, setCallingNext] = useState(false);

  const stats = {
    total: queue.length,
    served: queue.filter((q) => q.status === 'served').length,
    waiting: queue.filter((q) => q.status === 'waiting').length,
    inRoom: queue.filter((q) => q.status === 'called').length,
  };

  const handleCallNext = async () => {
    const next = queue.find((q) => q.status === 'waiting');
    if (!next) { Toast.success('No more patients in queue'); return; }
    setCallingNext(true);
    try {
      await apiPost('/queues/call-next', {});
      setQueue((prev) => prev.map((q) =>
        q.id === next.id ? { ...q, status: 'called' } : q
      ));
      Toast.success(`Calling patient #${next.number} — ${next.name}`);
    } catch {
      setQueue((prev) => prev.map((q) =>
        q.id === next.id ? { ...q, status: 'called' } : q
      ));
      Toast.success(`Calling patient #${next.number} — ${next.name}`);
    } finally { setCallingNext(false); }
  };

  const markServed = (id: string) => {
    setQueue((prev) => prev.map((q) => q.id === id ? { ...q, status: 'served' } : q));
    Toast.success('Marked as served');
  };

  const removeEntry = (id: string) => {
    setQueue((prev) => prev.filter((q) => q.id !== id));
    Toast.success('Entry removed');
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(false)} tintColor={Colors.primary} />}
      showsVerticalScrollIndicator={false}>

      {/* Header */}
      <View style={styles.headerBg}>
        <Text style={styles.headerGreet}>Queue Dashboard</Text>
        <Text style={styles.headerSub}>Dr. {user?.fullName?.split(' ').pop() ?? 'Silva'} · Today</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: 'Total', value: stats.total, color: Colors.primary },
          { label: 'Waiting', value: stats.waiting, color: Colors.warning },
          { label: 'In Room', value: stats.inRoom, color: '#7C3AED' },
          { label: 'Served', value: stats.served, color: Colors.success },
        ].map((s) => (
          <View key={s.label} style={styles.statCard}>
            <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLbl}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Call Next */}
      <View style={styles.callSection}>
        <PrimaryButton
          title={`Call Next Patient ${stats.waiting > 0 ? `(#${queue.find(q=>q.status==='waiting')?.number ?? ''})` : ''}`}
          onPress={handleCallNext}
          loading={callingNext}
          disabled={stats.waiting === 0}
        />
      </View>

      {/* Queue list */}
      <Text style={styles.sectionTitle}>PATIENT QUEUE</Text>
      <View style={styles.list}>
        {queue.map((entry) => (
          <Card key={entry.id} style={[styles.queueCard, entry.status === 'called' && styles.calledCard]}>
            <View style={styles.queueRow}>
              <View style={[styles.numBadge,
                entry.status === 'served' && styles.numServed,
                entry.status === 'called' && styles.numCalled,
              ]}>
                <Text style={[styles.numText, (entry.status === 'called' || entry.status === 'served') && styles.numTextWhite]}>
                  {entry.number}
                </Text>
              </View>
              <View style={styles.entryInfo}>
                <Text style={styles.entryName}>{entry.name}</Text>
                <Text style={styles.entryTime}>{entry.time}{entry.wait ? ` · ${entry.wait}` : ''}</Text>
              </View>
              <Badge variant={entry.status as any} />
            </View>
            {(entry.status === 'waiting' || entry.status === 'called') && (
              <View style={styles.actions}>
                {entry.status === 'called' && (
                  <TouchableOpacity style={styles.actionBtn} onPress={() => markServed(entry.id)}>
                    <Text style={styles.actionBtnText}>✓ Mark Served</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={[styles.actionBtn, styles.removeBtn]} onPress={() => removeEntry(entry.id)}>
                  <Text style={styles.removeBtnText}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}
          </Card>
        ))}
      </View>
      <View style={{ height: 32 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPage },
  headerBg: {
    backgroundColor: Colors.primaryDark,
    padding: Spacing.xl,
    paddingTop: 52,
    paddingBottom: 24,
  },
  headerGreet: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.75)', marginTop: 4 },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    marginHorizontal: Spacing.xl,
    marginTop: -16,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    ...Shadow.medium,
    marginBottom: 20,
  },
  statCard: { flex: 1, alignItems: 'center', padding: 14, borderRightWidth: 1, borderRightColor: Colors.border },
  statVal: { fontSize: 22, fontWeight: '800' },
  statLbl: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },

  callSection: { paddingHorizontal: Spacing.xl, marginBottom: 24 },

  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1,
    paddingHorizontal: Spacing.xl,
    marginBottom: 12,
  },
  list: { paddingHorizontal: Spacing.xl, gap: 10 },
  queueCard: { padding: 14 },
  calledCard: { borderColor: '#7C3AED', borderWidth: 1.5, backgroundColor: '#FAF5FF' },
  queueRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  numBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.bgMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numServed: { backgroundColor: Colors.success },
  numCalled: { backgroundColor: '#7C3AED' },
  numText: { fontSize: 16, fontWeight: '700', color: Colors.textSecondary },
  numTextWhite: { color: '#FFFFFF' },
  entryInfo: { flex: 1 },
  entryName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  entryTime: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  actionBtn: {
    flex: 1,
    backgroundColor: Colors.successLight,
    borderRadius: Radius.sm,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.success,
  },
  actionBtnText: { fontSize: 13, fontWeight: '700', color: Colors.success },
  removeBtn: { backgroundColor: Colors.errorLight, borderColor: Colors.error },
  removeBtnText: { fontSize: 13, fontWeight: '700', color: Colors.error },
});

export default DoctorDashboard;
