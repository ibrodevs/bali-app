import React, { useEffect, useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { buildBookingDeliveryLabel, formatBookingStatus, formatConvertedMoney, formatDateRange, formatDateTime } from "../data";
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
                        {formatConvertedMoney(booking.total_price, booking.currency || "USD", app.currency, app.language)}
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

export function ProfileScreen({ app, navigation, onOpenSupportChat }) {
  const insets = useSafeAreaInsets();
  const { copy, profile, bookings, notifications, documents, languageLabel } = app;
  const completedCount = bookings.filter((item) => item.status === "completed").length;
  const primaryThread = app.chatThreads[0] || null;

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
          <Pressable onPress={onOpenSupportChat} style={{ borderRadius: 20, backgroundColor: COLORS.black, padding: 18, marginBottom: 4 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,215,0,0.16)", alignItems: "center", justifyContent: "center" }}>
                  <Ionicons name="chatbubble-ellipses-outline" size={18} color={COLORS.gold} />
                </View>
                <View>
                  <AppText family="sora" weight="bold" style={{ fontSize: 16, color: COLORS.white }}>
                    {copy.supportChat}
                  </AppText>
                  <AppText family="inter" style={{ fontSize: 12, color: "rgba(255,255,255,0.58)" }}>
                    {copy.openLiveChat}
                  </AppText>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
            </View>
            <AppText family="inter" style={{ fontSize: 13, lineHeight: 21, color: "rgba(255,255,255,0.72)" }}>
              {primaryThread?.last_message?.text || copy.supportHint}
            </AppText>
          </Pressable>
          {[
            { icon: "document-text-outline", label: copy.myBookings, action: () => navigation.toTab("bookings") },
            { icon: "document-outline", label: `${copy.documents} · ${documents.length}`, action: () => navigation.push("documents") },
            { icon: "notifications-outline", label: `${copy.notifications} · ${notifications.filter((item) => !item.is_read).length}`, action: () => navigation.push("notifications") },
            { icon: "globe-outline", label: `${copy.language} · ${languageLabel}`, action: () => navigation.push("language") },
            { icon: "cash-outline", label: `${copy.currency} · ${app.currency}`, action: () => navigation.push("settings") },
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
        <ScreenHeader
          title={copy.helpSupport}
          onBack={navigation.goBack}
          rightAction={
            <Pressable onPress={onStartThread} style={{ borderRadius: 999, backgroundColor: COLORS.black, paddingHorizontal: 12, paddingVertical: 8 }}>
              <AppText family="inter" weight="bold" style={{ fontSize: 11, color: COLORS.white, textTransform: "uppercase", letterSpacing: 0.8 }}>
                {copy.newChat}
              </AppText>
            </Pressable>
          }
        />
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

export function ThreadScreen({ app, error, loading, messages, navigation, onSend, onStartThread, quickReplies, thread, threadMessage, setThreadMessage }) {
  const insets = useSafeAreaInsets();
  const copy = app.copy;
  const scrollRef = useRef(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollRef.current?.scrollToEnd?.({ animated: true });
    }, 60);

    return () => clearTimeout(timeoutId);
  }, [messages.length]);

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: COLORS.gray100 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Math.max(insets.top, 12)}>
      <PageContent style={{ flex: 1, paddingHorizontal: 20, paddingTop: insets.top + 16, paddingBottom: Math.max(insets.bottom, 14) }}>
        <ScreenHeader
          title={thread?.title || copy.supportChat}
          onBack={navigation.goBack}
          rightAction={
            <Pressable onPress={onStartThread} style={{ borderRadius: 999, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.gray200, paddingHorizontal: 12, paddingVertical: 8 }}>
              <AppText family="inter" weight="bold" style={{ fontSize: 11, color: COLORS.black, textTransform: "uppercase", letterSpacing: 0.8 }}>
                {copy.newChat}
              </AppText>
            </Pressable>
          }
        />
        {loading ? <LoadingBlock label={copy.loading} /> : null}
        {error ? (
          <View style={{ marginBottom: 16, borderRadius: 12, backgroundColor: "#FEF2F2", paddingHorizontal: 14, paddingVertical: 12 }}>
            <AppText family="inter" style={{ fontSize: 13, color: COLORS.danger }}>
              {error}
            </AppText>
          </View>
        ) : null}
        <View style={{ flex: 1, borderRadius: 22, backgroundColor: COLORS.gray100, overflow: "hidden" }}>
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ gap: 10, paddingBottom: 18 }}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd?.({ animated: true })}
          >
            {messages.map((item) => (
              <View key={item.id} style={{ alignSelf: item.sender?.email === app.profile?.email ? "flex-end" : "flex-start", maxWidth: "88%", borderRadius: 16, backgroundColor: item.sender?.email === app.profile?.email ? COLORS.black : COLORS.white, borderWidth: item.sender?.email === app.profile?.email ? 0 : 1, borderColor: COLORS.gray200, paddingHorizontal: 14, paddingVertical: 12, ...SHADOWS.card }}>
                <AppText family="inter" style={{ fontSize: 14, color: item.sender?.email === app.profile?.email ? COLORS.white : COLORS.black, lineHeight: 22 }}>
                  {item.text}
                </AppText>
                <AppText family="inter" style={{ fontSize: 11, color: item.sender?.email === app.profile?.email ? "rgba(255,255,255,0.58)" : COLORS.gray500, marginTop: 6 }}>
                  {formatDateTime(item.created_at, app.language)}
                </AppText>
              </View>
            ))}
          </ScrollView>
        </View>
        {quickReplies.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ gap: 8, paddingTop: 14, paddingBottom: 12 }}>
            {quickReplies.map((reply) => (
              <Pressable key={reply.id} onPress={() => setThreadMessage(reply.text)} style={{ borderRadius: 999, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.gray200, paddingHorizontal: 14, paddingVertical: 10 }}>
                <AppText family="inter" weight="bold" style={{ fontSize: 12, color: COLORS.black }}>
                  {reply.title}
                </AppText>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}
        <View style={{ marginTop: 4, borderRadius: 20, borderWidth: 1, borderColor: COLORS.gray200, backgroundColor: COLORS.white, padding: 12 }}>
          <LabeledInput
            label={copy.typeMessage}
            value={threadMessage}
            onChangeText={setThreadMessage}
            multiline
            numberOfLines={4}
            containerStyle={{ borderWidth: 1, borderColor: COLORS.gray200, backgroundColor: COLORS.white }}
            style={{ marginBottom: 12 }}
          />
          <PrimaryButton variant="dark" onPress={onSend}>
            {copy.send}
          </PrimaryButton>
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
