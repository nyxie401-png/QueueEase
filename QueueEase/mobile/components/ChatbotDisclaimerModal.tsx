import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface ChatbotDisclaimerModalProps {
  visible: boolean;
  onAccept: () => void;
  onCancel: () => void;
}

/**
 * A polished AI assistant disclaimer modal for QueueEase.
 * This is intentionally built for React Native mobile usage.
 */
const ChatbotDisclaimerModal: React.FC<ChatbotDisclaimerModalProps> = ({
  visible,
  onAccept,
  onCancel,
}) => {
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const contentTransform = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 240,
          useNativeDriver: true,
        }),
        Animated.spring(contentTransform, {
          toValue: 0,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.timing(overlayOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, overlayOpacity, contentTransform]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent={true}
    >
      <Animated.View style={[styles.backdrop, { opacity: overlayOpacity }]}> </Animated.View>

      <View style={styles.centeredContainer}>
        <Animated.View
          style={[
            styles.card,
            {
              transform: [
                {
                  translateY: contentTransform,
                },
              ],
            },
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.title}>⚠ AI Assistant Notice</Text>
            <Text style={styles.subtitle}>
              QueueEase AI is a clinic support assistant and NOT a licensed medical professional.
            </Text>
          </View>

          <View style={styles.body}>
            <Text style={styles.bodyText}>
              The chatbot:
            </Text>
            <View style={styles.bulletList}>
              <Text style={styles.bulletItem}>• Cannot diagnose medical conditions</Text>
              <Text style={styles.bulletItem}>• Cannot prescribe medication</Text>
              <Text style={styles.bulletItem}>• Cannot provide treatment instructions</Text>
              <Text style={styles.bulletItem}>• Cannot replace professional medical advice</Text>
            </View>

            <Text style={styles.note}>
              If you have severe symptoms or a medical emergency, please contact a doctor or visit the nearest hospital immediately.
            </Text>

            <Text style={styles.footer}>
              By continuing, you acknowledge and accept these limitations.
            </Text>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity onPress={onCancel} style={[styles.button, styles.cancelButton]}>
              <Text style={[styles.buttonText, styles.cancelButtonText]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onAccept} style={[styles.button, styles.confirmButton]}>
              <Text style={[styles.buttonText, styles.confirmButtonText]}>I Understand</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 25, 47, 0.72)',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    borderRadius: 28,
    padding: 24,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255,255,255,0.92)' : '#f9fbfd',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.85)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.12,
    shadowRadius: 36,
    elevation: 18,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f213f',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4f5870',
  },
  body: {
    marginBottom: 24,
  },
  bodyText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#20304a',
    marginBottom: 12,
  },
  bulletList: {
    marginLeft: 8,
    marginBottom: 16,
  },
  bulletItem: {
    fontSize: 15,
    lineHeight: 24,
    color: '#37415a',
    marginBottom: 8,
  },
  note: {
    fontSize: 14,
    lineHeight: 22,
    color: '#515f7e',
    backgroundColor: 'rgba(65,116,170,0.08)',
    padding: 14,
    borderRadius: 18,
    marginBottom: 16,
  },
  footer: {
    fontSize: 14,
    lineHeight: 22,
    color: '#2f3a55',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: '#d7dde6',
  },
  confirmButton: {
    backgroundColor: '#0d5ede',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  cancelButtonText: {
    color: '#3d4f6c',
  },
  confirmButtonText: {
    color: '#fff',
  },
});

export default ChatbotDisclaimerModal;
