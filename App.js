import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts as useInterFonts,
} from "@expo-google-fonts/inter";
import {
  Sora_400Regular,
  Sora_600SemiBold,
  Sora_700Bold,
  Sora_800ExtraBold,
  Sora_900Black,
  useFonts as useSoraFonts,
} from "@expo-google-fonts/sora";
import { apiRequest, API_BASE_URL, ApiError } from "./src/api";
import { COLORS } from "./src/theme";
import {
  buildCreateBookingPayload,
  createInitialBookingRange,
  DEFAULT_DELIVERY_SLOTS,
  getDefaultVehicle,
  getDefaultZone,
  getLanguageOption,
  getVehicleById,
  unwrapList,
} from "./src/data";
import { translate } from "./src/i18n";
import {
  BookingDatesScreen,
  BookingsScreen,
  DeliveryScreen,
  DetailScreen,
  DocumentsScreen,
  FleetScreen,
  HomeScreen,
  LanguageScreen,
  LoginScreen,
  NotificationsScreen,
  OnboardingScreen,
  OrderConfirmedScreen,
  PaymentScreen,
  ProfileScreen,
  SettingsScreen,
  SplashScreen,
  SupportScreen,
  ThreadScreen,
} from "./src/screens";

const STORAGE_KEYS = {
  language: "scoot-bali.language",
  session: "scoot-bali.session",
  onboarding: "scoot-bali.onboarding",
};

const DARK_ROUTES = new Set(["splash", "onboarding-1", "onboarding-2", "onboarding-3"]);

function replaceTop(stack, route) {
  if (!stack.length) {
    return [route];
  }

  return [...stack.slice(0, -1), route];
}

function initialAuthForm() {
  return {
    fullName: "",
    email: "",
    phone: "",
    password: "",
  };
}

function getErrorMessage(error) {
  if (error instanceof ApiError) {
    if (typeof error.details === "object" && error.details && !Array.isArray(error.details)) {
      const firstValue = Object.values(error.details)[0];
      if (Array.isArray(firstValue)) {
        return String(firstValue[0]);
      }
      if (typeof firstValue === "string") {
        return firstValue;
      }
    }
    return error.message;
  }

  return error?.message || "Something went wrong";
}

export default function App() {
  const [interLoaded] = useInterFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  const [soraLoaded] = useSoraFonts({
    Sora_400Regular,
    Sora_600SemiBold,
    Sora_700Bold,
    Sora_800ExtraBold,
    Sora_900Black,
  });
  const [fontGateExpired, setFontGateExpired] = useState(false);
  const [startupReady, setStartupReady] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [stack, setStack] = useState([{ name: "splash" }]);
  const [language, setLanguage] = useState("en");
  const [bootstrap, setBootstrap] = useState(null);
  const [bootstrapLoading, setBootstrapLoading] = useState(true);
  const [bootstrapError, setBootstrapError] = useState("");
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [chatThreads, setChatThreads] = useState([]);
  const [quickReplies, setQuickReplies] = useState([]);
  const [privateLoading, setPrivateLoading] = useState(false);
  const [privateError, setPrivateError] = useState("");
  const [authMode, setAuthMode] = useState("signin");
  const [authForm, setAuthForm] = useState(initialAuthForm());
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");
  const [selectedScooterId, setSelectedScooterId] = useState(null);
  const [bookingRange, setBookingRange] = useState(() => createInitialBookingRange());
  const [deliveryZoneId, setDeliveryZoneId] = useState(null);
  const [deliverySlot, setDeliverySlot] = useState(DEFAULT_DELIVERY_SLOTS[0]);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("online_card");
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [selectedDocumentType, setSelectedDocumentType] = useState("passport");
  const [documentError, setDocumentError] = useState("");
  const [documentUploading, setDocumentUploading] = useState(false);
  const [supportError, setSupportError] = useState("");
  const [threadMessages, setThreadMessages] = useState([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [threadError, setThreadError] = useState("");
  const [threadMessage, setThreadMessage] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [settingsSaving, setSettingsSaving] = useState(false);

  const route = stack[stack.length - 1];

  useEffect(() => {
    if (interLoaded && soraLoaded) {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      setFontGateExpired(true);
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [interLoaded, soraLoaded]);

  useEffect(() => {
    let active = true;

    async function restore() {
      try {
        const [storedLanguage, storedSession, storedOnboarding] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.language),
          AsyncStorage.getItem(STORAGE_KEYS.session),
          AsyncStorage.getItem(STORAGE_KEYS.onboarding),
        ]);

        if (!active) {
          return;
        }

        if (storedLanguage) {
          setLanguage(storedLanguage);
        }
        if (storedSession) {
          setSession(JSON.parse(storedSession));
        }
        setHasSeenOnboarding(storedOnboarding === "1");
      } finally {
        if (active) {
          setStartupReady(true);
        }
      }
    }

    restore();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!startupReady || route.name !== "splash") {
      return undefined;
    }

    const timeoutId = setTimeout(() => {
      if (hasSeenOnboarding) {
        setStack([{ name: session ? "home" : "login" }]);
      } else {
        setStack([{ name: "onboarding-1" }]);
      }
    }, 1200);

    return () => clearTimeout(timeoutId);
  }, [hasSeenOnboarding, route.name, session, startupReady]);

  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEYS.language, language).catch(() => {});
  }, [language]);

  useEffect(() => {
    let active = true;
    setBootstrapLoading(true);
    setBootstrapError("");

    apiRequest(`/public/bootstrap/?lang=${encodeURIComponent(language)}`, { language })
      .then((data) => {
        if (!active) {
          return;
        }

        setBootstrap(data);
        setBootstrapLoading(false);
        if (!selectedScooterId && data?.fleet?.items?.length) {
          setSelectedScooterId(data.fleet.items[0].id);
        }
        if (!deliveryZoneId && data?.deliveryZones?.length) {
          setDeliveryZoneId(data.deliveryZones[0].id);
        }
        if (data?.deliverySlots?.length) {
          setDeliverySlot((current) => current || data.deliverySlots[0]);
        }
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        setBootstrapError(getErrorMessage(error));
        setBootstrapLoading(false);
      });

    return () => {
      active = false;
    };
  }, [language]);

  async function signOut(nextRoute = "login") {
    if (session?.refresh) {
      try {
        await apiRequest("/auth/logout/", {
          method: "POST",
          token: session.access,
          language,
          body: { refresh: session.refresh },
        });
      } catch {
        // no-op
      }
    }

    await AsyncStorage.removeItem(STORAGE_KEYS.session).catch(() => {});
    setSession(null);
    setProfile(null);
    setBookings([]);
    setDocuments([]);
    setNotifications([]);
    setChatThreads([]);
    setQuickReplies([]);
    setThreadMessages([]);
    setThreadMessage("");
    setQuote(null);
    setStack([{ name: nextRoute }]);
  }

  async function loadPrivateData(accessToken = session?.access, options = {}) {
    const { background = false } = options;
    if (!accessToken) {
      return;
    }

    if (!background) {
      setPrivateLoading(true);
      setPrivateError("");
    }

    try {
      const [profileData, bookingsData, documentsData, notificationsData, threadsData, quickRepliesData] = await Promise.all([
        apiRequest("/profile/", { token: accessToken, language }),
        apiRequest("/bookings/", { token: accessToken, language }),
        apiRequest("/documents/my/", { token: accessToken, language }),
        apiRequest("/notifications/", { token: accessToken, language }),
        apiRequest("/chat/threads/", { token: accessToken, language }),
        apiRequest("/chat/quick-replies/?is_active=true", { token: accessToken, language }),
      ]);

      setProfile(profileData);
      setBookings(unwrapList(bookingsData));
      setDocuments(unwrapList(documentsData));
      setNotifications(unwrapList(notificationsData));
      setChatThreads(unwrapList(threadsData));
      setQuickReplies(unwrapList(quickRepliesData));
      if (!background) {
        setPrivateLoading(false);
      }
      return profileData;
    } catch (error) {
      if (!background) {
        setPrivateLoading(false);
      }
      setPrivateError(getErrorMessage(error));
      if (error instanceof ApiError && error.status === 401) {
        await signOut();
      }
      return null;
    }
  }

  useEffect(() => {
    if (!session?.access) {
      return;
    }

    loadPrivateData(session.access);
  }, [language, session?.access]);

  const fleet = bootstrap?.fleet?.items || [];
  const zones = bootstrap?.deliveryZones || [];
  const addons = bootstrap?.addons || [];
  const scooter = useMemo(() => getVehicleById(fleet, selectedScooterId), [fleet, selectedScooterId]);

  useEffect(() => {
    if (!scooter || !deliveryZoneId) {
      return;
    }

    let active = true;
    setQuoteLoading(true);
    setQuoteError("");

    apiRequest("/bookings/calculate/", {
      method: "POST",
      language,
      body: {
        ...buildCreateBookingPayload({
          scooter,
          range: bookingRange,
          selectedAddonIds: selectedAddons,
          deliveryZone: zones.find((item) => String(item.id) === String(deliveryZoneId)),
          deliveryAddress,
          deliverySlot,
          paymentMethod,
        }),
      },
    })
      .then((data) => {
        if (!active) {
          return;
        }
        setQuote(data);
        setQuoteLoading(false);
      })
      .catch((error) => {
        if (!active) {
          return;
        }
        setQuote(null);
        setQuoteError(getErrorMessage(error));
        setQuoteLoading(false);
      });

    return () => {
      active = false;
    };
  }, [bookingRange, deliveryAddress, deliverySlot, deliveryZoneId, language, paymentMethod, scooter, selectedAddons, zones]);

  function getPrimarySupportThread(threads = chatThreads) {
    return threads.find((item) => item.status === "open") || threads[0] || null;
  }

  async function persistSession(nextSession) {
    setSession(nextSession);
    await AsyncStorage.setItem(STORAGE_KEYS.session, JSON.stringify(nextSession));
  }

  function updateAuthField(key, value) {
    setAuthForm((current) => ({ ...current, [key]: value }));
  }

  async function handleAuthSubmit() {
    setAuthSubmitting(true);
    setAuthError("");

    try {
      if (authMode === "signin") {
        const authData = await apiRequest("/auth/login/", {
          method: "POST",
          language,
          body: {
            email: authForm.email.trim().toLowerCase(),
            password: authForm.password,
          },
        });
        await persistSession({ access: authData.access, refresh: authData.refresh });
        await loadPrivateData(authData.access);
        setStack([{ name: "home" }]);
      } else {
        await apiRequest("/auth/register/", {
          method: "POST",
          language,
          body: {
            email: authForm.email.trim().toLowerCase(),
            password: authForm.password,
            full_name: authForm.fullName.trim(),
            phone: authForm.phone.trim(),
            language,
          },
        });

        const authData = await apiRequest("/auth/login/", {
          method: "POST",
          language,
          body: {
            email: authForm.email.trim().toLowerCase(),
            password: authForm.password,
          },
        });
        await persistSession({ access: authData.access, refresh: authData.refresh });
        await loadPrivateData(authData.access);
        setStack([{ name: "home" }]);
      }
    } catch (error) {
      setAuthError(getErrorMessage(error));
    } finally {
      setAuthSubmitting(false);
    }
  }

  async function handleForgotPassword() {
    setAuthError("");
    try {
      await apiRequest("/auth/password-reset/", {
        method: "POST",
        language,
        body: { email: authForm.email.trim().toLowerCase() },
      });
      setAuthError(translate(language, "passwordResetSent"));
    } catch (error) {
      setAuthError(getErrorMessage(error));
    }
  }

  async function ensureSupportThread() {
    if (!session?.access) {
      setStack([{ name: "login" }]);
      return null;
    }

    const existing = getPrimarySupportThread();
    if (existing) {
      return existing;
    }

    const thread = await apiRequest("/chat/threads/ensure-support/", {
      method: "POST",
      token: session.access,
      language,
      body: { title: translate(language, "supportChat") },
    });
    await loadPrivateData(session.access, { background: true });
    return thread;
  }

  async function handleAfterLanguageConfirm() {
    await AsyncStorage.setItem(STORAGE_KEYS.onboarding, "1").catch(() => {});
    setHasSeenOnboarding(true);

    if (session?.access) {
      try {
        const nextProfile = await apiRequest("/profile/", {
          method: "PATCH",
          token: session.access,
          language,
          body: { language },
        });
        setProfile(nextProfile);
      } catch {
        // ignore
      }
      setStack((current) => (current.length > 1 ? current.slice(0, -1) : [{ name: "profile" }]));
      return;
    }

    setStack([{ name: "login" }]);
  }

  async function handleCreateBooking() {
    if (!session?.access || !scooter) {
      setStack([{ name: "login" }]);
      return;
    }

    setBookingSubmitting(true);
    try {
      const zone = zones.find((item) => String(item.id) === String(deliveryZoneId));
      const booking = await apiRequest("/bookings/", {
        method: "POST",
        token: session.access,
        language,
        body: buildCreateBookingPayload({
          scooter,
          range: bookingRange,
          selectedAddonIds: selectedAddons,
          deliveryZone: zone,
          deliveryAddress,
          deliverySlot,
          paymentMethod,
          currency: profile?.currency || "USD",
        }),
      });

      let finalBooking = booking;
      if (paymentMethod === "online_card") {
        await apiRequest("/payments/create/", {
          method: "POST",
          token: session.access,
          language,
          body: { booking_id: booking.id, provider: "mock" },
        });
      }

      const bookingsData = await apiRequest("/bookings/", {
        token: session.access,
        language,
      });
      const nextBookings = unwrapList(bookingsData);
      setBookings(nextBookings);
      await loadPrivateData(session.access);
      const refreshedBooking = nextBookings.find((item) => item.id === booking.id);
      if (refreshedBooking) {
        finalBooking = refreshedBooking;
      }

      setStack([{ name: "confirmed", params: { booking: finalBooking } }]);
    } catch (error) {
      setQuoteError(getErrorMessage(error));
    } finally {
      setBookingSubmitting(false);
    }
  }

  async function markAllNotificationsRead() {
    if (!session?.access) {
      return;
    }

    try {
      await apiRequest("/notifications/mark-all-read/", {
        method: "POST",
        token: session.access,
        language,
      });
      await loadPrivateData(session.access);
    } catch (error) {
      setPrivateError(getErrorMessage(error));
    }
  }

  async function openNotificationStatus(notification) {
    const threadId = notification?.data?.thread_id || notification?.data_json?.thread_id;
    const bookingId = notification?.data?.booking_id || notification?.data_json?.booking_id;
    if (session?.access && notification && !notification.is_read) {
      try {
        await apiRequest(`/notifications/${notification.id}/mark-read/`, {
          method: "POST",
          token: session.access,
          language,
        });
      } catch {
        // no-op
      }
    }
    await loadPrivateData(session?.access, { background: true });

    if (threadId) {
      await openThread(threadId);
      return;
    }

    if (!bookingId) {
      setStack([{ name: "bookings" }]);
      return;
    }

    const booking = bookings.find((item) => item.id === bookingId);
    if (booking) {
      setStack((current) => [...current, { name: "confirmed", params: { booking } }]);
    } else {
      setStack([{ name: "bookings" }]);
    }
  }

  async function handlePickDocument() {
    if (!session?.access) {
      setStack([{ name: "login" }]);
      return;
    }

    setDocumentUploading(true);
    setDocumentError("");

    try {
      const result = await DocumentPicker.getDocumentAsync({
        copyToCacheDirectory: true,
        multiple: false,
        type: ["image/*", "application/pdf"],
      });

      if (result.canceled || !result.assets?.length) {
        setDocumentUploading(false);
        return;
      }

      const asset = result.assets[0];
      const formData = new FormData();
      formData.append("type", selectedDocumentType);
      formData.append("file", {
        uri: asset.uri,
        name: asset.name || `${selectedDocumentType}.jpg`,
        type: asset.mimeType || "application/octet-stream",
      });

      await apiRequest("/documents/", {
        method: "POST",
        token: session.access,
        language,
        body: formData,
        isMultipart: true,
      });

      await loadPrivateData(session.access);
    } catch (error) {
      setDocumentError(getErrorMessage(error));
    } finally {
      setDocumentUploading(false);
    }
  }

  async function refreshThreadMessages(threadId, accessToken = session?.access, options = {}) {
    const { background = false } = options;
    if (!accessToken || !threadId) {
      setThreadMessages([]);
      return [];
    }

    if (!background) {
      setThreadLoading(true);
    }
    setThreadError("");

    try {
      const messagesData = await apiRequest(`/chat/messages/?thread=${threadId}&ordering=created_at&page_size=100`, {
        token: accessToken,
        language,
      });
      const nextMessages = unwrapList(messagesData);
      setThreadMessages(nextMessages);
      return nextMessages;
    } catch (error) {
      setThreadError(getErrorMessage(error));
      return [];
    } finally {
      if (!background) {
        setThreadLoading(false);
      }
    }
  }

  async function openThread(threadId) {
    if (!session?.access) {
      setStack([{ name: "login" }]);
      return;
    }

    setSupportError("");
    const messages = await refreshThreadMessages(threadId, session.access);
    if (messages) {
      setStack((current) => [...current, { name: "thread", params: { threadId } }]);
    }
  }

  async function sendThreadMessage() {
    const text = threadMessage.trim();
    if (!session?.access || !text) {
      return;
    }

    try {
      let threadId = route.params?.threadId;
      if (!threadId) {
        const thread = await ensureSupportThread();
        threadId = thread?.id;
      }
      if (!threadId) {
        return;
      }

      setThreadLoading(true);
      setThreadError("");
      await apiRequest("/chat/messages/", {
        method: "POST",
        token: session.access,
        language,
        body: {
          thread_id: threadId,
          text,
        },
      });
      setThreadMessage("");
      await refreshThreadMessages(threadId, session.access, { background: true });
      await loadPrivateData(session.access, { background: true });
    } catch (error) {
      setThreadError(getErrorMessage(error));
    } finally {
      setThreadLoading(false);
    }
  }

  async function quickReplySend(text) {
    try {
      setSupportError("");
      const thread = getPrimarySupportThread() || (await ensureSupportThread());
      if (!thread) {
        return;
      }
      setThreadMessage(text);
      await openThread(thread.id);
    } catch (error) {
      setSupportError(getErrorMessage(error));
    }
  }

  function updateProfileField(key, value) {
    setProfile((current) => ({ ...(current || {}), [key]: value }));
  }

  async function saveProfileSettings() {
    if (!session?.access || !profile) {
      return;
    }

    setSettingsSaving(true);
    setSettingsError("");
    try {
      const nextProfile = await apiRequest("/profile/", {
        method: "PATCH",
        token: session.access,
        language,
        body: {
          full_name: profile.full_name,
          phone: profile.phone,
          country: profile.country,
          language,
          currency: profile.currency || "USD",
        },
      });
      setProfile(nextProfile);
    } catch (error) {
      setSettingsError(getErrorMessage(error));
    } finally {
      setSettingsSaving(false);
    }
  }

  const currentLanguageOption = getLanguageOption(bootstrap?.languages, language);
  const copy = useMemo(
    () =>
      new Proxy(
        {},
        {
          get(_target, prop) {
            if (typeof prop === "symbol") {
              return undefined;
            }
            return translate(language, String(prop));
          },
        },
      ),
    [language],
  );
  const labels = {
    types: bootstrap?.content?.common?.types || {},
    paymentMethods: bootstrap?.content?.common?.paymentMethods || {},
    bookingStatuses: bootstrap?.content?.common?.bookingStatuses || {},
    documentTypes: bootstrap?.content?.common?.documentTypes || {},
    documentStatuses: bootstrap?.content?.common?.documentStatuses || {},
    daysLabel: bootstrap?.content?.common?.days || "days",
  };
  const app = {
    addOnsCount: selectedAddons.length,
    addons,
    bookQuoteError: quoteError,
    bookings,
    chatThreads,
    content: bootstrap?.content || {},
    copy,
    deliverySlots: bootstrap?.deliverySlots || DEFAULT_DELIVERY_SLOTS,
    documents,
    fleet,
    language,
    languageLabel: currentLanguageOption?.label || language.toUpperCase(),
    labels,
    notifications,
    profile,
    quickReplies,
    zones,
  };

  useEffect(() => {
    if (!session?.access || !["support", "thread"].includes(route.name)) {
      return;
    }

    const intervalId = setInterval(() => {
      loadPrivateData(session.access, { background: true });
      if (route.name === "thread" && route.params?.threadId) {
        refreshThreadMessages(route.params.threadId, session.access, { background: true });
      }
    }, 10000);

    return () => clearInterval(intervalId);
  }, [language, route.name, route.params?.threadId, session?.access]);

  const navigation = useMemo(
    () => ({
      push: (name, params = {}) => setStack((current) => [...current, { name, params }]),
      replace: (name, params = {}) => setStack((current) => replaceTop(current, { name, params })),
      goBack: () => setStack((current) => (current.length > 1 ? current.slice(0, -1) : current)),
      toTab: (name) => setStack([{ name }]),
      signOut: () => signOut("login"),
      openScooter: (id) => {
        setSelectedScooterId(id);
        setStack((current) => [...current, { name: "detail" }]);
      },
      startBooking: () => setStack((current) => [...current, { name: "booking-dates" }]),
      continueToDelivery: () => setStack((current) => [...current, { name: "delivery" }]),
      continueToPayment: () => setStack((current) => [...current, { name: "payment" }]),
      finishBooking: () => handleCreateBooking(),
      afterLanguageConfirm: () => handleAfterLanguageConfirm(),
    }),
    [language, session, scooter, bookingRange, selectedAddons, deliveryZoneId, deliveryAddress, deliverySlot, paymentMethod, profile, zones],
  );

  if ((!interLoaded || !soraLoaded) && !fontGateExpired) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, backgroundColor: COLORS.black, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
          <View style={{ width: 72, height: 72, borderRadius: 20, backgroundColor: COLORS.gold, alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
            <Text style={{ fontSize: 36, fontWeight: "800", color: COLORS.black }}>S</Text>
          </View>
          <Text style={{ fontSize: 24, fontWeight: "700", color: COLORS.white, marginBottom: 14 }}>
            Scoot Bali
          </Text>
          <ActivityIndicator size="small" color={COLORS.gold} />
        </View>
      </SafeAreaProvider>
    );
  }

  if (!bootstrap && bootstrapLoading && route.name !== "splash") {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <View style={{ flex: 1, backgroundColor: COLORS.white, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
          <ActivityIndicator size="small" color={COLORS.gold} />
          <Text style={{ marginTop: 12, color: COLORS.gray700 }}>{translate(language, "loading")}</Text>
          <Text style={{ marginTop: 8, color: COLORS.gray500, fontSize: 12 }}>{API_BASE_URL}</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  if (!bootstrap && bootstrapError && route.name !== "splash") {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <View style={{ flex: 1, backgroundColor: COLORS.white, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 }}>
          <Text style={{ color: COLORS.black, fontSize: 18, fontWeight: "700", marginBottom: 10 }}>Backend connection error</Text>
          <Text style={{ color: COLORS.gray700, textAlign: "center", marginBottom: 10 }}>{bootstrapError}</Text>
          <Text style={{ color: COLORS.gray500, fontSize: 12 }}>{API_BASE_URL}</Text>
        </View>
      </SafeAreaProvider>
    );
  }

  let screen = null;

  switch (route.name) {
    case "splash":
      screen = <SplashScreen copy={copy} />;
      break;
    case "onboarding-1":
      screen = <OnboardingScreen step={1} navigation={navigation} />;
      break;
    case "onboarding-2":
      screen = <OnboardingScreen step={2} navigation={navigation} />;
      break;
    case "onboarding-3":
      screen = <OnboardingScreen step={3} navigation={navigation} />;
      break;
    case "language":
      screen = (
        <LanguageScreen
          copy={copy}
          languages={bootstrap?.languages || []}
          navigation={navigation}
          selectedLanguage={language}
          setSelectedLanguage={setLanguage}
        />
      );
      break;
    case "login":
      screen = (
        <LoginScreen
          copy={copy}
          error={authError}
          form={authForm}
          mode={authMode}
          navigation={navigation}
          onForgotPassword={handleForgotPassword}
          onSubmit={handleAuthSubmit}
          onToggleMode={setAuthMode}
          submitting={authSubmitting}
          updateField={updateAuthField}
        />
      );
      break;
    case "home":
      screen = <HomeScreen app={app} navigation={navigation} />;
      break;
    case "fleet":
      screen = <FleetScreen app={app} navigation={navigation} />;
      break;
    case "detail":
      screen = <DetailScreen app={app} navigation={navigation} scooter={scooter} />;
      break;
    case "booking-dates":
      screen = (
        <BookingDatesScreen
          app={app}
          bookingRange={bookingRange}
          navigation={navigation}
          setBookingRange={setBookingRange}
        />
      );
      break;
    case "delivery":
      screen = (
        <DeliveryScreen
          app={app}
          bookingRange={bookingRange}
          deliveryAddress={deliveryAddress}
          deliverySlot={deliverySlot}
          deliveryZoneId={deliveryZoneId}
          navigation={navigation}
          scooter={scooter}
          selectedAddons={selectedAddons}
          setDeliveryAddress={setDeliveryAddress}
          setDeliverySlot={setDeliverySlot}
          setDeliveryZoneId={setDeliveryZoneId}
          setSelectedAddons={setSelectedAddons}
          quote={quote}
          quoteError={quoteError}
          quoteLoading={quoteLoading}
        />
      );
      break;
    case "payment":
      screen = (
        <PaymentScreen
          app={app}
          bookingRange={bookingRange}
          deliverySlot={deliverySlot}
          deliveryZoneId={deliveryZoneId}
          navigation={navigation}
          paymentMethod={paymentMethod}
          quote={quote}
          quoteError={quoteError}
          quoteLoading={quoteLoading}
          scooter={scooter}
          selectedAddons={selectedAddons}
          setPaymentMethod={setPaymentMethod}
          submitting={bookingSubmitting}
        />
      );
      break;
    case "confirmed":
      screen = (
        <OrderConfirmedScreen
          app={app}
          booking={route.params?.booking}
          navigation={navigation}
          scooter={app.fleet.find((item) => item.id === route.params?.booking?.scooter?.id) || scooter}
        />
      );
      break;
    case "bookings":
      screen = (
        <BookingsScreen
          app={app}
          navigation={navigation}
          onOpenBookingStatus={(booking) => navigation.push("confirmed", { booking })}
        />
      );
      break;
    case "profile":
      screen = <ProfileScreen app={app} navigation={navigation} />;
      break;
    case "notifications":
      screen = (
        <NotificationsScreen
          app={app}
          loading={privateLoading}
          markAllRead={markAllNotificationsRead}
          navigation={navigation}
          onOpenBookingStatus={openNotificationStatus}
        />
      );
      break;
    case "documents":
      screen = (
        <DocumentsScreen
          app={app}
          error={documentError}
          loading={privateLoading}
          navigation={navigation}
          onPickDocument={handlePickDocument}
          selectedType={selectedDocumentType}
          setSelectedType={setSelectedDocumentType}
          uploading={documentUploading}
        />
      );
      break;
    case "support":
      screen = (
        <SupportScreen
          app={app}
          error={supportError || privateError}
          loading={privateLoading}
          navigation={navigation}
          onOpenThread={openThread}
          onStartThread={async () => {
            const thread = await ensureSupportThread();
            if (thread) {
              await openThread(thread.id);
            }
          }}
          quickReplySend={quickReplySend}
        />
      );
      break;
    case "thread":
      screen = (
        <ThreadScreen
          app={app}
          error={threadError}
          loading={threadLoading}
          messages={threadMessages}
          navigation={navigation}
          onSend={sendThreadMessage}
          quickReplies={quickReplies}
          thread={chatThreads.find((item) => item.id === route.params?.threadId)}
          threadMessage={threadMessage}
          setThreadMessage={setThreadMessage}
        />
      );
      break;
    case "settings":
      screen = (
        <SettingsScreen
          app={app}
          error={settingsError}
          navigation={navigation}
          onSave={saveProfileSettings}
          saving={settingsSaving}
          updateField={updateProfileField}
        />
      );
      break;
    default:
      screen = <HomeScreen app={app} navigation={navigation} />;
      break;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style={DARK_ROUTES.has(route.name) ? "light" : "dark"} />
      <View style={{ flex: 1, backgroundColor: COLORS.white }}>{screen}</View>
    </SafeAreaProvider>
  );
}
