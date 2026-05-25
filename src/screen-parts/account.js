import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { buildBookingDeliveryLabel, formatBookingStatus, formatBookingTotal, formatDateRange, formatDateTime } from "../data";
import { COLORS, SHADOWS } from "../theme";
import { AppText, Badge, BottomNav, CenteredScrollView, LabeledInput, LoadingBlock, PageContent, PrimaryButton, ScooterThumb } from "../components";
import { EmptyCard, ScreenHeader, SectionHeader } from "./shared";

export function BookingsScreen({ app, navigation, onOpenBookingStatus }) {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState("all");
  const copy = app.copy;

  const bookings = useMemo(() => {
    if (tab === "active") return app.bookings.filter((booking) => ["created", "pending_payment", "confirmed", "delivery", "active"].includes(booking.status));
    if (tab === "completed") return app.bookings.filter((booking) => ["completed", "cancelled"].includes(booking.status));
    return app.bookings;
  }, [app.bookings, tab]);
  const emptyBookingsBody = app.sessionActive ? copy.noBookingsHint : copy.signInHint;

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
              const scooter = app.fleet.find((item) => item.id === booking.scooter?.id) || { name: booking.scooter?.title || copy.scooterLabel, engine: "" };
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
                        {formatBookingTotal(booking, app.currency, app.language)}
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
            <EmptyCard title={copy.noBookings} body={emptyBookingsBody} />
          )}
        </PageContent>
      </CenteredScrollView>
      <BottomNav active="bookings" onChange={navigation.toTab} labels={{ home: copy.home, fleet: copy.fleet, bookings: copy.bookings, profile: copy.profile }} />
    </View>
  );
}

function PreferenceOverlay({
  app,
  danger = false,
  onClose,
  onSelect,
  saving = false,
  type,
  error,
}) {
  if (!type) {
    return null;
  }

  const title = type === "language" ? app.copy.language : app.copy.currency;
  const items = type === "language" ? app.languages : app.currencies;

  return (
    <Modal transparent animationType="fade" visible onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.18)" }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 220 }}>
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
            {saving ? (
              <AppText family="inter" style={{ fontSize: 12, color: COLORS.gray500, marginTop: 10 }}>
                {app.copy.loading}
              </AppText>
            ) : null}
            {error ? (
              <AppText family="inter" style={{ fontSize: 12, color: COLORS.danger, marginTop: 10 }}>
                {error}
              </AppText>
            ) : null}
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

export function ProfileScreen({ app, navigation, onChangeCurrency, onChangeLanguage, preferenceError, preferenceSaving }) {
  const insets = useSafeAreaInsets();
  const { copy, profile, bookings, notifications, languageLabel } = app;
  const [expandedPreference, setExpandedPreference] = useState(null);
  const completedCount = bookings.filter((item) => item.status === "completed").length;
  const isSignedIn = app.sessionActive;
  const quickStats = isSignedIn
    ? [
        { value: String(bookings.length), label: copy.bookings },
        { value: String(completedCount), label: copy.completed },
      ]
    : [
        { value: languageLabel, label: copy.language },
        { value: app.currency, label: copy.currency },
      ];
  const profileActions = isSignedIn
    ? [
        { icon: "document-text-outline", label: copy.myBookings, action: () => navigation.toTab("bookings") },
        { icon: "notifications-outline", label: `${copy.notifications} · ${notifications.filter((item) => !item.is_read).length}`, action: () => navigation.push("notifications") },
        { icon: "settings-outline", label: copy.accountSettings, action: () => navigation.push("settings") },
        { icon: "help-circle-outline", label: copy.helpSupport, action: () => navigation.push("support") },
        { icon: "log-out-outline", label: copy.signOut, action: navigation.signOut, danger: true },
      ]
    : [
        { icon: "person-outline", label: copy.signIn, action: navigation.openSignIn },
        { icon: "person-add-outline", label: copy.createAccount, action: navigation.openSignUp },
      ];

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
                  {profile?.full_name || copy.defaultUserName}
                </AppText>
                <AppText family="inter" style={{ fontSize: 13, color: COLORS.gray500 }}>
                  {profile?.email || `${languageLabel} · ${app.currency}`}
                </AppText>
              </View>
            </View>
            <View style={{ flexDirection: "row", gap: 10 }}>
              {quickStats.map((item) => (
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
          <Pressable onPress={() => setExpandedPreference((current) => (current === "language" ? null : "language"))} style={{ borderRadius: 14, backgroundColor: COLORS.white, paddingHorizontal: 18, paddingVertical: 16, flexDirection: "row", alignItems: "center", gap: 14 }}>
            <Ionicons name="globe-outline" size={20} color={COLORS.black} />
            <AppText family="inter" weight="medium" style={{ flex: 1, fontSize: 15, color: COLORS.black }}>
              {`${copy.language} · ${languageLabel}`}
            </AppText>
            {preferenceSaving && expandedPreference === "language" ? <ActivityIndicator size="small" color={COLORS.gray500} /> : <Ionicons name="chevron-forward" size={16} color={COLORS.gray300} />}
          </Pressable>
          <Pressable onPress={() => setExpandedPreference((current) => (current === "currency" ? null : "currency"))} style={{ borderRadius: 14, backgroundColor: COLORS.white, paddingHorizontal: 18, paddingVertical: 16, flexDirection: "row", alignItems: "center", gap: 14 }}>
            <Ionicons name="cash-outline" size={20} color={COLORS.black} />
            <AppText family="inter" weight="medium" style={{ flex: 1, fontSize: 15, color: COLORS.black }}>
              {`${copy.currency} · ${app.currency}`}
            </AppText>
            {preferenceSaving && expandedPreference === "currency" ? <ActivityIndicator size="small" color={COLORS.gray500} /> : <Ionicons name="chevron-forward" size={16} color={COLORS.gray300} />}
          </Pressable>
          {profileActions.map((item) => (
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
      <PreferenceOverlay
        app={app}
        error={preferenceError}
        onClose={() => setExpandedPreference(null)}
        onSelect={(value) => handlePreferenceChange(expandedPreference, value)}
        saving={preferenceSaving}
        type={expandedPreference}
      />
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
                  {!item.is_read ? <Badge variant="gold">{copy.newBadge}</Badge> : null}
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

export function SupportScreen({ app, error, loading, navigation, onOpenThread, onStartThread, quickReplySend }) {
  const insets = useSafeAreaInsets();
  const copy = app.copy;
  const threads = app.chatThreads;

  return (
    <CenteredScrollView backgroundColor={COLORS.gray100}>
      <PageContent style={{ paddingHorizontal: 20, paddingTop: insets.top + 10, paddingBottom: Math.max(insets.bottom, 24) + 24 }}>
        <ScreenHeader
          title={copy.helpSupport}
          onBack={navigation.goBack}
          rightAction={(
            <Pressable onPress={onStartThread} style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: COLORS.black, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="create-outline" size={18} color={COLORS.white} />
            </Pressable>
          )}
        />

        <View style={{ borderRadius: 24, backgroundColor: COLORS.black, padding: 18, marginBottom: 20, ...SHADOWS.card }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 14 }}>
            <View style={{ width: 56, height: 56, borderRadius: 18, backgroundColor: COLORS.gold, alignItems: "center", justifyContent: "center", ...SHADOWS.gold }}>
              <Ionicons name="chatbubbles-outline" size={26} color={COLORS.black} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText family="inter" weight="bold" style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 6 }}>
                {copy.supportChat}
              </AppText>
              <AppText family="sora" weight="extrabold" style={{ fontSize: 22, color: COLORS.white, letterSpacing: -0.7 }}>
                Bali Support
              </AppText>
            </View>
          </View>
          <AppText family="inter" style={{ fontSize: 14, color: "rgba(255,255,255,0.62)", lineHeight: 22, marginBottom: 16 }}>
            {copy.supportHint}
          </AppText>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable onPress={onStartThread} style={{ flex: 1, minHeight: 50, borderRadius: 16, backgroundColor: COLORS.gold, alignItems: "center", justifyContent: "center" }}>
              <AppText family="inter" weight="bold" style={{ fontSize: 14, color: COLORS.black }}>
                {copy.openLiveChat}
              </AppText>
            </Pressable>
            <View style={{ minWidth: 88, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center", paddingHorizontal: 14 }}>
              <AppText family="sora" weight="bold" style={{ fontSize: 18, color: COLORS.white }}>
                {threads.length}
              </AppText>
              <AppText family="inter" style={{ fontSize: 10, color: "rgba(255,255,255,0.52)", textTransform: "uppercase", letterSpacing: 0.9 }}>
                Chats
              </AppText>
            </View>
          </View>
        </View>

        {error ? (
          <View style={{ marginBottom: 16, borderRadius: 16, backgroundColor: "#FEF2F2", paddingHorizontal: 14, paddingVertical: 12 }}>
            <AppText family="inter" style={{ fontSize: 13, color: COLORS.danger }}>
              {error}
            </AppText>
          </View>
        ) : null}

        <SectionHeader title={copy.supportChat} />
        {loading ? <LoadingBlock label={copy.loading} /> : null}
        <View style={{ gap: 12, marginBottom: 26 }}>
          {threads.length ? (
            threads.map((thread) => {
              const latestMessage = thread.last_message;
              const initials = String(thread.title || copy.supportChat)
                .trim()
                .split(/\s+/)
                .slice(0, 2)
                .map((part) => part[0] || "")
                .join("")
                .toUpperCase();
              return (
                <Pressable
                  key={thread.id}
                  onPress={() => onOpenThread(thread.id)}
                  style={{ borderRadius: 20, backgroundColor: COLORS.white, padding: 16, borderWidth: 1, borderColor: COLORS.gray200, ...SHADOWS.card }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: COLORS.black, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
                      <AppText family="sora" weight="bold" style={{ fontSize: 14, color: COLORS.gold }}>
                        {initials || "SP"}
                      </AppText>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <AppText family="sora" weight="bold" style={{ flex: 1, fontSize: 15, color: COLORS.black }}>
                          {thread.title}
                        </AppText>
                        {thread.has_unread_support_reply ? <Badge variant="gold">{copy.newBadge}</Badge> : null}
                      </View>
                      <AppText numberOfLines={1} family="inter" style={{ fontSize: 13, color: COLORS.gray500, lineHeight: 18, marginBottom: 6 }}>
                        {latestMessage?.text || copy.supportHint}
                      </AppText>
                      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                        <AppText family="inter" style={{ fontSize: 12, color: COLORS.gray500 }}>
                          {latestMessage?.created_at ? formatDateTime(latestMessage.created_at, app.language) : ""}
                        </AppText>
                        <Ionicons name="chevron-forward" size={16} color={COLORS.gray300} />
                      </View>
                    </View>
                  </View>
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
                <Pressable key={reply.id} onPress={() => quickReplySend(reply.text)} style={{ borderRadius: 999, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.gray200, paddingHorizontal: 14, paddingVertical: 10 }}>
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
            <View key={item.id || item.q} style={{ borderRadius: 20, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.gray200, padding: 18, ...SHADOWS.card }}>
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

export function ThreadScreen({ app, error, loading, sending, messages, navigation, onSend, onStartThread, quickReplies, thread, threadMessage, setThreadMessage }) {
  const insets = useSafeAreaInsets();
  const copy = app.copy;
  const scrollRef = useRef(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const threadTitle = thread?.title || copy.supportChat;
  const threadAvatar = String(threadTitle)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || "")
    .join("")
    .toUpperCase();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollRef.current?.scrollToEnd?.({ animated: true });
    }, 60);

    return () => clearTimeout(timeoutId);
  }, [messages.length]);

  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const showSub = Keyboard.addListener(showEvent, () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false));

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.gray100 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={0}>
      <PageContent style={{ flex: 1, paddingHorizontal: 16, paddingTop: insets.top + 8, paddingBottom: keyboardVisible ? 8 : Math.max(insets.bottom, 10) }}>
        <View style={{ borderRadius: 22, backgroundColor: COLORS.white, paddingHorizontal: 14, paddingVertical: 14, marginBottom: 12, borderWidth: 1, borderColor: COLORS.gray200, ...SHADOWS.card }}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Pressable onPress={navigation.goBack} style={{ width: 36, height: 36, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="chevron-back" size={20} color={COLORS.gray500} />
            </Pressable>
            <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: COLORS.black, alignItems: "center", justifyContent: "center", marginLeft: 4 }}>
              <AppText family="sora" weight="bold" style={{ fontSize: 13, color: COLORS.gold }}>
                {threadAvatar || "SP"}
              </AppText>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <AppText family="sora" weight="bold" style={{ fontSize: 16, color: COLORS.black }}>
                {threadTitle}
              </AppText>
              <AppText family="inter" style={{ fontSize: 12, color: COLORS.gray500, marginTop: 2 }}>
                Bali Support
              </AppText>
            </View>
            <Pressable onPress={onStartThread} style={{ width: 38, height: 38, borderRadius: 14, backgroundColor: COLORS.gray100, alignItems: "center", justifyContent: "center" }}>
              <Ionicons name="create-outline" size={18} color={COLORS.black} />
            </Pressable>
          </View>
        </View>

        {loading && !messages.length ? <LoadingBlock label={copy.loading} /> : null}
        {error ? (
          <View style={{ marginBottom: 16, borderRadius: 16, backgroundColor: "#FEF2F2", paddingHorizontal: 14, paddingVertical: 12 }}>
            <AppText family="inter" style={{ fontSize: 13, color: COLORS.danger }}>
              {error}
            </AppText>
          </View>
        ) : null}

        <View style={{ flex: 1, borderRadius: 26, backgroundColor: COLORS.white, overflow: "hidden", borderWidth: 1, borderColor: COLORS.gray200, paddingHorizontal: 12, paddingTop: 14, ...SHADOWS.card }}>
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ gap: 10, paddingBottom: 20 }}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd?.({ animated: true })}
          >
            {messages.map((item) => {
              const own = item.sender?.email === app.profile?.email;

              return (
                <View key={item.id} style={{ flexDirection: "row", justifyContent: own ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8 }}>
                  {!own ? (
                    <View style={{ width: 28, height: 28, borderRadius: 10, backgroundColor: COLORS.black, alignItems: "center", justifyContent: "center" }}>
                      <AppText family="sora" weight="bold" style={{ fontSize: 9, color: COLORS.gold }}>
                        {threadAvatar || "SP"}
                      </AppText>
                    </View>
                  ) : null}
                  <View
                    style={{
                      maxWidth: "78%",
                      borderRadius: 22,
                      borderBottomRightRadius: own ? 8 : 22,
                      borderBottomLeftRadius: own ? 22 : 8,
                      backgroundColor: own ? COLORS.black : COLORS.gray100,
                      borderWidth: own ? 0 : 1,
                      borderColor: own ? "transparent" : COLORS.gray200,
                      paddingHorizontal: 14,
                      paddingVertical: 11,
                    }}
                  >
                    <AppText family="inter" style={{ fontSize: 14, color: own ? COLORS.white : COLORS.black, lineHeight: 20 }}>
                      {item.text}
                    </AppText>
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 6 }}>
                      <AppText family="inter" style={{ fontSize: 11, color: own ? "rgba(255,255,255,0.64)" : COLORS.gray500 }}>
                        {formatDateTime(item.created_at, app.language)}
                      </AppText>
                      {item.pending ? <ActivityIndicator size="small" color={own ? COLORS.gold : COLORS.black} /> : null}
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </View>

        {quickReplies.length && !keyboardVisible ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 8, paddingTop: 14, paddingBottom: 12, paddingHorizontal: 2 }}>
            {quickReplies.map((reply) => (
              <Pressable key={reply.id} onPress={() => setThreadMessage(reply.text)} style={{ borderRadius: 999, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.gray200, paddingHorizontal: 14, paddingVertical: 10 }}>
                <AppText family="inter" weight="bold" style={{ fontSize: 12, color: COLORS.black }}>
                  {reply.title}
                </AppText>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}

        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 10, paddingTop: 4 }}>
          <View style={{ flex: 1, minHeight: 54, maxHeight: 132, borderRadius: 22, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.gray200, paddingLeft: 16, paddingRight: 16, paddingVertical: 8, flexDirection: "row", alignItems: "flex-end" }}>
            <TextInput
              allowFontScaling={false}
              value={threadMessage}
              onChangeText={setThreadMessage}
              placeholder={copy.typeMessage}
              placeholderTextColor={COLORS.gray500}
              multiline
              style={{ flex: 1, maxHeight: 108, color: COLORS.black, fontSize: 15, paddingTop: 10, paddingBottom: 8 }}
            />
          </View>
          {keyboardVisible ? (
            <Pressable onPress={Keyboard.dismiss} style={{ width: 44, height: 44, borderRadius: 16, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.gray200, alignItems: "center", justifyContent: "center", marginBottom: 3 }}>
              <Ionicons name="chevron-down" size={22} color={COLORS.black} />
            </Pressable>
          ) : null}
          <Pressable onPress={onSend} disabled={!threadMessage.trim() || sending} style={{ width: 50, height: 50, borderRadius: 18, backgroundColor: threadMessage.trim() && !sending ? COLORS.black : COLORS.gray300, alignItems: "center", justifyContent: "center" }}>
            <Ionicons name="arrow-up" size={22} color={threadMessage.trim() && !sending ? COLORS.gold : COLORS.white} />
          </Pressable>
        </View>
      </PageContent>
    </KeyboardAvoidingView>
  );
}

export function SettingsScreen({ app, error, navigation, onSave, saving, updateCurrency, updateField }) {
  const insets = useSafeAreaInsets();
  const copy = app.copy;
  const profile = app.profile || {};

  return (
    <CenteredScrollView backgroundColor={COLORS.gray100}>
      <PageContent style={{ paddingHorizontal: 20, paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 24) + 20 }}>
        <ScreenHeader title={copy.accountSettings} onBack={navigation.goBack} />
        <View style={{ borderRadius: 22, backgroundColor: COLORS.black, padding: 18, marginBottom: 18 }}>
          <AppText family="inter" weight="bold" style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 10 }}>
            {copy.profile}
          </AppText>
          <AppText family="sora" weight="extrabold" style={{ fontSize: 24, color: COLORS.white, letterSpacing: -0.8, marginBottom: 6 }}>
            {profile.full_name || copy.defaultUserName}
          </AppText>
          <AppText family="inter" style={{ fontSize: 13, color: "rgba(255,255,255,0.62)" }}>
            {profile.email || `${copy.currency} · ${app.currency}`}
          </AppText>
        </View>
        {error ? (
          <View style={{ marginBottom: 16, borderRadius: 12, backgroundColor: "#FEF2F2", paddingHorizontal: 14, paddingVertical: 12 }}>
            <AppText family="inter" style={{ fontSize: 13, color: COLORS.danger }}>
              {error}
            </AppText>
          </View>
        ) : null}
        <View style={{ gap: 14, marginBottom: 20 }}>
          <LabeledInput label={copy.fullName} value={profile.full_name || ""} onChangeText={(value) => updateField("full_name", value)} containerStyle={{ borderWidth: 1, borderColor: COLORS.gray200, backgroundColor: COLORS.white }} />
          <LabeledInput label={copy.phone} value={profile.phone || ""} onChangeText={(value) => updateField("phone", value)} keyboardType="phone-pad" containerStyle={{ borderWidth: 1, borderColor: COLORS.gray200, backgroundColor: COLORS.white }} />
          <LabeledInput label={copy.country} value={profile.country || ""} onChangeText={(value) => updateField("country", value)} containerStyle={{ borderWidth: 1, borderColor: COLORS.gray200, backgroundColor: COLORS.white }} />
          <View>
            <AppText family="inter" weight="bold" style={{ fontSize: 11, color: COLORS.gray500, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 7 }}>
              {copy.currency}
            </AppText>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
              {app.currencies.map((item) => {
                const active = app.currency === item.code;
                return (
                  <Pressable
                    key={item.code}
                    onPress={() => updateCurrency(item.code)}
                    style={{ width: "31%", borderRadius: 14, borderWidth: 1.5, borderColor: active ? COLORS.gold : COLORS.gray200, backgroundColor: active ? "rgba(255,215,0,0.08)" : COLORS.white, paddingHorizontal: 14, paddingVertical: 14 }}
                  >
                    <AppText family="sora" weight="semibold" style={{ fontSize: 15, color: COLORS.black, marginBottom: 2 }}>
                      {item.code}
                    </AppText>
                    <AppText family="inter" style={{ fontSize: 12, color: COLORS.gray500 }}>
                      {item.symbol}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
        <PrimaryButton variant="dark" onPress={onSave} disabled={saving}>
          {saving ? copy.loading : copy.save}
        </PrimaryButton>
      </PageContent>
    </CenteredScrollView>
  );
}
