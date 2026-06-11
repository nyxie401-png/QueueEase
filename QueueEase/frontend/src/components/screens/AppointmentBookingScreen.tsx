import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Search,
  ChevronRight,
  MapPin,
  Star,
  Stethoscope,
  User,
  Phone,
  FileText,
  CheckCircle,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { EmptyState } from '../ui/EmptyState';
import { apiPost, apiGet } from '../../services/api';
import { isValidImageUrl } from '../../utils/helpers';

interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  avatar?: string;
  rating?: number;
  nextAvailable?: string;
}

interface Clinic {
  _id: string;
  name: string;
  address: string;
  doctors: Doctor[];
  services: string[];
}

interface TimeSlot {
  time: string;
  available: boolean;
  doctorId?: string;
}

type Step = 'clinic' | 'doctor' | 'datetime' | 'confirm';

const AppointmentBookingScreen: React.FC = () => {
  const [step, setStep] = useState<Step>('clinic');
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<'consultation' | 'follow-up' | 'emergency'>('consultation');
  const [reason, setReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [booked, setBooked] = useState(false);
  const [error, setError] = useState('');
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    setIsLoading(true);
    try {
      const data = await apiGet<any>('/clinics');
      setClinics(data.data?.clinics || []);
    } catch (err) {
      setError('Failed to load clinics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedClinic && selectedDoctor && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDate, selectedDoctor]);

  const fetchAvailableSlots = async () => {
    if (!selectedDoctor || !selectedDate) return;
    try {
      const data = await apiGet<any>(
        `/availability/${selectedDoctor._id}?date=${selectedDate}`
      );
      setAvailableSlots(data.data?.slots || generateDefaultSlots());
    } catch {
      setAvailableSlots(generateDefaultSlots());
    }
  };

  const generateDefaultSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (const min of ['00', '30']) {
        const time = `${hour.toString().padStart(2, '0')}:${min}`;
        slots.push({
          time,
          available: Math.random() > 0.3,
          doctorId: selectedDoctor?._id,
        });
      }
    }
    return slots;
  };

  const handleBooking = async () => {
    if (!selectedClinic || !selectedDoctor || !selectedDate || !selectedTime) return;
    setIsBooking(true);
    setError('');
    try {
      await apiPost('/appointments', {
        clinicId: selectedClinic._id,
        doctorId: selectedDoctor._id,
        date: selectedDate,
        timeSlot: { start: selectedTime, end: addMinutes(selectedTime, 30) },
        type: appointmentType,
        reason,
      });
      setBooked(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to book appointment');
    } finally {
      setIsBooking(false);
    }
  };

  const addMinutes = (time: string, minutes: number): string => {
    const [h, m] = time.split(':').map(Number);
    const total = h * 60 + m + minutes;
    return `${Math.floor(total / 60).toString().padStart(2, '0')}:${(total % 60).toString().padStart(2, '0')}`;
  };

  const getNext7Days = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: date.getDate(),
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        isToday: i === 0,
      });
    }
    return days;
  };

  const filteredClinics = clinics.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Booking success screen
  if (booked) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-10 h-10 text-green-400" />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">Appointment Booked!</h2>
          <p className="text-gray-400 mb-4">Your appointment has been confirmed</p>
          <GlassCard variant="light" className="text-left mb-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Doctor</span>
                <span className="text-white text-sm font-medium">{selectedDoctor?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Clinic</span>
                <span className="text-white text-sm font-medium">{selectedClinic?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Date</span>
                <span className="text-white text-sm font-medium">{selectedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Time</span>
                <span className="text-white text-sm font-medium">{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Type</span>
                <Badge variant="info">{appointmentType}</Badge>
              </div>
            </div>
          </GlassCard>
          <div className="flex gap-3">
            <Button variant="primary" className="flex-1" onClick={() => {
              setBooked(false);
              setStep('clinic');
              setSelectedClinic(null);
              setSelectedDoctor(null);
              setSelectedDate('');
              setSelectedTime('');
              setReason('');
            }}>
              Book Another
            </Button>
            <Button variant="ghost" className="flex-1">
              View Appointments
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {(['clinic', 'doctor', 'datetime', 'confirm'] as Step[]).map((s, i) => (
        <React.Fragment key={s}>
          <div className={`flex items-center gap-1 ${
            step === s ? 'text-teal-400' : i < ['clinic', 'doctor', 'datetime', 'confirm'].indexOf(step) ? 'text-green-400' : 'text-gray-600'
          }`}>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step === s ? 'bg-teal-500/20 border border-teal-500/50' :
              i < ['clinic', 'doctor', 'datetime', 'confirm'].indexOf(step) ? 'bg-green-500/20 border border-green-500/50' :
              'bg-white/5 border border-white/10'
            }`}>
              {i + 1}
            </div>
            <span className="text-xs hidden sm:inline capitalize">{s}</span>
          </div>
          {i < 3 && <ChevronRight className="w-4 h-4 text-gray-600" />}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        {step !== 'clinic' && (
          <button
            onClick={() => {
              if (step === 'doctor') setStep('clinic');
              else if (step === 'datetime') setStep('doctor');
              else if (step === 'confirm') setStep('datetime');
            }}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-white">Book Appointment</h1>
          <p className="text-gray-400 text-sm mt-1">Schedule your visit in a few steps</p>
        </div>
      </div>

      {renderStepIndicator()}

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      {/* Step 1: Select Clinic */}
      {step === 'clinic' && (
        <div className="space-y-4">
          <Input
            placeholder="Search clinics by name or area..."
            leftIcon={<Search className="w-4 h-4" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {isLoading ? (
            <div className="flex justify-center py-12"><LoadingSpinner size="lg" /></div>
          ) : filteredClinics.length === 0 ? (
            <EmptyState
              icon={<MapPin className="w-12 h-12" />}
              title="No clinics found"
              description="Try a different search term"
            />
          ) : (
            <div className="space-y-3">
              {filteredClinics.map((clinic) => (
                <motion.div
                  key={clinic._id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <GlassCard
                    className="cursor-pointer hover:border-teal-500/30 transition-colors"
                    onClick={() => {
                      setSelectedClinic(clinic);
                      setStep('doctor');
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center">
                          <MapPin className="w-6 h-6 text-teal-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{clinic.name}</h3>
                          <p className="text-gray-400 text-sm">{clinic.address}</p>
                          <div className="flex gap-1 mt-1">
                            {clinic.services?.slice(0, 3).map((s, i) => (
                              <span key={i} className="text-xs px-2 py-0.5 bg-white/5 rounded-full text-gray-400">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Select Doctor */}
      {step === 'doctor' && selectedClinic && (
        <div className="space-y-4">
          <div className="text-sm text-gray-400 mb-2">
            <MapPin className="w-3 h-3 inline mr-1" />
            {selectedClinic.name}
          </div>
          {selectedClinic.doctors?.length === 0 ? (
            <EmptyState
              icon={<Stethoscope className="w-12 h-12" />}
              title="No doctors available"
              description="This clinic has no registered doctors yet"
            />
          ) : (
            <div className="space-y-3">
              {(selectedClinic.doctors || []).map((doctor) => (
                <motion.div
                  key={doctor._id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <GlassCard
                    className={`cursor-pointer transition-all ${
                      selectedDoctor?._id === doctor._id
                        ? 'border-teal-500/50 ring-1 ring-teal-500/20'
                        : 'hover:border-teal-500/30'
                    }`}
                    onClick={() => {
                      setSelectedDoctor(doctor);
                      setStep('datetime');
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-cyan-500/10 flex items-center justify-center">
                        {doctor.avatar && isValidImageUrl(doctor.avatar) ? (
                          <img src={doctor.avatar} alt={doctor.name} className="w-12 h-12 rounded-full" />
                        ) : (
                          <User className="w-6 h-6 text-cyan-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-medium">Dr. {doctor.name}</h3>
                        <p className="text-teal-400 text-sm">{doctor.specialization}</p>
                        {doctor.rating && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                            <span className="text-yellow-400 text-xs">{doctor.rating}</span>
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 3: Select Date & Time */}
      {step === 'datetime' && selectedDoctor && (
        <div className="space-y-6">
          <div className="text-sm text-gray-400">
            <Stethoscope className="w-3 h-3 inline mr-1" />
            Dr. {selectedDoctor.name} — {selectedDoctor.specialization}
          </div>

          {/* Date Selection */}
          <div>
            <h3 className="text-white font-medium mb-3">Select Date</h3>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {getNext7Days().map((day) => (
                <button
                  key={day.date}
                  onClick={() => setSelectedDate(day.date)}
                  className={`flex flex-col items-center px-4 py-3 rounded-xl min-w-[72px] transition-all min-h-[48px] ${
                    selectedDate === day.date
                      ? 'bg-teal-500/20 border border-teal-500/50 text-teal-400'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  <span className="text-xs">{day.dayName}</span>
                  <span className="text-lg font-bold">{day.dayNum}</span>
                  <span className="text-xs">{day.month}</span>
                  {day.isToday && <span className="text-[10px] text-teal-400 mt-1">Today</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Time Slots */}
          {selectedDate && (
            <div>
              <h3 className="text-white font-medium mb-3">Select Time</h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.time}
                    disabled={!slot.available}
                    onClick={() => slot.available && setSelectedTime(slot.time)}
                    className={`py-3 px-2 rounded-lg text-sm font-medium transition-all min-h-[48px] ${
                      !slot.available
                        ? 'bg-white/5 text-gray-600 cursor-not-allowed line-through'
                        : selectedTime === slot.time
                        ? 'bg-teal-500/20 border border-teal-500/50 text-teal-400'
                        : 'bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {slot.time}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Appointment Type */}
          <div>
            <h3 className="text-white font-medium mb-3">Appointment Type</h3>
            <div className="grid grid-cols-3 gap-2">
              {(['consultation', 'follow-up', 'emergency'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setAppointmentType(type)}
                  className={`py-3 px-2 rounded-xl text-sm font-medium transition-all min-h-[48px] ${
                    appointmentType === type
                      ? type === 'emergency'
                        ? 'bg-red-500/20 border border-red-500/50 text-red-400'
                        : 'bg-teal-500/20 border border-teal-500/50 text-teal-400'
                      : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {type === 'consultation' ? '🩺 Consultation' : type === 'follow-up' ? '🔄 Follow-up' : '🚨 Emergency'}
                </button>
              ))}
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="text-white text-sm font-medium mb-2 block">Reason (Optional)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Brief description of your concern..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-teal-500/50 focus:ring-1 focus:ring-teal-500/20 resize-none min-h-[100px]"
            />
          </div>

          <Button
            variant="primary"
            className="w-full"
            disabled={!selectedDate || !selectedTime}
            onClick={() => setStep('confirm')}
          >
            Continue to Confirm
          </Button>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === 'confirm' && selectedDoctor && selectedClinic && (
        <div className="space-y-6">
          <GlassCard variant="neon">
            <h3 className="text-white font-semibold mb-4">Appointment Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <div className="text-white font-medium">Dr. {selectedDoctor.name}</div>
                  <div className="text-gray-400 text-sm">{selectedDoctor.specialization}</div>
                </div>
              </div>
              <div className="border-t border-white/5 pt-3 space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-400">{selectedClinic.name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-400">{selectedDate}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-400">{selectedTime} — {addMinutes(selectedTime, 30)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <FileText className="w-4 h-4 text-gray-500" />
                  <Badge variant={appointmentType === 'emergency' ? 'emergency' : 'info'}>
                    {appointmentType}
                  </Badge>
                </div>
              </div>
              {reason && (
                <div className="border-t border-white/5 pt-3">
                  <div className="text-gray-400 text-xs mb-1">Reason</div>
                  <p className="text-gray-300 text-sm">{reason}</p>
                </div>
              )}
            </div>
          </GlassCard>

          <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <p className="text-yellow-400 text-sm">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              Please arrive 10 minutes before your appointment time. You will be automatically added to the queue upon check-in.
            </p>
          </div>

          <Button
            variant="primary"
            className="w-full"
            isLoading={isBooking}
            onClick={handleBooking}
          >
            Confirm Booking
          </Button>
        </div>
      )}
    </div>
  );
};

export default AppointmentBookingScreen;
