import React from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  StyleProp,
} from "react-native";
import { Colors } from "@/constants/colors";
import { Typography } from "@/constants/typography";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "text";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function Button({
  title,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const getButtonStyle = () => {
    let buttonStyle: ViewStyle = { ...styles.button };

    switch (variant) {
      case "primary":
        buttonStyle = { ...buttonStyle, ...styles.primary };
        break;
      case "secondary":
        buttonStyle = { ...buttonStyle, ...styles.secondary };
        break;
      case "outline":
        buttonStyle = { ...buttonStyle, ...styles.outline };
        break;
      case "text":
        buttonStyle = { ...buttonStyle, ...styles.text };
        break;
    }

    switch (size) {
      case "small":
        buttonStyle = { ...buttonStyle, ...styles.small };
        break;
      case "medium":
        buttonStyle = { ...buttonStyle, ...styles.medium };
        break;
      case "large":
        buttonStyle = { ...buttonStyle, ...styles.large };
        break;
    }

    if (disabled) {
      buttonStyle = { ...buttonStyle, ...styles.disabled };
    }

    return buttonStyle;
  };

  const getTextStyle = () => {
    let textStyleObj: TextStyle = { ...styles.buttonText };

    switch (variant) {
      case "primary":
        textStyleObj = { ...textStyleObj, ...styles.primaryText };
        break;
      case "secondary":
        textStyleObj = { ...textStyleObj, ...styles.secondaryText };
        break;
      case "outline":
        textStyleObj = { ...textStyleObj, ...styles.outlineText };
        break;
      case "text":
        textStyleObj = { ...textStyleObj, ...styles.textVariantText };
        break;
    }

    if (disabled) {
      textStyleObj = { ...textStyleObj, ...styles.disabledText };
    }

    return textStyleObj;
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === "primary" || variant === "secondary"
              ? Colors.white
              : Colors.primary[600]
          }
        />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  primary: {
    backgroundColor: Colors.primary[600],
  },
  secondary: {
    backgroundColor: Colors.secondary[400],
  },
  outline: {
    backgroundColor: Colors.transparent,
    borderWidth: 2,
    borderColor: Colors.primary[600],
  },
  text: {
    backgroundColor: Colors.transparent,
  },

  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
  },

  buttonText: {
    ...Typography.buttonText,
    textAlign: "center",
  },
  primaryText: {
    color: Colors.white,
  },
  secondaryText: {
    color: Colors.white,
  },
  outlineText: {
    color: Colors.primary[600],
  },
  textVariantText: {
    color: Colors.primary[600],
  },

  disabled: {
    opacity: 0.5,
  },
  disabledText: {
    color: Colors.neutral[500],
  },
});
