import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  FileText,
  Shield,
  Bell,
  LogOut,
  Edit2,
  Save,
  Camera,
  Heart,
  Activity,
  AlertCircle,
  CheckCircle,
  X,
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { useAuthStore } from '../../stores/authStore';
import { apiGet, apiPut } from '../../services/api';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'patient' | 'doctor' | 'receptionist';
  avatar?: string;
  dateOfBirth?: string;
  address?: string;
  bloodType?: string;
  allergies?: string[];
  medicalHistory?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  specialization?: string;
  medicalLicenseNo?: string;
  employeeId?: string;
  createdAt: string;
}

const ProfileScreen: React.FC = () => {
  const { user, logout, updateProfile } = useAuthStore();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const data = await apiGet<any>('/auth/me');
      setProfile(data.data?.user || null);
      setEditForm(data.data?.user || {});
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const data = await apiPut<any>('/auth/me', editForm);
      setProfile(data.data?.user || null);
      updateProfile(data.data?.user || {});
      setSaveSuccess(true);
      setTimeout(() => {
        setShowEditModal(false);
        setIsEditing(false);
        setSaveSuccess(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to update profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Unable to load profile</p>
          <Button variant="primary" className="mt-4" onClick={fetchProfile}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const isPatient = profile.role === 'patient';
  const isDoctor = profile.role === 'doctor';
  const isReceptionist = profile.role === 'receptionist';

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My Profile</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your account information</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Edit2 className="w-4 h-4" />}
          onClick={() => {
            setShowEditModal(true);
            setIsEditing(true);
          }}
        >
          Edit Profile
        </Button>
      </div>

      {/* Profile Header Card */}
      <GlassCard variant="neon" className="relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-teal-500/20 to-cyan-500/20" />
        <div className="relative pt-12 px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-teal-500/20 to-cyan-500/20 border-2 border-teal-500/50 flex items-center justify-center">
                {profile.avatar ? (
                  <img src={profile.avatar} alt={profile.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-teal-400" />
                )}
              </div>
              <Badge
                variant={isDoctor ? 'in-consultation' : isReceptionist ? 'info' : 'waiting'}
                className="absolute -bottom-1 -right-1"
              >
                {profile.role}
              </Badge>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-bold text-white">{profile.name}</h2>
              {isDoctor && profile.specialization && (
                <p className="text-teal-400 text-sm mt-1">{profile.specialization}</p>
              )}
              {isReceptionist && profile.employeeId && (
                <p className="text-cyan-400 text-sm mt-1">Employee ID: {profile.employeeId}</p>
              )}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-2">
                <span className="text-gray-400 text-sm flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {profile.email}
                </span>
                {profile.phone && (
                  <span className="text-gray-400 text-sm flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    {profile.phone}
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<LogOut className="w-4 h-4" />}
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              Logout
            </Button>
          </div>
        </div>
      </GlassCard>

      {/* Patient-specific Info */}
      {isPatient && (
        <div className="grid md:grid-cols-2 gap-4">
          <GlassCard>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-400" />
              Medical Information
            </h3>
            <div className="space-y-3">
              {profile.bloodType && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Blood Type</span>
                  <Badge variant="emergency">{profile.bloodType}</Badge>
                </div>
              )}
              {profile.dateOfBirth && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Date of Birth</span>
                  <span className="text-white text-sm">{profile.dateOfBirth}</span>
                </div>
              )}
              {profile.allergies && profile.allergies.length > 0 && (
                <div>
                  <div className="text-gray-400 text-sm mb-2">Allergies</div>
                  <div className="flex flex-wrap gap-1">
                    {profile.allergies.map((allergy, i) => (
                      <Badge key={i} variant="urgent">{allergy}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {profile.medicalHistory && profile.medicalHistory.length > 0 && (
                <div>
                  <div className="text-gray-400 text-sm mb-2">Medical History</div>
                  <div className="space-y-1">
                    {profile.medicalHistory.map((condition, i) => (
                      <div key={i} className="text-gray-300 text-sm flex items-center gap-2">
                        <Activity className="w-3 h-3 text-teal-400" />
                        {condition}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-400" />
              Emergency Contact
            </h3>
            {profile.emergencyContact ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Name</span>
                  <span className="text-white text-sm">{profile.emergencyContact.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Phone</span>
                  <span className="text-white text-sm">{profile.emergencyContact.phone}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Relationship</span>
                  <span className="text-white text-sm">{profile.emergencyContact.relationship}</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No emergency contact set</p>
            )}
          </GlassCard>
        </div>
      )}

      {/* Doctor-specific Info */}
      {isDoctor && (
        <GlassCard>
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal-400" />
            Professional Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {profile.specialization && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Specialization</span>
                <span className="text-white text-sm">{profile.specialization}</span>
              </div>
            )}
            {profile.medicalLicenseNo && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Medical License No.</span>
                <span className="text-white text-sm font-mono">{profile.medicalLicenseNo}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Member Since</span>
              <span className="text-white text-sm">
                {new Date(profile.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Receptionist-specific Info */}
      {isReceptionist && (
        <GlassCard>
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            Employee Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {profile.employeeId && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Employee ID</span>
                <span className="text-white text-sm font-mono">{profile.employeeId}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Member Since</span>
              <span className="text-white text-sm">
                {new Date(profile.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Account Settings */}
      <GlassCard>
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-4 h-4 text-gray-400" />
          Account Settings
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              <Bell className="w-4 h-4 text-gray-400" />
              <span className="text-white text-sm">Push Notifications</span>
            </div>
            <div className="w-12 h-6 bg-teal-500/20 rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 bg-teal-500 rounded-full" />
            </div>
          </div>
          <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-white text-sm">Email Notifications</span>
            </div>
            <div className="w-12 h-6 bg-teal-500/20 rounded-full relative cursor-pointer">
              <div className="absolute right-1 top-1 w-4 h-4 bg-teal-500 rounded-full" />
            </div>
          </div>
          <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-white text-sm">SMS Notifications</span>
            </div>
            <div className="w-12 h-6 bg-white/10 rounded-full relative cursor-pointer">
              <div className="absolute left-1 top-1 w-4 h-4 bg-gray-500 rounded-full" />
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setIsEditing(false);
          setSaveSuccess(false);
        }}
        title="Edit Profile"
        size="lg"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto">
          {saveSuccess && (
            <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm">Profile updated successfully!</span>
            </div>
          )}

          <Input
            label="Full Name"
            value={editForm.name || ''}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            leftIcon={<User className="w-4 h-4" />}
          />

          <Input
            label="Phone Number"
            value={editForm.phone || ''}
            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
            leftIcon={<Phone className="w-4 h-4" />}
          />

          {isPatient && (
            <>
              <Input
                label="Date of Birth"
                type="date"
                value={editForm.dateOfBirth || ''}
                onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                leftIcon={<Calendar className="w-4 h-4" />}
              />

              <Input
                label="Blood Type"
                value={editForm.bloodType || ''}
                onChange={(e) => setEditForm({ ...editForm, bloodType: e.target.value })}
                placeholder="e.g., A+, B-, O+"
                leftIcon={<Heart className="w-4 h-4" />}
              />

              <div>
                <label className="text-white text-sm font-medium mb-2 block">Address</label>
                <textarea
                  value={editForm.address || ''}
                  onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                  placeholder="Enter your address"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 resize-none min-h-[80px]"
                />
              </div>
            </>
          )}

          {isDoctor && (
            <>
              <Input
                label="Specialization"
                value={editForm.specialization || ''}
                onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })}
                placeholder="e.g., General Physician, Cardiologist"
                leftIcon={<Shield className="w-4 h-4" />}
              />

              <Input
                label="Medical License Number"
                value={editForm.medicalLicenseNo || ''}
                onChange={(e) => setEditForm({ ...editForm, medicalLicenseNo: e.target.value })}
                placeholder="Enter your license number"
                leftIcon={<FileText className="w-4 h-4" />}
              />
            </>
          )}

          {isReceptionist && (
            <Input
              label="Employee ID"
              value={editForm.employeeId || ''}
              onChange={(e) => setEditForm({ ...editForm, employeeId: e.target.value })}
              placeholder="Enter your employee ID"
              leftIcon={<Shield className="w-4 h-4" />}
            />
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => {
                setShowEditModal(false);
                setIsEditing(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
              onClick={handleSaveProfile}
            >
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProfileScreen;