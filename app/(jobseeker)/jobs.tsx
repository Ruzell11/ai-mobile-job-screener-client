// app/(jobseeker)/jobs.tsx
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import JobCard from '../components/job-card';
import JobFiltersModal from '../components/job-filters-modal';
import { jobAPI as jobsAPI } from '../config/api';
import { JobFilters, JobWithDetails } from '../types';

export default function FindJobsScreen() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<JobFilters>({
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    totalPages: 1,
  });

  useEffect(() => {
    loadJobs();
  }, [filters]);

const loadJobs = async (isRefresh = false) => {
  try {
    if (isRefresh) {
      setIsRefreshing(true);
    } else if (filters.page === 1) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    const response = await jobsAPI.getAllJobs(filters);

    if (response.data?.jobs) {
      const newJobs = response.data.jobs;

      if (filters.page === 1 || isRefresh) {
        setJobs(newJobs);
      } else {
        setJobs((prev) => [...prev, ...newJobs]);
      }

      setPagination({
        total: response.data.pagination.total,
        page: response.data.pagination.page,
        totalPages: response.data.pagination.totalPages,
      });
    } else {
      console.warn('No jobs found in response:', response.data);
    }
  } catch (error) {
    console.error('Error loading jobs:', error);
    Alert.alert('Error', error.response?.data?.error || 'Failed to load jobs');
  } finally {
    setIsLoading(false);
    setIsRefreshing(false);
    setIsLoadingMore(false);
  }
};


  const handleSearch = () => {
    setFilters((prev) => ({
      ...prev,
      search: searchQuery,
      page: 1,
    }));
  };

  const handleRefresh = () => {
    setFilters((prev) => ({ ...prev, page: 1 }));
    loadJobs(true);
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && pagination.page < pagination.totalPages) {
      setFilters((prev) => ({
        ...prev,
        page: (prev.page || 1) + 1,
      }));
    }
  };

  const handleApplyFilters = (newFilters: JobFilters) => {
    setFilters({
      ...newFilters,
      page: 1,
    });
    setShowFilters(false);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setFilters({
      page: 1,
      limit: 10,
    });
  };

  const handleSaveJob = async (jobId: string) => {
    try {
      const job = jobs.find((j) => j.id === jobId);
      if (!job) return;

      if (job.isSaved) {
        await jobsAPI.unsaveJob(jobId);
        Alert.alert('Success', 'Job removed from saved');
      } else {
        await jobsAPI.saveJob(jobId);
        Alert.alert('Success', 'Job saved successfully');
      }

      // Update local state
      setJobs((prev) =>
        prev.map((j) =>
          j.id === jobId ? { ...j, isSaved: !j.isSaved } : j
        )
      );
    } catch (error: any) {
      console.error('Error saving job:', error);
      Alert.alert('Error', error.response?.data?.error || 'Failed to save job');
    }
  };

  const handleJobPress = (jobId: string) => {
    router.push(`/(jobseeker)/job-details/${jobId}`);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.location) count++;
    if (filters.employmentType) count++;
    if (filters.experienceLevel) count++;
    if (filters.salaryMin) count++;
    if (filters.skills && filters.skills.length > 0) count++;
    if (filters.isRemote) count++;
    return count;
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <MaterialIcons name="search" size={24} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search jobs, companies, keywords..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialIcons name="close" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <MaterialIcons name="search" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <MaterialIcons name="tune" size={20} color="#4A90E2" />
          <Text style={styles.filterButtonText}>Filters</Text>
          {getActiveFiltersCount() > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{getActiveFiltersCount()}</Text>
            </View>
          )}
        </TouchableOpacity>

        {getActiveFiltersCount() > 0 && (
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={handleClearFilters}
          >
            <Text style={styles.clearFiltersText}>Clear All</Text>
          </TouchableOpacity>
        )}

        <View style={styles.resultsCount}>
          <Text style={styles.resultsCountText}>
            {pagination.total} {pagination.total === 1 ? 'job' : 'jobs'} found
          </Text>
        </View>
      </View>

      {/* Active Filters Display */}
      {getActiveFiltersCount() > 0 && (
        <View style={styles.activeFilters}>
          {filters.location && (
            <View style={styles.filterChip}>
              <MaterialIcons name="location-on" size={16} color="#4A90E2" />
              <Text style={styles.filterChipText}>{filters.location}</Text>
              <TouchableOpacity
                onPress={() => setFilters({ ...filters, location: undefined, page: 1 })}
              >
                <MaterialIcons name="close" size={16} color="#4A90E2" />
              </TouchableOpacity>
            </View>
          )}
          {filters.employmentType && (
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>
                {filters.employmentType.replace('_', ' ')}
              </Text>
              <TouchableOpacity
                onPress={() => setFilters({ ...filters, employmentType: undefined, page: 1 })}
              >
                <MaterialIcons name="close" size={16} color="#4A90E2" />
              </TouchableOpacity>
            </View>
          )}
          {filters.experienceLevel && (
            <View style={styles.filterChip}>
              <Text style={styles.filterChipText}>{filters.experienceLevel}</Text>
              <TouchableOpacity
                onPress={() =>
                  setFilters({ ...filters, experienceLevel: undefined, page: 1 })
                }
              >
                <MaterialIcons name="close" size={16} color="#4A90E2" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="work-outline" size={80} color="#ccc" />
      <Text style={styles.emptyStateTitle}>No jobs found</Text>
      <Text style={styles.emptyStateText}>
        {searchQuery || getActiveFiltersCount() > 0
          ? 'Try adjusting your search or filters'
          : 'Check back later for new opportunities'}
      </Text>
      {(searchQuery || getActiveFiltersCount() > 0) && (
        <TouchableOpacity style={styles.clearButton} onPress={handleClearFilters}>
          <Text style={styles.clearButtonText}>Clear Search & Filters</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#4A90E2" />
        <Text style={styles.footerLoaderText}>Loading more jobs...</Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4A90E2" />
        <Text style={styles.loadingText}>Finding great jobs for you...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <JobCard
            job={item}
            onPress={() => handleJobPress(item.id)}
            onSave={() => handleSaveJob(item.id)}
          />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
      />

      <JobFiltersModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleApplyFilters}
        initialFilters={filters}
      />
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
  listContent: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    backgroundColor: '#4A90E2',
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
  },
  filterBadge: {
    backgroundColor: '#4A90E2',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  clearFiltersButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  clearFiltersText: {
    fontSize: 14,
    color: '#F44336',
    fontWeight: '600',
  },
  resultsCount: {
    flex: 1,
    alignItems: 'flex-end',
  },
  resultsCountText: {
    fontSize: 14,
    color: '#666',
  },
  activeFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    gap: 6,
  },
  filterChipText: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  clearButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    gap: 12,
  },
  footerLoaderText: {
    fontSize: 14,
    color: '#666',
  },
});