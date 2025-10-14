import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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
import { employerAPI } from '../config/api';
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
  skills: string[];
}

export default function CreateJobScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
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
    skills: [],
  });

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

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    setIsLoading(true);

    try {
      const jobData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        requirements: formData.requirements.trim(),
        responsibilities: formData.responsibilities.trim(),
        location: formData.location.trim(),
        employmentType: formData.employmentType,
        experienceLevel: formData.experienceLevel,
        salaryMin: formData.salaryMin ? parseFloat(formData.salaryMin) : undefined,
        salaryMax: formData.salaryMax ? parseFloat(formData.salaryMax) : undefined,
        isRemote: formData.isRemote,
        isActive: true,
        skills: formData.skills,
      };

      console.log('📝 Creating job:', jobData);

      const response = await employerAPI.createJob(jobData);

      console.log('✅ Job created:', response.data);

      Alert.alert('Success', 'Job posted successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      console.error('❌ Error creating job:', error);
      Alert.alert(
        'Error',
        error.response?.data?.error || 'Failed to post job. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post New Job</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
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
            editable={!isLoading}
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
                disabled={isLoading}
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
                disabled={isLoading}
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
            editable={!isLoading}
          />
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Remote Work Available</Text>
            <Switch
              value={formData.isRemote}
              onValueChange={(value) => updateFormData('isRemote', value)}
              disabled={isLoading}
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
                editable={!isLoading}
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
                editable={!isLoading}
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
            editable={!isLoading}
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
            editable={!isLoading}
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
            editable={!isLoading}
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
              editable={!isLoading}
            />
            <TouchableOpacity
              style={styles.addSkillButton}
              onPress={addSkill}
              disabled={isLoading || !skillInput.trim()}
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
                    disabled={isLoading}
                    style={styles.removeSkillButton}
                  >
                    <MaterialIcons name="close" size={18} color="#4A90E2" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Submit Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <MaterialIcons name="check-circle" size={24} color="#fff" />
                <Text style={styles.submitButtonText}>Post Job</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={isLoading}
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
  submitButton: {
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
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
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