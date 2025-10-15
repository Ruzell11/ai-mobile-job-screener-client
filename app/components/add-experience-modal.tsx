// components/AddExperienceModal.tsx
import { MaterialIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface AddExperienceModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: ExperienceData) => Promise<void>;
}

interface ExperienceData {
  jobTitle: string;
  company: string;
  location: string;
  startDate: Date;
  endDate: Date | null;
  description: string;
  isCurrent: boolean;
}

export default function AddExperienceModal({
  visible,
  onClose,
  onSave,
}: AddExperienceModalProps) {
  const [formData, setFormData] = useState<ExperienceData>({
    jobTitle: '',
    company: '',
    location: '',
    startDate: new Date(),
    endDate: null,
    description: '',
    isCurrent: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ExperienceData, string>>>({});
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ExperienceData, string>> = {};

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = 'Job title is required';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.isCurrent && !formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (formData.endDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave(formData);
      resetForm();
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to add experience');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      jobTitle: '',
      company: '',
      location: '',
      startDate: new Date(),
      endDate: null,
      description: '',
      isCurrent: false,
    });
    setErrors({});
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const formatDate = (date: Date | null): string => {
    if (!date) return 'Select date';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Experience</Text>
            <TouchableOpacity onPress={handleCancel} disabled={isLoading}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Job Title */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Job Title <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.jobTitle && styles.inputError]}
                value={formData.jobTitle}
                onChangeText={(text) => {
                  setFormData({ ...formData, jobTitle: text });
                  if (errors.jobTitle) {
                    setErrors({ ...errors, jobTitle: undefined });
                  }
                }}
                placeholder="e.g. Software Engineer"
                editable={!isLoading}
              />
              {errors.jobTitle && <Text style={styles.errorText}>{errors.jobTitle}</Text>}
            </View>

            {/* Company */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Company <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.company && styles.inputError]}
                value={formData.company}
                onChangeText={(text) => {
                  setFormData({ ...formData, company: text });
                  if (errors.company) {
                    setErrors({ ...errors, company: undefined });
                  }
                }}
                placeholder="e.g. Tech Corp"
                editable={!isLoading}
              />
              {errors.company && <Text style={styles.errorText}>{errors.company}</Text>}
            </View>

            {/* Location */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Location <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.location && styles.inputError]}
                value={formData.location}
                onChangeText={(text) => {
                  setFormData({ ...formData, location: text });
                  if (errors.location) {
                    setErrors({ ...errors, location: undefined });
                  }
                }}
                placeholder="e.g. San Francisco, CA"
                editable={!isLoading}
              />
              {errors.location && <Text style={styles.errorText}>{errors.location}</Text>}
            </View>

            {/* Start Date */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Start Date <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowStartDatePicker(true)}
                disabled={isLoading}
              >
                <Text style={styles.dateText}>{formatDate(formData.startDate)}</Text>
                <MaterialIcons name="calendar-today" size={20} color="#666" />
              </TouchableOpacity>
              {showStartDatePicker && (
                <DateTimePicker
                  value={formData.startDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    setShowStartDatePicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      setFormData({ ...formData, startDate: selectedDate });
                    }
                  }}
                  maximumDate={new Date()}
                />
              )}
            </View>

            {/* Currently Working */}
            <View style={styles.switchContainer}>
              <View style={styles.switchLabelContainer}>
                <MaterialIcons name="work" size={20} color="#4A90E2" />
                <Text style={styles.switchLabel}>I currently work here</Text>
              </View>
              <Switch
                value={formData.isCurrent}
                onValueChange={(value) => {
                  setFormData({
                    ...formData,
                    isCurrent: value,
                    endDate: value ? null : formData.endDate || new Date(),
                  });
                  if (value && errors.endDate) {
                    setErrors({ ...errors, endDate: undefined });
                  }
                }}
                trackColor={{ false: '#ddd', true: '#4A90E2' }}
                thumbColor="#fff"
                disabled={isLoading}
              />
            </View>

            {/* End Date */}
            {!formData.isCurrent && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  End Date <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity
                  style={[styles.dateInput, errors.endDate && styles.inputError]}
                  onPress={() => setShowEndDatePicker(true)}
                  disabled={isLoading}
                >
                  <Text style={styles.dateText}>{formatDate(formData.endDate)}</Text>
                  <MaterialIcons name="calendar-today" size={20} color="#666" />
                </TouchableOpacity>
                {errors.endDate && <Text style={styles.errorText}>{errors.endDate}</Text>}
                {showEndDatePicker && (
                  <DateTimePicker
                    value={formData.endDate || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event, selectedDate) => {
                      setShowEndDatePicker(Platform.OS === 'ios');
                      if (selectedDate) {
                        setFormData({ ...formData, endDate: selectedDate });
                      }
                    }}
                    minimumDate={formData.startDate}
                    maximumDate={new Date()}
                  />
                )}
              </View>
            )}

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                placeholder="Describe your responsibilities and achievements..."
                multiline
                numberOfLines={5}
                textAlignVertical="top"
                editable={!isLoading}
              />
              <Text style={styles.charCount}>{formData.description?.length} / 1000</Text>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>Add Experience</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  required: {
    color: '#F44336',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#F44336',
  },
  textArea: {
    height: 120,
    paddingTop: 12,
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  switchLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    textAlign: 'right',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#4A90E2',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});