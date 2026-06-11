import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInputProps,
} from 'react-native';
import { Colors, Radius, Spacing } from '../../theme';

interface InputFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  ...props
}) => {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputRow,
          focused && styles.focused,
          !!error && styles.errorBorder,
        ]}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <TextInput
          style={[styles.input, icon && { paddingLeft: 0 }]}
          placeholderTextColor={Colors.textMuted}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginBottom: Spacing.md },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.lg,
    minHeight: 50,
  },
  focused: { borderColor: Colors.primary, backgroundColor: Colors.bgCard },
  errorBorder: { borderColor: Colors.error },
  icon: { marginRight: 10 },
  rightIcon: { marginLeft: 8 },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    paddingVertical: 12,
  },
  error: { fontSize: 12, color: Colors.error, marginTop: 4 },
});

export default InputField;
