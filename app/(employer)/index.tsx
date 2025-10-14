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
import { employerAPI } from '../config/api';
import { useAuth } from '../context/AuthContext';

interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  pendingApplications: number;
  interviewsScheduled: number;
  viewsThisMonth: number;
}

interface RecentApplication {
  id: string;
  jobTitle: string;
  candidateName: string;
  appliedAt: string;
  status: string;
}

const EmployerDashboard: React.FC = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState<DashboardStats>({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    interviewsScheduled: 0,
    viewsThisMonth: 0,
  });
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await employerAPI.getDashboard();
      
      if (response.data?.data) {
        setStats(response.data.data.stats || stats);
        setRecentApplications(response.data.data.recentApplications || []);
      }
    } catch (error: any) {
      console.error('Error loading dashboard:', error);
      // Don't show error alert on initial load - just use default values
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
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
          <Text style={styles.companyName}>
            {user?.profile?.companyName || 'Company'}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={() => {
            // Navigate to notifications
            Alert.alert('Info', 'Notifications coming soon');
          }}
        >
          <MaterialIcons name="notifications" size={28} color="#333" />
          <View style={styles.notificationBadge}>
            <Text style={styles.notificationBadgeText}>
              {stats.pendingApplications}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Statistics Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: '#4A90E2' }]}
            onPress={() => router.push('/(employer)/my-jobs')}
          >
            <MaterialIcons name="work" size={32} color="#fff" />
            <Text style={styles.statValue}>{stats.activeJobs}</Text>
            <Text style={styles.statLabel}>Active Jobs</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: '#FF9800' }]}
            onPress={() => {
              // Navigate to applications
              Alert.alert('Info', 'View all applications');
            }}
          >
            <MaterialIcons name="description" size={32} color="#fff" />
            <Text style={styles.statValue}>{stats.pendingApplications}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: '#4CAF50' }]}
            onPress={() => {
              Alert.alert('Info', 'View interviews');
            }}
          >
            <MaterialIcons name="event" size={32} color="#fff" />
            <Text style={styles.statValue}>{stats.interviewsScheduled}</Text>
            <Text style={styles.statLabel}>Interviews</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.statCard, { backgroundColor: '#9C27B0' }]}
            onPress={() => {
              Alert.alert('Info', 'View analytics');
            }}
          >
            <MaterialIcons name="visibility" size={32} color="#fff" />
            <Text style={styles.statValue}>{stats.viewsThisMonth}</Text>
            <Text style={styles.statLabel}>Views</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
         <TouchableOpacity
  style={styles.actionButton}
  onPress={() => router.push('/(employer)/create-job')}
>
  <View style={styles.actionIconContainer}>
    <MaterialIcons name="add-circle" size={24} color="#4A90E2" />
  </View>
  <Text style={styles.actionText}>Post New Job</Text>
</TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              Alert.alert('Info', 'AI matching coming soon');
            }}
          >
            <View style={styles.actionIconContainer}>
              <MaterialIcons name="psychology" size={24} color="#9C27B0" />
            </View>
            <Text style={styles.actionText}>AI Matching</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              Alert.alert('Info', 'Reports coming soon');
            }}
          >
            <View style={styles.actionIconContainer}>
              <MaterialIcons name="assessment" size={24} color="#FF9800" />
            </View>
            <Text style={styles.actionText}>View Reports</Text>
          </TouchableOpacity>

           <TouchableOpacity
            style={styles.actionButton}
            onPress={() => {
              Alert.alert('Info', 'Work Force and Analytics coming soon');
            }}
          >
            <View style={styles.actionIconContainer}>
              <MaterialIcons name="assessment" size={24} color="#FF9800" />
            </View>
            <Text style={styles.actionText}>Work Force and Analytics</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/profile')}
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
            onPress={() => {
              Alert.alert('Info', 'View all applications');
            }}
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
                Alert.alert('Info', `View application: ${application.candidateName}`);
              }}
            >
              <View style={styles.applicationHeader}>
                <View style={styles.applicationAvatar}>
                  <MaterialIcons name="person" size={24} color="#4A90E2" />
                </View>
                <View style={styles.applicationInfo}>
                  <Text style={styles.candidateName}>{application.candidateName}</Text>
                  <Text style={styles.jobTitle}>{application.jobTitle}</Text>
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
            <Text style={styles.emptyStateText}>No recent applications</Text>
            <Text style={styles.emptyStateSubtext}>
              Applications will appear here once candidates apply
            </Text>
          </View>
        )}
      </View>

      {/* Tips Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tips for Success</Text>
        <View style={styles.tipCard}>
          <MaterialIcons name="lightbulb" size={24} color="#FFB800" />
          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Boost Your Job Visibility</Text>
            <Text style={styles.tipText}>
              Add detailed job descriptions and requirements to attract better candidates
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
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
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
  candidateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  jobTitle: {
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

export default EmployerDashboard;