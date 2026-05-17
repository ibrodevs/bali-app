import React from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { formatConvertedMoney } from "../data";
import { COLORS, SHADOWS } from "../theme";
import { AppText, Badge, ScooterThumb, Stars } from "../components";

export function SummaryRow({ label, value, border = false, labelColor = COLORS.gray500, valueColor = COLORS.black }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        gap: 12,
        paddingVertical: 9,
        borderTopWidth: border ? 1 : 0,
        borderTopColor: COLORS.gray200,
      }}
    >
      <AppText family="inter" style={{ fontSize: 13, color: labelColor, flex: 1 }}>
        {label}
      </AppText>
      <AppText family="inter" weight="bold" style={{ fontSize: 13, color: valueColor, textAlign: "right", flexShrink: 1 }}>
        {value}
      </AppText>
    </View>
  );
}

export function EmptyCard({ title, body }) {
  return (
    <View style={{ borderRadius: 18, backgroundColor: COLORS.white, padding: 20, ...SHADOWS.card }}>
      <AppText family="sora" weight="bold" style={{ fontSize: 17, color: COLORS.black, marginBottom: 6 }}>
        {title}
      </AppText>
      <AppText family="inter" style={{ fontSize: 14, color: COLORS.gray500, lineHeight: 22 }}>
        {body}
      </AppText>
    </View>
  );
}

export function SectionHeader({ title, actionLabel, onPress }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
      <AppText family="sora" weight="bold" style={{ fontSize: 18, color: COLORS.black }}>
        {title}
      </AppText>
      {actionLabel && onPress ? (
        <Pressable onPress={onPress}>
          <AppText family="inter" weight="medium" style={{ fontSize: 13, color: COLORS.gray500 }}>
            {actionLabel}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

export function ScreenHeader({ title, onBack, rightAction }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 24 }}>
      {onBack ? (
        <Pressable onPress={onBack}>
          <Ionicons name="chevron-back" size={20} color={COLORS.gray500} />
        </Pressable>
      ) : null}
      <AppText family="sora" weight="bold" style={{ flex: 1, fontSize: 20, color: COLORS.black }}>
        {title}
      </AppText>
      {rightAction || null}
    </View>
  );
}

export function FeaturePill({ children, dark = false }) {
  return (
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: dark ? "rgba(255,255,255,0.08)" : COLORS.gray100,
        borderWidth: 1,
        borderColor: dark ? "rgba(255,255,255,0.08)" : COLORS.gray200,
      }}
    >
      <AppText family="inter" weight="semibold" style={{ fontSize: 12, color: dark ? COLORS.white : COLORS.gray700 }}>
        {children}
      </AppText>
    </View>
  );
}

export function FleetCard({ actionLabel, copy, currency, language, onPress, scooter }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: COLORS.white,
        borderRadius: 24,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: COLORS.gray200,
        ...SHADOWS.card,
      }}
    >
      <View style={{ padding: 10, paddingBottom: 0 }}>
        <ScooterThumb scooter={scooter} height={208} />
      </View>
      <View style={{ paddingHorizontal: 18, paddingTop: 16, paddingBottom: 18 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 14, alignItems: "flex-start", marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Badge variant={scooter.available ? "green" : "default"}>{scooter.available ? copy.available : copy.unavailable}</Badge>
              <AppText family="inter" weight="bold" style={{ fontSize: 11, color: COLORS.gray500, textTransform: "uppercase", letterSpacing: 1 }}>
                {scooter.typeLabel}
              </AppText>
            </View>
            <AppText family="sora" weight="extrabold" style={{ fontSize: 20, color: COLORS.black, letterSpacing: -0.7 }}>
              {scooter.name}
            </AppText>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 }}>
              <Stars rating={scooter.rating} size={12} />
              <AppText family="inter" style={{ fontSize: 12, color: COLORS.gray500 }}>
                {`${scooter.reviews} ${copy.reviewsLabel}`}
              </AppText>
            </View>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <AppText family="inter" weight="bold" style={{ fontSize: 10, color: COLORS.gray500, letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 }}>
              {copy.perDay}
            </AppText>
            <AppText family="sora" weight="black" style={{ fontSize: 28, color: COLORS.black, letterSpacing: -1 }}>
              {formatConvertedMoney(scooter.priceUSD, "USD", currency, language)}
            </AppText>
          </View>
        </View>

        <AppText family="inter" style={{ fontSize: 13, lineHeight: 22, color: COLORS.gray500, marginBottom: 14 }}>
          {scooter.description}
        </AppText>

        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          <FeaturePill>{scooter.engine}</FeaturePill>
          {(scooter.features || []).slice(0, 2).map((feature) => (
            <FeaturePill key={feature}>{feature}</FeaturePill>
          ))}
        </View>

        <View style={{ minHeight: 50, borderRadius: 16, backgroundColor: COLORS.black, alignItems: "center", justifyContent: "center", paddingHorizontal: 20 }}>
          <AppText family="inter" weight="bold" style={{ fontSize: 14, color: COLORS.white }}>
            {actionLabel}
          </AppText>
        </View>
      </View>
    </Pressable>
  );
}

export function CheckoutSteps({ copy, current }) {
  const steps = [copy.selectDates, copy.deliveryExtras, copy.payment];
  return (
    <View style={{ flexDirection: "row", gap: 6, marginBottom: 24 }}>
      {steps.map((label, index) => (
        <View key={label} style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 4 }}>
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 999,
              backgroundColor: index <= current ? COLORS.gold : COLORS.gray200,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AppText family="sora" weight="extrabold" style={{ fontSize: 11, color: index <= current ? COLORS.black : COLORS.gray500 }}>
              {index + 1}
            </AppText>
          </View>
          <AppText family="inter" weight={index === current ? "bold" : "regular"} style={{ flex: 1, fontSize: 11, color: index === current ? COLORS.black : COLORS.gray500 }}>
            {label}
          </AppText>
        </View>
      ))}
    </View>
  );
}
