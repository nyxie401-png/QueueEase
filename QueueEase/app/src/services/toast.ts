/**
 * Toast notification service
 * Uses a simple alert fallback; replace with react-native-toast-message in production
 */
import { Alert } from 'react-native';

class ToastService {
  success(message: string) {
    console.log(`[SUCCESS] ${message}`);
  }

  error(message: string) {
    console.error(`[ERROR] ${message}`);
    Alert.alert('Error', message);
  }

  info(message: string) {
    console.info(`[INFO] ${message}`);
  }
}

export default new ToastService();
