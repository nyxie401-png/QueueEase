import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors, Radius } from '../../theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  variant?: 'teal' | 'white' | 'danger';
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  style,
  variant = 'teal',
}) => {
  const bgColor =
    variant === 'teal'
      ? Colors.primary
      : variant === 'danger'
      ? Colors.error
      : Colors.bgCard;
  const txtColor =
    variant === 'white' ? Colors.primary : Colors.textOnPrimary;
  const borderColor = variant === 'white' ? Colors.border : 'transparent';

  return (
    <TouchableOpacity
      style={[
        styles.btn,
        { backgroundColor: bgColor, borderColor, borderWidth: variant === 'white' ? 1.5 : 0 },
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.82}>
      {loading ? (
        <ActivityIndicator color={txtColor} size="small" />
      ) : (
        <Text style={[styles.text, { color: txtColor }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    borderRadius: Radius.md,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  disabled: { opacity: 0.55 },
});

export default PrimaryButton;
