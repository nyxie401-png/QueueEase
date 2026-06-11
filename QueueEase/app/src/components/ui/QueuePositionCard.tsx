import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Shadow } from '../../theme';

interface Props {
  position: number;
  estimatedWait?: number;
  status?: string;
}

const QueuePositionCard: React.FC<Props> = ({ position, estimatedWait, status }) => (
  <View style={styles.card}>
    <Text style={styles.label}>YOUR QUEUE NUMBER</Text>
    <Text style={styles.position}>{position}</Text>
    {estimatedWait != null && (
      <View style={styles.waitRow}>
        <Text style={styles.waitIcon}>⏱</Text>
        <Text style={styles.waitText}>
          Est. {estimatedWait} min wait
        </Text>
      </View>
    )}
    {status && (
      <View style={styles.statusPill}>
        <View style={styles.dot} />
        <Text style={styles.statusText}>{status}</Text>
      </View>
    )}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: 24,
    alignItems: 'center',
    ...Shadow.medium,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  position: {
    fontSize: 72,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 80,
  },
  waitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  waitIcon: { fontSize: 16 },
  waitText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 14,
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#A7F3D0',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default QueuePositionCard;
