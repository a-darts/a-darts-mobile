import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const aspectRatio = height / width;
const isTablet = aspectRatio < 1.6 && width > 600;

// Función para escalar el tamaño de letra en tablet (*1.5)
const scale = (size) => isTablet ? Math.round(size * 1.5) : size;


export const typography = {
  fontFamily: {
    regular: 'Manrope_400Regular',
    medium: 'Manrope_500Medium',
    semiBold: 'Manrope_600SemiBold',
    bold: 'Manrope_700Bold',

    title: 'SpaceGrotesk_700Bold',
    subTitle: 'SpaceGrotesk_500Medium',

    primaryButtonText: 'SpaceGrotesk_700Bold',
    secondaryButtonText: 'SpaceGrotesk_500Medium',
    tertiaryButtonText: 'Manrope_400Regular',
  },
  sizes: {
    xxs: scale(10),
    xs: scale(12),
    sm: scale(14),
    md: scale(16),
    lg: scale(18),
    xl: scale(20),
    xxl: scale(24),
    xxxl: scale(28),
    h1: scale(32),
    leftScore: scale(40),
  },
};
