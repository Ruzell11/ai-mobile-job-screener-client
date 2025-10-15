// components/JobFiltersModal.tsx
import { MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { EmploymentType, ExperienceLevel, JobFilters } from '../types';

interface JobFiltersModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: JobFilters) => void;
  initialFilters: JobFilters;
}

const JOB_TYPES = [
  { value: EmploymentType.FULL_TIME, label: 'Full Time', icon: 'work' },
  { value: EmploymentType.PART_TIME, label: 'Part Time', icon: 'access-time' },
  { value: EmploymentType.CONTRACT, label: 'Contract', icon: 'description' },
  { value: EmploymentType.INTERNSHIP, label: 'Internship', icon: 'school' },
  { value: EmploymentType.FREELANCE, label: 'Freelance', icon: 'laptop' },
];

const EXPERIENCE_LEVELS = [
  { value: ExperienceLevel.ENTRY, label: 'Entry Level', icon: 'trending-up' },
  { value: ExperienceLevel.INTERMEDIATE, label: 'Intermediate', icon: 'show-chart' },
  { value: ExperienceLevel.SENIOR, label: 'Senior', icon: 'bar-chart' },
  { value: ExperienceLevel.LEAD, label: 'Lead', icon: 'stars' },
  { value: ExperienceLevel.EXECUTIVE, label: 'Executive', icon: 'business-center' },
];

const SALARY_RANGES = [
  { min: 0, max: 50000, label: 'Up to $50K' },
  { min: 50000, max: 75000, label: '$50K - $75K' },
  { min: 75000, max: 100000, label: '$75K - $100K' },
  { min: 100000, max: 150000, label: '$100K - $150K' },
  { min: 150000, max: null, label: '$150K+' },
];

export default function JobFiltersModal({
  visible,
  onClose,
  onApply,
  initialFilters,
}: JobFiltersModalProps) {
  const [filters, setFilters] = useState<JobFilters>(initialFilters);

  const handleApply = () => {
    onApply(filters);
  };

  const handleReset = () => {
    setFilters({
      page: 1,
      limit: 10,
    });
  };

  const toggleJobType = (type: EmploymentType) => {
    setFilters({
      ...filters,
      employmentType: filters.employmentType === type ? undefined : type,
    });
  };

  const toggleExperienceLevel = (level: ExperienceLevel) => {
    setFilters({
      ...filters,
      experienceLevel: filters.experienceLevel === level ? undefined : level,
    });
  };

  const setSalaryRange = (min: number | null, max: number | null) => {
    setFilters({
      ...filters,
      salaryMin: min || undefined,
      salaryMax: max || undefined,
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.location) count++;
    if (filters.employmentType) count++;
    if (filters.experienceLevel) count++;
    if (filters.salaryMin || filters.salaryMax) count++;
    if (filters.isRemote) count++;
    return count;
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={styles.headerLeft}>
              <Text style={styles.modalTitle}>Filters</Text>
              {getActiveFiltersCount() > 0 && (
                <View style={styles.headerBadge}>
                  <Text style={styles.headerBadgeText}>{getActiveFiltersCount()}</Text>
                </View>
              )}
            </View>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Location */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Location</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="location-on" size={20} color="#999" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter city or region"
                  value={filters.location || ''}
                  onChangeText={(text) => setFilters({ ...filters, location: text })}
                />
                {filters.location && (
                  <TouchableOpacity onPress={() => setFilters({ ...filters, location: undefined })}>
                    <MaterialIcons name="close" size={20} color="#999" />
                  </TouchableOpacity>
                )}
              </View>
              
              {/* Remote Work Toggle */}
              <TouchableOpacity
                style={[
                  styles.remoteToggle,
                  filters.isRemote && styles.remoteToggleActive,
                ]}
                onPress={() => setFilters({ ...filters, isRemote: !filters.isRemote })}
              >
                <MaterialIcons
                  name="home-work"
                  size={20}
                  color={filters.isRemote ? '#4A90E2' : '#999'}
                />
                <Text
                  style={[
                    styles.remoteToggleText,
                    filters.isRemote && styles.remoteToggleTextActive,
                  ]}
                >
                  Remote Work Only
                </Text>
                {filters.isRemote && (
                  <MaterialIcons name="check" size={20} color="#4A90E2" />
                )}
              </TouchableOpacity>
            </View>

            {/* Job Type */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Employment Type</Text>
              <View style={styles.optionsGrid}>
                {JOB_TYPES.map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.optionCard,
                      filters.employmentType === type.value && styles.optionCardSelected,
                    ]}
                    onPress={() => toggleJobType(type.value)}
                  >
                    <MaterialIcons
                      name={type.icon as any}
                      size={24}
                      color={filters.employmentType === type.value ? '#4A90E2' : '#999'}
                    />
                    <Text
                      style={[
                        styles.optionText,
                        filters.employmentType === type.value && styles.optionTextSelected,
                      ]}
                    >
                      {type.label}
                    </Text>
                    {filters.employmentType === type.value && (
                      <MaterialIcons
                        name="check-circle"
                        size={20}
                        color="#4A90E2"
                        style={styles.checkIcon}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Experience Level */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Experience Level</Text>
              <View style={styles.optionsGrid}>
                {EXPERIENCE_LEVELS.map((level) => (
                  <TouchableOpacity
                    key={level.value}
                    style={[
                      styles.optionCard,
                      filters.experienceLevel === level.value && styles.optionCardSelected,
                    ]}
                    onPress={() => toggleExperienceLevel(level.value)}
                  >
                    <MaterialIcons
                      name={level.icon as any}
                      size={24}
                      color={filters.experienceLevel === level.value ? '#4A90E2' : '#999'}
                    />
                    <Text
                      style={[
                        styles.optionText,
                        filters.experienceLevel === level.value && styles.optionTextSelected,
                      ]}
                    >
                      {level.label}
                    </Text>
                    {filters.experienceLevel === level.value && (
                      <MaterialIcons
                        name="check-circle"
                        size={20}
                        color="#4A90E2"
                        style={styles.checkIcon}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Salary Range */}
            <View style={styles.filterSection}>
              <Text style={styles.sectionTitle}>Salary Range</Text>
              <View style={styles.salaryOptions}>
                {SALARY_RANGES.map((range, index) => {
                  const isSelected =
                    filters.salaryMin === range.min &&
                    (filters.salaryMax === range.max || (!filters.salaryMax && !range.max));
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.salaryOption,
                        isSelected && styles.salaryOptionSelected,
                      ]}
                      onPress={() => setSalaryRange(range.min, range.max)}
                    >
                      <MaterialIcons
                        name="payments"
                        size={20}
                        color={isSelected ? '#4A90E2' : '#999'}
                      />
                      <Text
                        style={[
                          styles.salaryOptionText,
                          isSelected && styles.salaryOptionTextSelected,
                        ]}
                      >
                        {range.label}
                      </Text>
                      {isSelected && (
                        <MaterialIcons name="check" size={20} color="#4A90E2" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.button, styles.resetButton]}
              onPress={handleReset}
            >
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.applyButton]}
              onPress={handleApply}
            >
              <Text style={styles.applyButtonText}>
                Apply {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
              </Text>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerBadge: {
    backgroundColor: '#4A90E2',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalContent: {
    padding: 20,
  },
  filterSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  remoteToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 12,
  },
  remoteToggleActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#4A90E2',
  },
  remoteToggleText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  remoteToggleTextActive: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionCard: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 8,
  },
  optionCardSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#4A90E2',
  },
  optionText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  optionTextSelected: {
    color: '#4A90E2',
    fontWeight: '600',
  },
  checkIcon: {
    marginLeft: 'auto',
  },
  salaryOptions: {
    gap: 12,
  },
  salaryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 12,
  },
  salaryOptionSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#4A90E2',
  },
  salaryOptionText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  salaryOptionTextSelected: {
    color: '#4A90E2',
    fontWeight: '600',
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
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetButton: {
    backgroundColor: '#f5f5f5',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  applyButton: {
    backgroundColor: '#4A90E2',
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});