import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatbotDisclaimerModal from '../components/ChatbotDisclaimerModal';
import { sendClinicAssistantMessage } from '../services/geminiClient';
import { SAFE_BLOCKED_RESPONSE, checkDangerousInput } from '../utils/aiSafetyUtils';

interface ChatbotScreenProps {
  sessionId: string;
  onNavigateBack?: () => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

/**
 * Chatbot screen with multi-layer safety and session-based disclaimer enforcement.
 * This screen does not display medical advice and prevents unsafe requests.
 */
const ChatbotScreen: React.FC<ChatbotScreenProps> = ({ sessionId, onNavigateBack }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'assistant-welcome',
      role: 'assistant',
      text: 'Welcome to QueueEase AI. I can help with clinic navigation, appointment guidance, queue support, and clinic service information.',
    },
  ]);
  const [messageText, setMessageText] = useState('');
  const [isDisclaimerVisible, setDisclaimerVisible] = useState(true);
  const [loadingAcceptance, setLoadingAcceptance] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const storageKey = useMemo(
    () => `@QueueEase:chatbotDisclaimerAccepted:${sessionId}`,
    [sessionId],
  );

  useEffect(() => {
    const loadDisclaimerState = async () => {
      try {
        const accepted = await AsyncStorage.getItem(storageKey);
        setDisclaimerVisible(accepted !== 'accepted');
      } catch (error) {
        setDisclaimerVisible(true);
      } finally {
        setLoadingAcceptance(false);
      }
    };

    if (sessionId) {
      loadDisclaimerState();
    }
  }, [sessionId, storageKey]);

  const messageHistory = useMemo(
    () =>
      messages.map((message) => ({
        role: message.role,
        content: message.text,
      })),
    [messages],
  );

  const handleAcceptDisclaimer = async () => {
    await AsyncStorage.setItem(storageKey, 'accepted');
    setDisclaimerVisible(false);
  };

  const handleCancelDisclaimer = () => {
    setDisclaimerVisible(false);
    onNavigateBack?.();
  };

  const handleSend = async () => {
    const trimmedMessage = messageText.trim();
    if (!trimmedMessage || isLoading) {
      return;
    }

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmedMessage,
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessageText('');
    setErrorMessage('');
    setIsLoading(true);

    const unsafeCheck = checkDangerousInput(trimmedMessage);
    if (unsafeCheck.blocked) {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: unsafeCheck.safeReply ?? SAFE_BLOCKED_RESPONSE,
        },
      ]);
      setIsLoading(false);
      return;
    }

    const result = await sendClinicAssistantMessage(trimmedMessage, messageHistory);

    setMessages((prev) => [
      ...prev,
      {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: result.assistantReply,
      },
    ]);

    if (!result.success) {
      setErrorMessage(
        result.blocked
          ? 'Your request was blocked for safety reasons.'
          : 'The assistant is unavailable right now. Please try again or consult clinic staff.',
      );
    }

    setIsLoading(false);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ChatbotDisclaimerModal
        visible={isDisclaimerVisible}
        onAccept={handleAcceptDisclaimer}
        onCancel={handleCancelDisclaimer}
      />

      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>AI Clinic Assistant</Text>
        <Text style={styles.headerSubtitle}>QueueEase AI provides general clinic assistance only.</Text>
      </View>

      {loadingAcceptance ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0d5ede" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.messageList} keyboardShouldPersistTaps="handled">
          {messages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageBubble,
                message.role === 'assistant' ? styles.assistantBubble : styles.userBubble,
              ]}
            >
              <Text style={styles.messageRole}>
                {message.role === 'assistant' ? 'Assistant' : 'You'}
              </Text>
              <Text style={styles.messageText}>{message.text}</Text>
            </View>
          ))}
        </ScrollView>
      )}

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Text style={styles.noticeText}>QueueEase AI provides general clinic assistance only.</Text>
          <TextInput
            value={messageText}
            onChangeText={setMessageText}
            placeholder="Type your clinic question..."
            placeholderTextColor="#7a8cab"
            style={styles.input}
            editable={!isDisclaimerVisible}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            multiline
          />
        </View>

        <TouchableOpacity
          style={[styles.sendButton, (isLoading || isDisclaimerVisible) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={isLoading || isDisclaimerVisible}
        >
          <Text style={styles.sendLabel}>{isLoading ? 'Sending...' : 'Send'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#edf4fb',
  },
  headerContainer: {
    paddingTop: 20,
    paddingHorizontal: 22,
    paddingBottom: 14,
    backgroundColor: '#f7fbff',
    borderBottomWidth: 1,
    borderBottomColor: '#d9e5f2',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#122a44',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#5e718f',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageList: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 14,
  },
  messageBubble: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    maxWidth: '85%',
  },
  assistantBubble: {
    backgroundColor: '#ffffff',
    alignSelf: 'flex-start',
    borderColor: '#d8e3ef',
    borderWidth: 1,
  },
  userBubble: {
    backgroundColor: '#e6f0ff',
    alignSelf: 'flex-end',
    borderColor: '#b6caf4',
    borderWidth: 1,
  },
  messageRole: {
    fontSize: 12,
    color: '#60708a',
    marginBottom: 6,
    fontWeight: '600',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1f324f',
  },
  errorText: {
    paddingHorizontal: 22,
    color: '#b3261e',
    fontSize: 13,
    marginBottom: 10,
  },
  inputContainer: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#dae4ee',
  },
  inputWrapper: {
    backgroundColor: '#f4f9ff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d9e6f3',
    padding: 12,
  },
  noticeText: {
    fontSize: 12,
    color: '#556979',
    marginBottom: 8,
  },
  input: {
    minHeight: 52,
    maxHeight: 120,
    fontSize: 15,
    lineHeight: 22,
    color: '#16283a',
    textAlignVertical: 'top',
  },
  sendButton: {
    marginTop: 12,
    alignSelf: 'flex-end',
    backgroundColor: '#0b55d3',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 18,
  },
  sendButtonDisabled: {
    backgroundColor: '#8da9dc',
  },
  sendLabel: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default ChatbotScreen;
