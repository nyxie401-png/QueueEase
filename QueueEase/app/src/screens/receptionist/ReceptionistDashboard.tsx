import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
} from 'react-native';
import { apiPost } from '../../services/api';
import Toast from '../../services/toast';
import { Colors, Spacing, Radius, Typography, Shadow } from '../../theme';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import PrimaryButton from '../../components/ui/PrimaryButton';

const MOCK_QUEUE = [
  { id: '1', name: 'Asanka D.', phone: '+94 77 123 4567', number: 1, status: 'served' },
  { id: '2', name: 'Nimal P.', phone: '+94 71 234 5678', number: 2, status: 'served' },
  { id: '3', name: 'Tharushi K.', phone: '+94 76 345 6789', number: 3, status: 'called' },
  { id: '4', name: 'Ravi S.', phone: '+94 77 456 7890', number: 4, status: 'waiting' },
  { id: '5', name: 'Kamani B.', phone: '+94 71 567 8901', number: 5, status: 'waiting' },
];

const ReceptionistDashboard = () => {
  const [queue, setQueue] = useState(MOCK_QUEUE);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [adding, setAdding] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const nextNum = Math.max(...queue.map((q) => q.number), 0) + 1;

  const addPatient = async () => {
    if (!newName.trim()) { Toast.error('Patient name is required'); return; }
    setAdding(true);
    try {
      await apiPost('/queues/walk-in', { name: newName, phone: newPhone });
    } catch {}
    setQueue((prev) => [
      ...prev,
      { id: Date.now().toString(), name: newName.trim(), phone: newPhone || '—', number: nextNum, status: 'waiting' },
    ]);
    Toast.success(`Walk-in patient #${nextNum} added`);
    setNewName('');
    setNewPhone('');
    setAdding(false);
  };

  const callNext = () => {
    const waiting = queue.find((q) => q.status === 'waiting');
    if (!waiting) { Toast.success('No patients waiting'); return; }
    setQueue((prev) => prev.map((q) => q.id === waiting.id ? { ...q, status: 'called' } : q));
    Toast.success(`Called #${waiting.number} — ${waiting.name}`);
  };

  const markServed = (id: string) => {
    setQueue((prev) => prev.map((q) => q.id === id ? { ...q, status: 'served' } : q));
    Toast.success('Marked as served');
  };

  const remove = (id: string) => {
    setQueue((prev) => prev.filter((q) => q.id !== id));
    Toast.success('Entry removed');
  };

  const stats = {
    waiting: queue.filter((q) => q.status === 'waiting').length,
    called: queue.filter((q) => q.status === 'called').length,
    served: queue.filter((q) => q.status === 'served').length,
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(false)} tintColor={Colors.primary} />}
      showsVerticalScrollIndicator={false}>

      <View style={styles.headerBg}>
        <Text style={styles.headerTitle}>Queue Manager</Text>
        <Text style={styles.headerSub}>Dr. Silva · Nugegoda Clinic</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: 'Waiting', value: stats.waiting, color: Colors.warning },
          { label: 'In Room', value: stats.called, color: '#7C3AED' },
          { label: 'Served', value: stats.served, color: Colors.success },
        ].map((s) => (
          <View key={s.label} style={styles.statCard}>
            <Text style={[styles.statVal, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLbl}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Call next */}
      <View style={styles.section}>
        <PrimaryButton title={`📣  Call Next Patient`} onPress={callNext} disabled={stats.waiting === 0} />
      </View>

      {/* Add walk-in */}
      <Card style={styles.addCard}>
        <Text style={styles.addTitle}>➕  Add Walk-in Patient</Text>
        <TextInput
          style={styles.addInput}
          placeholder="Patient full name *"
          placeholderTextColor={Colors.textMuted}
          value={newName}
          onChangeText={setNewName}
        />
        <TextInput
          style={styles.addInput}
          placeholder="Phone number (optional)"
          placeholderTextColor={Colors.textMuted}
          value={newPhone}
          onChangeText={setNewPhone}
          keyboardType="phone-pad"
        />
        <TouchableOpacity
          style={[styles.addBtn, adding && styles.addBtnDisabled]}
          onPress={addPatient}
          disabled={adding}>
          <Text style={styles.addBtnText}>
            {adding ? 'Adding...' : `Add as #${nextNum}`}
          </Text>
        </TouchableOpacity>
      </Card>

      {/* Queue */}
      <Text style={styles.sectionTitle}>FULL QUEUE LIST</Text>
      <View style={styles.list}>
        {queue.map((entry) => (
          <Card key={entry.id} style={[styles.item, entry.status === 'called' && styles.calledItem]}>
            <View style={styles.itemRow}>
              <View style={[styles.num, entry.status === 'called' && styles.numCalled, entry.status === 'served' && styles.numServed]}>
                <Text style={[styles.numTxt, (entry.status === 'called' || entry.status === 'served') && { color: '#fff' }]}>
                  {entry.number}
                </Text>
              </View>
              <View style={styles.info}>
                <Text style={styles.name}>{entry.name}</Text>
                <Text style={styles.phone}>{entry.phone}</Text>
              </View>
              <Badge variant={entry.status as any} />
            </View>
            {(entry.status === 'waiting' || entry.status === 'called') && (
              <View style={styles.btns}>
                {entry.status === 'called' && (
                  <TouchableOpacity style={styles.serveBtn} onPress={() => markServed(entry.id)}>
                    <Text style={styles.serveTxt}>✓ Served</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.removeBtn} onPress={() => remove(entry.id)}>
                  <Text style={styles.removeTxt}>Remove</Text>
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
  headerBg: { backgroundColor: '#0F766E', padding: Spacing.xl, paddingTop: 52, paddingBottom: 24 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  headerSub: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },

  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    marginHorizontal: Spacing.xl,
    marginTop: -16,
    borderRadius: Radius.lg,
    ...Shadow.medium,
    marginBottom: 20,
  },
  statCard: { flex: 1, alignItems: 'center', padding: 14, borderRightWidth: 1, borderRightColor: Colors.border },
  statVal: { fontSize: 22, fontWeight: '800' },
  statLbl: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },

  section: { paddingHorizontal: Spacing.xl, marginBottom: 20 },
  addCard: { marginHorizontal: Spacing.xl, marginBottom: 24, gap: 10 },
  addTitle: { fontSize: 14, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6 },
  addInput: {
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  addBtnDisabled: { opacity: 0.6 },
  addBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

  sectionTitle: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, letterSpacing: 1, paddingHorizontal: Spacing.xl, marginBottom: 12 },
  list: { paddingHorizontal: Spacing.xl, gap: 10 },
  item: { padding: 14 },
  calledItem: { borderColor: '#7C3AED', borderWidth: 1.5 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  num: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.bgMuted, justifyContent: 'center', alignItems: 'center' },
  numCalled: { backgroundColor: '#7C3AED' },
  numServed: { backgroundColor: Colors.success },
  numTxt: { fontSize: 16, fontWeight: '700', color: Colors.textSecondary },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  phone: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  btns: { flexDirection: 'row', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  serveBtn: { flex: 1, backgroundColor: Colors.successLight, borderRadius: Radius.sm, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: Colors.success },
  serveTxt: { fontSize: 13, fontWeight: '700', color: Colors.success },
  removeBtn: { flex: 1, backgroundColor: Colors.errorLight, borderRadius: Radius.sm, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: Colors.error },
  removeTxt: { fontSize: 13, fontWeight: '700', color: Colors.error },
});

export default ReceptionistDashboard;
