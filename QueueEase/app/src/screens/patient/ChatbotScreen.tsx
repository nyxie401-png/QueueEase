import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, Shadow } from '../../theme';
import ChatbotDisclaimerModal from '../../components/ChatbotDisclaimerModal';
import { sendClinicAssistantMessage } from '../../services/chatbotService';
import { checkDangerousInput, SAFE_BLOCKED_RESPONSE } from '../../utils/aiSafetyUtils';

interface Message { id: string; role: 'user' | 'assistant'; text: string; }

const QUICK_PROMPTS = [
  'Clinic timings',
  'Queue availability',
  'Cancel my booking',
  'Find a doctor',
];

const SESSION_ID = 'default';

const ChatbotScreen: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'assistant', text: 'Hi there 👋 I\'m your QueueEase assistant. I can help with clinic timings, queue availability, booking guidance, and general support. How can I help today?' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [disclaimerVisible, setDisclaimerVisible] = useState(true);
  const [checkingDisclaimer, setCheckingDisclaimer] = useState(true);
  const scrollRef = useRef<ScrollView>(null);
  const storageKey = `@QueueEase:chatbotDisclaimer:${SESSION_ID}`;

  useEffect(() => {
    AsyncStorage.getItem(storageKey).then((val) => {
      setDisclaimerVisible(val !== 'accepted');
      setCheckingDisclaimer(false);
    });
  }, []);

  const history = useMemo(() =>
    messages.map((m) => ({ role: m.role, content: m.text })),
    [messages]
  );

  const addMsg = (msg: Message) => setMessages((prev) => [...prev, msg]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    addMsg({ id: `u-${Date.now()}`, role: 'user', text: trimmed });
    setInput('');
    setLoading(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    const unsafe = checkDangerousInput(trimmed);
    if (unsafe.blocked) {
      addMsg({ id: `a-${Date.now()}`, role: 'assistant', text: unsafe.safeReply ?? SAFE_BLOCKED_RESPONSE });
      setLoading(false);
      return;
    }

    const result = await sendClinicAssistantMessage(trimmed, history);
    addMsg({ id: `a-${Date.now()}`, role: 'assistant', text: result.assistantReply ?? 'I\'m unable to respond right now. Please try again.' });
    setLoading(false);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}>

      <ChatbotDisclaimerModal
        visible={disclaimerVisible}
        onAccept={async () => { await AsyncStorage.setItem(storageKey, 'accepted'); setDisclaimerVisible(false); }}
        onCancel={() => setDisclaimerVisible(false)}
      />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.botAvatar}>
            <Text style={styles.botEmoji}>🤖</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>QueueEase AI</Text>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online · GPT powered</Text>
            </View>
          </View>
        </View>
      </View>

      {checkingDisclaimer ? (
        <View style={styles.center}><ActivityIndicator color={Colors.primary} /></View>
      ) : (
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[styles.bubble, msg.role === 'assistant' ? styles.asstBubble : styles.userBubble]}>
              {msg.role === 'assistant' && (
                <Text style={styles.bubbleRole}>Assistant</Text>
              )}
              <Text style={[styles.bubbleText, msg.role === 'user' && styles.bubbleTextUser]}>
                {msg.text}
              </Text>
            </View>
          ))}
          {loading && (
            <View style={[styles.bubble, styles.asstBubble, styles.loadingBubble]}>
              <ActivityIndicator color={Colors.primary} size="small" />
            </View>
          )}
        </ScrollView>
      )}

      {/* Quick prompts */}
      <ScrollView
        horizontal
        style={styles.quickRow}
        contentContainerStyle={styles.quickContent}
        showsHorizontalScrollIndicator={false}>
        {QUICK_PROMPTS.map((p) => (
          <TouchableOpacity
            key={p}
            style={styles.quickChip}
            onPress={() => send(p)}
            disabled={loading || disclaimerVisible}>
            <Text style={styles.quickChipText}>{p}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Input */}
      <View style={styles.inputArea}>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Ask anything..."
            placeholderTextColor={Colors.textMuted}
            multiline
            editable={!disclaimerVisible && !loading}
            returnKeyType="send"
            onSubmitEditing={() => send(input)}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading || disclaimerVisible) && styles.sendBtnDisabled]}
            onPress={() => send(input)}
            disabled={!input.trim() || loading || disclaimerVisible}>
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.disclaimer}>QueueEase AI provides general clinic assistance only — not medical advice.</Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: Colors.bgPage },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgCard,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  botAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botEmoji: { fontSize: 22 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: Colors.success },
  onlineText: { fontSize: 12, color: Colors.textMuted },

  messages: { flex: 1 },
  messagesContent: { padding: Spacing.xl, gap: 14, paddingBottom: 20 },

  bubble: {
    maxWidth: '82%',
    borderRadius: Radius.xl,
    padding: 14,
  },
  asstBubble: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.bgCard,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
  },
  loadingBubble: { padding: 16 },
  bubbleRole: { fontSize: 11, fontWeight: '700', color: Colors.textMuted, marginBottom: 5 },
  bubbleText: { fontSize: 14, color: Colors.textPrimary, lineHeight: 21 },
  bubbleTextUser: { color: '#FFFFFF' },

  quickRow: { maxHeight: 46, backgroundColor: Colors.bgCard, borderTopWidth: 1, borderTopColor: Colors.border },
  quickContent: { paddingHorizontal: Spacing.lg, alignItems: 'center', gap: 8 },
  quickChip: {
    backgroundColor: Colors.accentSoft,
    borderRadius: Radius.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  quickChipText: { fontSize: 12, fontWeight: '600', color: Colors.primaryDark },

  inputArea: {
    backgroundColor: Colors.bgCard,
    paddingHorizontal: Spacing.xl,
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  input: {
    flex: 1,
    backgroundColor: Colors.bgInput,
    borderRadius: Radius.xl,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: Colors.textPrimary,
    borderWidth: 1.5,
    borderColor: Colors.border,
    maxHeight: 100,
    minHeight: 46,
  },
  sendBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: Colors.bgMuted },
  sendIcon: { fontSize: 18, color: '#FFFFFF' },
  disclaimer: { fontSize: 11, color: Colors.textMuted, textAlign: 'center', marginTop: 8 },
});

export default ChatbotScreen;
