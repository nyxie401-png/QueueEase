import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { apiPost } from '../../services/api';
import Toast from '../../services/toast';
import { Colors, Spacing, Radius, Typography, Shadow } from '../../theme';
import Card from '../../components/ui/Card';
import PrimaryButton from '../../components/ui/PrimaryButton';

const SLOTS = Array.from({ length: 12 }, (_, i) => {
  const num = i + 1;
  const baseMin = 9 * 60 + 18; // 9:18 AM session start
  const totalMin = baseMin + i * 6;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  const hStr = h > 12 ? h - 12 : h;
  const mStr = m.toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  return { num, time: `${hStr}:${mStr} ${ampm}`, locked: num <= 3 };
});

const BookAppointmentScreen = ({ navigation }: any) => {
  const [selected, setSelected] = useState<number | null>(null);
  const [booking, setBooking] = useState(false);

  const handleBook = async () => {
    if (!selected) { Toast.error('Please select a slot'); return; }
    setBooking(true);
    try {
      await apiPost('/queues/book', { slotNumber: selected });
      Toast.success(`Slot #${selected} booked successfully!`);
      navigation.navigate('QueueStatus');
    } catch {
      Toast.error('Booking failed. Please try again.');
    } finally { setBooking(false); }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>

      {/* Clinic header */}
      <Card style={styles.clinicCard}>
        <View style={styles.clinicRow}>
          <View>
            <Text style={styles.clinicName}>Dr. Silva</Text>
            <Text style={styles.clinicSpec}>General Physician · Nugegoda Cli...</Text>
          </View>
          <View style={styles.openBadge}>
            <View style={styles.openDot} />
            <Text style={styles.openText}>Open</Text>
          </View>
        </View>
      </Card>

      {/* Session times */}
      <View style={styles.sessionRow}>
        <View style={styles.sessionBlock}>
          <Text style={styles.sessionLabel}>SCHEDULED</Text>
          <Text style={styles.sessionTime}>9:00 AM</Text>
          <Text style={styles.sessionSub}>Doctor's posted start</Text>
        </View>
        <View style={[styles.sessionBlock, styles.actualBlock]}>
          <Text style={[styles.sessionLabel, { color: Colors.success }]}>ACTUAL</Text>
          <Text style={[styles.sessionTime, { color: Colors.success }]}>9:18 AM</Text>
          <Text style={styles.sessionSub}>Session started today</Text>
        </View>
      </View>

      {/* AI badge */}
      <View style={styles.aiRow}>
        <Text style={styles.nextTitle}>NEXT AVAILABLE NUMBERS</Text>
        <View style={styles.aiBadge}>
          <Text style={styles.aiText}>✨ AI-predicted time</Text>
        </View>
      </View>

      {/* Slot Grid */}
      <View style={styles.slotGrid}>
        {SLOTS.map((slot) => (
          <TouchableOpacity
            key={slot.num}
            style={[
              styles.slotCard,
              slot.locked && styles.slotLocked,
              selected === slot.num && styles.slotSelected,
            ]}
            onPress={() => !slot.locked && setSelected(slot.num)}
            disabled={slot.locked}
            activeOpacity={0.8}>
            {slot.locked && <Text style={styles.lockIcon}>🔒</Text>}
            <Text style={styles.slotLabel}>NO.</Text>
            <Text style={[styles.slotNum, slot.locked && styles.slotNumLocked, selected === slot.num && styles.slotNumSelected]}>
              {slot.num}
            </Text>
            <Text style={[styles.slotTime, slot.locked && styles.slotTimeLocked]}>{slot.time}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {selected && (
        <Card style={styles.selectedInfo}>
          <Text style={styles.selectedTitle}>Selected: Slot #{selected}</Text>
          <Text style={styles.selectedSub}>
            You will be notified 15 minutes before your turn. You can cancel anytime from the queue status screen.
          </Text>
        </Card>
      )}

      <PrimaryButton
        title={selected ? `Confirm Slot #${selected}` : 'Select a Slot'}
        onPress={handleBook}
        loading={booking}
        disabled={!selected || booking}
        style={styles.confirmBtn}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPage },
  content: { padding: Spacing.xl, paddingBottom: 40 },

  clinicCard: { marginBottom: Spacing.lg },
  clinicRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  clinicName: { fontSize: 17, fontWeight: '700', color: Colors.textPrimary },
  clinicSpec: { fontSize: 13, color: Colors.textMuted, marginTop: 3 },
  openBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successLight,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
    gap: 5,
  },
  openDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.success },
  openText: { fontSize: 12, fontWeight: '700', color: Colors.success },

  sessionRow: { flexDirection: 'row', gap: 12, marginBottom: Spacing.xl },
  sessionBlock: {
    flex: 1,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actualBlock: { borderColor: Colors.success, backgroundColor: Colors.successLight },
  sessionLabel: { fontSize: 10, fontWeight: '700', color: Colors.textMuted, letterSpacing: 0.8 },
  sessionTime: { fontSize: 22, fontWeight: '800', color: Colors.textPrimary, marginTop: 4 },
  sessionSub: { fontSize: 11, color: Colors.textMuted, marginTop: 4 },

  aiRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  nextTitle: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, letterSpacing: 0.8 },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDE9FE',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  aiText: { fontSize: 11, color: '#5B21B6', fontWeight: '600' },

  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  slotCard: {
    width: '30%',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadow.card,
    minHeight: 80,
    justifyContent: 'center',
    gap: 2,
  },
  slotLocked: { backgroundColor: Colors.bgMuted, borderColor: Colors.bgMuted, opacity: 0.6 },
  slotSelected: { borderColor: Colors.primary, backgroundColor: Colors.accentSoft },
  lockIcon: { position: 'absolute', top: 6, right: 6, fontSize: 10 },
  slotLabel: { fontSize: 9, fontWeight: '700', color: Colors.textMuted, letterSpacing: 0.5 },
  slotNum: { fontSize: 26, fontWeight: '800', color: Colors.textPrimary },
  slotNumLocked: { color: Colors.textMuted },
  slotNumSelected: { color: Colors.primary },
  slotTime: { fontSize: 10, color: Colors.textMuted, textAlign: 'center' },
  slotTimeLocked: { color: Colors.bgMuted },

  selectedInfo: { marginBottom: 16 },
  selectedTitle: { fontSize: 14, fontWeight: '700', color: Colors.primary, marginBottom: 6 },
  selectedSub: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  confirmBtn: { marginTop: 4 },
});

export default BookAppointmentScreen;
