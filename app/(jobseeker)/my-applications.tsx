// app/(jobseeker)/my-applications.tsx
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
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { applicationAPI } from '../config/api';

interface Application {
  id: string;
  job: {
    id: string;
    title: string;
    location: string;
    salaryRange: string;
    employer: {
      companyName: string;
      logo: string | null;
    };
  };
  status: string;
  appliedAt: string;
  updatedAt: string;
  coverLetter: string | null;
}

type FilterStatus = 'ALL' | 'PENDING' | 'REVIEWING' | 'INTERVIEW_SCHEDULED' | 'OFFERED' | 'ACCEPTED' | 'REJECTED';

export default function MyApplicationsScreen() {
  const router = useRouter();

  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    filterAndSearchApplications();
  }, [applications, searchQuery, filterStatus]);

  const loadApplications = async () => {
    try {
      const response = await applicationAPI.getMyApplications();
      console.log('Applications response:', response.data);
      
      if (response.data?.applications) {
        setApplications(response.data.applications);
      } else if (Array.isArray(response.data)) {
        setApplications(response.data);
      }
    } catch (error: any) {
      console.error('Error loading applications:', error);
      Alert.alert('Error', 'Failed to load applications');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const filterAndSearchApplications = () => {
    let filtered = [...applications];

    // Filter by status
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(app => app.status === filterStatus);
    }

    // Search by job title or company name
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        app =>
          app.job.title.toLowerCase().includes(query) ||
          app.job.employer.companyName.toLowerCase().includes(query)
      );
    }

    setFilteredApplications(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadApplications();
  };

  const handleWithdrawApplication = (applicationId: string, jobTitle: string) => {
    Alert.alert(
      'Withdraw Application',
      `Are you sure you want to withdraw your application for "${jobTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: async () => {
            try {
              await applicationAPI.withdrawApplication(applicationId);
              Alert.alert('Success', 'Application withdrawn successfully');
              await loadApplications();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.error || 'Failed to withdraw application');
            }
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
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusStats = () => {
    return {
      total: applications.length,
      pending: applications.filter(app => app.status === 'PENDING').length,
      reviewing: applications.filter(app => app.status === 'REVIEWING').length,
      interview: applications.filter(app => app.status === 'INTERVIEW_SCHEDULED').length,
      offered: applications.filter(app => app.status === 'OFFERED').length,
      accepted: applications.filter(app => app.status === 'ACCEPTED').length,
      rejected: applications.filter(app => app.status === 'REJECTED').length,
    };
  };

  const stats = getStatusStats();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Loading applications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Applications</Text>
        <View style={styles.headerRight}>
          <Text style={styles.applicationCount}>{stats.total}</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by job title or company..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialIcons name="close" size={20} color="#666" />
          </TouchableOpacity>
        )}
      </View>

      {/* Status Filter Tabs */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        <TouchableOpacity
          style={[styles.filterTab, filterStatus === 'ALL' && styles.filterTabActive]}
          onPress={() => setFilterStatus('ALL')}
        >
          <Text style={[styles.filterTabText, filterStatus === 'ALL' && styles.filterTabTextActive]}>
            All ({stats.total})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filterStatus === 'PENDING' && styles.filterTabActive]}
          onPress={() => setFilterStatus('PENDING')}
        >
          <Text style={[styles.filterTabText, filterStatus === 'PENDING' && styles.filterTabTextActive]}>
            Pending ({stats.pending})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filterStatus === 'REVIEWING' && styles.filterTabActive]}
          onPress={() => setFilterStatus('REVIEWING')}
        >
          <Text style={[styles.filterTabText, filterStatus === 'REVIEWING' && styles.filterTabTextActive]}>
            Reviewing ({stats.reviewing})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filterStatus === 'INTERVIEW_SCHEDULED' && styles.filterTabActive]}
          onPress={() => setFilterStatus('INTERVIEW_SCHEDULED')}
        >
          <Text style={[styles.filterTabText, filterStatus === 'INTERVIEW_SCHEDULED' && styles.filterTabTextActive]}>
            Interview ({stats.interview})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filterStatus === 'OFFERED' && styles.filterTabActive]}
          onPress={() => setFilterStatus('OFFERED')}
        >
          <Text style={[styles.filterTabText, filterStatus === 'OFFERED' && styles.filterTabTextActive]}>
            Offered ({stats.offered})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filterStatus === 'REJECTED' && styles.filterTabActive]}
          onPress={() => setFilterStatus('REJECTED')}
        >
          <Text style={[styles.filterTabText, filterStatus === 'REJECTED' && styles.filterTabTextActive]}>
            Rejected ({stats.rejected})
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Applications List */}
      <ScrollView
        style={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredApplications.length > 0 ? (
          filteredApplications.map((application) => (
            <TouchableOpacity
              key={application.id}
              style={styles.applicationCard}
              onPress={() => {
                router.push(`/(jobseeker)/application-details?id=${application.id}`);
              }}
            >
              <View style={styles.applicationHeader}>
                <View style={styles.companyLogoContainer}>
                  {application.job.employer.logo ? (
                    <Text style={styles.companyLogoText}>
                      {application.job.employer.companyName.charAt(0)}
                    </Text>
                  ) : (
                    <MaterialIcons name="business" size={24} color="#4A90E2" />
                  )}
                </View>

                <View style={styles.applicationInfo}>
                  <Text style={styles.jobTitle} numberOfLines={1}>
                    {application.job.title}
                  </Text>
                  <Text style={styles.companyName} numberOfLines={1}>
                    {application.job.employer.companyName}
                  </Text>
                  <View style={styles.jobMetaContainer}>
                    <View style={styles.jobMeta}>
                      <MaterialIcons name="location-on" size={14} color="#999" />
                      <Text style={styles.jobMetaText}>{application.job.location}</Text>
                    </View>
                    {application.job.salaryRange && (
                      <View style={styles.jobMeta}>
                        <MaterialIcons name="attach-money" size={14} color="#999" />
                        <Text style={styles.jobMetaText}>{application.job.salaryRange}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.applicationFooter}>
                <View style={styles.applicationDates}>
                  <Text style={styles.applicationDate}>
                    Applied {formatDate(application.appliedAt)}
                  </Text>
                  {application.updatedAt !== application.appliedAt && (
                    <Text style={styles.applicationDate}>
                      • Updated {formatDate(application.updatedAt)}
                    </Text>
                  )}
                </View>

                <View style={styles.applicationActions}>
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

                  {(application.status === 'PENDING' || application.status === 'REVIEWING') && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleWithdrawApplication(application.id, application.job.title);
                      }}
                    >
                      <MaterialIcons name="cancel" size={20} color="#F44336" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="inbox" size={64} color="#ccc" />
            <Text style={styles.emptyStateText}>
              {searchQuery || filterStatus !== 'ALL'
                ? 'No applications found'
                : 'No applications yet'}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery || filterStatus !== 'ALL'
                ? 'Try adjusting your search or filters'
                : 'Start applying to jobs to see your applications here'}
            </Text>
            {!searchQuery && filterStatus === 'ALL' && (
              <TouchableOpacity
                style={styles.browseJobsButton}
                onPress={() => router.push('/(jobseeker)/jobs')}
              >
                <Text style={styles.browseJobsButtonText}>Browse Jobs</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 40,
    alignItems: 'flex-end',
  },
  applicationCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A90E2',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filterContainer: {
    maxHeight: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterContent: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  filterTabActive: {
    backgroundColor: '#4A90E2',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  filterTabTextActive: {
    color: '#fff',
  },
  listContainer: {
    flex: 1,
    padding: 20,
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
    marginBottom: 12,
    gap: 12,
  },
  companyLogoContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  companyLogoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  applicationInfo: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  jobMetaContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  jobMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  jobMetaText: {
    fontSize: 12,
    color: '#999',
  },
  applicationFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    gap: 8,
  },
  applicationDates: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  applicationDate: {
    fontSize: 12,
    color: '#999',
  },
  applicationActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FFEBEE',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
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
});