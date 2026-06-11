import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
} from 'react-native';
import Toast from '../services/toast';
import { Colors, Spacing, Radius, Shadow } from '../theme';
import Card from '../components/ui/Card';

const SettingsScreen = () => {
  const [notifications, setNotifications] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [queueUpdates, setQueueUpdates] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const SETTINGS_SECTIONS = [
    {
      title: 'Notifications',
      items: [
        { label: 'Push Notifications', sub: 'Get alerts when your turn is near', value: notifications, onChange: setNotifications },
        { label: 'SMS Alerts', sub: 'Receive SMS 15 min before your turn', value: smsAlerts, onChange: setSmsAlerts },
        { label: 'Queue Status Updates', sub: 'Real-time queue position changes', value: queueUpdates, onChange: setQueueUpdates },
      ],
    },
    {
      title: 'Appearance',
      items: [
        { label: 'Dark Mode', sub: 'Coming soon', value: darkMode, onChange: (v: boolean) => Toast.success('Dark mode coming soon!'), disabled: true },
      ],
    },
  ];

  const INFO_ITEMS = [
    { icon: '📄', label: 'Terms of Service' },
    { icon: '🔐', label: 'Privacy Policy' },
    { icon: '🆕', label: 'App Version 2.0.0' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {SETTINGS_SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title.toUpperCase()}</Text>
            <Card style={styles.sectionCard}>
              {section.items.map((item, i) => (
                <View key={item.label} style={[styles.settingRow, i < section.items.length - 1 && styles.divider]}>
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingLabel, item.disabled && styles.disabled]}>{item.label}</Text>
                    <Text style={styles.settingSub}>{item.sub}</Text>
                  </View>
                  <Switch
                    value={item.value}
                    onValueChange={item.onChange}
                    trackColor={{ false: Colors.bgMuted, true: Colors.primaryLight }}
                    thumbColor={item.value ? Colors.primary : Colors.textMuted}
                    disabled={item.disabled}
                  />
                </View>
              ))}
            </Card>
          </View>
        ))}

        {/* Info section */}
        <Text style={styles.sectionTitle}>ABOUT</Text>
        <Card style={styles.sectionCard}>
          {INFO_ITEMS.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.infoRow, i < INFO_ITEMS.length - 1 && styles.divider]}
              onPress={() => Toast.success(item.label)}
              activeOpacity={0.8}>
              <Text style={styles.infoIcon}>{item.icon}</Text>
              <Text style={styles.infoLabel}>{item.label}</Text>
              <Text style={styles.arrow}>›</Text>
            </TouchableOpacity>
          ))}
        </Card>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bgPage },
  content: { padding: Spacing.xl, paddingBottom: 40, gap: 8 },
  section: { marginBottom: 8 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  sectionCard: { padding: 0, overflow: 'hidden' },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    gap: 12,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  settingInfo: { flex: 1 },
  settingLabel: { fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  settingSub: { fontSize: 12, color: Colors.textMuted, marginTop: 3 },
  disabled: { color: Colors.textMuted },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 14,
    gap: 14,
  },
  infoIcon: { fontSize: 20 },
  infoLabel: { flex: 1, fontSize: 15, fontWeight: '500', color: Colors.textPrimary },
  arrow: { fontSize: 20, color: Colors.textMuted },
});

export default SettingsScreen;
