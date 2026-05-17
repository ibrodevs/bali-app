import React, { useDeferredValue, useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  addDays,
  buildBookingDeliveryLabel,
  buildCalendarMonth,
  buildLocalBookingPreview,
  formatBookingStatus,
  formatDate,
  formatDateRange,
  formatDateTime,
  formatMoney,
  getBookingDuration,
  getSelectedRentalDays,
  getZoneById,
  vehicleMatchesCategory,
  vehicleMatchesSearch,
} from "./data";
import { COLORS, SHADOWS } from "./theme";
import {
  AppText,
  Badge,
  BottomNav,
  CenteredScrollView,
  FilterPill,
  GlassCircleButton,
  LabeledInput,
  LocaleBadge,
  LoadingBlock,
  PageContent,
  PrimaryButton,
  ResolvedIcon,
  ScooterThumb,
  SearchBar,
  Stars,
} from "./components";

function SummaryRow({ label, value, border = false, labelColor = COLORS.gray500, valueColor = COLORS.black }) {
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

function EmptyCard({ title, body }) {
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

function SectionHeader({ title, actionLabel, onPress }) {
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

function ScreenHeader({ title, onBack, rightAction }) {
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

function CheckoutSteps({ copy, current }) {
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

export function SplashScreen({ copy }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#060608", justifyContent: "center", alignItems: "center", paddingHorizontal: 28 }}>
      <View style={{ position: "absolute", width: 320, height: 320, borderRadius: 999, backgroundColor: "rgba(255,215,0,0.08)" }} />
      <View style={{ width: 72, height: 72, borderRadius: 20, backgroundColor: COLORS.gold, alignItems: "center", justifyContent: "center", marginBottom: 20, ...SHADOWS.gold }}>
        <AppText family="sora" weight="black" style={{ fontSize: 36, color: COLORS.black }}>
          S
        </AppText>
      </View>
      <AppText family="sora" weight="extrabold" style={{ fontSize: 28, color: COLORS.white, letterSpacing: -1.1, marginBottom: 6 }}>
        SCOOT <AppText family="sora" weight="regular" style={{ color: COLORS.gold }}>BALI</AppText>
      </AppText>
      <AppText family="inter" weight="medium" style={{ fontSize: 13, color: "rgba(255,255,255,0.42)", letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 56 }}>
        {copy.readyMvp}
      </AppText>
      <LoadingBlock color={COLORS.gold} />
    </View>
  );
}

export function OnboardingScreen({ step, navigation }) {
  const insets = useSafeAreaInsets();
  const screens = [
    {
      title: "Live Fleet\nfrom Backend",
      sub: "Browse the real scooter catalog with live prices, availability, and vehicle details.",
      cta: "Continue",
      colors: ["#1A1A1A", "#080808"],
    },
    {
      title: "Real Booking\nFlow",
      sub: "Dates, delivery, add-ons, booking creation, and payment are all connected to the backend.",
      cta: "Next",
      colors: ["#141824", "#080808"],
    },
    {
      title: "Profile,\nDocs, Support",
      sub: "Track bookings, upload documents, read notifications, and message support from the app.",
      cta: "Get Started",
      colors: ["#1A1410", "#080808"],
    },
  ];
  const current = screens[step - 1];
  const nextRoute = step === 1 ? "onboarding-2" : step === 2 ? "onboarding-3" : "language";

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.screenBlack }}>
      <LinearGradient colors={current.colors} style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingTop: insets.top }}>
        <AppText family="inter" weight="medium" style={{ fontSize: 11, color: "rgba(255,255,255,0.24)", textTransform: "uppercase", letterSpacing: 1.8 }}>
          expo 54 mobile mvp
        </AppText>
        <LinearGradient colors={["transparent", COLORS.screenBlack]} style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 120 }} />
      </LinearGradient>

      <PageContent style={{ paddingHorizontal: 28, paddingTop: 32, paddingBottom: Math.max(insets.bottom, 28) + 20 }}>
        <AppText family="sora" weight="black" style={{ color: COLORS.white, fontSize: 38, lineHeight: 40, letterSpacing: -1.7, marginBottom: 16 }}>
          {current.title}
        </AppText>
        <AppText family="inter" style={{ color: "rgba(255,255,255,0.54)", fontSize: 15, lineHeight: 26, marginBottom: 36 }}>
          {current.sub}
        </AppText>
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 28 }}>
          {[1, 2, 3].map((index) => (
            <View key={index} style={{ flex: index === step ? 1.5 : 1, height: 4, borderRadius: 999, backgroundColor: index === step ? COLORS.gold : "rgba(255,255,255,0.15)" }} />
          ))}
        </View>
        <PrimaryButton variant="gold" onPress={() => navigation.replace(nextRoute)}>
          {current.cta} →
        </PrimaryButton>
      </PageContent>
    </View>
  );
}

export function LanguageScreen({ copy, languages, navigation, selectedLanguage, setSelectedLanguage }) {
  const insets = useSafeAreaInsets();

  return (
    <CenteredScrollView backgroundColor={COLORS.white}>
      <PageContent style={{ flex: 1, paddingHorizontal: 28, paddingTop: insets.top + 24, paddingBottom: Math.max(insets.bottom, 24) + 16 }}>
        <View style={{ marginBottom: 36 }}>
          <AppText family="inter" weight="bold" style={{ fontSize: 11, color: COLORS.gold, textTransform: "uppercase", letterSpacing: 1.6, marginBottom: 12 }}>
            {copy.language}
          </AppText>
          <AppText family="sora" weight="extrabold" style={{ fontSize: 34, lineHeight: 38, color: COLORS.black, letterSpacing: -1.4 }}>
            {copy.chooseLanguage}
          </AppText>
        </View>
        <View style={{ flex: 1, gap: 10 }}>
          {languages.map((language) => {
            const active = selectedLanguage === language.api_code;
            return (
              <Pressable
                key={language.api_code}
                onPress={() => setSelectedLanguage(language.api_code)}
                style={{ paddingHorizontal: 18, paddingVertical: 16, borderRadius: 14, borderWidth: 1.5, borderColor: active ? COLORS.gold : COLORS.gray200, backgroundColor: active ? "rgba(255,215,0,0.06)" : COLORS.white, flexDirection: "row", alignItems: "center", gap: 14 }}
              >
                <LocaleBadge value={language.flag} />
                <AppText family="sora" weight="semibold" style={{ flex: 1, fontSize: 16, color: COLORS.black }}>
                  {language.label}
                </AppText>
                {active ? <Ionicons name="checkmark" size={18} color={COLORS.gold} /> : null}
              </Pressable>
            );
          })}
        </View>
        <PrimaryButton variant="dark" style={{ marginTop: 24 }} onPress={() => navigation.afterLanguageConfirm()}>
          {copy.confirmLanguage}
        </PrimaryButton>
      </PageContent>
    </CenteredScrollView>
  );
}

export function LoginScreen({
  copy,
  error,
  form,
  mode,
  navigation,
  onForgotPassword,
  onSubmit,
  onToggleMode,
  submitting,
  updateField,
}) {
  const insets = useSafeAreaInsets();

  return (
    <CenteredScrollView backgroundColor={COLORS.white}>
      <PageContent style={{ paddingHorizontal: 28, paddingTop: insets.top + 28, paddingBottom: Math.max(insets.bottom, 24) + 20 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 40 }}>
          <View style={{ width: 28, height: 28, borderRadius: 7, backgroundColor: COLORS.gold, alignItems: "center", justifyContent: "center" }}>
            <AppText family="sora" weight="black" style={{ fontSize: 14, color: COLORS.black }}>
              S
            </AppText>
          </View>
          <AppText family="sora" weight="bold" style={{ fontSize: 17, color: COLORS.black, letterSpacing: -0.5 }}>
            SCOOT <AppText family="sora" weight="regular" style={{ color: COLORS.gold }}>BALI</AppText>
          </AppText>
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginBottom: 24 }}>
          {[
            { key: "signin", label: copy.signIn },
            { key: "signup", label: copy.createAccount },
          ].map((item) => {
            const active = mode === item.key;
            return (
              <Pressable
                key={item.key}
                onPress={() => onToggleMode(item.key)}
                style={{ flex: 1, borderRadius: 12, paddingVertical: 14, alignItems: "center", backgroundColor: active ? COLORS.black : COLORS.gray100 }}
              >
                <AppText family="inter" weight="bold" style={{ fontSize: 14, color: active ? COLORS.white : COLORS.gray700 }}>
                  {item.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <AppText family="sora" weight="extrabold" style={{ fontSize: 32, color: COLORS.black, letterSpacing: -1.2, marginBottom: 8 }}>
          {mode === "signin" ? copy.welcomeBack : copy.createAccount}
        </AppText>
        <AppText family="inter" style={{ fontSize: 14, color: COLORS.gray500, marginBottom: 28 }}>
          {mode === "signin" ? copy.signInHint : copy.registerHint}
        </AppText>

        <View style={{ gap: 14, marginBottom: 20 }}>
          {mode === "signup" ? (
            <>
              <LabeledInput label={copy.fullName} value={form.fullName} onChangeText={(value) => updateField("fullName", value)} />
              <LabeledInput label={copy.phone} value={form.phone} onChangeText={(value) => updateField("phone", value)} keyboardType="phone-pad" />
            </>
          ) : null}
          <LabeledInput label={copy.email} value={form.email} onChangeText={(value) => updateField("email", value)} keyboardType="email-address" autoCapitalize="none" />
          <LabeledInput label={copy.password} value={form.password} onChangeText={(value) => updateField("password", value)} secureTextEntry autoCapitalize="none" />
        </View>

        {mode === "signin" ? (
          <Pressable style={{ alignSelf: "flex-end", marginBottom: 24 }} onPress={onForgotPassword}>
            <AppText family="inter" weight="medium" style={{ fontSize: 13, color: COLORS.black }}>
              {copy.forgotPassword}
            </AppText>
          </Pressable>
        ) : null}

        {error ? (
          <View style={{ marginBottom: 18, borderRadius: 12, backgroundColor: "#FEF2F2", paddingHorizontal: 14, paddingVertical: 12 }}>
            <AppText family="inter" style={{ fontSize: 13, color: COLORS.danger }}>
              {error}
            </AppText>
          </View>
        ) : null}

        <PrimaryButton variant="dark" onPress={onSubmit} disabled={submitting}>
          {submitting ? copy.loading : mode === "signin" ? `${copy.signIn} →` : `${copy.createAccount} →`}
        </PrimaryButton>

        <Pressable style={{ marginTop: 18, alignSelf: "center" }} onPress={() => navigation.goBack()}>
          <AppText family="inter" style={{ fontSize: 13, color: COLORS.gray500 }}>
            {copy.back}
          </AppText>
        </Pressable>
      </PageContent>
    </CenteredScrollView>
  );
}

export function HomeScreen({ app, navigation }) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const deferredSearch = useDeferredValue(search);
  const { copy, labels, profile, fleet, bookings, language } = app;

  const activeBooking = bookings.find((item) => ["confirmed", "delivery", "active", "pending_payment", "created"].includes(item.status)) || null;
  const featuredList = useMemo(
    () =>
      fleet.filter((vehicle) => vehicleMatchesSearch(vehicle, deferredSearch) && vehicleMatchesCategory(vehicle, category)),
    [category, deferredSearch, fleet],
  );
  const featured = featuredList[0] || fleet[0];

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <CenteredScrollView backgroundColor={COLORS.white} contentContainerStyle={{ paddingBottom: 120 + Math.max(insets.bottom, 16) }}>
        <PageContent style={{ paddingHorizontal: 20, paddingTop: insets.top + 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <View>
              <AppText family="inter" style={{ fontSize: 13, color: COLORS.gray500, marginBottom: 2 }}>
                {copy.welcome}
              </AppText>
              <AppText family="sora" weight="extrabold" style={{ fontSize: 22, color: COLORS.black, letterSpacing: -0.8 }}>
                {profile?.full_name || profile?.email || "Scoot Bali"}
              </AppText>
            </View>
            <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: COLORS.gold, alignItems: "center", justifyContent: "center" }}>
              <AppText family="sora" weight="extrabold" style={{ fontSize: 16, color: COLORS.black }}>
                {(profile?.full_name || profile?.email || "SB").slice(0, 2).toUpperCase()}
              </AppText>
            </View>
          </View>

          {featured ? (
            <View style={{ borderRadius: 24, overflow: "hidden", backgroundColor: COLORS.black, marginBottom: 18 }}>
              <ScooterThumb scooter={featured} height={190} />
              <View style={{ paddingHorizontal: 18, paddingVertical: 18 }}>
                <Badge variant="gold" style={{ alignSelf: "flex-start", marginBottom: 12 }}>
                  {copy.readyMvp}
                </Badge>
                <AppText family="sora" weight="extrabold" style={{ fontSize: 24, color: COLORS.white, letterSpacing: -1, marginBottom: 8 }}>
                  {featured.name}
                </AppText>
                <AppText family="inter" style={{ fontSize: 14, lineHeight: 24, color: "rgba(255,255,255,0.58)", marginBottom: 18 }}>
                  {featured.description}
                </AppText>
                <PrimaryButton variant="gold" onPress={() => navigation.openScooter(featured.id)}>
                  {`${copy.continue || "Continue"} →`}
                </PrimaryButton>
              </View>
            </View>
          ) : null}

          <SearchBar placeholder={copy.searchFleet} value={search} onChangeText={setSearch} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 16, paddingBottom: 22 }}>
            {[
              { key: "all", label: copy.all },
              { key: "scooter", label: labels.types?.scooter || "Scooter" },
              { key: "maxi", label: labels.types?.maxi || "Maxi" },
              { key: "moto", label: labels.types?.moto || "Motorcycle" },
              { key: "available", label: copy.available },
            ].map((item) => (
              <FilterPill key={item.key} label={item.label} active={category === item.key} onPress={() => setCategory(item.key)} />
            ))}
          </ScrollView>

          <View style={{ flexDirection: "row", gap: 12, marginBottom: 22 }}>
            <Pressable onPress={() => navigation.toTab("bookings")} style={{ flex: 1, backgroundColor: COLORS.gray100, borderRadius: 16, padding: 16 }}>
              <ResolvedIcon icon="speedometer-outline" size={22} color={COLORS.black} style={{ marginBottom: 8 }} />
              <AppText family="inter" style={{ fontSize: 11, color: COLORS.gray500, marginBottom: 3 }}>
                {copy.activeBooking}
              </AppText>
              <AppText family="sora" weight="bold" style={{ fontSize: 13, color: COLORS.black }}>
                {activeBooking?.scooter?.title || copy.noBookings}
              </AppText>
            </Pressable>
            <View style={{ flex: 1, backgroundColor: COLORS.gray100, borderRadius: 16, padding: 16 }}>
              <ResolvedIcon icon="car-outline" size={22} color={COLORS.black} style={{ marginBottom: 8 }} />
              <AppText family="inter" style={{ fontSize: 11, color: COLORS.gray500, marginBottom: 3 }}>
                {copy.delivered}
              </AppText>
              <AppText family="sora" weight="bold" style={{ fontSize: 13, color: COLORS.black }}>
                {app.zones.slice(0, 3).map((item) => item.name).join(" · ")}
              </AppText>
            </View>
          </View>

          <SectionHeader title={copy.topPicks} actionLabel={app.content?.home?.fleet?.cta || "View all →"} onPress={() => navigation.toTab("fleet")} />
          <View style={{ gap: 14 }}>
            {featuredList.slice(0, 3).map((scooter) => (
              <Pressable key={scooter.id} onPress={() => navigation.openScooter(scooter.id)} style={{ backgroundColor: COLORS.white, borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: COLORS.gray200 }}>
                <ScooterThumb scooter={scooter} height={126} />
                <View style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <View style={{ flex: 1, paddingRight: 12 }}>
                      <AppText family="sora" weight="bold" style={{ fontSize: 15, color: COLORS.black }}>
                        {scooter.name}
                      </AppText>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 }}>
                        <Stars rating={scooter.rating} size={11} />
                        <AppText family="inter" style={{ fontSize: 11, color: COLORS.gray500 }}>
                          {scooter.reviews}
                        </AppText>
                      </View>
                    </View>
                    <AppText family="sora" weight="extrabold" style={{ fontSize: 20, color: COLORS.black }}>
                      {formatMoney(scooter.priceUSD, "USD", language)}
                    </AppText>
                  </View>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap", flex: 1, paddingRight: 12 }}>
                      <Badge>{scooter.engine}</Badge>
                      <Badge>{scooter.typeLabel}</Badge>
                    </View>
                    <Badge variant={scooter.available ? "green" : "default"}>{scooter.available ? copy.available : copy.unavailable}</Badge>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        </PageContent>
      </CenteredScrollView>
      <BottomNav active="home" onChange={navigation.toTab} labels={{ home: copy.home, fleet: copy.fleet, bookings: copy.bookings, profile: copy.profile }} />
    </View>
  );
}

export function FleetScreen({ app, navigation }) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const deferredSearch = useDeferredValue(search);
  const { copy, labels, fleet, language } = app;

  const filteredScooters = useMemo(
    () => fleet.filter((vehicle) => vehicleMatchesSearch(vehicle, deferredSearch) && vehicleMatchesCategory(vehicle, filter)),
    [deferredSearch, filter, fleet],
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.gray100 }}>
      <View style={{ backgroundColor: COLORS.white }}>
        <PageContent style={{ paddingHorizontal: 20, paddingTop: insets.top + 16 }}>
          <AppText family="sora" weight="extrabold" style={{ fontSize: 24, color: COLORS.black, letterSpacing: -0.8, marginBottom: 16 }}>
            {copy.fleet}
          </AppText>
          <SearchBar placeholder={copy.searchFleet} value={search} onChangeText={setSearch} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 16, paddingBottom: 16 }}>
            {[
              { key: "all", label: copy.all },
              { key: "scooter", label: labels.types?.scooter || "Scooter" },
              { key: "maxi", label: labels.types?.maxi || "Maxi" },
              { key: "moto", label: labels.types?.moto || "Motorcycle" },
              { key: "available", label: copy.available },
            ].map((item) => (
              <Pressable key={item.key} onPress={() => setFilter(item.key)} style={{ paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: filter === item.key ? COLORS.gold : COLORS.gray100, borderWidth: 1, borderColor: filter === item.key ? COLORS.gold : COLORS.gray200 }}>
                <AppText family="inter" weight="bold" style={{ fontSize: 12, color: filter === item.key ? COLORS.black : COLORS.gray700 }}>
                  {item.label}
                </AppText>
              </Pressable>
            ))}
          </ScrollView>
        </PageContent>
      </View>
      <CenteredScrollView backgroundColor={COLORS.gray100} contentContainerStyle={{ paddingBottom: 120 + Math.max(insets.bottom, 16) }}>
        <PageContent style={{ paddingHorizontal: 20, paddingTop: 16, gap: 14 }}>
          {filteredScooters.length ? (
            filteredScooters.map((scooter) => (
              <Pressable key={scooter.id} onPress={() => navigation.openScooter(scooter.id)} style={{ backgroundColor: COLORS.white, borderRadius: 18, overflow: "hidden", ...SHADOWS.card }}>
                <ScooterThumb scooter={scooter} height={132} />
                <View style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                    <View style={{ flex: 1, paddingRight: 12 }}>
                      <AppText family="sora" weight="bold" style={{ fontSize: 15, color: COLORS.black }}>
                        {scooter.name}
                      </AppText>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 }}>
                        <Stars rating={scooter.rating} size={11} />
                        <AppText family="inter" style={{ fontSize: 11, color: COLORS.gray500 }}>
                          {scooter.reviews}
                        </AppText>
                      </View>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <AppText family="sora" weight="extrabold" style={{ fontSize: 20, color: COLORS.black }}>
                        {formatMoney(scooter.priceUSD, "USD", language)}
                      </AppText>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
                    <Badge>{scooter.engine}</Badge>
                    <Badge>{scooter.typeLabel}</Badge>
                    <Badge variant={scooter.available ? "green" : "default"}>{scooter.available ? copy.available : copy.unavailable}</Badge>
                  </View>
                </View>
              </Pressable>
            ))
          ) : (
            <EmptyCard title={copy.noVehicles} body={copy.searchFleet} />
          )}
        </PageContent>
      </CenteredScrollView>
      <BottomNav active="fleet" onChange={navigation.toTab} labels={{ home: copy.home, fleet: copy.fleet, bookings: copy.bookings, profile: copy.profile }} />
    </View>
  );
}

export function DetailScreen({ app, navigation, scooter }) {
  const insets = useSafeAreaInsets();
  const { copy, language } = app;

  if (!scooter) {
    return (
      <CenteredScrollView backgroundColor={COLORS.white}>
        <PageContent style={{ paddingHorizontal: 20, paddingTop: insets.top + 20 }}>
          <EmptyCard title={copy.noVehicles} body={copy.retry} />
        </PageContent>
      </CenteredScrollView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <CenteredScrollView backgroundColor={COLORS.white} contentContainerStyle={{ paddingBottom: 120 + Math.max(insets.bottom, 16) }}>
        <View style={{ position: "relative" }}>
          <ScooterThumb scooter={scooter} height={270} />
          <GlassCircleButton icon="chevron-back" onPress={navigation.goBack} style={{ position: "absolute", top: insets.top + 12, left: 20 }} />
        </View>
        <PageContent style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <View style={{ flex: 1, paddingRight: 16 }}>
              <AppText family="sora" weight="extrabold" style={{ fontSize: 24, color: COLORS.black, letterSpacing: -1, marginBottom: 4 }}>
                {scooter.name}
              </AppText>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Stars rating={scooter.rating} />
                <AppText family="inter" style={{ fontSize: 12, color: COLORS.gray500 }}>
                  {scooter.reviews}
                </AppText>
              </View>
            </View>
            <View>
              <AppText family="sora" weight="black" style={{ fontSize: 28, color: COLORS.black, textAlign: "right" }}>
                {formatMoney(scooter.priceUSD, "USD", language)}
              </AppText>
              <AppText family="inter" style={{ fontSize: 12, color: COLORS.gray500, textAlign: "right" }}>
                {copy.perDay || "/day"}
              </AppText>
            </View>
          </View>
          <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
            <Badge variant={scooter.available ? "green" : "default"}>{scooter.available ? copy.available : copy.unavailable}</Badge>
            <Badge>{scooter.engine}</Badge>
            <Badge>{scooter.typeLabel}</Badge>
          </View>
          <AppText family="inter" style={{ fontSize: 14, color: COLORS.gray700, lineHeight: 24, marginBottom: 20 }}>
            {scooter.description}
          </AppText>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
            {Object.entries(scooter.specs || {}).map(([key, value]) => (
              <View key={key} style={{ width: "47%", backgroundColor: COLORS.gray100, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14 }}>
                <AppText family="inter" weight="medium" style={{ fontSize: 10, color: COLORS.gray500, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>
                  {key.replaceAll("_", " ")}
                </AppText>
                <AppText family="sora" weight="bold" style={{ fontSize: 16, color: COLORS.black }}>
                  {value}
                </AppText>
              </View>
            ))}
          </View>
          <SectionHeader title={copy.addons} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {(scooter.features || []).map((feature) => (
              <Badge key={feature} variant="black" style={{ paddingHorizontal: 10, paddingVertical: 6 }}>
                {feature}
              </Badge>
            ))}
          </View>
        </PageContent>
      </CenteredScrollView>
      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: "rgba(255,255,255,0.96)", borderTopWidth: 1, borderTopColor: "#EBEBEB", paddingHorizontal: 20, paddingTop: 16, paddingBottom: Math.max(insets.bottom, 16) + 16 }}>
        <PageContent>
          <PrimaryButton variant={scooter.available ? "dark" : "ghost"} onPress={scooter.available ? navigation.startBooking : navigation.goBack}>
            {scooter.available ? `${copy.confirmBooking} →` : copy.back}
          </PrimaryButton>
        </PageContent>
      </View>
    </View>
  );
}

export function BookingDatesScreen({ app, bookingRange, navigation, setBookingRange }) {
  const insets = useSafeAreaInsets();
  const calendar = useMemo(() => buildCalendarMonth(bookingRange, app.language), [app.language, bookingRange]);
  const selectedDays = useMemo(() => new Set(getSelectedRentalDays(bookingRange)), [bookingRange]);
  const copy = app.copy;

  const handleDatePress = (timestamp, disabled) => {
    if (disabled) {
      return;
    }

    if (!bookingRange.start || getBookingDuration(bookingRange) > 1) {
      setBookingRange({ start: timestamp, end: addDays(new Date(timestamp), 1).getTime() });
      return;
    }

    if (timestamp <= bookingRange.start) {
      setBookingRange({ start: timestamp, end: addDays(new Date(timestamp), 1).getTime() });
      return;
    }

    setBookingRange({ start: bookingRange.start, end: timestamp });
  };

  return (
    <CenteredScrollView backgroundColor={COLORS.white}>
      <PageContent style={{ paddingHorizontal: 20, paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 24) + 20 }}>
        <ScreenHeader title={copy.selectDates} onBack={navigation.goBack} />
        <CheckoutSteps copy={copy} current={0} />
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <AppText family="sora" weight="bold" style={{ fontSize: 18, color: COLORS.black }}>
            {calendar.label}
          </AppText>
          <Badge>{`${getBookingDuration(bookingRange)} ${app.labels.daysLabel}`}</Badge>
        </View>
        <View style={{ flexDirection: "row", marginBottom: 8 }}>
          {["M", "T", "W", "T", "F", "S", "S"].map((day) => (
            <View key={day} style={{ flex: 1, alignItems: "center", paddingVertical: 4 }}>
              <AppText family="inter" weight="bold" style={{ fontSize: 12, color: COLORS.gray500 }}>
                {day}
              </AppText>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 2 }}>
          {Array.from({ length: calendar.leadingEmpty }).map((_, index) => (
            <View key={`empty-${index}`} style={{ width: "13.6%", aspectRatio: 1 }} />
          ))}
          {calendar.days.map((item) => {
            const active = selectedDays.has(item.timestamp);
            const first = item.timestamp === bookingRange.start;
            const lastRideDay = bookingRange.end - 24 * 60 * 60 * 1000;
            const last = item.timestamp === lastRideDay;

            return (
              <Pressable
                key={item.timestamp}
                onPress={() => handleDatePress(item.timestamp, item.disabled)}
                style={{
                  width: "13.6%",
                  aspectRatio: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: first || last ? 10 : 0,
                  backgroundColor: active ? (first || last ? COLORS.gold : "rgba(255,215,0,0.18)") : COLORS.white,
                }}
              >
                <AppText family="sora" weight={active ? "bold" : "regular"} style={{ fontSize: 14, color: item.disabled ? COLORS.gray300 : COLORS.black }}>
                  {item.day}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <View style={{ marginTop: 24, marginBottom: 20, borderRadius: 14, backgroundColor: COLORS.gray100, padding: 16, flexDirection: "row" }}>
          {[
            { label: "Check-in", value: formatDate(bookingRange.start, app.language) },
            { label: "Check-out", value: formatDate(bookingRange.end, app.language) },
            { label: "Duration", value: `${getBookingDuration(bookingRange)} ${app.labels.daysLabel}` },
          ].map((item, index) => (
            <View key={item.label} style={{ flex: 1, paddingHorizontal: 8, borderRightWidth: index < 2 ? 1 : 0, borderRightColor: COLORS.gray250 }}>
              <AppText family="inter" weight="bold" style={{ fontSize: 10, color: COLORS.gray500, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 }}>
                {item.label}
              </AppText>
              <AppText family="sora" weight="bold" style={{ fontSize: 14, color: COLORS.black }}>
                {item.value}
              </AppText>
            </View>
          ))}
        </View>
        <PrimaryButton variant="dark" onPress={navigation.continueToDelivery}>
          {copy.continueToDelivery} →
        </PrimaryButton>
      </PageContent>
    </CenteredScrollView>
  );
}

export function DeliveryScreen({
  app,
  bookingRange,
  deliveryAddress,
  deliverySlot,
  deliveryZoneId,
  navigation,
  scooter,
  selectedAddons,
  setDeliveryAddress,
  setDeliverySlot,
  setDeliveryZoneId,
  setSelectedAddons,
  quote,
  quoteError,
  quoteLoading,
}) {
  const insets = useSafeAreaInsets();
  const copy = app.copy;
  const zone = getZoneById(app.zones, deliveryZoneId);
  const summary = buildLocalBookingPreview({
    addons: app.addons,
    deliveryZone: zone,
    quote,
    range: bookingRange,
    scooter,
    selectedAddonIds: selectedAddons,
  });

  const toggleAddon = (id) => {
    setSelectedAddons((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  return (
    <CenteredScrollView backgroundColor={COLORS.white}>
      <PageContent style={{ paddingHorizontal: 20, paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 24) + 20 }}>
        <ScreenHeader title={copy.deliveryExtras} onBack={navigation.goBack} />
        <CheckoutSteps copy={copy} current={1} />

        <View style={{ borderRadius: 18, backgroundColor: COLORS.black, padding: 18, marginBottom: 24 }}>
          <AppText family="sora" weight="bold" style={{ fontSize: 16, color: COLORS.white, marginBottom: 6 }}>
            {scooter.name}
          </AppText>
          <AppText family="inter" style={{ fontSize: 13, color: "rgba(255,255,255,0.58)" }}>
            {`${formatDateRange(bookingRange, app.language)} · ${summary.duration} ${app.labels.daysLabel}`}
          </AppText>
        </View>

        <LabeledInput label={copy.address} value={deliveryAddress} onChangeText={setDeliveryAddress} placeholder="Villa, hotel, apartment..." style={{ marginBottom: 24 }} />

        <SectionHeader title={copy.deliveryZone} />
        <View style={{ gap: 10, marginBottom: 24 }}>
          {app.zones.map((item) => {
            const active = String(item.id) === String(deliveryZoneId);
            return (
              <Pressable key={item.id} onPress={() => setDeliveryZoneId(item.id)} style={{ borderRadius: 14, borderWidth: 1.5, borderColor: active ? COLORS.gold : COLORS.gray200, backgroundColor: active ? "rgba(255,215,0,0.06)" : COLORS.white, paddingHorizontal: 16, paddingVertical: 14, flexDirection: "row", alignItems: "center" }}>
                <View>
                  <AppText family="sora" weight="bold" style={{ fontSize: 15, color: COLORS.black, marginBottom: 3 }}>
                    {item.name}
                  </AppText>
                  <AppText family="inter" style={{ fontSize: 12, color: COLORS.gray500 }}>
                    {`${item.timeMinutes} min · ${item.freeDelivery ? "Free" : formatMoney(item.deliveryFeeUSD, "USD", app.language)}`}
                  </AppText>
                </View>
                {active ? <Ionicons name="checkmark-circle" size={20} color={COLORS.gold} style={{ marginLeft: "auto" }} /> : null}
              </Pressable>
            );
          })}
        </View>

        <SectionHeader title={copy.preferredTime} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 24 }}>
          {app.deliverySlots.map((slot) => {
            const active = slot === deliverySlot;
            return (
              <Pressable key={slot} onPress={() => setDeliverySlot(slot)} style={{ paddingHorizontal: 18, paddingVertical: 12, borderRadius: 999, backgroundColor: active ? COLORS.black : COLORS.gray100 }}>
                <AppText family="inter" weight="bold" style={{ fontSize: 13, color: active ? COLORS.white : COLORS.gray700 }}>
                  {slot}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>

        <SectionHeader title={copy.addons} />
        <View style={{ gap: 10, marginBottom: 24 }}>
          {app.addons.map((addon) => {
            const active = selectedAddons.includes(addon.id);
            return (
              <Pressable key={addon.id} onPress={() => toggleAddon(addon.id)} style={{ borderRadius: 14, borderWidth: 1.5, borderColor: active ? COLORS.black : COLORS.gray200, backgroundColor: active ? COLORS.black : COLORS.white, paddingHorizontal: 16, paddingVertical: 14, flexDirection: "row", alignItems: "center", gap: 12 }}>
                <ResolvedIcon icon={addon.icon} size={22} color={active ? COLORS.gold : COLORS.black} />
                <View style={{ flex: 1 }}>
                  <AppText family="sora" weight="bold" style={{ fontSize: 15, color: active ? COLORS.white : COLORS.black, marginBottom: 3 }}>
                    {addon.name}
                  </AppText>
                  <AppText family="inter" style={{ fontSize: 12, color: active ? "rgba(255,255,255,0.58)" : COLORS.gray500 }}>
                    {addon.description}
                  </AppText>
                </View>
                <AppText family="inter" weight="bold" style={{ fontSize: 13, color: active ? COLORS.gold : COLORS.black }}>
                  +{formatMoney(addon.priceUSD, "USD", app.language)}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <View style={{ borderRadius: 16, backgroundColor: COLORS.gray100, padding: 16, marginBottom: 24 }}>
          <AppText family="sora" weight="bold" style={{ fontSize: 15, color: COLORS.black, marginBottom: 10 }}>
            {copy.preview}
          </AppText>
          {quoteLoading ? <LoadingBlock label={copy.loading} /> : null}
          {quoteError ? (
            <AppText family="inter" style={{ fontSize: 13, color: COLORS.danger, marginBottom: 10 }}>
              {quoteError}
            </AppText>
          ) : null}
          <SummaryRow label={copy.rental} value={formatMoney(summary.rentalCost, "USD", app.language)} />
          <SummaryRow label={copy.addons} value={formatMoney(summary.addonsTotal, "USD", app.language)} />
          <SummaryRow label={copy.deliveryZone} value={summary.deliveryFee === 0 ? "Free" : formatMoney(summary.deliveryFee, "USD", app.language)} />
          <SummaryRow label={copy.total} value={formatMoney(summary.total, "USD", app.language)} border />
        </View>

        <PrimaryButton variant="dark" onPress={navigation.continueToPayment}>
          {copy.continueToPayment} →
        </PrimaryButton>
      </PageContent>
    </CenteredScrollView>
  );
}

export function PaymentScreen({
  app,
  bookingRange,
  deliverySlot,
  deliveryZoneId,
  navigation,
  paymentMethod,
  quote,
  quoteError,
  quoteLoading,
  scooter,
  selectedAddons,
  setPaymentMethod,
  submitting,
}) {
  const insets = useSafeAreaInsets();
  const copy = app.copy;
  const zone = getZoneById(app.zones, deliveryZoneId);
  const summary = buildLocalBookingPreview({
    addons: app.addons,
    deliveryZone: zone,
    quote,
    range: bookingRange,
    scooter,
    selectedAddonIds: selectedAddons,
  });

  return (
    <CenteredScrollView backgroundColor={COLORS.white}>
      <PageContent style={{ paddingHorizontal: 20, paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 24) + 20 }}>
        <ScreenHeader title={copy.payment} onBack={navigation.goBack} />
        <CheckoutSteps copy={copy} current={2} />

        <View style={{ backgroundColor: COLORS.black, borderRadius: 18, padding: 20, marginBottom: 24 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <AppText family="sora" weight="bold" style={{ fontSize: 16, color: COLORS.white }}>
              {scooter.name}
            </AppText>
            <Badge variant="gold">{`${summary.duration} ${app.labels.daysLabel}`}</Badge>
          </View>
          <SummaryRow label="Dates" labelColor="rgba(255,255,255,0.58)" value={formatDateRange(bookingRange, app.language)} valueColor="rgba(255,255,255,0.72)" />
          <SummaryRow label={copy.deliveryZone} labelColor="rgba(255,255,255,0.58)" value={`${zone?.name || "-"} · ${deliverySlot}`} valueColor="rgba(255,255,255,0.72)" />
          <SummaryRow label={copy.rental} labelColor="rgba(255,255,255,0.58)" value={formatMoney(summary.rentalCost, "USD", app.language)} valueColor="rgba(255,255,255,0.72)" />
          <SummaryRow label={copy.addons} labelColor="rgba(255,255,255,0.58)" value={formatMoney(summary.addonsTotal, "USD", app.language)} valueColor="rgba(255,255,255,0.72)" />
          <SummaryRow label={copy.total} labelColor="rgba(255,255,255,0.58)" value={formatMoney(summary.total, "USD", app.language)} valueColor={COLORS.gold} border />
        </View>

        <SectionHeader title={copy.paymentMethod} />
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 24 }}>
          {[
            { key: "online_card", icon: "card-outline", label: app.labels.paymentMethods.online_card || "Card Online" },
            { key: "cash_on_delivery", icon: "cash-outline", label: app.labels.paymentMethods.cash_on_delivery || "Cash" },
            { key: "card_on_delivery", icon: "albums-outline", label: app.labels.paymentMethods.card_on_delivery || "Card on Delivery" },
          ].map((item) => {
            const active = paymentMethod === item.key;
            return (
              <Pressable key={item.key} onPress={() => setPaymentMethod(item.key)} style={{ flex: 1, borderRadius: 12, borderWidth: 1.5, borderColor: active ? COLORS.black : COLORS.gray200, backgroundColor: active ? COLORS.black : COLORS.gray100, alignItems: "center", paddingVertical: 14, gap: 4 }}>
                <Ionicons name={item.icon} size={20} color={active ? COLORS.white : COLORS.gray700} />
                <AppText family="sora" weight="bold" style={{ fontSize: 11, color: active ? COLORS.white : COLORS.gray700, textAlign: "center", paddingHorizontal: 8 }}>
                  {item.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        {quoteLoading ? <LoadingBlock label={copy.loading} /> : null}
        {quoteError ? (
          <View style={{ marginBottom: 16, borderRadius: 12, backgroundColor: "#FEF2F2", paddingHorizontal: 14, paddingVertical: 12 }}>
            <AppText family="inter" style={{ fontSize: 13, color: COLORS.danger }}>
              {quoteError}
            </AppText>
          </View>
        ) : null}
        <PrimaryButton variant="gold" onPress={navigation.finishBooking} disabled={submitting}>
          {submitting ? copy.loading : `${copy.confirmBooking} →`}
        </PrimaryButton>
        <AppText family="inter" style={{ textAlign: "center", fontSize: 11, color: COLORS.gray500, marginTop: 10 }}>
          {copy.secureCheckout}
        </AppText>
      </PageContent>
    </CenteredScrollView>
  );
}

export function OrderConfirmedScreen({ app, booking, navigation, scooter }) {
  const insets = useSafeAreaInsets();
  const copy = app.copy;

  return (
    <CenteredScrollView backgroundColor={COLORS.white}>
      <PageContent style={{ minHeight: 760, alignItems: "center", justifyContent: "center", paddingHorizontal: 28, paddingTop: insets.top + 40, paddingBottom: Math.max(insets.bottom, 24) + 40 }}>
        <View style={{ width: 96, height: 96, borderRadius: 999, backgroundColor: COLORS.gold, alignItems: "center", justifyContent: "center", marginBottom: 28, ...SHADOWS.gold }}>
          <Ionicons name="checkmark" size={46} color={COLORS.black} />
        </View>
        <AppText family="sora" weight="black" style={{ fontSize: 32, color: COLORS.black, letterSpacing: -1.4, textAlign: "center", marginBottom: 10 }}>
          {copy.bookingConfirmed}
        </AppText>
        <View style={{ borderRadius: 999, backgroundColor: COLORS.gray100, paddingHorizontal: 20, paddingVertical: 8, marginBottom: 20 }}>
          <AppText family="sora" weight="bold" style={{ fontSize: 14, color: COLORS.black }}>
            #{booking?.order_number || booking?.id}
          </AppText>
        </View>
        <AppText family="inter" style={{ textAlign: "center", fontSize: 15, lineHeight: 26, color: COLORS.gray500, marginBottom: 36 }}>
          {`${scooter?.name || booking?.scooter?.title || "Scooter"} · ${formatBookingStatus(booking, app.labels.bookingStatuses)}`}
        </AppText>
        <View style={{ width: "100%", borderRadius: 16, backgroundColor: COLORS.gray100, padding: 20, marginBottom: 28 }}>
          {[
            { label: "Vehicle", value: scooter?.name || booking?.scooter?.title || "-" },
            { label: "Duration", value: `${booking?.rental_days || 1} ${app.labels.daysLabel}` },
            { label: "Delivery", value: booking ? buildBookingDeliveryLabel(booking, app.language) : "-" },
            { label: "Total", value: formatMoney(booking?.total_price || 0, booking?.currency || "USD", app.language) },
          ].map((row) => (
            <View key={row.label} style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
              <AppText family="inter" style={{ fontSize: 14, color: COLORS.gray700 }}>
                {row.label}
              </AppText>
              <AppText family="inter" weight="bold" style={{ fontSize: 14, color: COLORS.black, textAlign: "right", flexShrink: 1, paddingLeft: 12 }}>
                {row.value}
              </AppText>
            </View>
          ))}
        </View>
        <PrimaryButton variant="dark" style={{ width: "100%", marginBottom: 12 }} onPress={() => navigation.toTab("bookings")}>
          {copy.myBookings}
        </PrimaryButton>
        <PrimaryButton variant="ghost" style={{ width: "100%" }} onPress={() => navigation.toTab("home")}>
          {copy.viewHome}
        </PrimaryButton>
      </PageContent>
    </CenteredScrollView>
  );
}

export function BookingsScreen({ app, navigation, onOpenBookingStatus }) {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState("all");
  const copy = app.copy;

  const bookings = useMemo(() => {
    if (tab === "active") return app.bookings.filter((booking) => ["created", "pending_payment", "confirmed", "delivery", "active"].includes(booking.status));
    if (tab === "completed") return app.bookings.filter((booking) => ["completed", "cancelled"].includes(booking.status));
    return app.bookings;
  }, [app.bookings, tab]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.gray100 }}>
      <View style={{ backgroundColor: COLORS.white }}>
        <PageContent style={{ paddingHorizontal: 20, paddingTop: insets.top + 16, paddingBottom: 16 }}>
          <AppText family="sora" weight="extrabold" style={{ fontSize: 24, color: COLORS.black, letterSpacing: -0.8, marginBottom: 16 }}>
            {copy.myBookings}
          </AppText>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {[
              { key: "all", label: copy.all },
              { key: "active", label: copy.active },
              { key: "completed", label: copy.completed },
            ].map((item) => (
              <Pressable key={item.key} onPress={() => setTab(item.key)} style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: tab === item.key ? COLORS.gold : COLORS.gray100 }}>
                <AppText family="inter" weight="bold" style={{ fontSize: 13, color: COLORS.black }}>
                  {item.label}
                </AppText>
              </Pressable>
            ))}
          </View>
        </PageContent>
      </View>
      <CenteredScrollView backgroundColor={COLORS.gray100} contentContainerStyle={{ paddingBottom: 120 + Math.max(insets.bottom, 16) }}>
        <PageContent style={{ paddingHorizontal: 20, paddingTop: 16, gap: 14 }}>
          {bookings.length ? (
            bookings.map((booking) => {
              const active = ["created", "pending_payment", "confirmed", "delivery", "active"].includes(booking.status);
              const scooter = app.fleet.find((item) => item.id === booking.scooter?.id) || { name: booking.scooter?.title || "Scooter", engine: "" };
              return (
                <View key={booking.id} style={{ borderRadius: 18, overflow: "hidden", backgroundColor: COLORS.white, ...SHADOWS.card }}>
                  <ScooterThumb scooter={scooter} height={110} />
                  <View style={{ paddingHorizontal: 16, paddingVertical: 14 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <View style={{ flex: 1, paddingRight: 12 }}>
                        <AppText family="sora" weight="bold" style={{ fontSize: 15, color: COLORS.black, marginBottom: 2 }}>
                          {scooter.name}
                        </AppText>
                        <AppText family="inter" style={{ fontSize: 12, color: COLORS.gray500 }}>
                          {`${formatDateRange({ start: new Date(booking.start_datetime).getTime(), end: new Date(booking.end_datetime).getTime() }, app.language)} · #${booking.order_number}`}
                        </AppText>
                      </View>
                      <Badge variant={active ? "green" : "default"}>{formatBookingStatus(booking, app.labels.bookingStatuses)}</Badge>
                    </View>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <AppText family="sora" weight="extrabold" style={{ fontSize: 18, color: COLORS.black }}>
                        {formatMoney(booking.total_price, booking.currency || "USD", app.language)}
                      </AppText>
                      <Pressable onPress={() => (active ? onOpenBookingStatus(booking) : navigation.openScooter(booking.scooter?.id))} style={{ borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: active ? COLORS.black : COLORS.gray100 }}>
                        <AppText family="inter" weight="bold" style={{ fontSize: 12, color: active ? COLORS.white : COLORS.black }}>
                          {active ? copy.openBooking : copy.bookAgain}
                        </AppText>
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })
          ) : (
            <EmptyCard title={copy.noBookings} body={copy.signInHint} />
          )}
        </PageContent>
      </CenteredScrollView>
      <BottomNav active="bookings" onChange={navigation.toTab} labels={{ home: copy.home, fleet: copy.fleet, bookings: copy.bookings, profile: copy.profile }} />
    </View>
  );
}

export function ProfileScreen({ app, navigation }) {
  const insets = useSafeAreaInsets();
  const { copy, profile, bookings, notifications, documents, languageLabel } = app;
  const completedCount = bookings.filter((item) => item.status === "completed").length;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.gray100 }}>
      <CenteredScrollView backgroundColor={COLORS.gray100} contentContainerStyle={{ paddingBottom: 120 + Math.max(insets.bottom, 16) }}>
        <View style={{ backgroundColor: COLORS.white }}>
          <PageContent style={{ paddingHorizontal: 20, paddingTop: insets.top + 16, paddingBottom: 16 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 20 }}>
              <LinearGradient colors={[COLORS.gold, COLORS.goldDark]} style={{ width: 64, height: 64, borderRadius: 20, alignItems: "center", justifyContent: "center", ...SHADOWS.gold }}>
                <AppText family="sora" weight="black" style={{ fontSize: 24, color: COLORS.black }}>
                  {(profile?.full_name || profile?.email || "SB").slice(0, 2).toUpperCase()}
                </AppText>
              </LinearGradient>
              <View style={{ flex: 1 }}>
                <AppText family="sora" weight="bold" style={{ fontSize: 20, color: COLORS.black, marginBottom: 4 }}>
                  {profile?.full_name || "Scoot Bali User"}
                </AppText>
                <AppText family="inter" style={{ fontSize: 13, color: COLORS.gray500 }}>
                  {profile?.email}
                </AppText>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {[
                { value: String(bookings.length), label: copy.bookings },
                { value: String(documents.length), label: copy.documents },
                { value: String(completedCount), label: copy.completed },
              ].map((item) => (
                <View key={item.label} style={{ flex: 1, borderRadius: 12, backgroundColor: COLORS.gray100, paddingVertical: 12, paddingHorizontal: 8, alignItems: "center" }}>
                  <AppText family="sora" weight="extrabold" style={{ fontSize: 20, color: COLORS.black }}>
                    {item.value}
                  </AppText>
                  <AppText family="inter" style={{ fontSize: 11, color: COLORS.gray500, marginTop: 2 }}>
                    {item.label}
                  </AppText>
                </View>
              ))}
            </View>
          </PageContent>
        </View>
        <PageContent style={{ paddingHorizontal: 20, paddingTop: 16, gap: 10 }}>
          {[
            { icon: "document-text-outline", label: copy.myBookings, action: () => navigation.toTab("bookings") },
            { icon: "document-outline", label: `${copy.documents} · ${documents.length}`, action: () => navigation.push("documents") },
            { icon: "notifications-outline", label: `${copy.notifications} · ${notifications.filter((item) => !item.is_read).length}`, action: () => navigation.push("notifications") },
            { icon: "globe-outline", label: `${copy.language} · ${languageLabel}`, action: () => navigation.push("language") },
            { icon: "settings-outline", label: copy.accountSettings, action: () => navigation.push("settings") },
            { icon: "help-circle-outline", label: copy.helpSupport, action: () => navigation.push("support") },
            { icon: "log-out-outline", label: copy.signOut, action: navigation.signOut, danger: true },
          ].map((item) => (
            <Pressable key={item.label} onPress={item.action} style={{ borderRadius: 14, backgroundColor: COLORS.white, paddingHorizontal: 18, paddingVertical: 16, flexDirection: "row", alignItems: "center", gap: 14 }}>
              <Ionicons name={item.icon} size={20} color={item.danger ? COLORS.danger : COLORS.black} />
              <AppText family="inter" weight="medium" style={{ flex: 1, fontSize: 15, color: item.danger ? COLORS.danger : COLORS.black }}>
                {item.label}
              </AppText>
              {!item.danger ? <Ionicons name="chevron-forward" size={16} color={COLORS.gray300} /> : null}
            </Pressable>
          ))}
        </PageContent>
      </CenteredScrollView>
      <BottomNav active="profile" onChange={navigation.toTab} labels={{ home: copy.home, fleet: copy.fleet, bookings: copy.bookings, profile: copy.profile }} />
    </View>
  );
}

export function NotificationsScreen({ app, loading, markAllRead, navigation, onOpenBookingStatus }) {
  const insets = useSafeAreaInsets();
  const copy = app.copy;

  return (
    <CenteredScrollView backgroundColor={COLORS.gray100}>
      <PageContent style={{ paddingHorizontal: 20, paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 24) + 20 }}>
        <ScreenHeader
          title={copy.notifications}
          onBack={navigation.goBack}
          rightAction={
            app.notifications.length ? (
              <Pressable onPress={markAllRead}>
                <AppText family="inter" weight="bold" style={{ fontSize: 12, color: COLORS.black }}>
                  {copy.markAllRead}
                </AppText>
              </Pressable>
            ) : null
          }
        />
        <AppText family="inter" style={{ fontSize: 14, color: COLORS.gray500, lineHeight: 22, marginBottom: 16 }}>
          {copy.notificationsHint}
        </AppText>
        {loading ? <LoadingBlock label={copy.loading} /> : null}
        <View style={{ gap: 12 }}>
          {app.notifications.length ? (
            app.notifications.map((item) => (
              <Pressable key={item.id} onPress={() => onOpenBookingStatus(item)} style={{ borderRadius: 16, backgroundColor: COLORS.white, padding: 18, borderWidth: item.is_read ? 1 : 1.5, borderColor: item.is_read ? COLORS.gray200 : COLORS.gold }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 8 }}>
                  <AppText family="sora" weight="bold" style={{ flex: 1, fontSize: 15, color: COLORS.black }}>
                    {item.title}
                  </AppText>
                  {!item.is_read ? <Badge variant="gold">NEW</Badge> : null}
                </View>
                <AppText family="inter" style={{ fontSize: 14, color: COLORS.gray700, lineHeight: 22, marginBottom: 8 }}>
                  {item.body}
                </AppText>
                <AppText family="inter" style={{ fontSize: 12, color: COLORS.gray500 }}>
                  {formatDateTime(item.created_at, app.language)}
                </AppText>
              </Pressable>
            ))
          ) : (
            <EmptyCard title={copy.noNotifications} body={copy.notificationsHint} />
          )}
        </View>
      </PageContent>
    </CenteredScrollView>
  );
}

export function DocumentsScreen({ app, error, loading, navigation, onPickDocument, selectedType, setSelectedType, uploading }) {
  const insets = useSafeAreaInsets();
  const copy = app.copy;

  return (
    <CenteredScrollView backgroundColor={COLORS.gray100}>
      <PageContent style={{ paddingHorizontal: 20, paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 24) + 20 }}>
        <ScreenHeader title={copy.documents} onBack={navigation.goBack} />
        <AppText family="inter" style={{ fontSize: 14, color: COLORS.gray500, lineHeight: 22, marginBottom: 16 }}>
          {copy.documentsHint}
        </AppText>

        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {Object.entries(app.labels.documentTypes).map(([key, value]) => {
            const active = selectedType === key;
            return (
              <Pressable key={key} onPress={() => setSelectedType(key)} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: active ? COLORS.black : COLORS.white }}>
                <AppText family="inter" weight="bold" style={{ fontSize: 12, color: active ? COLORS.white : COLORS.black }}>
                  {value}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        <PrimaryButton variant="dark" style={{ marginBottom: 16 }} onPress={onPickDocument} disabled={uploading}>
          {uploading ? copy.loading : copy.uploadDocument}
        </PrimaryButton>

        {error ? (
          <View style={{ marginBottom: 16, borderRadius: 12, backgroundColor: "#FEF2F2", paddingHorizontal: 14, paddingVertical: 12 }}>
            <AppText family="inter" style={{ fontSize: 13, color: COLORS.danger }}>
              {error}
            </AppText>
          </View>
        ) : null}

        {loading ? <LoadingBlock label={copy.loading} /> : null}
        <View style={{ gap: 12 }}>
          {app.documents.length ? (
            app.documents.map((item) => (
              <View key={item.id} style={{ borderRadius: 16, backgroundColor: COLORS.white, padding: 18 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                  <AppText family="sora" weight="bold" style={{ fontSize: 15, color: COLORS.black }}>
                    {app.labels.documentTypes[item.document_type] || item.document_type}
                  </AppText>
                  <Badge variant={item.status === "approved" ? "green" : item.status === "pending" ? "gold" : "default"}>
                    {app.labels.documentStatuses[item.status] || item.status}
                  </Badge>
                </View>
                <AppText family="inter" style={{ fontSize: 13, color: COLORS.gray500, marginBottom: 6 }}>
                  {formatDateTime(item.created_at, app.language)}
                </AppText>
                {item.rejection_reason ? (
                  <AppText family="inter" style={{ fontSize: 13, color: COLORS.danger }}>
                    {item.rejection_reason}
                  </AppText>
                ) : null}
              </View>
            ))
          ) : (
            <EmptyCard title={copy.noDocuments} body={copy.documentsHint} />
          )}
        </View>
      </PageContent>
    </CenteredScrollView>
  );
}

export function SupportScreen({ app, error, loading, navigation, onOpenThread, onStartThread, quickReplySend }) {
  const insets = useSafeAreaInsets();
  const copy = app.copy;

  return (
    <CenteredScrollView backgroundColor={COLORS.gray100}>
      <PageContent style={{ paddingHorizontal: 20, paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 24) + 20 }}>
        <ScreenHeader title={copy.helpSupport} onBack={navigation.goBack} />
        <AppText family="inter" style={{ fontSize: 14, color: COLORS.gray500, lineHeight: 22, marginBottom: 16 }}>
          {copy.supportHint}
        </AppText>

        {error ? (
          <View style={{ marginBottom: 16, borderRadius: 12, backgroundColor: "#FEF2F2", paddingHorizontal: 14, paddingVertical: 12 }}>
            <AppText family="inter" style={{ fontSize: 13, color: COLORS.danger }}>
              {error}
            </AppText>
          </View>
        ) : null}

        <SectionHeader title={copy.supportChat} />
        {loading ? <LoadingBlock label={copy.loading} /> : null}
        <View style={{ gap: 12, marginBottom: 24 }}>
          {app.chatThreads.length ? (
            app.chatThreads.map((thread) => {
              const latestMessage = thread.last_message;
              return (
                <Pressable key={thread.id} onPress={() => onOpenThread(thread.id)} style={{ borderRadius: 16, backgroundColor: COLORS.white, padding: 18 }}>
                  <AppText family="sora" weight="bold" style={{ fontSize: 15, color: COLORS.black, marginBottom: 6 }}>
                    {thread.title}
                  </AppText>
                  <AppText family="inter" style={{ fontSize: 13, color: COLORS.gray500 }}>
                    {latestMessage?.text || copy.noThreads}
                  </AppText>
                </Pressable>
              );
            })
          ) : (
            <>
              <EmptyCard title={copy.noThreads} body={copy.supportHint} />
              <PrimaryButton variant="dark" onPress={onStartThread}>
                {copy.startSupportChat}
              </PrimaryButton>
            </>
          )}
        </View>

        {app.quickReplies.length ? (
          <>
            <SectionHeader title={copy.quickReplies} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 24 }}>
              {app.quickReplies.map((reply) => (
                <Pressable key={reply.id} onPress={() => quickReplySend(reply.text)} style={{ borderRadius: 999, backgroundColor: COLORS.white, paddingHorizontal: 14, paddingVertical: 10 }}>
                  <AppText family="inter" weight="bold" style={{ fontSize: 12, color: COLORS.black }}>
                    {reply.title}
                  </AppText>
                </Pressable>
              ))}
            </ScrollView>
          </>
        ) : null}

        <SectionHeader title={copy.faqTitle} />
        <View style={{ gap: 12 }}>
          {(app.content?.home?.faq?.items || []).map((item) => (
            <View key={item.id || item.q} style={{ borderRadius: 16, backgroundColor: COLORS.white, padding: 18 }}>
              <AppText family="sora" weight="bold" style={{ fontSize: 15, color: COLORS.black, marginBottom: 8 }}>
                {item.q}
              </AppText>
              <AppText family="inter" style={{ fontSize: 14, color: COLORS.gray700, lineHeight: 22 }}>
                {item.a}
              </AppText>
            </View>
          ))}
        </View>
      </PageContent>
    </CenteredScrollView>
  );
}

export function ThreadScreen({ app, error, loading, messages, navigation, onSend, quickReplies, thread, threadMessage, setThreadMessage }) {
  const insets = useSafeAreaInsets();
  const copy = app.copy;

  return (
    <CenteredScrollView backgroundColor={COLORS.gray100}>
      <PageContent style={{ paddingHorizontal: 20, paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 24) + 20 }}>
        <ScreenHeader title={thread?.title || copy.supportChat} onBack={navigation.goBack} />
        {loading ? <LoadingBlock label={copy.loading} /> : null}
        {error ? (
          <View style={{ marginBottom: 16, borderRadius: 12, backgroundColor: "#FEF2F2", paddingHorizontal: 14, paddingVertical: 12 }}>
            <AppText family="inter" style={{ fontSize: 13, color: COLORS.danger }}>
              {error}
            </AppText>
          </View>
        ) : null}
        <View style={{ gap: 10, marginBottom: 16 }}>
          {messages.map((item) => (
            <View key={item.id} style={{ alignSelf: item.sender?.email === app.profile?.email ? "flex-end" : "flex-start", maxWidth: "88%", borderRadius: 16, backgroundColor: item.sender?.email === app.profile?.email ? COLORS.black : COLORS.white, paddingHorizontal: 14, paddingVertical: 12 }}>
              <AppText family="inter" style={{ fontSize: 14, color: item.sender?.email === app.profile?.email ? COLORS.white : COLORS.black, lineHeight: 22 }}>
                {item.text}
              </AppText>
              <AppText family="inter" style={{ fontSize: 11, color: item.sender?.email === app.profile?.email ? "rgba(255,255,255,0.58)" : COLORS.gray500, marginTop: 6 }}>
                {formatDateTime(item.created_at, app.language)}
              </AppText>
            </View>
          ))}
        </View>
        {quickReplies.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 12 }}>
            {quickReplies.map((reply) => (
              <Pressable key={reply.id} onPress={() => setThreadMessage(reply.text)} style={{ borderRadius: 999, backgroundColor: COLORS.white, paddingHorizontal: 14, paddingVertical: 10 }}>
                <AppText family="inter" weight="bold" style={{ fontSize: 12, color: COLORS.black }}>
                  {reply.title}
                </AppText>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}
        <LabeledInput label={copy.typeMessage} value={threadMessage} onChangeText={setThreadMessage} multiline numberOfLines={4} style={{ marginBottom: 16 }} />
        <PrimaryButton variant="dark" onPress={onSend}>
          {copy.send}
        </PrimaryButton>
      </PageContent>
    </CenteredScrollView>
  );
}

export function SettingsScreen({ app, error, navigation, onSave, saving, updateField }) {
  const insets = useSafeAreaInsets();
  const copy = app.copy;
  const profile = app.profile || {};

  return (
    <CenteredScrollView backgroundColor={COLORS.gray100}>
      <PageContent style={{ paddingHorizontal: 20, paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 24) + 20 }}>
        <ScreenHeader title={copy.accountSettings} onBack={navigation.goBack} />
        {error ? (
          <View style={{ marginBottom: 16, borderRadius: 12, backgroundColor: "#FEF2F2", paddingHorizontal: 14, paddingVertical: 12 }}>
            <AppText family="inter" style={{ fontSize: 13, color: COLORS.danger }}>
              {error}
            </AppText>
          </View>
        ) : null}
        <View style={{ gap: 14, marginBottom: 20 }}>
          <LabeledInput label={copy.fullName} value={profile.full_name || ""} onChangeText={(value) => updateField("full_name", value)} />
          <LabeledInput label={copy.phone} value={profile.phone || ""} onChangeText={(value) => updateField("phone", value)} keyboardType="phone-pad" />
          <LabeledInput label={copy.country} value={profile.country || ""} onChangeText={(value) => updateField("country", value)} />
          <LabeledInput label={copy.currency} value={profile.currency || "USD"} onChangeText={(value) => updateField("currency", value.toUpperCase())} autoCapitalize="characters" />
        </View>
        <PrimaryButton variant="dark" onPress={onSave} disabled={saving}>
          {saving ? copy.loading : copy.save}
        </PrimaryButton>
      </PageContent>
    </CenteredScrollView>
  );
}
