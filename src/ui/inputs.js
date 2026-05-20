import React from "react";
import { Pressable, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS } from "../theme";
import { AppText } from "./core";

export function SearchBar({ placeholder, value, onChangeText }) {
  return (
    <View style={{ minHeight: 46, borderRadius: 12, backgroundColor: COLORS.gray100, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 14 }}>
      <Ionicons name="search" size={16} color={COLORS.gray500} />
      <TextInput
        allowFontScaling={false}
        placeholder={placeholder}
        placeholderTextColor={COLORS.gray500}
        style={{ flex: 1, paddingVertical: 12, color: COLORS.black, fontFamily: FONTS.interRegular, fontSize: 14 }}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}

export function FilterPill({ label, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: active ? COLORS.black : COLORS.gray100 }}>
      <AppText family="inter" weight="semibold" style={{ fontSize: 13, color: active ? COLORS.white : COLORS.gray700 }}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function LabeledInput({
  label,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType,
  placeholder,
  autoCapitalize = "sentences",
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
  rightIcon,
  onRightPress,
  rightIconColor = COLORS.gray500,
  containerStyle,
  ...rest
}) {
  return (
    <View style={style}>
      <AppText family="inter" weight="bold" style={{ fontSize: 11, color: COLORS.gray500, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 7 }}>
        {label}
      </AppText>
      <View style={[{ borderRadius: 12, backgroundColor: COLORS.gray100, paddingHorizontal: 16, flexDirection: "row", alignItems: multiline ? "flex-start" : "center" }, containerStyle]}>
        <TextInput
          allowFontScaling={false}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray500}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          {...rest}
          style={[
            {
              minHeight: multiline ? 110 : 50,
              flex: 1,
              color: COLORS.black,
              fontFamily: FONTS.interRegular,
              fontSize: 15,
              textAlignVertical: multiline ? "top" : "center",
              paddingTop: multiline ? 14 : 0,
              paddingBottom: multiline ? 14 : 0,
            },
            inputStyle,
          ]}
        />
        {rightIcon && onRightPress ? (
          <Pressable onPress={onRightPress} hitSlop={10} style={{ minHeight: multiline ? 110 : 50, justifyContent: "center", paddingLeft: 12 }}>
            <Ionicons name={rightIcon} size={20} color={rightIconColor} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
