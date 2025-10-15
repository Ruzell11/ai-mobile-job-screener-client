// components/JobCard.tsx
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { EmploymentType, ExperienceLevel, JobWithDetails } from '../types';

interface JobCardProps {
  job: JobWithDetails;
  onPress: () => void;
  onSave: () => void;
}

export default function JobCard({ job, onPress, onSave }: JobCardProps) {
  const formatSalary = () => {
    if (!job.salaryMin && !job.salaryMax) return 'Salary not specified';
    
    const format = (amount: number) => {
      if (amount >= 1000000) {
        return `$${(amount / 1000000).toFixed(1)}M`;
      } else if (amount >= 1000) {
        return `$${(amount / 1000).toFixed(0)}K`;
      }
      return `$${amount}`;
    };

    if (job.salaryMin && job.salaryMax) {
      return `${format(job.salaryMin)} - ${format(job.salaryMax)}`;
    } else if (job.salaryMin) {
      return `From ${format(job.salaryMin)}`;
    } else if (job.salaryMax) {
      return `Up to ${format(job.salaryMax)}`;
    }
  };

  const formatPostedDate = () => {
    const now = new Date();
    const posted = new Date(job.createdAt);
    const diffMs = now.getTime() - posted.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  const getJobTypeColor = () => {
    switch (job.employmentType) {
      case EmploymentType.FULL_TIME: return '#4CAF50';
      case EmploymentType.PART_TIME: return '#FF9800';
      case EmploymentType.CONTRACT: return '#2196F3';
      case EmploymentType.INTERNSHIP: return '#9C27B0';
      case EmploymentType.FREELANCE: return '#795548';
      default: return '#666';
    }
  };

  const getJobTypeLabel = () => {
    return job.employmentType.replace('_', '-');
  };

  const getExperienceLevelColor = () => {
    switch (job.experienceLevel) {
      case ExperienceLevel.ENTRY: return '#4CAF50';
      case ExperienceLevel.INTERMEDIATE: return '#2196F3';
      case ExperienceLevel.SENIOR: return '#FF9800';
      case ExperienceLevel.LEAD: return '#9C27B0';
      case ExperienceLevel.EXECUTIVE: return '#F44336';
      default: return '#666';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.companyInfo}>
          {job.employer?.logo ? (
            <Image
              source={{ uri: job.employer.logo }}
              style={styles.companyLogo}
            />
          ) : (
            <View style={styles.companyLogoPlaceholder}>
              <MaterialIcons name="business" size={24} color="#4A90E2" />
            </View>
          )}
          <View style={styles.headerText}>
            <Text style={styles.jobTitle} numberOfLines={1}>
              {job.title}
            </Text>
            <Text style={styles.companyName} numberOfLines={1}>
              {job.employer?.companyName || 'Company'}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={(e) => {
            e.stopPropagation();
            onSave();
          }}
        >
          <MaterialIcons
            name={job.isSaved ? 'bookmark' : 'bookmark-border'}
            size={24}
            color={job.isSaved ? '#4A90E2' : '#999'}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.tagsContainer}>
        <View style={[styles.tag, { backgroundColor: getJobTypeColor() + '20' }]}>
          <MaterialIcons name="work" size={14} color={getJobTypeColor()} />
          <Text style={[styles.tagText, { color: getJobTypeColor() }]}>
            {getJobTypeLabel()}
          </Text>
        </View>
        <View
          style={[
            styles.tag,
            { backgroundColor: getExperienceLevelColor() + '20' },
          ]}
        >
          <MaterialIcons name="trending-up" size={14} color={getExperienceLevelColor()} />
          <Text style={[styles.tagText, { color: getExperienceLevelColor() }]}>
            {job.experienceLevel}
          </Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {job.description}
      </Text>

      {job.skills && job.skills.length > 0 && (
        <View style={styles.skillsContainer}>
          {job.skills.slice(0, 3).map((skillItem) => (
            <View key={skillItem.id} style={styles.skillChip}>
              <Text style={styles.skillText}>{skillItem.skill.name}</Text>
            </View>
          ))}
          {job.skills.length > 3 && (
            <View style={styles.skillChip}>
              <Text style={styles.skillText}>+{job.skills.length - 3}</Text>
            </View>
          )}
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.infoRow}>
          <MaterialIcons name="location-on" size={16} color="#666" />
          <Text style={styles.infoText}>{job.location}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialIcons name="payments" size={16} color="#666" />
          <Text style={styles.infoText}>{formatSalary()}</Text>
        </View>
      </View>

      <View style={styles.metaFooter}>
        <View style={styles.metaInfo}>
          <MaterialIcons name="access-time" size={14} color="#999" />
          <Text style={styles.metaText}>{formatPostedDate()}</Text>
        </View>
        {job._count && job._count.applications > 0 && (
          <View style={styles.metaInfo}>
            <MaterialIcons name="people" size={14} color="#999" />
            <Text style={styles.metaText}>
              {job._count.applications}{' '}
              {job._count.applications === 1 ? 'applicant' : 'applicants'}
            </Text>
          </View>
        )}
        {job.hasApplied && (
          <View style={styles.appliedBadge}>
            <MaterialIcons name="check-circle" size={14} color="#4CAF50" />
            <Text style={styles.appliedText}>Applied</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  companyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  companyLogo: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  companyLogoPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  jobTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    color: '#666',
  },
  saveButton: {
    padding: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  skillChip: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  skillText: {
    fontSize: 12,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: 13,
    color: '#666',
  },
  metaFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#999',
  },
  appliedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 'auto',
    backgroundColor: '#E8F5E9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  appliedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
});