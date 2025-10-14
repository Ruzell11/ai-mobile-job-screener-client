// app/(employer)/_layout.tsx
import { Stack } from 'expo-router';

export default function EmployerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Employer Dashboard' }} />
      <Stack.Screen name="create-job" options={{ title: 'Create Job' }} />
      <Stack.Screen name="my-jobs" options={{ title: 'My Jobs' }} />
    </Stack>
  );
}
