import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const aspectRatio = height / width;

/**
 * `true` when the app is running on a tablet-sized device.
 * Condition: landscape-ish aspect ratio (< 1.6) AND width > 600 dp.
 */
export const isTablet = aspectRatio < 1.6 && width > 600;
