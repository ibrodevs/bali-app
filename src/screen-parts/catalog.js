import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { formatConvertedMoney, getScooterGallery, vehicleMatchesCategory, vehicleMatchesSearch } from "../data";
import { COLORS, SHADOWS } from "../theme";
import { AppText, Badge, BottomNav, CenteredScrollView, FilterPill, GlassCircleButton, PageContent, PrimaryButton, ResolvedIcon, ScooterThumb, SearchBar, Stars } from "../components";
import { EmptyCard, FleetCard, SectionHeader } from "./shared";

function PreferenceOverlay({ app, onClose, onSelect, preferenceError, preferenceSaving, type }) {
  if (!type) {
    return null;
  }

  const title = type === "language" ? app.copy.language : app.copy.currency;
  const items = type === "language" ? app.languages : app.currencies;

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.18)" }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 112 }}>
          <Pressable onPress={() => {}} style={{ borderRadius: 22, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.gray200, padding: 12, ...SHADOWS.card, elevation: 12 }}>
            <AppText family="sora" weight="bold" style={{ fontSize: 16, color: COLORS.black, marginBottom: 10 }}>
              {title}
            </AppText>
            <View style={{ gap: 8, flexDirection: type === "currency" ? "row" : "column", flexWrap: "wrap" }}>
              {items.map((item) => {
                const key = type === "language" ? item.api_code : item.code;
                const active = type === "language" ? app.language === item.api_code : app.currency === item.code;
                return (
                  <Pressable
                    key={key}
                    onPress={() => onSelect(key)}
                    style={{
                      width: type === "currency" ? "31%" : "100%",
                      borderRadius: 12,
                      borderWidth: 1.5,
                      borderColor: active ? COLORS.gold : COLORS.gray200,
                      backgroundColor: active ? "rgba(255,215,0,0.08)" : COLORS.white,
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                    }}
                  >
                    <AppText family="sora" weight="semibold" style={{ fontSize: 14, color: COLORS.black }}>
                      {type === "language" ? item.label : item.code}
                    </AppText>
                    <AppText family="inter" style={{ fontSize: 11, color: COLORS.gray500, marginTop: 2 }}>
                      {type === "language" ? item.api_code.toUpperCase() : item.symbol}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
            {preferenceSaving ? (
              <AppText family="inter" style={{ fontSize: 12, color: COLORS.gray500, marginTop: 10 }}>
                {app.copy.loading}
              </AppText>
            ) : null}
            {preferenceError ? (
              <AppText family="inter" style={{ fontSize: 12, color: COLORS.danger, marginTop: 10 }}>
                {preferenceError}
              </AppText>
            ) : null}
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

function InlinePreferenceChips({ app, expandedPreference, onChangeCurrency, onChangeLanguage, preferenceError, preferenceSaving, setExpandedPreference }) {
  async function handlePreferenceChange(type, value) {
    const applyChange = type === "language" ? onChangeLanguage : onChangeCurrency;
    if (!applyChange) {
      return;
    }

    const success = await applyChange(value);
    if (success) {
      setExpandedPreference(null);
    }
  }

  return (
    <View style={{ width: "100%" }}>
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        <Pressable onPress={() => setExpandedPreference((current) => (current === "language" ? null : "language"))} style={{ borderRadius: 999, backgroundColor: COLORS.gray100, paddingHorizontal: 12, paddingVertical: 8 }}>
          <AppText family="inter" weight="bold" style={{ fontSize: 12, color: COLORS.black }}>
            {`${app.copy.language} · ${app.languageLabel}`}
          </AppText>
        </Pressable>
        <Pressable onPress={() => setExpandedPreference((current) => (current === "currency" ? null : "currency"))} style={{ borderRadius: 999, backgroundColor: COLORS.gray100, paddingHorizontal: 12, paddingVertical: 8 }}>
          <AppText family="inter" weight="bold" style={{ fontSize: 12, color: COLORS.black }}>
            {`${app.copy.currency} · ${app.currency}`}
          </AppText>
        </Pressable>
      </View>
      <PreferenceOverlay
        app={app}
        onClose={() => setExpandedPreference(null)}
        onSelect={(value) => handlePreferenceChange(expandedPreference, value)}
        preferenceError={preferenceError}
        preferenceSaving={preferenceSaving}
        type={expandedPreference}
      />
    </View>
  );
}

export function HomeScreen({ app, navigation, onChangeCurrency, onChangeLanguage, preferenceError, preferenceSaving }) {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [expandedPreference, setExpandedPreference] = useState(null);
  const deferredSearch = useDeferredValue(search);
  const { copy, labels, profile, fleet, bookings, language } = app;

  const activeBooking = bookings.find((item) => ["confirmed", "delivery", "active", "pending_payment", "created"].includes(item.status)) || null;
  const featuredList = useMemo(
    () => fleet.filter((vehicle) => vehicleMatchesSearch(vehicle, deferredSearch) && vehicleMatchesCategory(vehicle, category)),
    [category, deferredSearch, fleet],
  );
  const headerTitle = profile?.full_name || profile?.email || "Scoot Bali";
  const headerInitials = (profile?.full_name || profile?.email || "SB").slice(0, 2).toUpperCase();

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.white }}>
      <CenteredScrollView backgroundColor={COLORS.white} contentContainerStyle={{ paddingBottom: 120 + Math.max(insets.bottom, 16) }}>
        <PageContent style={{ paddingHorizontal: 20, paddingTop: insets.top + 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <AppText family="sora" weight="extrabold" style={{ fontSize: 22, color: COLORS.black, letterSpacing: -0.8, marginBottom: 10 }}>
                {headerTitle}
              </AppText>
              <InlinePreferenceChips
                app={app}
                expandedPreference={expandedPreference}
                onChangeCurrency={onChangeCurrency}
                onChangeLanguage={onChangeLanguage}
                preferenceError={preferenceError}
                preferenceSaving={preferenceSaving}
                setExpandedPreference={setExpandedPreference}
              />
            </View>
            <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: COLORS.gold, alignItems: "center", justifyContent: "center" }}>
              <AppText family="sora" weight="extrabold" style={{ fontSize: 16, color: COLORS.black }}>
                {headerInitials}
              </AppText>
            </View>
          </View>
          <SearchBar placeholder={copy.searchFleet} value={search} onChangeText={setSearch} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 16, paddingBottom: 22 }}>
            {[
              { key: "all", label: copy.all },
              { key: "scooter", label: labels.types?.scooter || copy.scooterLabel },
              { key: "maxi", label: labels.types?.maxi || copy.maxiLabel },
              { key: "moto", label: labels.types?.moto || copy.motorcycleLabel },
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

          <SectionHeader title={copy.topPicks} actionLabel={app.content?.home?.fleet?.cta || `${copy.viewAll} →`} onPress={() => navigation.toTab("fleet")} />
          <View style={{ gap: 14 }}>
            {featuredList.slice(0, 3).map((scooter) => (
              <FleetCard
                key={scooter.id}
                actionLabel={`${copy.details} →`}
                copy={copy}
                currency={app.currency}
                language={language}
                onPress={() => navigation.openScooter(scooter.id)}
                scooter={scooter}
              />
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
              { key: "scooter", label: labels.types?.scooter || copy.scooterLabel },
              { key: "maxi", label: labels.types?.maxi || copy.maxiLabel },
              { key: "moto", label: labels.types?.moto || copy.motorcycleLabel },
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
              <FleetCard
                key={scooter.id}
                actionLabel={`${copy.details} →`}
                copy={copy}
                currency={app.currency}
                language={language}
                onPress={() => navigation.openScooter(scooter.id)}
                scooter={scooter}
              />
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
  const gallery = useMemo(() => getScooterGallery(scooter), [scooter]);
  const [photoIndex, setPhotoIndex] = useState(0);

  useEffect(() => {
    setPhotoIndex(0);
  }, [scooter?.id]);

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
          <ScooterThumb scooter={{ ...scooter, mainImage: gallery[photoIndex] || scooter.mainImage }} height={320} />
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
                {formatConvertedMoney(scooter.priceUSD, "USD", app.currency, language)}
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
          {gallery.length > 1 ? (
            <>
              <SectionHeader title={copy.photoGallery} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 18 }}>
                {gallery.map((image, index) => {
                  const active = index === photoIndex;
                  return (
                    <Pressable
                      key={`${image}-${index}`}
                      onPress={() => setPhotoIndex(index)}
                      style={{
                        width: 112,
                        borderRadius: 18,
                        overflow: "hidden",
                        borderWidth: 2,
                        borderColor: active ? COLORS.gold : COLORS.gray200,
                        backgroundColor: COLORS.white,
                      }}
                    >
                      <ScooterThumb scooter={{ ...scooter, mainImage: image }} height={82} />
                    </Pressable>
                  );
                })}
              </ScrollView>
            </>
          ) : null}
          <AppText family="inter" style={{ fontSize: 14, color: COLORS.gray700, lineHeight: 24, marginBottom: 20 }}>
            {scooter.description}
          </AppText>
          <SectionHeader title={copy.details} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
            {Object.entries(scooter.specs || {}).map(([key, value]) => (
              <View key={key} style={{ width: "47%", backgroundColor: COLORS.gray100, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16 }}>
                <AppText family="inter" weight="medium" style={{ fontSize: 10, color: COLORS.gray500, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>
                  {app.labels.specLabels?.[key] || key.replaceAll("_", " ")}
                </AppText>
                <AppText family="sora" weight="bold" style={{ fontSize: 16, color: COLORS.black }}>
                  {value}
                </AppText>
              </View>
            ))}
          </View>
          {scooter.rentalTerms ? (
            <>
              <SectionHeader title={copy.rentalTerms} />
              <View style={{ borderRadius: 18, backgroundColor: COLORS.black, padding: 18 }}>
                <AppText family="inter" style={{ fontSize: 14, lineHeight: 24, color: "rgba(255,255,255,0.74)" }}>
                  {scooter.rentalTerms}
                </AppText>
              </View>
            </>
          ) : null}
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
