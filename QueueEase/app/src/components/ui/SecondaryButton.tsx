import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius } from '../../theme';

interface Props {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
}

const SecondaryButton: React.FC<Props> = ({ title, onPress, disabled, style }) => (
  <TouchableOpacity
    style={[styles.btn, disabled && styles.disabled, style]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.8}>
    <Text style={styles.text}>{title}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  btn: {
    borderRadius: Radius.md,
    paddingVertical: 13,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: Colors.accentSoft,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
  },
  text: { fontSize: 15, fontWeight: '600', color: Colors.primary },
  disabled: { opacity: 0.55 },
});

export default SecondaryButton;
