// app/(tabs)/profile.tsx
import { MaterialIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import AddEducationModal from '../components/add-education-modal';
import AddExperienceModal from '../components/add-experience-modal';
import AddSkillModal from '../components/add-skills-modal';
import EditProfileModal from '../components/edit-profile-modal';
import { jobSeekerAPI } from '../config/api';
import { useAuth } from '../context/AuthContext';

interface Skill {
  id: string;
  skill: {
    id: string;
    name: string;
  };
  proficiency: number;
  yearsOfExp: number;
}

interface Experience {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string | null;
  description: string;
  isCurrent: boolean;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string | null;
  grade: string | null;
  currentlyStudying: boolean;
}

interface JobSeekerProfile {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  location: string;
  bio: string;
  profilePicture: string | null;
  resumeUrl: string | null;
  skills: Skill[] | null;
  experiences: Experience[] | null;
  educations: Education[] | null;
  user: {
    email: string;
    createdAt: string;
  };
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<JobSeekerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  
  // Modal states
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [showAddExperienceModal, setShowAddExperienceModal] = useState(false);
  const [showAddEducationModal, setShowAddEducationModal] = useState(false);
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await jobSeekerAPI.getProfile();
      console.log('Profile response:', response.data);
      
      let profileData = null;
      
      // Handle different response formats
      if (response.data?.data) {
        profileData = response.data.data;
      } else if (response.data?.profile) {
        profileData = response.data.profile;
      } else if (response.data) {
        profileData = response.data;
      }
      
      // Ensure arrays are initialized
      if (profileData) {
        setProfile({
          ...profileData,
          skills: Array.isArray(profileData.skills) ? profileData.skills : [],
          experiences: Array.isArray(profileData.experiences) ? profileData.experiences : [],
          educations: Array.isArray(profileData.educations) ? profileData.educations : [],
        });
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProfile();
  };

  const handleBackToDashboard = () => {
    if (user?.role === 'JOB_SEEKER') {
      router.push('/(jobseeker)');
    } else if (user?.role === 'EMPLOYER') {
      router.push('/(employer)');
    } else {
      router.back();
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  const handleEditProfile = () => {
    setShowEditProfileModal(true);
  };

  const handleSaveProfile = async (data: any) => {
    await jobSeekerAPI.updateProfile(data);
    Alert.alert('Success', 'Profile updated successfully');
    await loadProfile();
  };

  const handleUploadPhoto = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to upload photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setUploadingPhoto(true);
        const formData = new FormData();
        const uri = result.assets[0].uri;
        const filename = uri.split('/').pop() || 'profile.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('profilePicture', {
          uri,
          name: filename,
          type,
        } as any);

        await jobSeekerAPI.uploadProfilePicture(formData);
        
        Alert.alert('Success', 'Profile picture updated successfully');
        await loadProfile();
      }
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleUploadResume = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        setUploadingResume(true);

        if (result.size && result.size > 5 * 1024 * 1024) {
          Alert.alert('Error', 'File size must be less than 5MB');
          return;
        }

        const formData = new FormData();
        formData.append('resume', {
          uri: result.uri,
          name: result.name,
          type: result.mimeType || 'application/pdf',
        } as any);

        await jobSeekerAPI.uploadResume(formData);
        
        Alert.alert('Success', 'Resume uploaded successfully');
        await loadProfile();
      }
    } catch (error: any) {
      console.error('Error uploading resume:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to upload resume');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleAddSkill = () => {
    setShowAddSkillModal(true);
  };

  const handleSaveSkill = async (data: { skillName: string; proficiency: number; yearsOfExp: number }) => {
    await jobSeekerAPI.addSkill(data);
    Alert.alert('Success', 'Skill added successfully');
    await loadProfile();
  };

  const handleRemoveSkill = (skillId: string, skillName: string) => {
    Alert.alert(
      'Remove Skill',
      `Are you sure you want to remove "${skillName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await jobSeekerAPI.removeSkill(skillId);
              Alert.alert('Success', 'Skill removed successfully');
              await loadProfile();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.error || 'Failed to remove skill');
            }
          },
        },
      ]
    );
  };

  const handleAddExperience = () => {
    setShowAddExperienceModal(true);
  };

  const handleSaveExperience = async (data: any) => {
    await jobSeekerAPI.addExperience({
      ...data,
      startDate: data.startDate.toISOString(),
      endDate: data.endDate ? data.endDate.toISOString() : null,
    });
    Alert.alert('Success', 'Experience added successfully');
    await loadProfile();
  };

  const handleDeleteExperience = (experienceId: string, jobTitle: string) => {
    Alert.alert(
      'Delete Experience',
      `Are you sure you want to delete "${jobTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await jobSeekerAPI.deleteExperience(experienceId);
              Alert.alert('Success', 'Experience deleted successfully');
              await loadProfile();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.error || 'Failed to delete experience');
            }
          },
        },
      ]
    );
  };

  const handleAddEducation = () => {
    setShowAddEducationModal(true);
  };

  const handleSaveEducation = async (data: any) => {
    await jobSeekerAPI.addEducation({
      ...data,
      startDate: data.startDate.toISOString(),
      endDate: data.endDate ? data.endDate.toISOString() : null,
    });
    Alert.alert('Success', 'Education added successfully');
    await loadProfile();
  };

  const handleDeleteEducation = (educationId: string, degree: string) => {
    Alert.alert(
      'Delete Education',
      `Are you sure you want to delete "${degree}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await jobSeekerAPI.deleteEducation(educationId);
              Alert.alert('Success', 'Education deleted successfully');
              await loadProfile();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.error || 'Failed to delete education');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const calculateProfileCompletion = (): number => {
    if (!profile) return 0;

    let score = 0;
    const weights = {
      basicInfo: 20,
      skills: 25,
      experience: 25,
      education: 20,
      resume: 10,
    };

    if (profile.firstName && profile.lastName && profile.phone) {
      score += weights.basicInfo;
    }

    if (Array.isArray(profile.skills) && profile.skills.length > 0) {
      score += weights.skills;
    }

    if (Array.isArray(profile.experiences) && profile.experiences.length > 0) {
      score += weights.experience;
    }

    if (Array.isArray(profile.educations) && profile.educations.length > 0) {
      score += weights.education;
    }

    if (profile.resumeUrl) {
      score += weights.resume;
    }

    return Math.round(score);
  };

  const getProficiencyLabel = (level: number): string => {
    switch (level) {
      case 1: return 'Beginner';
      case 2: return 'Intermediate';
      case 3: return 'Advanced';
      case 4: return 'Expert';
      case 5: return 'Master';
      default: return 'Beginner';
    }
  };

  const getProficiencyColor = (level: number): string => {
    switch (level) {
      case 1: return '#F44336';
      case 2: return '#FF9800';
      case 3: return '#2196F3';
      case 4: return '#4CAF50';
      case 5: return '#9C27B0';
      default: return '#666';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={64} color="#ccc" />
        <Text style={styles.errorText}>Failed to load profile</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadProfile}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const profileCompletion = calculateProfileCompletion();

  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBackToDashboard}
          >
            <MaterialIcons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Profile</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialIcons name="logout" size={24} color="#F44336" />
          </TouchableOpacity>
        </View>

        {/* Profile Picture & Basic Info */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            {uploadingPhoto ? (
              <View style={styles.profileImagePlaceholder}>
                <ActivityIndicator size="large" color="#fff" />
              </View>
            ) : profile.profilePicture ? (
              <Image source={{ uri: profile.profilePicture }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <MaterialIcons name="person" size={60} color="#fff" />
              </View>
            )}
            <TouchableOpacity 
              style={styles.editPhotoButton} 
              onPress={handleUploadPhoto}
              disabled={uploadingPhoto}
            >
              <MaterialIcons name="camera-alt" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.profileName}>
            {profile.firstName} {profile.lastName}
          </Text>
          <Text style={styles.profileEmail}>{profile.user.email}</Text>
          {profile.location && (
            <View style={styles.locationContainer}>
              <MaterialIcons name="location-on" size={16} color="#666" />
              <Text style={styles.locationText}>{profile.location}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.editProfileButton} onPress={handleEditProfile}>
            <MaterialIcons name="edit" size={20} color="#4A90E2" />
            <Text style={styles.editProfileButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Completion */}
        {profileCompletion < 100 && (
          <View style={styles.completionCard}>
            <View style={styles.completionHeader}>
              <MaterialIcons name="check-circle" size={24} color="#4CAF50" />
              <Text style={styles.completionTitle}>Profile Completion</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${profileCompletion}%`,
                      backgroundColor: profileCompletion >= 80 ? '#4CAF50' : '#FF9800',
                    },
                  ]}
                />
              </View>
              <Text style={styles.progressText}>{profileCompletion}%</Text>
            </View>
            <Text style={styles.completionSubtext}>
              Complete your profile to increase your chances of getting hired
            </Text>
          </View>
        )}

        {/* Bio Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="info" size={24} color="#4A90E2" />
            <Text style={styles.sectionTitle}>About Me</Text>
            <TouchableOpacity onPress={handleEditProfile}>
              <MaterialIcons name="edit" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          {profile.bio ? (
            <Text style={styles.bioText}>{profile.bio}</Text>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No bio added yet</Text>
              <TouchableOpacity onPress={handleEditProfile}>
                <Text style={styles.addLink}>Add Bio</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="contact-phone" size={24} color="#4A90E2" />
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <TouchableOpacity onPress={handleEditProfile}>
              <MaterialIcons name="edit" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          <View style={styles.contactInfoContainer}>
            <View style={styles.contactInfoRow}>
              <MaterialIcons name="email" size={20} color="#666" />
              <View style={styles.contactInfoContent}>
                <Text style={styles.contactInfoLabel}>Email</Text>
                <Text style={styles.contactInfoValue}>{profile.user.email}</Text>
              </View>
            </View>
            {profile.phone && (
              <View style={styles.contactInfoRow}>
                <MaterialIcons name="phone" size={20} color="#666" />
                <View style={styles.contactInfoContent}>
                  <Text style={styles.contactInfoLabel}>Phone</Text>
                  <Text style={styles.contactInfoValue}>{profile.phone}</Text>
                </View>
              </View>
            )}
            {profile.location && (
              <View style={styles.contactInfoRow}>
                <MaterialIcons name="location-on" size={20} color="#666" />
                <View style={styles.contactInfoContent}>
                  <Text style={styles.contactInfoLabel}>Location</Text>
                  <Text style={styles.contactInfoValue}>{profile.location}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Resume Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="description" size={24} color="#4A90E2" />
            <Text style={styles.sectionTitle}>Resume</Text>
          </View>
          {profile.resumeUrl ? (
            <View style={styles.resumeCard}>
              <View style={styles.resumeIcon}>
                <MaterialIcons name="description" size={32} color="#4A90E2" />
              </View>
              <View style={styles.resumeInfo}>
                <Text style={styles.resumeTitle}>My Resume.pdf</Text>
                <Text style={styles.resumeSubtitle}>Uploaded</Text>
              </View>
              <View style={styles.resumeActions}>
                <TouchableOpacity style={styles.resumeActionButton}>
                  <MaterialIcons name="visibility" size={20} color="#4A90E2" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.resumeActionButton}
                  onPress={handleUploadResume}
                  disabled={uploadingResume}
                >
                  {uploadingResume ? (
                    <ActivityIndicator size="small" color="#4A90E2" />
                  ) : (
                    <MaterialIcons name="cloud-upload" size={20} color="#4A90E2" />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.uploadResumeCard} 
              onPress={handleUploadResume}
              disabled={uploadingResume}
            >
              {uploadingResume ? (
                <ActivityIndicator size="large" color="#4A90E2" />
              ) : (
                <>
                  <MaterialIcons name="cloud-upload" size={48} color="#ccc" />
                  <Text style={styles.uploadResumeText}>Upload Your Resume</Text>
                  <Text style={styles.uploadResumeSubtext}>PDF, DOC, DOCX (Max 5MB)</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Skills Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="star" size={24} color="#4A90E2" />
            <Text style={styles.sectionTitle}>Skills</Text>
            <TouchableOpacity onPress={handleAddSkill}>
              <MaterialIcons name="add-circle" size={24} color="#4A90E2" />
            </TouchableOpacity>
          </View>
          {Array.isArray(profile.skills) && profile.skills.length > 0 ? (
            <View style={styles.skillsContainer}>
              {profile.skills.map((skillItem) => (
                <View key={skillItem.id} style={styles.skillCard}>
                  <View style={styles.skillHeader}>
                    <Text style={styles.skillName}>{skillItem.skill.name}</Text>
                    <TouchableOpacity
                      onPress={() => handleRemoveSkill(skillItem.skill.id, skillItem.skill.name)}
                    >
                      <MaterialIcons name="close" size={20} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.skillDetails}>
                    <View
                      style={[
                        styles.proficiencyBadge,
                        { backgroundColor: getProficiencyColor(skillItem.proficiency) + '20' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.proficiencyText,
                          { color: getProficiencyColor(skillItem.proficiency) },
                        ]}
                      >
                        {getProficiencyLabel(skillItem.proficiency)}
                      </Text>
                    </View>
                    <Text style={styles.yearsOfExp}>{skillItem.yearsOfExp} years</Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="star-border" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No skills added yet</Text>
              <TouchableOpacity style={styles.addButton} onPress={handleAddSkill}>
                <Text style={styles.addButtonText}>Add Skills</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Experience Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="work" size={24} color="#4A90E2" />
            <Text style={styles.sectionTitle}>Work Experience</Text>
            <TouchableOpacity onPress={handleAddExperience}>
              <MaterialIcons name="add-circle" size={24} color="#4A90E2" />
            </TouchableOpacity>
          </View>
          {Array.isArray(profile.experiences) && profile.experiences.length > 0 ? (
            <View style={styles.experienceContainer}>
              {profile.experiences.map((exp) => (
                <View key={exp.id} style={styles.experienceCard}>
                  <View style={styles.experienceHeader}>
                    <View style={styles.experienceIcon}>
                      <MaterialIcons name="work" size={24} color="#4A90E2" />
                    </View>
                    <View style={styles.experienceInfo}>
                      <Text style={styles.experienceTitle}>{exp.jobTitle}</Text>
                      <Text style={styles.experienceCompany}>{exp.company}</Text>
                      <Text style={styles.experienceLocation}>{exp.location}</Text>
                      <Text style={styles.experienceDate}>
                        {formatDate(exp.startDate)} -{' '}
                        {exp.isCurrent ? 'Present' : formatDate(exp.endDate!)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteExperience(exp.id, exp.jobTitle)}
                    >
                      <MaterialIcons name="delete" size={20} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                  {exp.description && (
                    <Text style={styles.experienceDescription}>{exp.description}</Text>
                  )}
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="work-outline" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No work experience added yet</Text>
              <TouchableOpacity style={styles.addButton} onPress={handleAddExperience}>
                <Text style={styles.addButtonText}>Add Experience</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Education Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="school" size={24} color="#4A90E2" />
            <Text style={styles.sectionTitle}>Education</Text>
            <TouchableOpacity onPress={handleAddEducation}>
              <MaterialIcons name="add-circle" size={24} color="#4A90E2" />
            </TouchableOpacity>
          </View>
          {Array.isArray(profile.educations) && profile.educations.length > 0 ? (
            <View style={styles.educationContainer}>
              {profile.educations.map((edu) => (
                <View key={edu.id} style={styles.educationCard}>
                  <View style={styles.educationHeader}>
                    <View style={styles.educationIcon}>
                      <MaterialIcons name="school" size={24} color="#4A90E2" />
                    </View>
                    <View style={styles.educationInfo}>
                      <Text style={styles.educationDegree}>{edu.degree}</Text>
                      <Text style={styles.educationField}>{edu.fieldOfStudy}</Text>
                      <Text style={styles.educationInstitution}>{edu.institution}</Text>
                      <Text style={styles.educationDate}>
                        {formatDate(edu.startDate)} -{' '}
                        {edu.currentlyStudying ? 'Present' : formatDate(edu.endDate!)}
                      </Text>
                      {edu.grade && (
                        <Text style={styles.educationGrade}>Grade: {edu.grade}</Text>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteEducation(edu.id, edu.degree)}
                    >
                      <MaterialIcons name="delete" size={20} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="school" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No education added yet</Text>
              <TouchableOpacity style={styles.addButton} onPress={handleAddEducation}>
                <Text style={styles.addButtonText}>Add Education</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Settings & Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="settings" size={24} color="#4A90E2" />
            <Text style={styles.sectionTitle}>Settings</Text>
          </View>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => Alert.alert('Info', 'Change password coming soon')}
          >
            <MaterialIcons name="lock" size={24} color="#666" />
            <Text style={styles.settingText}>Change Password</Text>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => Alert.alert('Info', 'Notification settings coming soon')}
          >
            <MaterialIcons name="notifications" size={24} color="#666" />
            <Text style={styles.settingText}>Notifications</Text>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => Alert.alert('Info', 'Privacy settings coming soon')}
          >
            <MaterialIcons name="privacy-tip" size={24} color="#666" />
            <Text style={styles.settingText}>Privacy</Text>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => Alert.alert('Info', 'Help & Support coming soon')}
          >
            <MaterialIcons name="help" size={24} color="#666" />
            <Text style={styles.settingText}>Help & Support</Text>
            <MaterialIcons name="chevron-right" size={24} color="#ccc" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.settingItem}
            onPress={handleBackToDashboard}
          >
            <MaterialIcons name="dashboard" size={24} color="#4A90E2" />
            <Text style={[styles.settingText, { color: '#4A90E2' }]}>Back to Dashboard</Text>
            <MaterialIcons name="chevron-right" size={24} color="#4A90E2" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.settingItem, styles.logoutItem]} onPress={handleLogout}>
            <MaterialIcons name="logout" size={24} color="#F44336" />
            <Text style={[styles.settingText, styles.logoutText]}>Logout</Text>
            <MaterialIcons name="chevron-right" size={24} color="#F44336" />
          </TouchableOpacity>
        </View>

        {/* Account Info */}
        <View style={styles.accountInfo}>
          <Text style={styles.accountInfoText}>
            Member since {formatDate(profile.user.createdAt)}
          </Text>
          <Text style={styles.accountInfoText}>User ID: {profile.id.substring(0, 8)}</Text>
        </View>
      </ScrollView>

      {/* Modals */}
      {profile && (
        <>
          <EditProfileModal
            visible={showEditProfileModal}
            onClose={() => setShowEditProfileModal(false)}
            onSave={handleSaveProfile}
            initialData={{
              firstName: profile.firstName,
              lastName: profile.lastName,
              phone: profile.phone,
              location: profile.location,
              bio: profile.bio,
            }}
          />
          <AddSkillModal
            visible={showAddSkillModal}
            onClose={() => setShowAddSkillModal(false)}
            onSave={handleSaveSkill}
          />
          <AddExperienceModal
            visible={showAddExperienceModal}
            onClose={() => setShowAddExperienceModal(false)}
            onSave={handleSaveExperience}
          />
          <AddEducationModal
            visible={showAddEducationModal}
            onClose={() => setShowAddEducationModal(false)}
            onSave={handleSaveEducation}
          />
        </>
      )}
    </>
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
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFEBEE',
  },
  profileSection: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editPhotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4A90E2',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
    gap: 8,
  },
  editProfileButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
  },
  completionCard: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  completionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  progressBarBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    minWidth: 40,
  },
  completionSubtext: {
    fontSize: 12,
    color: '#999',
  },
  section: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  bioText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
    marginBottom: 16,
  },
  addLink: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  contactInfoContainer: {
    gap: 16,
  },
  contactInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  contactInfoContent: {
    flex: 1,
  },
  contactInfoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  contactInfoValue: {
    fontSize: 14,
    color: '#333',
  },
  resumeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    gap: 12,
  },
  resumeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resumeInfo: {
    flex: 1,
  },
  resumeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  resumeSubtitle: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 2,
  },
  resumeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  resumeActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadResumeCard: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  uploadResumeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
  },
  uploadResumeSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  skillsContainer: {
    gap: 12,
  },
  skillCard: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  skillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  skillName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  skillDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  proficiencyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  proficiencyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  yearsOfExp: {
    fontSize: 12,
    color: '#666',
  },
  experienceContainer: {
    gap: 16,
  },
  experienceCard: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  experienceHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  experienceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  experienceInfo: {
    flex: 1,
  },
  experienceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  experienceCompany: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  experienceLocation: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  experienceDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  experienceDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    lineHeight: 20,
  },
  educationContainer: {
    gap: 16,
  },
  educationCard: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
  },
  educationHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  educationIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  educationInfo: {
    flex: 1,
  },
  educationDegree: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  educationField: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  educationInstitution: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  educationDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  educationGrade: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 4,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  logoutItem: {
    borderBottomWidth: 0,
  },
  logoutText: {
    color: '#F44336',
    fontWeight: '600',
  },
  accountInfo: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  accountInfoText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
});