import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { employerAPI, jobAPI } from '../config/api';
import { EmploymentType, ExperienceLevel } from '../types';

interface JobFormData {
  title: string;
  description: string;
  requirements: string;
  responsibilities: string;
  location: string;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  salaryMin: string;
  salaryMax: string;
  isRemote: boolean;
  isActive: boolean;
  skills: string[];
}

export default function EditJobScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const jobId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    location: '',
    employmentType: EmploymentType.FULL_TIME,
    experienceLevel: ExperienceLevel.INTERMEDIATE,
    salaryMin: '',
    salaryMax: '',
    isRemote: false,
    isActive: true,
    skills: [],
  });

  useEffect(() => {
    loadJob();
  }, []);

  const loadJob = async () => {
    try {
      const response = await jobAPI.getJobById(jobId);
      console.log('📥 Job data:', response.data);

      const job = response.data?.job || response.data?.data?.job;

      if (job) {
        setFormData({
          title: job.title || '',
          description: job.description || '',
          requirements: job.requirements || '',
          responsibilities: job.responsibilities || '',
          location: job.location || '',
          employmentType: job.employmentType || EmploymentType.FULL_TIME,
          experienceLevel: job.experienceLevel || ExperienceLevel.INTERMEDIATE,
          salaryMin: job.salaryMin ? job.salaryMin.toString() : '',
          salaryMax: job.salaryMax ? job.salaryMax.toString() : '',
          isRemote: job.isRemote || false,
          isActive: job.isActive !== undefined ? job.isActive : true,
          skills: job.skills?.map((s: any) => s.skill?.name || s) || [],
        });
      }
    } catch (error: any) {
      console.error('Error loading job:', error);
      Alert.alert('Error', 'Failed to load job details');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (key: keyof JobFormData, value: any) => {
    setFormData({ ...formData, [key]: value });
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()],
      });
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    });
  };

  const validateForm = (): string | null => {
    if (!formData.title.trim()) return 'Job title is required';
    if (!formData.description.trim()) return 'Job description is required';
    if (!formData.requirements.trim()) return 'Requirements are required';
    if (!formData.responsibilities.trim()) return 'Responsibilities are required';
    if (!formData.location.trim()) return 'Location is required';
    
    if (formData.salaryMin && formData.salaryMax) {
      const min = parseFloat(formData.salaryMin);
      const max = parseFloat(formData.salaryMax);
      if (min >= max) return 'Maximum salary must be greater than minimum salary';
    }

    if (formData.skills.length === 0) return 'Please add at least one required skill';

    return null;
  };

  const handleSave = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    setIsSaving(true);

    try {
      const jobData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        requirements: formData.requirements.trim(),
        responsibilities: formData.responsibilities.trim(),
        location: formData.location.trim(),
        employmentType: formData.employmentType,
        experienceLevel: formData.experienceLevel,
        salaryMin: formData.salaryMin ? parseFloat(formData.salaryMin) : null,
        salaryMax: formData.salaryMax ? parseFloat(formData.salaryMax) : null,
        isRemote: formData.isRemote,
        isActive: formData.isActive,
        skills: formData.skills,
      };

      console.log('📝 Updating job:', jobData);

      await employerAPI.updateJob(jobId, jobData);

      Alert.alert('Success', 'Job updated successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error('❌ Error updating job:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to update job. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading job details...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Job</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Job Status Toggle */}
        <View style={styles.statusSection}>
          <View style={styles.statusInfo}>
            <Text style={styles.statusLabel}>Job Status</Text>
            <Text style={styles.statusDescription}>
              {formData.isActive ? 'Visible to candidates' : 'Hidden from candidates'}
            </Text>
          </View>
          <Switch
            value={formData.isActive}
            onValueChange={(value) => updateFormData('isActive', value)}
            disabled={isSaving}
            trackColor={{ false: '#ccc', true: '#4A90E2' }}
            thumbColor="#fff"
          />
        </View>

        {/* Job Title */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Job Title <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Senior Software Engineer"
            value={formData.title}
            onChangeText={(value) => updateFormData('title', value)}
            editable={!isSaving}
          />
        </View>

        {/* Employment Type */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Employment Type <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.buttonGroup}>
            {Object.values(EmploymentType).map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.optionButton,
                  formData.employmentType === type && styles.optionButtonActive,
                ]}
                onPress={() => updateFormData('employmentType', type)}
                disabled={isSaving}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    formData.employmentType === type && styles.optionButtonTextActive,
                  ]}
                >
                  {type.replace(/_/g, ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Experience Level */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Experience Level <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.buttonGroup}>
            {Object.values(ExperienceLevel).map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.optionButton,
                  formData.experienceLevel === level && styles.optionButtonActive,
                ]}
                onPress={() => updateFormData('experienceLevel', level)}
                disabled={isSaving}
              >
                <Text
                  style={[
                    styles.optionButtonText,
                    formData.experienceLevel === level && styles.optionButtonTextActive,
                  ]}
                >
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Location & Remote */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Location <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. San Francisco, CA"
            value={formData.location}
            onChangeText={(value) => updateFormData('location', value)}
            editable={!isSaving}
          />
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Remote Work Available</Text>
            <Switch
              value={formData.isRemote}
              onValueChange={(value) => updateFormData('isRemote', value)}
              disabled={isSaving}
              trackColor={{ false: '#ccc', true: '#4A90E2' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Salary Range */}
        <View style={styles.section}>
          <Text style={styles.label}>Salary Range (Optional)</Text>
          <View style={styles.salaryContainer}>
            <View style={styles.salaryInput}>
              <Text style={styles.salaryPrefix}>$</Text>
              <TextInput
                style={styles.salaryField}
                placeholder="Min"
                value={formData.salaryMin}
                onChangeText={(value) => updateFormData('salaryMin', value)}
                keyboardType="numeric"
                editable={!isSaving}
              />
            </View>
            <Text style={styles.salaryDivider}>to</Text>
            <View style={styles.salaryInput}>
              <Text style={styles.salaryPrefix}>$</Text>
              <TextInput
                style={styles.salaryField}
                placeholder="Max"
                value={formData.salaryMax}
                onChangeText={(value) => updateFormData('salaryMax', value)}
                keyboardType="numeric"
                editable={!isSaving}
              />
            </View>
          </View>
        </View>

        {/* Job Description */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Job Description <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the role, company culture, and what makes this opportunity unique..."
            value={formData.description}
            onChangeText={(value) => updateFormData('description', value)}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            editable={!isSaving}
          />
        </View>

        {/* Requirements */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Requirements <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="List the required qualifications, education, and experience..."
            value={formData.requirements}
            onChangeText={(value) => updateFormData('requirements', value)}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            editable={!isSaving}
          />
        </View>

        {/* Responsibilities */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Responsibilities <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the day-to-day responsibilities and expectations..."
            value={formData.responsibilities}
            onChangeText={(value) => updateFormData('responsibilities', value)}
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            editable={!isSaving}
          />
        </View>

        {/* Skills */}
        <View style={styles.section}>
          <Text style={styles.label}>
            Required Skills <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.skillInputContainer}>
            <TextInput
              style={styles.skillInput}
              placeholder="Add a skill (e.g. React, Python)"
              value={skillInput}
              onChangeText={setSkillInput}
              onSubmitEditing={addSkill}
              editable={!isSaving}
            />
            <TouchableOpacity
              style={styles.addSkillButton}
              onPress={addSkill}
              disabled={isSaving || !skillInput.trim()}
            >
              <MaterialIcons name="add" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {formData.skills.length > 0 && (
            <View style={styles.skillsContainer}>
              {formData.skills.map((skill, index) => (
                <View key={index} style={styles.skillChip}>
                  <Text style={styles.skillChipText}>{skill}</Text>
                  <TouchableOpacity
                    onPress={() => removeSkill(skill)}
                    disabled={isSaving}
                    style={styles.removeSkillButton}
                  >
                    <MaterialIcons name="close" size={18} color="#4A90E2" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <MaterialIcons name="check" size={24} color="#fff" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => {
              Alert.alert(
                'Discard Changes?',
                'Are you sure you want to discard your changes?',
                [
                  { text: 'Keep Editing', style: 'cancel' },
                  { text: 'Discard', style: 'destructive', onPress: () => router.back() },
                ]
              );
            }}
            disabled={isSaving}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  statusSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 24,
    backgroundColor: '#f0f8ff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4A90E2',
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
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
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  optionButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  optionButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  optionButtonTextActive: {
    color: '#fff',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  salaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  salaryInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  salaryPrefix: {
    fontSize: 16,
    color: '#666',
    marginRight: 8,
  },
  salaryField: {
    flex: 1,
    fontSize: 16,
  },
  salaryDivider: {
    fontSize: 16,
    color: '#666',
  },
  skillInputContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  skillInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  addSkillButton: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 20,
    paddingVertical: 8,
    paddingLeft: 16,
    paddingRight: 12,
    gap: 8,
  },
  skillChipText: {
    fontSize: 14,
    color: '#1976D2',
    fontWeight: '500',
  },
  removeSkillButton: {
    padding: 2,
  },
  buttonContainer: {
    marginTop: 24,
    gap: 12,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});