import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { Colors, Radius, Shadow } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}

const Card: React.FC<CardProps> = ({ children, style, padding = 16 }) => (
  <View style={[styles.card, { padding }, style]}>{children}</View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
});

export default Card;
