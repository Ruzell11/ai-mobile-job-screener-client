// app/(jobseeker)/job-details/[id].tsx
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { applicationAPI, jobAPI as jobsAPI } from '../../../config/api';
import { JobWithDetails } from '../../../types';

export default function JobDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [job, setJob] = useState<JobWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [showApplyModal, setShowApplyModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadJobDetails();
    }
  }, [id]);

  const loadJobDetails = async () => {
    try {
      setIsLoading(true);
      const response = await jobsAPI.getJobById(id);
      if (response.data?.job) {
        setJob(response.data.job);
      }
    } catch (error: any) {
      console.error('Error loading job details:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to load job details');
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveJob = async () => {
    if (!job) return;

    try {
      if (job.isSaved) {
        await jobsAPI.unsaveJob(job.id);
        Alert.alert('Success', 'Job removed from saved');
        setJob({ ...job, isSaved: false });
      } else {
        await jobsAPI.saveJob(job.id);
        Alert.alert('Success', 'Job saved successfully');
        setJob({ ...job, isSaved: true });
      }
    } catch (error: any) {
      console.error('Error saving job:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to save job');
    }
  };

  const handleApply = async () => {
    if (!job) return;

    setIsApplying(true);
    const data = {
        coverLetter,
        jobId: job.id
    }
    try {
      await applicationAPI.submitApplication(data);
      Alert.alert('Success', 'Application submitted successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
      setJob({ ...job, hasApplied: true });
    } catch (error: any) {
      console.error('Error applying for job:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to submit application');
    } finally {
      setIsApplying(false);
      setShowApplyModal(false);
    }
  };

  const formatSalary = () => {
    if (!job) return '';
    if (!job.salaryMin && !job.salaryMax) return 'Salary not specified';

    const format = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      }).format(amount);
    };

    if (job.salaryMin && job.salaryMax) {
      return `${format(job.salaryMin)} - ${format(job.salaryMax)} per year`;
    } else if (job.salaryMin) {
      return `From ${format(job.salaryMin)} per year`;
    } else if (job.salaryMax) {
      return `Up to ${format(job.salaryMax)} per year`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading job details...</Text>
      </View>
    );
  }

  if (!job) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={64} color="#ccc" />
        <Text style={styles.errorText}>Job not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job Details</Text>
        <TouchableOpacity style={styles.headerButton} onPress={handleSaveJob}>
          <MaterialIcons
            name={job.isSaved ? 'bookmark' : 'bookmark-border'}
            size={24}
            color={job.isSaved ? '#4A90E2' : '#333'}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Company Header */}
        <View style={styles.companyHeader}>
          {job.employer?.logo ? (
            <Image
              source={{ uri: job.employer.logo }}
              style={styles.companyLogo}
            />
          ) : (
            <View style={styles.companyLogoPlaceholder}>
              <MaterialIcons name="business" size={40} color="#4A90E2" />
            </View>
          )}
          <View style={styles.companyInfo}>
            <Text style={styles.jobTitle}>{job.title}</Text>
            <Text style={styles.companyName}>{job.employer?.companyName || 'Company'}</Text>
          </View>
        </View>

        {/* Quick Info */}
        <View style={styles.quickInfo}>
          <View style={styles.infoCard}>
            <MaterialIcons name="location-on" size={24} color="#4A90E2" />
            <Text style={styles.infoLabel}>Location</Text>
            <Text style={styles.infoValue}>{job.location}</Text>
            {job.isRemote && (
              <View style={styles.remoteBadge}>
                <MaterialIcons name="home-work" size={12} color="#4A90E2" />
                <Text style={styles.remoteText}>Remote</Text>
              </View>
            )}
          </View>
          <View style={styles.infoCard}>
            <MaterialIcons name="work" size={24} color="#4A90E2" />
            <Text style={styles.infoLabel}>Job Type</Text>
            <Text style={styles.infoValue}>
              {job.employmentType.replace('_', ' ')}
            </Text>
          </View>
          <View style={styles.infoCard}>
            <MaterialIcons name="trending-up" size={24} color="#4A90E2" />
            <Text style={styles.infoLabel}>Experience</Text>
            <Text style={styles.infoValue}>{job.experienceLevel}</Text>
          </View>
        </View>

        {/* Salary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="payments" size={24} color="#4A90E2" />
            <Text style={styles.sectionTitle}>Salary</Text>
          </View>
          <Text style={styles.salaryText}>{formatSalary()}</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="description" size={24} color="#4A90E2" />
            <Text style={styles.sectionTitle}>Job Description</Text>
          </View>
          <Text style={styles.descriptionText}>{job.description}</Text>
        </View>

        {/* Requirements */}
        {job.requirements && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="checklist" size={24} color="#4A90E2" />
              <Text style={styles.sectionTitle}>Requirements</Text>
            </View>
            <Text style={styles.requirementsText}>{job.requirements}</Text>
          </View>
        )}

        {/* Responsibilities */}
        {job.responsibilities && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="assignment" size={24} color="#4A90E2" />
              <Text style={styles.sectionTitle}>Responsibilities</Text>
            </View>
            <Text style={styles.requirementsText}>{job.responsibilities}</Text>
          </View>
        )}

        {/* Skills */}
        {job.skills && job.skills.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="star" size={24} color="#4A90E2" />
              <Text style={styles.sectionTitle}>Required Skills</Text>
            </View>
            <View style={styles.skillsContainer}>
              {job.skills.map((skillItem) => (
                <View key={skillItem.id} style={styles.skillChip}>
                  <Text style={styles.skillText}>{skillItem.skill.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Company Info */}
        {job.employer?.description && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="business" size={24} color="#4A90E2" />
              <Text style={styles.sectionTitle}>About Company</Text>
            </View>
            <Text style={styles.companyDescription}>
              {job.employer.description}
            </Text>
          </View>
        )}

        {/* Meta Info */}
        <View style={styles.metaInfo}>
          <View style={styles.metaItem}>
            <MaterialIcons name="access-time" size={16} color="#999" />
            <Text style={styles.metaText}>Posted on {formatDate(job.createdAt)}</Text>
          </View>
          <View style={styles.metaItem}>
            <MaterialIcons name="visibility" size={16} color="#999" />
            <Text style={styles.metaText}>{job.viewCount} views</Text>
          </View>
          {job._count && job._count.applications > 0 && (
            <View style={styles.metaItem}>
              <MaterialIcons name="people" size={16} color="#999" />
              <Text style={styles.metaText}>
                {job._count.applications}{' '}
                {job._count.applications === 1 ? 'applicant' : 'applicants'}
              </Text>
            </View>
          )}
          {job.isActive ? (
            <View style={styles.metaItem}>
              <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
              <Text style={[styles.metaText, { color: '#4CAF50' }]}>Active</Text>
            </View>
          ) : (
            <View style={styles.metaItem}>
              <MaterialIcons name="cancel" size={16} color="#F44336" />
              <Text style={[styles.metaText, { color: '#F44336' }]}>Closed</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Apply Button */}
      {!job.hasApplied ? (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => setShowApplyModal(true)}
          >
            <MaterialIcons name="send" size={20} color="#fff" />
            <Text style={styles.applyButtonText}>Apply Now</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.footer}>
          <View style={styles.appliedBanner}>
            <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
            <Text style={styles.appliedText}>You have already applied for this job</Text>
          </View>
        </View>
      )}

      {/* Apply Modal */}
      {showApplyModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Apply for {job.title}</Text>
              <TouchableOpacity onPress={() => setShowApplyModal(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalLabel}>Cover Letter (Optional)</Text>
              <TextInput
                style={styles.coverLetterInput}
                placeholder="Tell the employer why you're a great fit for this position..."
                value={coverLetter}
                onChangeText={setCoverLetter}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{coverLetter.length} / 1000</Text>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowApplyModal(false)}
                disabled={isApplying}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleApply}
                disabled={isApplying}
              >
                {isApplying ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <MaterialIcons name="send" size={20} color="#fff" />
                    <Text style={styles.submitButtonText}>Submit Application</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  companyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    gap: 16,
  },
  companyLogo: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  companyLogoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 16,
    color: '#666',
  },
  quickInfo: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  infoCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  remoteBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginTop: 4,
  },
  remoteText: {
    fontSize: 10,
    color: '#4A90E2',
    fontWeight: '600',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  salaryText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  descriptionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  requirementsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    backgroundColor: '#E3F2FD',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  skillText: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '600',
  },
  companyDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  metaInfo: {
    backgroundColor: '#fff',
    padding: 20,
    gap: 12,
    marginBottom: 100,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#999',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  applyButton: {
    flexDirection: 'row',
    backgroundColor: '#4A90E2',
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  appliedBanner: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
  },
  appliedText: {
    flex: 1,
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '600',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  modalContent: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  coverLetterInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 150,
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
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
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
  submitButton: {
    backgroundColor: '#4A90E2',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});