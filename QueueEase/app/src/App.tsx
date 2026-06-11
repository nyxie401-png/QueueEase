import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { useAuthStore } from './stores/authStore';
import RootNavigator from './navigation/RootNavigator';
import { Colors } from './theme';

const App = () => {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, []);

  return (
    <NavigationContainer>
      <StatusBar
        backgroundColor={Colors.primary}
        barStyle="light-content"
        translucent={false}
      />
      <RootNavigator />
    </NavigationContainer>
  );
};

export default App;
