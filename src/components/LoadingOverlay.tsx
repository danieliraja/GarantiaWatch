import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

const LoadingOverlay: React.FC = () => {
  return (
    <View
      style={styles.container}
      accessibilityRole="status"
      accessibilityLiveRegion="polite"
      accessible
    >
      <ActivityIndicator animating size="large" />
      <Text style={styles.text}>Carregando...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  text: {
    marginTop: 16
  }
});

export default LoadingOverlay;
