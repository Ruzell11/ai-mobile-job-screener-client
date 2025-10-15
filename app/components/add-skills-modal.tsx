// components/AddSkillModal.tsx
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface AddSkillModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (data: SkillData) => Promise<void>;
}

interface SkillData {
  skillName: string;
  proficiency: number;
  yearsOfExp: number;
}

const PROFICIENCY_LEVELS = [
  { level: 1, label: 'Beginner', color: '#F44336', description: 'Just starting out' },
  { level: 2, label: 'Intermediate', color: '#FF9800', description: 'Some experience' },
  { level: 3, label: 'Advanced', color: '#2196F3', description: 'Proficient' },
  { level: 4, label: 'Expert', color: '#4CAF50', description: 'Highly skilled' },
  { level: 5, label: 'Master', color: '#9C27B0', description: 'Industry expert' },
];

export default function AddSkillModal({ visible, onClose, onSave }: AddSkillModalProps) {
  const [formData, setFormData] = useState<SkillData>({
    skillName: '',
    proficiency: 3,
    yearsOfExp: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof SkillData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof SkillData, string>> = {};

    if (!formData.skillName.trim()) {
      newErrors.skillName = 'Skill name is required';
    }

    if (formData.yearsOfExp < 0 || formData.yearsOfExp > 50) {
      newErrors.yearsOfExp = 'Please enter valid years of experience (0-50)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSave({
        ...formData,
        skillName: formData.skillName.trim(),
      });
      resetForm();
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to add skill');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      skillName: '',
      proficiency: 3,
      yearsOfExp: 1,
    });
    setErrors({});
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const selectedProficiency = PROFICIENCY_LEVELS.find((p) => p.level === formData.proficiency);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Skill</Text>
            <TouchableOpacity onPress={handleCancel} disabled={isLoading}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Skill Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Skill Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, errors.skillName && styles.inputError]}
                value={formData.skillName}
                onChangeText={(text) => {
                  setFormData({ ...formData, skillName: text });
                  if (errors.skillName) {
                    setErrors({ ...errors, skillName: undefined });
                  }
                }}
                placeholder="e.g. JavaScript, Project Management, Photoshop"
                editable={!isLoading}
                autoFocus
              />
              {errors.skillName && <Text style={styles.errorText}>{errors.skillName}</Text>}
            </View>

            {/* Proficiency Level */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Proficiency Level <Text style={styles.required}>*</Text>
              </Text>
              <Text style={styles.helperText}>Select your skill level</Text>

              <View style={styles.proficiencyContainer}>
                {PROFICIENCY_LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level.level}
                    style={[
                      styles.proficiencyCard,
                      formData.proficiency === level.level && styles.proficiencyCardSelected,
                      formData.proficiency === level.level && {
                        borderColor: level.color,
                        backgroundColor: level.color + '10',
                      },
                    ]}
                    onPress={() => setFormData({ ...formData, proficiency: level.level })}
                    disabled={isLoading}
                  >
                    <View style={styles.proficiencyHeader}>
                      <View
                        style={[
                          styles.proficiencyDot,
                          {
                            backgroundColor:
                              formData.proficiency === level.level ? level.color : '#ddd',
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.proficiencyLabel,
                          formData.proficiency === level.level && { color: level.color },
                        ]}
                      >
                        {level.label}
                      </Text>
                    </View>
                    <Text style={styles.proficiencyDescription}>{level.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {selectedProficiency && (
                <View
                  style={[
                    styles.selectedBadge,
                    { backgroundColor: selectedProficiency.color + '20' },
                  ]}
                >
                  <MaterialIcons
                    name="check-circle"
                    size={16}
                    color={selectedProficiency.color}
                  />
                  <Text style={[styles.selectedText, { color: selectedProficiency.color }]}>
                    {selectedProficiency.label} selected
                  </Text>
                </View>
              )}
            </View>

            {/* Years of Experience */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Years of Experience <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.yearsInputContainer}>
                <TouchableOpacity
                  style={styles.yearsButton}
                  onPress={() =>
                    setFormData({
                      ...formData,
                      yearsOfExp: Math.max(0, formData.yearsOfExp - 1),
                    })
                  }
                  disabled={isLoading || formData.yearsOfExp <= 0}
                >
                  <MaterialIcons name="remove" size={24} color="#4A90E2" />
                </TouchableOpacity>

                <TextInput
                  style={[styles.yearsInput, errors.yearsOfExp && styles.inputError]}
                  value={formData.yearsOfExp.toString()}
                  onChangeText={(text) => {
                    const years = parseInt(text) || 0;
                    setFormData({ ...formData, yearsOfExp: years });
                    if (errors.yearsOfExp) {
                      setErrors({ ...errors, yearsOfExp: undefined });
                    }
                  }}
                  keyboardType="numeric"
                  editable={!isLoading}
                />

                <TouchableOpacity
                  style={styles.yearsButton}
                  onPress={() =>
                    setFormData({
                      ...formData,
                      yearsOfExp: Math.min(50, formData.yearsOfExp + 1),
                    })
                  }
                  disabled={isLoading || formData.yearsOfExp >= 50}
                >
                  <MaterialIcons name="add" size={24} color="#4A90E2" />
                </TouchableOpacity>
              </View>
              {errors.yearsOfExp && <Text style={styles.errorText}>{errors.yearsOfExp}</Text>}
              <Text style={styles.helperText}>
                {formData.yearsOfExp === 0
                  ? 'No experience yet'
                  : formData.yearsOfExp === 1
                  ? '1 year of experience'
                  : `${formData.yearsOfExp} years of experience`}
              </Text>
            </View>

            {/* Preview Card */}
            {formData.skillName.trim() && (
              <View style={styles.previewSection}>
                <Text style={styles.previewTitle}>Preview</Text>
                <View style={styles.previewCard}>
                  <View style={styles.previewHeader}>
                    <Text style={styles.previewSkillName}>{formData.skillName}</Text>
                  </View>
                  <View style={styles.previewDetails}>
                    <View
                      style={[
                        styles.previewBadge,
                        {
                          backgroundColor:
                            (selectedProficiency?.color || '#666') + '20',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.previewBadgeText,
                          { color: selectedProficiency?.color || '#666' },
                        ]}
                      >
                        {selectedProficiency?.label || 'Advanced'}
                      </Text>
                    </View>
                    <Text style={styles.previewYears}>{formData.yearsOfExp} years</Text>
                  </View>
                </View>
              </View>
            )}
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
              style={[
                styles.button,
                styles.saveButton,
                !formData.skillName.trim() && styles.saveButtonDisabled,
              ]}
              onPress={handleSave}
              disabled={isLoading || !formData.skillName.trim()}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <MaterialIcons name="add" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>Add Skill</Text>
                </>
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
    marginBottom: 24,
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
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
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
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
  },
  proficiencyContainer: {
    gap: 12,
    marginTop: 12,
  },
  proficiencyCard: {
    borderWidth: 2,
    borderColor: '#f0f0f0',
    borderRadius: 12,
    padding: 12,
    backgroundColor: '#fff',
  },
  proficiencyCardSelected: {
    borderWidth: 2,
  },
  proficiencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  proficiencyDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  proficiencyLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  proficiencyDescription: {
    fontSize: 12,
    color: '#666',
    marginLeft: 20,
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  selectedText: {
    fontSize: 14,
    fontWeight: '600',
  },
  yearsInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  yearsButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  yearsInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    backgroundColor: '#fff',
  },
  previewSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  previewCard: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  previewHeader: {
    marginBottom: 8,
  },
  previewSkillName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  previewDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  previewBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  previewBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  previewYears: {
    fontSize: 12,
    color: '#666',
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
    flexDirection: 'row',
    gap: 8,
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
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});