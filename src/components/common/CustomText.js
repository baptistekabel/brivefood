import React from 'react';
import { Text } from 'react-native';
import { typography } from '../../constants/theme';

const CustomText = ({ 
  children, 
  style, 
  weight = 'regular', 
  size = 'base',
  color,
  ...props 
}) => {
  const getFontFamily = (weight) => {
    switch (weight) {
      case 'medium':
        return typography.fontFamily.medium;
      case 'semibold':
        return typography.fontFamily.semibold;
      case 'bold':
        return typography.fontFamily.bold;
      default:
        return typography.fontFamily.regular;
    }
  };

  const textStyle = {
    fontFamily: getFontFamily(weight),
    fontSize: typography.fontSizes[size] || typography.fontSizes.base,
    color: color,
    ...style,
  };

  return (
    <Text style={textStyle} {...props}>
      {children}
    </Text>
  );
};

export default CustomText;