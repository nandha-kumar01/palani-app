import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ScrollView 
} from 'react-native';
import { testRegistrationAPI } from '../utils/apiHelper';
import { apiService } from '../services/api';

const APITestScreen: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testRegistration = async () => {
    setLoading(true);
    try {
      const response = await testRegistrationAPI();
      addTestResult(`✅ Registration Success: ${response.message}`);
      Alert.alert('Success', 'Registration test passed!');
    } catch (error: any) {
      addTestResult(`❌ Registration Error: ${error.message}`);
      Alert.alert('Test Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  const testWithInvalidData = async () => {
    setLoading(true);
    try {
      await apiService.register({
        name: '',
        email: 'invalid-email',
        phone: '123',
        password: '123',
      });
      addTestResult('❌ Should have failed with invalid data');
    } catch (error: any) {
      addTestResult(`✅ Correctly rejected invalid data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testNetworkError = async () => {
    setLoading(true);
    try {
      // Test with invalid URL
      const response = await fetch('https://invalid-url-that-does-not-exist.com');
      addTestResult('❌ Should have failed with network error');
    } catch (error: any) {
      addTestResult(`✅ Network error handled: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>API Integration Tests</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.testButton]} 
          onPress={testRegistration}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Testing...' : 'Test Registration API'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.testButton]} 
          onPress={testWithInvalidData}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Invalid Data</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.testButton]} 
          onPress={testNetworkError}
          disabled={loading}
        >
          <Text style={styles.buttonText}>Test Network Error</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.clearButton]} 
          onPress={clearResults}
        >
          <Text style={styles.buttonText}>Clear Results</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Test Results:</Text>
        {testResults.length === 0 ? (
          <Text style={styles.noResults}>No tests run yet</Text>
        ) : (
          testResults.map((result, index) => (
            <Text key={index} style={styles.resultText}>
              {result}
            </Text>
          ))
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>API Configuration:</Text>
        <Text style={styles.infoText}>Base URL: https://palani-admin.vercel.app/api</Text>
        <Text style={styles.infoText}>Endpoint: /auth/register</Text>
        <Text style={styles.infoText}>Group ID: Not required</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  buttonContainer: {
    marginBottom: 30,
  },
  button: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  testButton: {
    backgroundColor: '#667eea',
  },
  clearButton: {
    backgroundColor: '#f56565',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    minHeight: 200,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  noResults: {
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  resultText: {
    fontSize: 14,
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 4,
  },
  infoContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  infoText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666',
  },
});

export default APITestScreen;