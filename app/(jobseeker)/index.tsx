// app/(jobseeker)/index.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { jobSeekerAPI } from '../config/api';
import { useAuth } from '../context/AuthContext';

interface DashboardStats {
  totalApplications: number;
  pendingApplications: number;
  interviewsScheduled: number;
  savedJobsCount: number;
  profileViewsCount: number;
  profileCompletion: number;
}

interface RecentApplication {
  id: string;
  jobTitle: string;
  companyName: string;
  companyLogo: string | null;
  appliedAt: string;
  status: string;
}
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
const JobSeekerDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats>({
    totalApplications: 0,
    pendingApplications: 0,
    interviewsScheduled: 0,
    savedJobsCount: 0,
    profileViewsCount: 0,
    profileCompletion: 0,
  });
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
    const [profile, setProfile] = useState<JobSeekerProfile | null>(null);

  useEffect(() => {
    loadDashboardData();
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
  const loadDashboardData = async () => {
    try {
      const response = await jobSeekerAPI.getDashboard();
      
      if (response.data?.data) {
        setStats(response.data.data.stats || stats);
        setRecentApplications(response.data.data.recentApplications || []);
      }
    } catch (error: any) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
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

  const profileCompletion = calculateProfileCompletion();
  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
    loadProfile();
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'PENDING':
        return '#FF9800';
      case 'REVIEWING':
        return '#2196F3';
      case 'INTERVIEW_SCHEDULED':
        return '#9C27B0';
      case 'OFFERED':
        return '#4CAF50';
      case 'ACCEPTED':
        return '#00C853';
      case 'REJECTED':
        return '#F44336';
      default:
        return '#666';
    }
  };

  const formatStatus = (status: string): string => {
    return status.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const getProfileCompletionColor = (completion: number): string => {
    if (completion >= 80) return '#4CAF50';
    if (completion >= 50) return '#FF9800';
    return '#F44336';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>
            {user?.profile?.firstName || 'Job Seeker'}
          </Text>
        </View>
        
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => router.push('/(jobseeker)/notifications')}
          >
            <MaterialIcons name="notifications" size={28} color="#333" />
            {stats.pendingApplications > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>
                  {stats.pendingApplications}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <MaterialIcons name="logout" size={24} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Completion Banner */}
      {profileCompletion < 100 && (
        <View style={styles.profileCompletionCard}>
          <View style={styles.profileCompletionHeader}>
            <MaterialIcons 
              name="account-circle" 
              size={32} 
              color={getProfileCompletionColor(profileCompletion)} 
            />
            <View style={styles.profileCompletionInfo}>
              <Text style={styles.profileCompletionTitle}>Complete Your Profile</Text>
              <Text style={styles.profileCompletionSubtitle}>
                {profileCompletion}% Complete - Get noticed by employers!
              </Text>
            </View>
          </View>
          
          <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
              <View 
                style={[
                  styles.progressBarFill, 
                  { 
                    width: `${profileCompletion}%`,
                    backgroundColor: getProfileCompletionColor(profileCompletion)
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{profileCompletion}%</Text>
          </View>

          <TouchableOpacity
            style={styles.completeProfileButton}
            onPress={() => router.push('/(jobseeker)/profile')}
          >
            <Text style={styles.completeProfileButtonText}>Complete Now</Text>
            <MaterialIcons name="arrow-forward" size={16} color="#4A90E2" />
          </TouchableOpacity>
        </View>
      )}

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: '#4A90E2' }]}
            onPress={() => router.push('/(jobseeker)/my-applications')}
          >
            <MaterialIcons name="description" size={32} color="#fff" />
            <Text style={styles.statValue}>{stats.totalApplications}</Text>
            <Text style={styles.statLabel}>Applications</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: '#FF9800' }]}
            onPress={() => router.push('/(jobseeker)/my-applications')}
          >
            <MaterialIcons name="pending" size={32} color="#fff" />
            <Text style={styles.statValue}>{stats.pendingApplications}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: '#9C27B0' }]}
            onPress={() => router.push('/(jobseeker)/my-applications')}
          >
            <MaterialIcons name="event" size={32} color="#fff" />
            <Text style={styles.statValue}>{stats.interviewsScheduled}</Text>
            <Text style={styles.statLabel}>Interviews</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: '#4CAF50' }]}
            onPress={() => router.push('/(jobseeker)/saved-jobs')}
          >
            <MaterialIcons name="bookmark" size={32} color="#fff" />
            <Text style={styles.statValue}>{stats.savedJobsCount}</Text>
            <Text style={styles.statLabel}>Saved Jobs</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(jobseeker)/jobs')}
          >
            <View style={styles.actionIconContainer}>
              <MaterialIcons name="search" size={24} color="#4A90E2" />
            </View>
            <Text style={styles.actionText}>Find Jobs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(jobseeker)/saved-jobs')}
          >
            <View style={styles.actionIconContainer}>
              <MaterialIcons name="bookmark" size={24} color="#4CAF50" />
            </View>
            <Text style={styles.actionText}>Saved Jobs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(jobseeker)/my-applications')}
          >
            <View style={styles.actionIconContainer}>
              <MaterialIcons name="description" size={24} color="#FF9800" />
            </View>
            <Text style={styles.actionText}>My Applications</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              Alert.alert('Info', 'AI Job Matching coming soon');
            }}
          >
            <View style={styles.actionIconContainer}>
              <MaterialIcons name="psychology" size={24} color="#9C27B0" />
            </View>
            <Text style={styles.actionText}>AI Matching</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <View style={styles.actionIconContainer}>
              <MaterialIcons name="person" size={24} color="#00BCD4" />
            </View>
            <Text style={styles.actionText}>My Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(jobseeker)/settings')}
          >
            <View style={styles.actionIconContainer}>
              <MaterialIcons name="settings" size={24} color="#666" />
            </View>
            <Text style={styles.actionText}>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Applications */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Applications</Text>
          <TouchableOpacity
            onPress={() => router.push('/(jobseeker)/my-applications')}
          >
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {recentApplications.length > 0 ? (
          recentApplications.map((application) => (
            <TouchableOpacity
              key={application.id}
              style={styles.applicationCard}
              onPress={() => {
                router.push(`/(jobseeker)/application-details?id=${application.id}`);
              }}
            >
              <View style={styles.applicationHeader}>
                <View style={styles.applicationAvatar}>
                  <MaterialIcons name="work" size={24} color="#4A90E2" />
                </View>
                <View style={styles.applicationInfo}>
                  <Text style={styles.jobTitle}>{application.jobTitle}</Text>
                  <Text style={styles.companyName}>{application.companyName}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(application.status) + '20' },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(application.status) },
                    ]}
                  >
                    {formatStatus(application.status)}
                  </Text>
                </View>
              </View>
              <Text style={styles.applicationTime}>
                Applied {formatDate(application.appliedAt)}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="inbox" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>No applications yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Start applying to jobs to see your applications here
            </Text>
            <TouchableOpacity
              style={styles.browseJobsButton}
              onPress={() => router.push('/(tabs)/jobs')}
            >
              <Text style={styles.browseJobsButtonText}>Browse Jobs</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Tips Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tips for Success</Text>
        <View style={styles.tipCard}>
          <MaterialIcons name="lightbulb" size={24} color="#FFB800" />
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Stand Out to Employers</Text>
            <Text style={styles.tipText}>
              Complete your profile with skills, experience, and a professional resume to increase your chances
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  greeting: {
    fontSize: 14,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#F44336',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFEBEE',
  },
  profileCompletionCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileCompletionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileCompletionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  profileCompletionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  profileCompletionSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
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
  completeProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  completeProfileButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
  },
  statsContainer: {
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
    opacity: 0.9,
  },
  section: {
    padding: 20,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  seeAllText: {
    color: '#4A90E2',
    fontSize: 14,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  applicationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  applicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  applicationAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  applicationInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  companyName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  applicationTime: {
    fontSize: 12,
    color: '#999',
    marginLeft: 60,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  browseJobsButton: {
    marginTop: 20,
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  browseJobsButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#FFE082',
  },
  tipContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default JobSeekerDashboard;