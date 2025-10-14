import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  companyName: string;
  contactPerson: string;
}

export default function RegisterScreen() {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    role: UserRole.JOB_SEEKER,
    firstName: '',
    lastName: '',
    companyName: '',
    contactPerson: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  const validateForm = (): string | null => {
    // Email validation
    if (!formData.email) {
      return 'Please enter your email';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email address';
    }

    // Role-specific validation
    if (formData.role === UserRole.JOB_SEEKER) {
      if (!formData.firstName.trim()) {
        return 'Please enter your first name';
      }
      if (!formData.lastName.trim()) {
        return 'Please enter your last name';
      }
    } else if (formData.role === UserRole.EMPLOYER) {
      if (!formData.companyName.trim()) {
        return 'Please enter your company name';
      }
      if (!formData.contactPerson.trim()) {
        return 'Please enter contact person name';
      }
    }

    // Password validation
    if (!formData.password) {
      return 'Please enter a password';
    }
    if (formData.password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }

    return null;
  };

  const handleRegister = async () => {
    // Validate form
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    setIsLoading(true);

    try {
      // Prepare registration data
      const registerData = {
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        role: formData.role,
        ...(formData.role === UserRole.JOB_SEEKER && {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
        }),
        ...(formData.role === UserRole.EMPLOYER && {
          companyName: formData.companyName.trim(),
          contactPerson: formData.contactPerson.trim(),
        }),
      };

      // Call register API
      const result = await register(registerData);

      if (result.success) {
        // Success! Show message and navigate
        Alert.alert(
          'Success',
          'Account created successfully! Welcome aboard!',
          [
            {
              text: 'OK',
              onPress: () => {
                // Auth state change will trigger redirect in _layout.tsx
              },
            },
          ]
        );
      } else {
        // Show error from backend
        Alert.alert(
          'Registration Failed',
          result.error || 'Unable to create account. Please try again.'
        );
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(
        'Error',
        'An unexpected error occurred. Please check your connection and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (key: keyof FormData, value: string | UserRole) => {
    setFormData({ ...formData, [key]: value });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join us and start your journey</Text>
        </View>

        {/* Role Selection */}
        <View style={styles.roleContainer}>
          <Text style={styles.label}>I am a:</Text>
          <View style={styles.roleButtons}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                formData.role === UserRole.JOB_SEEKER && styles.roleButtonActive,
              ]}
              onPress={() => updateFormData('role', UserRole.JOB_SEEKER)}
              disabled={isLoading}
            >
              <MaterialIcons
                name="person"
                size={24}
                color={formData.role === UserRole.JOB_SEEKER ? '#fff' : '#666'}
              />
              <Text
                style={[
                  styles.roleButtonText,
                  formData.role === UserRole.JOB_SEEKER && styles.roleButtonTextActive,
                ]}
              >
                Job Seeker
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleButton,
                formData.role === UserRole.EMPLOYER && styles.roleButtonActive,
              ]}
              onPress={() => updateFormData('role', UserRole.EMPLOYER)}
              disabled={isLoading}
            >
              <MaterialIcons
                name="business"
                size={24}
                color={formData.role === UserRole.EMPLOYER ? '#fff' : '#666'}
              />
              <Text
                style={[
                  styles.roleButtonText,
                  formData.role === UserRole.EMPLOYER && styles.roleButtonTextActive,
                ]}
              >
                Employer
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.form}>
          {/* Email */}
          <View style={styles.inputContainer}>
            <MaterialIcons name="email" size={24} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email *"
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              editable={!isLoading}
            />
          </View>

          {/* Conditional Fields Based on Role */}
          {formData.role === UserRole.JOB_SEEKER ? (
            <>
              <View style={styles.inputContainer}>
                <MaterialIcons name="person" size={24} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="First Name *"
                  value={formData.firstName}
                  onChangeText={(value) => updateFormData('firstName', value)}
                  autoCapitalize="words"
                  autoComplete="name-given"
                  textContentType="givenName"
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputContainer}>
                <MaterialIcons name="person" size={24} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Last Name *"
                  value={formData.lastName}
                  onChangeText={(value) => updateFormData('lastName', value)}
                  autoCapitalize="words"
                  autoComplete="name-family"
                  textContentType="familyName"
                  editable={!isLoading}
                />
              </View>
            </>
          ) : (
            <>
              <View style={styles.inputContainer}>
                <MaterialIcons name="business" size={24} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Company Name *"
                  value={formData.companyName}
                  onChangeText={(value) => updateFormData('companyName', value)}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputContainer}>
                <MaterialIcons name="person" size={24} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Contact Person *"
                  value={formData.contactPerson}
                  onChangeText={(value) => updateFormData('contactPerson', value)}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>
            </>
          )}

          {/* Password */}
          <View style={styles.inputContainer}>
            <MaterialIcons name="lock" size={24} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password (min 8 characters) *"
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password-new"
              textContentType="newPassword"
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
              disabled={isLoading}
            >
              <MaterialIcons
                name={showPassword ? 'visibility' : 'visibility-off'}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputContainer}>
            <MaterialIcons name="lock" size={24} color="#666" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password *"
              value={formData.confirmPassword}
              onChangeText={(value) => updateFormData('confirmPassword', value)}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password-new"
              textContentType="newPassword"
              editable={!isLoading}
            />
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.registerButton, isLoading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.registerButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/login')}
              disabled={isLoading}
            >
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
  },
  roleContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
  },
  roleButtonActive: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  roleButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  roleButtonTextActive: {
    color: '#fff',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 16,
    paddingHorizontal: 12,
    backgroundColor: '#f9f9f9',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 5,
  },
  registerButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 10,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: '#666',
    fontSize: 16,
  },
  loginLink: {
    color: '#4A90E2',
    fontSize: 16,
    fontWeight: '600',
  },
});