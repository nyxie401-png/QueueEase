import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius } from '../../theme';

type BadgeVariant = 'waiting' | 'called' | 'served' | 'cancelled' | 'noShow' | 'open' | 'closed';

const BADGE_MAP: Record<BadgeVariant, { bg: string; text: string; label: string }> = {
  waiting:   { bg: Colors.primaryLight, text: Colors.primaryDark, label: 'Waiting' },
  called:    { bg: '#EDE9FE', text: '#5B21B6', label: 'Called' },
  served:    { bg: Colors.successLight, text: Colors.success, label: 'Served' },
  cancelled: { bg: Colors.errorLight, text: Colors.error, label: 'Cancelled' },
  noShow:    { bg: Colors.bgMuted, text: Colors.textMuted, label: 'No Show' },
  open:      { bg: Colors.successLight, text: Colors.success, label: 'Open' },
  closed:    { bg: Colors.errorLight, text: Colors.error, label: 'Closed' },
};

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
}

const Badge: React.FC<BadgeProps> = ({ variant, label }) => {
  const config = BADGE_MAP[variant];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>
        {label ?? config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 12, fontWeight: '600' },
});

export default Badge;
