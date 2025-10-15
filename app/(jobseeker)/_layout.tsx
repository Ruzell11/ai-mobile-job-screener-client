// app/(jobseeker)/_layout.tsx
import { Stack } from 'expo-router';

export default function JobSeekerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="index" 
        options={{ title: 'Job Seeker Dashboard' }} 
      />
        <Stack.Screen 
        name="profile" 
        options={{ title: 'Job Seeker Profile' }} 
      />
      <Stack.Screen 
        name="my-applications" 
        options={{ title: 'My Applications' }} 
      />
      <Stack.Screen 
        name="saved-jobs" 
        options={{ title: 'Saved Jobs' }} 
      />
      <Stack.Screen 
        name="application-details" 
        options={{ title: 'Application Details' }} 
      />
      <Stack.Screen 
        name="job-details" 
        options={{ title: 'Job Details' }} 
      />
      <Stack.Screen 
        name="apply-job" 
        options={{ title: 'Apply for Job' }} 
      />
      <Stack.Screen 
        name="edit-profile" 
        options={{ title: 'Edit Profile' }} 
      />
      <Stack.Screen 
        name="manage-skills" 
        options={{ title: 'Manage Skills' }} 
      />
      <Stack.Screen 
        name="manage-experience" 
        options={{ title: 'Work Experience' }} 
      />
      <Stack.Screen 
        name="manage-education" 
        options={{ title: 'Education' }} 
      />
      <Stack.Screen 
        name="upload-resume" 
        options={{ title: 'Upload Resume' }} 
      />
      <Stack.Screen 
        name="search-jobs" 
        options={{ title: 'Search Jobs' }} 
      />
      <Stack.Screen 
        name="recommended-jobs" 
        options={{ title: 'Recommended Jobs' }} 
      />
      <Stack.Screen 
        name="notifications" 
        options={{ title: 'Notifications' }} 
      />
      <Stack.Screen 
        name="settings" 
        options={{ title: 'Settings' }} 
      />
    </Stack>
  );
}