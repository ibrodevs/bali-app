import React, { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { apiRequest } from "../api";
import {
  addDays,
  buildBookingDeliveryLabel,
  buildCalendarMonth,
  buildLocalBookingPreview,
  formatBookingStatus,
  formatDate,
  formatDateRange,
  formatConvertedMoney,
  formatMoney,
  getAddonTotalPrice,
  getBookingDuration,
  getDefaultZone,
  getSelectedRentalDays,
  getWeekdayLabels,
} from "../data";
import { COLORS, SHADOWS } from "../theme";
import { AppText, Badge, CenteredScrollView, LabeledInput, LoadingBlock, PageContent, PrimaryButton, ResolvedIcon, ScooterThumb } from "../components";
import { CheckoutSteps, ScreenHeader, SectionHeader, SummaryRow } from "./shared";

function startOfMonthValue(value) {
  const next = new Date(value || Date.now());
  next.setDate(1);
  next.setHours(0, 0, 0, 0);
  return next.getTime();
}

function shiftMonth(value, amount) {
  const next = new Date(value);
  next.setDate(1);
  next.setMonth(next.getMonth() + amount);
  next.setHours(0, 0, 0, 0);
  return next.getTime();
}

function monthRequestParts(value) {
  const date = new Date(value);
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
  };
}

function formatDateKey(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function BookingDatesScreen({ app, bookingRange, navigation, scooter, setBookingRange }) {
  const insets = useSafeAreaInsets();
  const [visibleMonthStart, setVisibleMonthStart] = useState(() => startOfMonthValue(bookingRange.start));
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityError, setAvailabilityError] = useState("");
  const [availabilityMap, setAvailabilityMap] = useState(() => new Map());
  const weekdayLabels = useMemo(() => getWeekdayLabels(app.language), [app.language]);
  const selectedDays = useMemo(() => new Set(getSelectedRentalDays(bookingRange)), [bookingRange]);
  const copy = app.copy;
  const currentMonthStart = startOfMonthValue(Date.now());
  const checkoutDay = bookingRange.end;
  const calendarMonth = useMemo(
    () => buildCalendarMonth({ start: visibleMonthStart }, app.language),
    [app.language, visibleMonthStart],
  );
  const todayTimestamp = useMemo(() => {
    const next = new Date();
    next.setHours(0, 0, 0, 0);
    return next.getTime();
  }, []);

  useEffect(() => {
    const selectedMonth = startOfMonthValue(bookingRange.start);
    if (selectedMonth !== visibleMonthStart) {
      setVisibleMonthStart(selectedMonth);
    }
  }, [bookingRange.start]);

  useEffect(() => {
    if (!scooter?.id) {
      setAvailabilityMap(new Map());
      setAvailabilityError("");
      return;
    }

    let active = true;
    setAvailabilityLoading(true);
    setAvailabilityError("");

    const { year, month } = monthRequestParts(visibleMonthStart);

    apiRequest(`/scooters/${scooter.id}/availability/?year=${year}&month=${month}`, {
      language: app.language,
    })
      .then((response) => {
        if (!active) {
          return;
        }

        const nextMap = new Map();
        const days = Array.isArray(response?.days) ? response.days : [];
        days.forEach((day) => {
          if (day?.date) {
            nextMap.set(day.date, day.status || "available");
          }
        });
        setAvailabilityMap(nextMap);
        setAvailabilityLoading(false);
      })
      .catch(() => {
        if (!active) {
          return;
        }
        setAvailabilityMap(new Map());
        setAvailabilityError(copy.loadAvailabilityFailed);
        setAvailabilityLoading(false);
      });

    return () => {
      active = false;
    };
  }, [app.language, copy.loadAvailabilityFailed, scooter?.id, visibleMonthStart]);

  const statusForTimestamp = (timestamp) => {
    if (timestamp < todayTimestamp) {
      return "booked";
    }

    return availabilityMap.get(formatDateKey(timestamp)) || "available";
  };

  const rangeHasUnavailable = (startTimestamp, endTimestamp) => {
    for (let cursor = startTimestamp; cursor <= endTimestamp; cursor += 24 * 60 * 60 * 1000) {
      if (statusForTimestamp(cursor) !== "available") {
        return true;
      }
    }
    return false;
  };

  const handleDatePress = (timestamp, disabled) => {
    if (disabled) return;
    if (statusForTimestamp(timestamp) !== "available") return;

    if (!bookingRange.start || timestamp < bookingRange.start) {
      setBookingRange({ start: timestamp, end: addDays(new Date(timestamp), 1).getTime() });
      return;
    }

    if (timestamp === bookingRange.start) {
      setBookingRange({ start: timestamp, end: addDays(new Date(timestamp), 1).getTime() });
      return;
    }

    if (rangeHasUnavailable(bookingRange.start, timestamp)) {
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

        <View style={{ borderRadius: 22, backgroundColor: COLORS.black, padding: 20, marginBottom: 20 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <AppText family="sora" weight="bold" style={{ fontSize: 22, color: COLORS.white, marginBottom: 6 }}>
                {copy.selectDates}
              </AppText>
              <AppText family="inter" style={{ fontSize: 13, lineHeight: 22, color: "rgba(255,255,255,0.64)" }}>
                {copy.calendarHint}
              </AppText>
            </View>
            <Badge variant="gold">{`${getBookingDuration(bookingRange)} ${app.labels.daysLabel}`}</Badge>
          </View>

          <View style={{ flexDirection: "row", gap: 10 }}>
            {[
              { label: copy.checkIn, value: formatDate(bookingRange.start, app.language) },
              { label: copy.checkOut, value: formatDate(checkoutDay, app.language) },
            ].map((item) => (
              <View key={item.label} style={{ flex: 1, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.08)", padding: 14 }}>
                <AppText family="inter" weight="bold" style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>
                  {item.label}
                </AppText>
                <AppText family="sora" weight="bold" style={{ fontSize: 15, color: COLORS.white }}>
                  {item.value}
                </AppText>
              </View>
            ))}
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <Pressable
            onPress={() => setVisibleMonthStart((current) => shiftMonth(current, -1))}
            disabled={visibleMonthStart <= currentMonthStart}
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              backgroundColor: visibleMonthStart <= currentMonthStart ? COLORS.gray100 : COLORS.black,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="chevron-back" size={18} color={visibleMonthStart <= currentMonthStart ? COLORS.gray300 : COLORS.white} />
          </Pressable>
          <AppText family="sora" weight="bold" style={{ fontSize: 17, color: COLORS.black }}>
            {calendarMonth?.label}
          </AppText>
          <Pressable
            onPress={() => setVisibleMonthStart((current) => shiftMonth(current, 1))}
            style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: COLORS.black, alignItems: "center", justifyContent: "center" }}
          >
            <Ionicons name="chevron-forward" size={18} color={COLORS.white} />
          </Pressable>
        </View>

        <View style={{ gap: 16, marginBottom: 22 }}>
          <View style={{ borderRadius: 22, borderWidth: 1, borderColor: COLORS.gray200, backgroundColor: COLORS.white, padding: 16, ...SHADOWS.card }}>
            <AppText family="sora" weight="bold" style={{ fontSize: 18, color: COLORS.black, marginBottom: 12 }}>
              {calendarMonth.label}
            </AppText>

            <View style={{ flexDirection: "row", marginBottom: 8 }}>
              {weekdayLabels.map((day) => (
                <View key={`${calendarMonth.label}-${day}`} style={{ width: "14.2857%", alignItems: "center", paddingVertical: 4 }}>
                  <AppText family="inter" weight="bold" style={{ fontSize: 11, color: COLORS.gray500 }}>
                    {day}
                  </AppText>
                </View>
              ))}
            </View>

            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {Array.from({ length: calendarMonth.leadingEmpty }).map((_, index) => (
                <View key={`${calendarMonth.label}-empty-${index}`} style={{ width: "14.2857%", padding: 2 }}>
                  <View style={{ aspectRatio: 1 }} />
                </View>
              ))}
              {calendarMonth.days.map((item) => {
                const isStart = item.timestamp === bookingRange.start;
                const isEnd = item.timestamp === checkoutDay;
                const inRange = item.timestamp > bookingRange.start && item.timestamp < checkoutDay;
                const selected = selectedDays.has(item.timestamp) || isEnd;
                const isToday = item.timestamp === todayTimestamp;
                const availabilityStatus = statusForTimestamp(item.timestamp);
                const isAvailable = availabilityStatus === "available";
                const isUnavailable = availabilityStatus !== "available";

                return (
                  <View key={item.timestamp} style={{ width: "14.2857%", padding: 2 }}>
                    <Pressable
                      onPress={() => handleDatePress(item.timestamp, item.disabled || isUnavailable)}
                      style={{
                        aspectRatio: 1,
                        borderRadius: 18,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: isStart || isEnd ? COLORS.black : inRange ? "rgba(255,215,0,0.18)" : isAvailable ? "rgba(22,163,74,0.12)" : "rgba(220,38,38,0.12)",
                        borderWidth: !selected && !item.disabled && isToday ? 1.5 : 1,
                        borderColor: isStart || isEnd ? COLORS.black : !selected && !item.disabled && isToday ? COLORS.gold : isAvailable ? "rgba(22,163,74,0.25)" : "rgba(220,38,38,0.2)",
                        opacity: item.disabled ? 0.45 : 1,
                      }}
                    >
                      <AppText
                        family="sora"
                        weight={isStart || isEnd ? "bold" : selected ? "semibold" : "regular"}
                        style={{
                          fontSize: 15,
                          color: isStart || isEnd ? COLORS.gold : item.disabled ? COLORS.gray300 : isAvailable ? COLORS.success : COLORS.danger,
                        }}
                      >
                        {item.day}
                      </AppText>
                      {isToday && !isStart && !isEnd ? (
                        <View style={{ marginTop: 4, width: 5, height: 5, borderRadius: 999, backgroundColor: isAvailable ? COLORS.success : COLORS.danger }} />
                      ) : null}
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {availabilityLoading ? <LoadingBlock label={copy.loading} /> : null}
        {availabilityError ? (
          <AppText family="inter" style={{ fontSize: 13, color: COLORS.danger, marginBottom: 16 }}>
            {availabilityError}
          </AppText>
        ) : null}

        <View style={{ flexDirection: "row", gap: 14, marginBottom: 18 }}>
          {[
            { label: copy.checkIn, value: formatDate(bookingRange.start, app.language) },
            { label: copy.checkOut, value: formatDate(checkoutDay, app.language) },
            { label: copy.duration, value: `${getBookingDuration(bookingRange)} ${app.labels.daysLabel}` },
          ].map((item, index) => (
            <View key={item.label} style={{ flex: 1, borderRadius: 18, backgroundColor: index === 2 ? COLORS.gold : COLORS.gray100, padding: 14 }}>
              <AppText family="inter" weight="bold" style={{ fontSize: 10, color: COLORS.gray500, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 3 }}>
                {item.label}
              </AppText>
              <AppText family="sora" weight="bold" style={{ fontSize: 14, color: COLORS.black }}>
                {item.value}
              </AppText>
            </View>
          ))}
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
          {[
            { color: "rgba(22,163,74,0.12)", label: copy.available, borderColor: "rgba(22,163,74,0.25)" },
            { color: "rgba(220,38,38,0.12)", label: copy.unavailable, borderColor: "rgba(220,38,38,0.2)" },
            { color: COLORS.black, label: copy.selected, borderColor: COLORS.black },
            { color: COLORS.white, label: copy.today, borderColor: COLORS.gold },
          ].map((item) => (
            <View key={item.label} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View style={{ width: 14, height: 14, borderRadius: 999, backgroundColor: item.color, borderWidth: 1, borderColor: item.borderColor }} />
              <AppText family="inter" style={{ fontSize: 12, color: COLORS.gray500 }}>
                {item.label}
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
  navigation,
  promoCode,
  scooter,
  selectedAddons,
  setDeliveryAddress,
  setDeliverySlot,
  setSelectedAddons,
  setPromoCode,
  quote,
  quoteError,
  quoteLoading,
}) {
  const insets = useSafeAreaInsets();
  const copy = app.copy;
  const rentalDays = getBookingDuration(bookingRange);
  const zone = getDefaultZone(app.zones);
  const summary = buildLocalBookingPreview({
    addons: app.addons,
    currency: app.currency,
    deliveryZone: zone,
    quote,
    range: bookingRange,
    scooter,
    selectedAddonIds: selectedAddons,
  });

  const toggleAddon = (id) => {
    setSelectedAddons((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  return (
    <CenteredScrollView backgroundColor={COLORS.white}>
      <PageContent style={{ paddingHorizontal: 20, paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 24) + 20 }}>
        <ScreenHeader title={copy.deliveryExtras} onBack={navigation.goBack} />
        <CheckoutSteps copy={copy} current={1} />

        <View style={{ borderRadius: 18, backgroundColor: COLORS.black, padding: 18, marginBottom: 24 }}>
          <View style={{ marginBottom: 14 }}>
            <ScooterThumb scooter={scooter} height={148} />
          </View>
          <AppText family="sora" weight="bold" style={{ fontSize: 16, color: COLORS.white, marginBottom: 6 }}>
            {scooter.name}
          </AppText>
          <AppText family="inter" style={{ fontSize: 13, color: "rgba(255,255,255,0.58)" }}>
            {`${formatDateRange(bookingRange, app.language)} · ${summary.duration} ${app.labels.daysLabel}`}
          </AppText>
        </View>

        <LabeledInput label={copy.address} value={deliveryAddress} onChangeText={setDeliveryAddress} placeholder={copy.addressPlaceholder} style={{ marginBottom: 24 }} />

        <LabeledInput
          label={copy.promoCode}
          value={promoCode}
          onChangeText={(value) => setPromoCode(value.toUpperCase().replace(/\s+/g, ""))}
          placeholder={copy.promoHint}
          autoCapitalize="characters"
          autoCorrect={false}
          style={{ marginBottom: 12 }}
        />
        {promoCode.trim() && !quoteLoading ? (
          <AppText family="inter" style={{ fontSize: 12, color: summary.discountAmount > 0 ? COLORS.success : COLORS.danger, marginBottom: 20 }}>
            {summary.discountAmount > 0 ? copy.promoApplied : copy.promoInvalid}
          </AppText>
        ) : null}

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
                  +{formatConvertedMoney(getAddonTotalPrice(addon, rentalDays), "USD", app.currency, app.language)}
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
          <SummaryRow label={copy.rental} value={formatMoney(summary.rentalCost, summary.currency, app.language)} />
          <SummaryRow label={copy.addons} value={formatMoney(summary.addonsTotal, summary.currency, app.language)} />
          <SummaryRow label={copy.delivery} value={summary.deliveryFee === 0 ? copy.free : formatMoney(summary.deliveryFee, summary.currency, app.language)} />
          {summary.discountAmount > 0 ? (
            <SummaryRow label={promoCode.trim() ? `${copy.discountLabel} (${promoCode.trim().toUpperCase()})` : copy.discountLabel} value={`-${formatMoney(summary.discountAmount, summary.currency, app.language)}`} />
          ) : null}
          <SummaryRow label={copy.total} value={formatMoney(summary.total, summary.currency, app.language)} border />
        </View>

        <PrimaryButton variant="dark" onPress={navigation.continueToPayment} disabled={!deliveryAddress.trim() || quoteLoading || !quote}>
          {copy.continueToPayment} →
        </PrimaryButton>
      </PageContent>
    </CenteredScrollView>
  );
}

export function PaymentScreen({
  app,
  bookingRange,
  bookingContact,
  deliveryAddress,
  deliverySlot,
  navigation,
  onUpdateBookingContact,
  paymentMethod,
  promoCode,
  quote,
  quoteError,
  quoteLoading,
  scooter,
  selectedAddons,
  setPaymentMethod,
  setPromoCode,
  submitting,
}) {
  const insets = useSafeAreaInsets();
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cashConfirmed, setCashConfirmed] = useState(false);
  const [localError, setLocalError] = useState("");
  const copy = app.copy;
  const zone = getDefaultZone(app.zones);
  const summary = buildLocalBookingPreview({
    addons: app.addons,
    currency: app.currency,
    deliveryZone: zone,
    quote,
    range: bookingRange,
    scooter,
    selectedAddonIds: selectedAddons,
  });
  const paymentOptions = [
    {
      key: "online_card",
      icon: "card-outline",
      label: app.labels.paymentMethods.online_card || copy.cardOnlineTitle,
      shortLabel: copy.paymentOptionCard,
      title: copy.cardOnlineTitle,
      description: copy.cardOnlineDescription,
    },
    {
      key: "cash_on_delivery",
      icon: "cash-outline",
      label: app.labels.paymentMethods.cash_on_delivery || copy.cashOnDeliveryTitle,
      shortLabel: copy.paymentOptionCash,
      title: copy.cashOnDeliveryTitle,
      description: copy.cashOnDeliveryDescription,
    },
    {
      key: "crypto",
      icon: "logo-bitcoin",
      label: copy.cryptoTitle,
      shortLabel: copy.paymentOptionCrypto,
      title: copy.cryptoTitle,
      description: copy.cryptoDescription,
    },
  ];
  const activePaymentOption = paymentOptions.find((item) => item.key === paymentMethod) || paymentOptions[0];
  const messengerOptions = [
    { key: "hasTelegram", label: copy.telegram },
    { key: "hasWhatsapp", label: copy.whatsapp },
    { key: "hasWechat", label: copy.wechat },
  ];
  const trustMarks = [copy.secureTrust1, copy.secureTrust2, copy.secureTrust3];
  const primaryActionLabel = copy.confirmBooking;

  const handleCardNumberChange = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 19);
    setCardNumber(digits.replace(/(.{4})/g, "$1 ").trim());
    setLocalError("");
  };

  const handleCardExpiryChange = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    setCardExpiry(digits.length <= 2 ? digits : `${digits.slice(0, 2)}/${digits.slice(2)}`);
    setLocalError("");
  };

  const handleFinish = () => {
    if (paymentMethod === "online_card") {
      const digits = cardNumber.replace(/\s+/g, "");
      if (!cardName.trim()) {
        setLocalError(copy.cardNameRequired);
        return;
      }
      if (digits.length < 12) {
        setLocalError(copy.cardNumberInvalid);
        return;
      }
      if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        setLocalError(copy.cardExpiryInvalid);
        return;
      }
    }

    if (paymentMethod === "cash_on_delivery" && !cashConfirmed) {
      setLocalError(copy.cashConsentRequired);
      return;
    }

    setLocalError("");
    navigation.finishBooking();
  };

  return (
    <CenteredScrollView backgroundColor={COLORS.white}>
      <PageContent style={{ paddingHorizontal: 20, paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 24) + 20 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <AppText family="inter" weight="bold" style={{ fontSize: 11, color: COLORS.gray500, textTransform: "uppercase", letterSpacing: 1.2 }}>
            {copy.paymentStepLabel}
          </AppText>
          <Badge>{summary.currency || app.currency}</Badge>
        </View>
        <ScreenHeader title={copy.payment} onBack={navigation.goBack} />
        <CheckoutSteps copy={copy} current={2} />
        <AppText family="sora" weight="black" style={{ fontSize: 30, color: COLORS.black, letterSpacing: -1.2, marginBottom: 24 }}>
          {copy.paymentPageTitle}
        </AppText>

        <View style={{ borderRadius: 20, backgroundColor: COLORS.gray100, padding: 20, marginBottom: 24 }}>
          <View style={{ borderRadius: 16, backgroundColor: COLORS.white, padding: 12, marginBottom: 16 }}>
            <ScooterThumb scooter={scooter} height={156} />
          </View>
          <AppText family="sora" weight="bold" style={{ fontSize: 22, color: COLORS.black, marginBottom: 6 }}>
            {scooter.name}
          </AppText>
          <AppText family="inter" style={{ fontSize: 13, color: COLORS.gray500, marginBottom: 16 }}>
            {`${formatDateRange(bookingRange, app.language)} · ${summary.duration} ${app.labels.daysLabel}`}
          </AppText>
          <View style={{ borderTopWidth: 1, borderTopColor: COLORS.gray200, paddingTop: 14 }}>
            <AppText family="inter" weight="bold" style={{ fontSize: 11, color: COLORS.gray500, textTransform: "uppercase", letterSpacing: 1.1, marginBottom: 10 }}>
              {copy.breakdown}
            </AppText>
            <SummaryRow label={copy.rental} value={formatMoney(summary.rentalCost, summary.currency, app.language)} />
            <SummaryRow label={copy.addons} value={formatMoney(summary.addonsTotal, summary.currency, app.language)} />
            <SummaryRow label={copy.delivery} value={summary.deliveryFee === 0 ? copy.free : formatMoney(summary.deliveryFee, summary.currency, app.language)} />
            {summary.discountAmount > 0 ? (
              <SummaryRow label={promoCode.trim() ? `${copy.discountLabel} (${promoCode.trim().toUpperCase()})` : copy.discountLabel} value={`-${formatMoney(summary.discountAmount, summary.currency, app.language)}`} />
            ) : null}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: COLORS.gray200 }}>
              <AppText family="sora" weight="bold" style={{ fontSize: 18, color: COLORS.black }}>
                {copy.total}
              </AppText>
              <View style={{ borderRadius: 999, backgroundColor: COLORS.gold, paddingHorizontal: 16, paddingVertical: 8 }}>
                <AppText family="sora" weight="black" style={{ fontSize: 22, color: COLORS.black }}>
                  {formatMoney(summary.total, summary.currency, app.language)}
                </AppText>
              </View>
            </View>
          </View>
        </View>

        <View style={{ borderRadius: 16, borderWidth: 1, borderColor: COLORS.gray200, backgroundColor: COLORS.white, padding: 18, marginBottom: 20 }}>
          <LabeledInput
            label={copy.promoCode}
            value={promoCode}
            onChangeText={(value) => {
              setPromoCode(value.toUpperCase().replace(/\s+/g, ""));
              setLocalError("");
            }}
            placeholder={copy.promoHint}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          {promoCode.trim() && !quoteLoading ? (
            <AppText family="inter" style={{ fontSize: 12, color: summary.discountAmount > 0 ? COLORS.success : COLORS.danger, marginTop: 10 }}>
              {summary.discountAmount > 0 ? copy.promoApplied : copy.promoInvalid}
            </AppText>
          ) : null}
        </View>

        {!app.sessionActive ? (
          <View style={{ borderRadius: 16, borderWidth: 1, borderColor: COLORS.gray200, backgroundColor: COLORS.white, padding: 16, marginBottom: 24 }}>
            <AppText family="inter" weight="bold" style={{ fontSize: 11, color: COLORS.gray500, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 14 }}>
              {copy.contactDetails}
            </AppText>
            <LabeledInput
              label={copy.fullName}
              value={bookingContact.fullName}
              onChangeText={(value) => onUpdateBookingContact("fullName", value)}
              placeholder=""
              style={{ marginBottom: 14 }}
            />
            <LabeledInput
              label={copy.phone}
              value={bookingContact.phone}
              onChangeText={(value) => onUpdateBookingContact("phone", value)}
              placeholder=""
              keyboardType="phone-pad"
              autoCapitalize="none"
              style={{ marginBottom: 14 }}
            />
            <AppText family="inter" weight="bold" style={{ fontSize: 11, color: COLORS.gray500, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 7 }}>
              {copy.messengerTitle}
            </AppText>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 8 }}>
              {messengerOptions.map((item) => {
                const active = Boolean(bookingContact[item.key]);
                return (
                  <Pressable
                    key={item.key}
                    onPress={() => onUpdateBookingContact(item.key, !active)}
                    style={{
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 999,
                      borderWidth: 1.5,
                      borderColor: active ? COLORS.black : COLORS.gray200,
                      backgroundColor: active ? COLORS.black : COLORS.white,
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Ionicons name={active ? "checkmark-circle" : "ellipse-outline"} size={16} color={active ? COLORS.gold : COLORS.gray500} />
                    <AppText family="inter" weight="bold" style={{ fontSize: 13, color: active ? COLORS.white : COLORS.gray700 }}>
                      {item.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
            <AppText family="inter" style={{ fontSize: 12, lineHeight: 20, color: COLORS.gray500 }}>
              {copy.messengerHint}
            </AppText>
          </View>
        ) : null}

        <View style={{ flexDirection: "row", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {paymentOptions.map((item) => {
            const active = paymentMethod === item.key;
            return (
              <Pressable
                key={item.key}
                onPress={() => {
                  setPaymentMethod(item.key);
                  setLocalError("");
                }}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: active ? COLORS.gold : COLORS.gray200,
                  backgroundColor: active ? COLORS.gold : COLORS.white,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <Ionicons name={item.icon} size={15} color={active ? COLORS.black : COLORS.gray700} />
                <AppText family="inter" weight="bold" style={{ fontSize: 12, color: active ? COLORS.black : COLORS.gray700, textTransform: "uppercase", letterSpacing: 0.8 }}>
                  {item.shortLabel}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        {paymentMethod === "online_card" ? (
          <View style={{ borderRadius: 16, borderWidth: 1, borderColor: COLORS.gray200, backgroundColor: COLORS.white, padding: 18, marginBottom: 20 }}>
            <AppText family="inter" weight="bold" style={{ fontSize: 11, color: COLORS.gray500, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 10 }}>
              {copy.cardOnlineTitle}
            </AppText>
            <AppText family="inter" style={{ fontSize: 13, lineHeight: 22, color: COLORS.gray500, marginBottom: 18 }}>
              {copy.cardOnlineDescription}
            </AppText>
            <LabeledInput label={copy.cardholder} value={cardName} onChangeText={(value) => { setCardName(value); setLocalError(""); }} placeholder="" style={{ marginBottom: 14 }} />
            <LabeledInput label={copy.cardNumber} value={cardNumber} onChangeText={handleCardNumberChange} placeholder="" keyboardType="number-pad" autoCapitalize="none" style={{ marginBottom: 14 }} />
            <View style={{ flexDirection: "row", gap: 12 }}>
              <LabeledInput label={copy.cardExpiry} value={cardExpiry} onChangeText={handleCardExpiryChange} placeholder="" keyboardType="number-pad" autoCapitalize="none" style={{ flex: 1 }} />
              <LabeledInput label={copy.cardCvc} value={cardCvc} onChangeText={(value) => { setCardCvc(value.replace(/\D/g, "").slice(0, 4)); setLocalError(""); }} placeholder="" keyboardType="number-pad" autoCapitalize="none" style={{ flex: 1 }} />
            </View>
          </View>
        ) : null}

        {paymentMethod === "cash_on_delivery" ? (
          <View style={{ borderRadius: 16, borderWidth: 1, borderColor: COLORS.gray200, backgroundColor: COLORS.white, padding: 18, marginBottom: 20 }}>
            <AppText family="inter" weight="bold" style={{ fontSize: 11, color: COLORS.gray500, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 10 }}>
              {copy.cashOnDeliveryTitle}
            </AppText>
            <AppText family="inter" style={{ fontSize: 13, lineHeight: 22, color: COLORS.gray500, marginBottom: 14 }}>
              {copy.cashOnDeliveryDescription}
            </AppText>
            <View style={{ borderRadius: 14, backgroundColor: COLORS.gray100, padding: 14, marginBottom: 14 }}>
              <SummaryRow label={copy.address} value={deliveryAddress || "-"} />
              <SummaryRow label={copy.preferredTime} value={deliverySlot} border />
            </View>
            <Pressable
              onPress={() => {
                setCashConfirmed((current) => !current);
                setLocalError("");
              }}
              style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}
            >
              <Ionicons name={cashConfirmed ? "checkbox" : "square-outline"} size={20} color={cashConfirmed ? COLORS.black : COLORS.gray500} />
              <AppText family="inter" style={{ flex: 1, fontSize: 13, lineHeight: 22, color: COLORS.gray700 }}>
                {copy.cashConsentLabel}
              </AppText>
            </Pressable>
          </View>
        ) : null}

        {paymentMethod === "crypto" ? (
          <View style={{ borderRadius: 16, borderWidth: 1, borderColor: COLORS.gray200, backgroundColor: COLORS.white, padding: 18, marginBottom: 20 }}>
            <AppText family="inter" weight="bold" style={{ fontSize: 11, color: COLORS.gray500, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 10 }}>
              {copy.cryptoTitle}
            </AppText>
            <AppText family="inter" style={{ fontSize: 13, lineHeight: 22, color: COLORS.gray500, marginBottom: 16 }}>
              {copy.cryptoDescription}
            </AppText>
            <View style={{ borderRadius: 14, backgroundColor: COLORS.gray100, padding: 14 }}>
              <SummaryRow label={copy.cryptoCurrency} value="USDT" />
              <SummaryRow label={copy.amountDue} value={formatMoney(summary.total, summary.currency, app.language)} border />
            </View>
          </View>
        ) : null}

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 14, marginBottom: 20 }}>
          {trustMarks.map((label) => (
            <View key={label} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              <Ionicons name="checkmark-circle-outline" size={14} color={COLORS.gray500} />
              <AppText family="inter" weight="bold" style={{ fontSize: 11, color: COLORS.gray500, textTransform: "uppercase", letterSpacing: 0.8 }}>
                {label}
              </AppText>
            </View>
          ))}
        </View>

        <View style={{ borderRadius: 16, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.gray200, padding: 16, marginBottom: 18 }}>
          <AppText family="inter" weight="bold" style={{ fontSize: 11, color: COLORS.gray500, textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 6 }}>
            {copy.protectedLabel}
          </AppText>
          <AppText family="inter" style={{ fontSize: 13, lineHeight: 22, color: COLORS.gray500 }}>
            {copy.protectedDescription}
          </AppText>
        </View>

        {quoteLoading ? <LoadingBlock label={copy.loading} /> : null}
        {quoteError || localError ? (
          <View style={{ marginBottom: 16, borderRadius: 12, backgroundColor: "#FEF2F2", paddingHorizontal: 14, paddingVertical: 12 }}>
            <AppText family="inter" style={{ fontSize: 13, color: COLORS.danger }}>
              {quoteError || localError}
            </AppText>
          </View>
        ) : null}
        <PrimaryButton variant="gold" onPress={handleFinish} disabled={submitting || quoteLoading || !quote}>
          {submitting ? copy.loading : `${primaryActionLabel} →`}
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
  const bookingStatus = formatBookingStatus(booking, app.labels.bookingStatuses);
  const bookingPendingPayment = booking?.status === "pending_payment" || booking?.payment_status === "pending";

  return (
    <CenteredScrollView backgroundColor={COLORS.white}>
      <PageContent style={{ minHeight: 760, alignItems: "center", justifyContent: "center", paddingHorizontal: 28, paddingTop: insets.top + 40, paddingBottom: Math.max(insets.bottom, 24) + 40 }}>
        <View style={{ width: 96, height: 96, borderRadius: 999, backgroundColor: COLORS.gold, alignItems: "center", justifyContent: "center", marginBottom: 28, ...SHADOWS.gold }}>
          <Ionicons name="checkmark" size={46} color={COLORS.black} />
        </View>
        <AppText family="sora" weight="black" style={{ fontSize: 32, color: COLORS.black, letterSpacing: -1.4, textAlign: "center", marginBottom: 10 }}>
          {bookingPendingPayment ? copy.bookingReserved : copy.bookingConfirmed}
        </AppText>
        <View style={{ borderRadius: 999, backgroundColor: COLORS.gray100, paddingHorizontal: 20, paddingVertical: 8, marginBottom: 20 }}>
          <AppText family="sora" weight="bold" style={{ fontSize: 14, color: COLORS.black }}>
            #{booking?.order_number || booking?.id}
          </AppText>
        </View>
        <AppText family="inter" style={{ textAlign: "center", fontSize: 15, lineHeight: 26, color: COLORS.gray500, marginBottom: 36 }}>
          {`${scooter?.name || booking?.scooter?.title || copy.scooterLabel} · ${bookingStatus}`}
        </AppText>
        {scooter ? (
          <View style={{ width: "100%", marginBottom: 18 }}>
            <ScooterThumb scooter={scooter} height={168} />
          </View>
        ) : null}
        <View style={{ width: "100%", borderRadius: 16, backgroundColor: COLORS.gray100, padding: 20, marginBottom: 28 }}>
          {[
            { label: copy.vehicle, value: scooter?.name || booking?.scooter?.title || "-" },
            { label: copy.duration, value: `${booking?.rental_days || 1} ${app.labels.daysLabel}` },
            { label: copy.delivery, value: booking ? buildBookingDeliveryLabel(booking, app.language) : "-" },
            { label: copy.total, value: formatConvertedMoney(booking?.total_price || 0, booking?.currency || "USD", app.currency, app.language) },
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
