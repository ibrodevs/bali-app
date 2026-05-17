import React from "react";
import { Image, Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../theme";
import { AppText } from "./core";

export function ScooterThumb({ scooter, height = 150 }) {
  const imageUri =
    scooter?.mainImage ||
    scooter?.main_image ||
    scooter?.imageUrl ||
    scooter?.gallery?.[0]?.image ||
    null;

  return (
    <LinearGradient
      colors={[scooter.accent || COLORS.black, "#1A1A1A"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ height, borderRadius: 18, overflow: "hidden", alignItems: "center", justifyContent: "center" }}
    >
      {imageUri ? (
        <>
          <Image
            source={{ uri: imageUri }}
            resizeMode="contain"
            style={{ width: "100%", height: "100%", position: "absolute", left: 0, top: 0 }}
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.04)", "rgba(0,0,0,0.3)"]}
            style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
          />
          <View
            style={{
              position: "absolute",
              left: "12%",
              right: "12%",
              bottom: 10,
              height: 20,
              backgroundColor: "rgba(0,0,0,0.28)",
              borderRadius: 999,
              opacity: 0.45,
              transform: [{ scaleX: 1.05 }],
            }}
          />
        </>
      ) : (
        <View style={{ alignItems: "center", paddingHorizontal: 20 }}>
          <AppText family="sora" weight="bold" style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", textAlign: "center" }}>
            {scooter.name}
          </AppText>
          <AppText family="inter" weight="medium" style={{ marginTop: 4, fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: COLORS.gold }}>
            {scooter.engine}
          </AppText>
        </View>
      )}
    </LinearGradient>
  );
}

export function GlassCircleButton({ icon, color = COLORS.white, onPress, style }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ width: 40, height: 40, borderRadius: 12, overflow: "hidden", opacity: pressed ? 0.82 : 1 }, style]}>
      <BlurView intensity={35} tint="dark" style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Ionicons name={icon} size={20} color={color} />
      </BlurView>
    </Pressable>
  );
}

export function BottomNav({ active, onChange, labels = {} }) {
  const insets = useSafeAreaInsets();
  const tabs = [
    { key: "home", icon: "home", inactiveIcon: "home-outline", label: labels.home || "Home" },
    { key: "fleet", icon: "search", inactiveIcon: "search-outline", label: labels.fleet || "Fleet" },
    { key: "bookings", icon: "document-text", inactiveIcon: "document-text-outline", label: labels.bookings || "Bookings" },
    { key: "profile", icon: "person", inactiveIcon: "person-outline", label: labels.profile || "Profile" },
  ];

  return (
    <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: "#EBEBEB", paddingTop: 10, paddingBottom: Math.max(insets.bottom, 16), flexDirection: "row" }}>
      {tabs.map((tab) => {
        const selected = active === tab.key;
        return (
          <Pressable key={tab.key} onPress={() => onChange(tab.key)} style={{ flex: 1, alignItems: "center", gap: 3 }}>
            <Ionicons name={selected ? tab.icon : tab.inactiveIcon} size={20} color={selected ? COLORS.black : COLORS.gray500} />
            <AppText family="inter" weight="semibold" style={{ fontSize: 10, color: selected ? COLORS.black : COLORS.gray500 }}>
              {tab.label}
            </AppText>
            <View style={{ marginTop: 2, width: 4, height: 4, borderRadius: 999, backgroundColor: selected ? COLORS.gold : "transparent" }} />
          </Pressable>
        );
      })}
    </View>
  );
}
