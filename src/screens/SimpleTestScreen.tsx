import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const SimpleTestScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🎯 App is Working!</Text>
      <Text style={styles.subtext}>This is a simple test to verify the app loads</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#667eea',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
  },
  subtext: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
  },
});

export default SimpleTestScreen;