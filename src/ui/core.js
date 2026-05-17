import React from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS, SHADOWS } from "../theme";

const EMOJI_IONICON_MAP = {
  "📍": "location-outline",
  "📅": "calendar-outline",
  "⏱": "time-outline",
  "🛵": "speedometer-outline",
  "✨": "sparkles-outline",
  "⚡": "flash-outline",
  "🚗": "car-sport-outline",
  "🚚": "car-outline",
  "🛡️": "shield-checkmark-outline",
  "📱": "phone-portrait-outline",
  "📋": "document-text-outline",
  "📄": "document-outline",
  "🔔": "notifications-outline",
  "💬": "chatbubble-ellipses-outline",
  "👤": "person-outline",
  "💳": "card-outline",
  "💵": "cash-outline",
  "📲": "phone-portrait-outline",
  "🔒": "lock-closed-outline",
  "📶": "wifi-outline",
  "🎒": "bag-handle-outline",
  "⛑️": "shield-checkmark-outline",
  "🪖": "shield-outline",
  "🧥": "shirt-outline",
  "🔍": "search-outline",
};

const FLAG_CODE_MAP = {
  "🇦🇺": "AU",
  "🇷🇺": "RU",
  "🇨🇳": "CN",
  "🇬🇧": "UK",
  "🇮🇩": "ID",
  "🇩🇪": "DE",
  "🇫🇷": "FR",
};

function resolveIonicon(icon) {
  if (!icon) return "ellipse-outline";
  return EMOJI_IONICON_MAP[icon] || icon;
}

function resolveFlagCode(value) {
  return FLAG_CODE_MAP[value] || String(value || "").toUpperCase().slice(0, 2) || "--";
}

function resolveFont(family, weight) {
  if (family === "sora") {
    if (weight === "regular") return FONTS.soraRegular;
    if (weight === "semibold") return FONTS.soraSemiBold;
    if (weight === "bold") return FONTS.soraBold;
    if (weight === "extrabold") return FONTS.soraExtraBold;
    return FONTS.soraBlack;
  }

  if (weight === "medium") return FONTS.interMedium;
  if (weight === "semibold") return FONTS.interSemiBold;
  if (weight === "bold") return FONTS.interBold;
  return FONTS.interRegular;
}

export function AppText({ children, family = "inter", weight = "regular", style, ...rest }) {
  return (
    <Text allowFontScaling={false} style={[{ fontFamily: resolveFont(family, weight) }, style]} {...rest}>
      {children}
    </Text>
  );
}

export function CenteredScrollView({
  children,
  backgroundColor = COLORS.white,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
}) {
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor }}
      contentContainerStyle={[{ flexGrow: 1, width: "100%" }, contentContainerStyle]}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
    >
      {children}
    </ScrollView>
  );
}

export function PageContent({ children, style }) {
  return <View style={[{ width: "100%", maxWidth: 430, alignSelf: "center" }, style]}>{children}</View>;
}

export function PrimaryButton({ children, variant = "gold", style, textStyle, ...rest }) {
  const variants = {
    gold: { backgroundColor: COLORS.gold, color: COLORS.black },
    dark: { backgroundColor: COLORS.black, color: COLORS.white },
    ghost: { backgroundColor: COLORS.gray100, color: COLORS.black },
  };
  const current = variants[variant];
  const disabled = rest.disabled;

  return (
    <Pressable
      style={({ pressed }) => [
        {
          minHeight: 54,
          borderRadius: 14,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
          opacity: disabled ? 0.55 : pressed ? 0.88 : 1,
        },
        current,
        variant === "gold" ? SHADOWS.gold : null,
        style,
      ]}
      {...rest}
    >
      <AppText family="inter" weight="bold" style={[{ fontSize: 15, color: current.color }, textStyle]}>
        {children}
      </AppText>
    </Pressable>
  );
}

export function Badge({ children, icon, variant = "default", style }) {
  const variants = {
    default: { backgroundColor: COLORS.gray100, color: COLORS.gray700 },
    gold: { backgroundColor: COLORS.gold, color: COLORS.black },
    green: { backgroundColor: COLORS.successBg, color: COLORS.success },
    black: { backgroundColor: COLORS.black, color: COLORS.white },
  };
  const current = variants[variant] ?? variants.default;

  return (
    <View style={[{ borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4, backgroundColor: current.backgroundColor }, style]}>
      <AppText family="inter" weight="bold" style={{ color: current.color, fontSize: 10, letterSpacing: 0.7, textTransform: "uppercase" }}>
        {icon ? <Ionicons name={icon} size={10} color={current.color} /> : null}
        {icon ? " " : ""}
        {children}
      </AppText>
    </View>
  );
}

export function ResolvedIcon({ icon, size = 20, color = COLORS.black, style }) {
  return <Ionicons name={resolveIonicon(icon)} size={size} color={color} style={style} />;
}

export function LocaleBadge({ value, style, textStyle }) {
  return (
    <View
      style={[
        {
          minWidth: 40,
          height: 28,
          paddingHorizontal: 8,
          borderRadius: 999,
          backgroundColor: "rgba(255,215,0,0.14)",
          borderWidth: 1,
          borderColor: "rgba(255,215,0,0.35)",
          alignItems: "center",
          justifyContent: "center",
        },
        style,
      ]}
    >
      <AppText family="inter" weight="bold" style={[{ fontSize: 11, color: COLORS.black, letterSpacing: 0.8 }, textStyle]}>
        {resolveFlagCode(value)}
      </AppText>
    </View>
  );
}

export function Stars({ rating = 5, size = 12 }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
      {Array.from({ length: 5 }, (_, index) => (
        <Ionicons
          key={index}
          name={index < Math.round(rating) ? "star" : "star-outline"}
          size={size}
          color={index < Math.round(rating) ? COLORS.gold : COLORS.gray300}
        />
      ))}
    </View>
  );
}

export function LoadingBlock({ label, color = COLORS.gold }) {
  return (
    <View style={{ paddingVertical: 24, alignItems: "center", justifyContent: "center", gap: 10 }}>
      <ActivityIndicator size="small" color={color} />
      {label ? (
        <AppText family="inter" style={{ fontSize: 13, color: COLORS.gray500 }}>
          {label}
        </AppText>
      ) : null}
    </View>
  );
}
