import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings as SettingsIcon,
  Bell,
  Moon,
  Globe,
  Shield,
  Volume2,
  VolumeX,
  Smartphone,
  LogOut,
  ChevronRight,
  Eye,
  EyeOff,
  Palette,
  Clock,
  Heart,
  FileText,
  HelpCircle,
  Info,
  AlertTriangle,
  Lock,
  User,
  MessageSquare,
  RefreshCw,
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { useAuthStore } from '../../stores/authStore';

interface SettingToggle {
  id: string;
  label: string;
  description?: string;
  enabled: boolean;
  icon?: React.ReactNode;
}

const SettingsScreen: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'extra-large'>('normal');
  const [language, setLanguage] = useState<'en' | 'si' | 'ta'>('en');

  const [notificationSettings, setNotificationSettings] = useState<SettingToggle[]>([
    { id: 'push', label: 'Push Notifications', description: 'Receive push notifications on your device', enabled: true, icon: <Bell className="w-4 h-4" /> },
    { id: 'queue-updates', label: 'Queue Updates', description: 'Get notified when queue status changes', enabled: true, icon: <Volume2 className="w-4 h-4" /> },
    { id: 'turn-alerts', label: 'Turn Alerts', description: 'Alert when your turn is approaching', enabled: true, icon: <Smartphone className="w-4 h-4" /> },
    { id: 'appointment-reminders', label: 'Appointment Reminders', description: 'Reminders before appointments', enabled: true, icon: <Clock className="w-4 h-4" /> },
    { id: 'emergency-alerts', label: 'Emergency Alerts', description: 'Critical emergency notifications', enabled: true, icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'sound', label: 'Notification Sound', description: 'Play sound for notifications', enabled: true, icon: <Volume2 className="w-4 h-4" /> },
  ]);

  const [accessibilitySettings, setAccessibilitySettings] = useState<SettingToggle[]>([
    { id: 'high-contrast', label: 'High Contrast Mode', description: 'Increase color contrast for better visibility', enabled: false, icon: <Eye className="w-4 h-4" /> },
    { id: 'large-text', label: 'Large Text', description: 'Increase text size throughout the app', enabled: false, icon: <Palette className="w-4 h-4" /> },
    { id: 'reduced-motion', label: 'Reduced Motion', description: 'Minimize animations and transitions', enabled: false, icon: <RefreshCw className="w-4 h-4" /> },
    { id: 'haptic', label: 'Haptic Feedback', description: 'Vibrate on touch interactions', enabled: true, icon: <Smartphone className="w-4 h-4" /> },
  ]);

  const toggleNotificationSetting = (id: string) => {
    setNotificationSettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const toggleAccessibilitySetting = (id: string) => {
    setAccessibilitySettings((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) return;
    setIsChangingPassword(true);
    // Placeholder for password change API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsChangingPassword(false);
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'si', name: 'Sinhala', native: 'සිංහල' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-teal-400" />
          Settings
        </h1>
        <p className="text-gray-400 text-sm mt-1">Customize your QueueEase experience</p>
      </div>

      {/* Language Selection */}
      <GlassCard>
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-teal-400" />
          Language
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code as any)}
              className={`p-3 rounded-xl text-center transition-all min-h-[48px] ${
                language === lang.code
                  ? 'bg-teal-500/20 border border-teal-500/50 text-teal-400'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
              }`}
            >
              <div className="font-medium text-sm">{lang.name}</div>
              <div className="text-xs mt-0.5 opacity-70">{lang.native}</div>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Notification Settings */}
      <GlassCard>
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-4 h-4 text-teal-400" />
          Notifications
        </h3>
        <div className="space-y-1">
          {notificationSettings.map((setting) => (
            <div
              key={setting.id}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  setting.enabled ? 'bg-teal-500/10 text-teal-400' : 'bg-white/5 text-gray-500'
                }`}>
                  {setting.icon}
                </div>
                <div>
                  <div className="text-white text-sm font-medium">{setting.label}</div>
                  {setting.description && (
                    <div className="text-gray-500 text-xs mt-0.5">{setting.description}</div>
                  )}
                </div>
              </div>
              <button
                onClick={() => toggleNotificationSetting(setting.id)}
                className={`relative w-12 h-7 rounded-full transition-all min-h-[48px] flex items-center ${
                  setting.enabled ? 'bg-teal-500/30' : 'bg-white/10'
                }`}
              >
                <div className={`absolute w-5 h-5 rounded-full transition-all ${
                  setting.enabled
                    ? 'right-1 bg-teal-500 shadow-[0_0_8px_rgba(0,183,168,0.5)]'
                    : 'left-1 bg-gray-500'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Accessibility Settings */}
      <GlassCard>
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Eye className="w-4 h-4 text-teal-400" />
          Accessibility
        </h3>
        <p className="text-gray-400 text-xs mb-4">
          Adjust settings for a more comfortable experience, especially for elderly users
        </p>

        {/* Font Size */}
        <div className="mb-4">
          <div className="text-white text-sm font-medium mb-2">Text Size</div>
          <div className="grid grid-cols-3 gap-2">
            {(['normal', 'large', 'extra-large'] as const).map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`py-3 px-2 rounded-xl text-center transition-all min-h-[48px] capitalize ${
                  fontSize === size
                    ? 'bg-teal-500/20 border border-teal-500/50 text-teal-400'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                }`}
                style={{ fontSize: size === 'large' ? '16px' : size === 'extra-large' ? '18px' : '14px' }}
              >
                {size === 'extra-large' ? 'X-Large' : size}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          {accessibilitySettings.map((setting) => (
            <div
              key={setting.id}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.02] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  setting.enabled ? 'bg-teal-500/10 text-teal-400' : 'bg-white/5 text-gray-500'
                }`}>
                  {setting.icon}
                </div>
                <div>
                  <div className="text-white text-sm font-medium">{setting.label}</div>
                  {setting.description && (
                    <div className="text-gray-500 text-xs mt-0.5">{setting.description}</div>
                  )}
                </div>
              </div>
              <button
                onClick={() => toggleAccessibilitySetting(setting.id)}
                className={`relative w-12 h-7 rounded-full transition-all min-h-[48px] flex items-center ${
                  setting.enabled ? 'bg-teal-500/30' : 'bg-white/10'
                }`}
              >
                <div className={`absolute w-5 h-5 rounded-full transition-all ${
                  setting.enabled
                    ? 'right-1 bg-teal-500 shadow-[0_0_8px_rgba(0,183,168,0.5)]'
                    : 'left-1 bg-gray-500'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Security */}
      <GlassCard>
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-teal-400" />
          Security
        </h3>
        <div className="space-y-2">
          <button
            onClick={() => setShowPasswordModal(true)}
            className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-white/[0.02] transition-colors min-h-[48px]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <Lock className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-left">
                <div className="text-white text-sm font-medium">Change Password</div>
                <div className="text-gray-500 text-xs">Update your account password</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>

          <button
            className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-white/[0.02] transition-colors min-h-[48px]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <Shield className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-left">
                <div className="text-white text-sm font-medium">Two-Factor Authentication</div>
                <div className="text-gray-500 text-xs">Add extra security to your account</div>
              </div>
            </div>
            <Badge variant="info">Coming Soon</Badge>
          </button>

          <button
            className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-white/[0.02] transition-colors min-h-[48px]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <FileText className="w-4 h-4 text-gray-400" />
              </div>
              <div className="text-left">
                <div className="text-white text-sm font-medium">Privacy Policy</div>
                <div className="text-gray-500 text-xs">How we handle your data</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </GlassCard>

      {/* About */}
      <GlassCard>
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Info className="w-4 h-4 text-teal-400" />
          About
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">App Version</span>
            <span className="text-white text-sm font-mono">2.0.0</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm">Build</span>
            <span className="text-white text-sm font-mono">2024.1.0</span>
          </div>
          <button
            className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-white/[0.02] transition-colors min-h-[48px]"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-4 h-4 text-gray-400" />
              <span className="text-white text-sm">Help & Support</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
          <button
            className="flex items-center justify-between w-full p-3 rounded-xl hover:bg-white/[0.02] transition-colors min-h-[48px]"
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4 text-gray-400" />
              <span className="text-white text-sm">Send Feedback</span>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </GlassCard>

      {/* Logout */}
      <Button
        variant="ghost"
        className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20"
        leftIcon={<LogOut className="w-5 h-5" />}
        onClick={() => setShowLogoutModal(true)}
      >
        Sign Out
      </Button>

      <div className="text-center text-gray-600 text-xs pb-4">
        QueueEase v2.0 — AI-Powered Smart Queue Management
      </div>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
      >
        <div className="space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            placeholder="Enter current password"
          />
          <Input
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            placeholder="Enter new password"
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leftIcon={<Lock className="w-4 h-4" />}
            placeholder="Confirm new password"
            error={confirmPassword && newPassword !== confirmPassword ? 'Passwords do not match' : undefined}
          />
          <Button
            variant="primary"
            className="w-full"
            isLoading={isChangingPassword}
            disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}
            onClick={handleChangePassword}
          >
            Update Password
          </Button>
        </div>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Sign Out"
      >
        <div className="text-center py-4">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
            <LogOut className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">Are you sure?</h3>
          <p className="text-gray-400 text-sm mb-6">
            You will be signed out and need to log in again to access your account.
          </p>
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setShowLogoutModal(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              className="flex-1"
              leftIcon={<LogOut className="w-4 h-4" />}
              onClick={() => {
                logout();
                setShowLogoutModal(false);
              }}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsScreen;
