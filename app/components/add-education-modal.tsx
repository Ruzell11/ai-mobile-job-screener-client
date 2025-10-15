// components/AddEducationModal.tsx
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

interface AddEducationModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: EducationData) => Promise<void>;
}

interface EducationData {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: Date;
  endDate: Date | null;
  grade: string;
  currentlyStudying: boolean;
}

export default function AddEducationModal({
  visible,
  onClose,
  onSave,
}: AddEducationModalProps) {
  const [formData, setFormData] = useState<EducationData>({
    institution: '',
    degree: '',
    fieldOfStudy: '',
    startDate: new Date(),
    endDate: null,
    grade: '',
    currentlyStudying: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof EducationData, string>>>({});
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EducationData, string>> = {};

    if (!formData.institution.trim()) {
      newErrors.institution = 'Institution name is required';
    }

    if (!formData.degree.trim()) {
      newErrors.degree = 'Degree is required';
    }

    if (!formData.fieldOfStudy.trim()) {
      newErrors.fieldOfStudy = 'Field of study is required';
    }

    if (!formData.currentlyStudying && !formData.endDate) {
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
      Alert.alert('Error', error.response?.data?.error || 'Failed to add education');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: new Date(),
      endDate: null,
      grade: '',
      currentlyStudying: false,
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
            <Text style={styles.modalTitle}>Add Education</Text>
            <TouchableOpacity onPress={handleCancel} disabled={isLoading}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Institution */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Institution <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.institution && styles.inputError]}
                value={formData.institution}
                onChangeText={(text) => {
                  setFormData({ ...formData, institution: text });
                  if (errors.institution) {
                    setErrors({ ...errors, institution: undefined });
                  }
                }}
                placeholder="e.g. Stanford University"
                editable={!isLoading}
              />
              {errors.institution && <Text style={styles.errorText}>{errors.institution}</Text>}
            </View>

            {/* Degree */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Degree <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.degree && styles.inputError]}
                value={formData.degree}
                onChangeText={(text) => {
                  setFormData({ ...formData, degree: text });
                  if (errors.degree) {
                    setErrors({ ...errors, degree: undefined });
                  }
                }}
                placeholder="e.g. Bachelor's Degree"
                editable={!isLoading}
              />
              {errors.degree && <Text style={styles.errorText}>{errors.degree}</Text>}
            </View>

            {/* Field of Study */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Field of Study <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.fieldOfStudy && styles.inputError]}
                value={formData.fieldOfStudy}
                onChangeText={(text) => {
                  setFormData({ ...formData, fieldOfStudy: text });
                  if (errors.fieldOfStudy) {
                    setErrors({ ...errors, fieldOfStudy: undefined });
                  }
                }}
                placeholder="e.g. Computer Science"
                editable={!isLoading}
              />
              {errors.fieldOfStudy && <Text style={styles.errorText}>{errors.fieldOfStudy}</Text>}
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

            {/* Currently Studying */}
            <View style={styles.switchContainer}>
              <View style={styles.switchLabelContainer}>
                <MaterialIcons name="school" size={20} color="#4A90E2" />
                <Text style={styles.switchLabel}>I currently study here</Text>
              </View>
              <Switch
                value={formData.currentlyStudying}
                onValueChange={(value) => {
                  setFormData({
                    ...formData,
                    currentlyStudying: value,
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
            {!formData.currentlyStudying && (
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
                  />
                )}
              </View>
            )}

            {/* Grade */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Grade / GPA (Optional)</Text>
              <TextInput
                style={styles.input}
                value={formData.grade}
                onChangeText={(text) => setFormData({ ...formData, grade: text })}
                placeholder="e.g. 3.8 GPA or First Class"
                editable={!isLoading}
              />
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
                <Text style={styles.saveButtonText}>Add Education</Text>
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