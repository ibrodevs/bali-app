import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Linking, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  isSupportedCurrency,
  localizeAddon,
  SUPPORTED_CURRENCIES,
  getVehicleById,
  unwrapList,
} from "./src/data";
import { translate } from "./src/i18n";
import {
  BookingDatesScreen,
  BookingsScreen,
  DeliveryScreen,
  DetailScreen,
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
  currency: "scoot-bali.currency",
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

function initialBookingContact() {
  return {
    fullName: "",
    phone: "",
    hasTelegram: false,
    hasWechat: false,
    hasWhatsapp: false,
  };
}

function getErrorMessage(error, fallback = "Something went wrong") {
  if (error instanceof ApiError) {
    if (typeof error.details === "object" && error.details && !Array.isArray(error.details)) {
      const firstEntry = Object.entries(error.details).find(([, value]) => {
        if (typeof value === "string" && value.trim()) {
          return true;
        }
        if (Array.isArray(value) && value.length) {
          return true;
        }
        return false;
      });

      if (firstEntry) {
        const [field, value] = firstEntry;
        const firstMessage = Array.isArray(value) ? value[0] : value;
        if (typeof firstMessage === "string" && firstMessage.trim()) {
          if (field === "non_field_errors" || field === "detail" || field === "error") {
            return firstMessage;
          }
          return `${field}: ${firstMessage}`;
        }
      }
    }
    return error.message;
  }

  return error?.message || fallback;
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
  const [currency, setCurrency] = useState("USD");
  const [bootstrap, setBootstrap] = useState(null);
  const [bootstrapLoading, setBootstrapLoading] = useState(true);
  const [bootstrapError, setBootstrapError] = useState("");
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [chatThreads, setChatThreads] = useState([]);
  const [quickReplies, setQuickReplies] = useState([]);
  const [privateLoading, setPrivateLoading] = useState(false);
  const [privateError, setPrivateError] = useState("");
  const [authMode, setAuthMode] = useState("signin");
  const [authForm, setAuthForm] = useState(initialAuthForm());
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authError, setAuthError] = useState("");
  const [passwordResetSession, setPasswordResetSession] = useState(null);
  const [selectedScooterId, setSelectedScooterId] = useState(null);
  const [bookingRange, setBookingRange] = useState(() => createInitialBookingRange());
  const [deliverySlot, setDeliverySlot] = useState(DEFAULT_DELIVERY_SLOTS[0]);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("online_card");
  const [bookingContact, setBookingContact] = useState(() => initialBookingContact());
  const [quote, setQuote] = useState(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState("");
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [supportError, setSupportError] = useState("");
  const [threadMessages, setThreadMessages] = useState([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [threadSending, setThreadSending] = useState(false);
  const [threadError, setThreadError] = useState("");
  const [threadMessage, setThreadMessage] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [settingsSaving, setSettingsSaving] = useState(false);

  const route = stack[stack.length - 1];
  const getLocalizedErrorMessage = (error) => getErrorMessage(error, translate(language, "somethingWentWrong"));

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
        const [storedLanguage, storedCurrency, storedSession, storedOnboarding] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.language),
          AsyncStorage.getItem(STORAGE_KEYS.currency),
          AsyncStorage.getItem(STORAGE_KEYS.session),
          AsyncStorage.getItem(STORAGE_KEYS.onboarding),
        ]);

        if (!active) {
          return;
        }

        if (storedLanguage) {
          setLanguage(storedLanguage);
        }
        if (storedCurrency && isSupportedCurrency(storedCurrency)) {
          setCurrency(storedCurrency);
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
        setStack([{ name: "home" }]);
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
    AsyncStorage.setItem(STORAGE_KEYS.currency, currency).catch(() => {});
  }, [currency]);

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
        if (data?.deliverySlots?.length) {
          setDeliverySlot((current) => current || data.deliverySlots[0]);
        }
      })
      .catch((error) => {
        if (!active) {
          return;
        }

        setBootstrapError(getLocalizedErrorMessage(error));
        setBootstrapLoading(false);
      });

    return () => {
      active = false;
    };
  }, [language]);

  async function signOut(nextRoute = "home") {
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
    setNotifications([]);
    setChatThreads([]);
    setQuickReplies([]);
    setThreadMessages([]);
    setThreadMessage("");
    setBookingContact(initialBookingContact());
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
      const [profileData, bookingsData, notificationsData, threadsData, quickRepliesData] = await Promise.all([
        apiRequest("/profile/", { token: accessToken, language }),
        apiRequest("/bookings/", { token: accessToken, language }),
        apiRequest("/notifications/", { token: accessToken, language }),
        apiRequest("/chat/threads/", { token: accessToken, language }),
        apiRequest("/chat/quick-replies/?is_active=true", { token: accessToken, language }),
      ]);

      setProfile(profileData);
      setBookings(unwrapList(bookingsData));
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
      setPrivateError(getLocalizedErrorMessage(error));
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

  useEffect(() => {
    if (!profile) {
      return;
    }

    setBookingContact((current) => ({
      ...current,
      fullName: current.fullName || profile.full_name || "",
      phone: current.phone || profile.phone || "",
    }));
  }, [profile]);

  const fleet = bootstrap?.fleet?.items || [];
  const zones = bootstrap?.deliveryZones || [];
  const addons = useMemo(() => (bootstrap?.addons || []).map((item) => localizeAddon(item, language)), [bootstrap?.addons, language]);
  const scooter = useMemo(() => getVehicleById(fleet, selectedScooterId), [fleet, selectedScooterId]);
  const deliveryZone = useMemo(() => getDefaultZone(zones), [zones]);

  useEffect(() => {
    const quoteEnabled = route.name === "delivery" || route.name === "payment";
    if (!quoteEnabled) {
      setQuote(null);
      setQuoteLoading(false);
      return;
    }

    if (!scooter) {
      setQuote(null);
      setQuoteLoading(false);
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
          deliveryZone,
          deliveryAddress,
          deliverySlot,
          paymentMethod,
          currency,
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
        setQuoteError(getLocalizedErrorMessage(error));
        setQuoteLoading(false);
      });

    return () => {
      active = false;
    };
  }, [bookingRange, currency, deliveryAddress, deliverySlot, deliveryZone, language, paymentMethod, route.name, scooter, selectedAddons]);

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

  function handleAuthModeChange(nextMode) {
    setAuthMode(nextMode);
    if (nextMode !== "reset") {
      setPasswordResetSession(null);
    }
    setAuthError("");
  }

  function updateBookingContactField(key, value) {
    setQuoteError("");
    setBookingContact((current) => ({ ...current, [key]: value }));
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
      } else if (authMode === "signup") {
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
      } else if (authMode === "reset" && passwordResetSession?.uid && passwordResetSession?.token) {
        await apiRequest("/auth/password-reset-confirm/", {
          method: "POST",
          language,
          body: {
            uid: passwordResetSession.uid,
            token: passwordResetSession.token,
            new_password: authForm.password,
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
        setPasswordResetSession(null);
        setStack([{ name: "home" }]);
      }
    } catch (error) {
      setAuthError(getLocalizedErrorMessage(error));
    } finally {
      setAuthSubmitting(false);
    }
  }

  async function handleForgotPassword() {
    setAuthError("");
    try {
      const resetData = await apiRequest("/auth/password-reset/", {
        method: "POST",
        language,
        body: { email: authForm.email.trim().toLowerCase() },
      });
      setPasswordResetSession({
        uid: resetData?.uid || "",
        token: resetData?.token || "",
      });
      setAuthForm((current) => ({ ...current, password: "" }));
      setAuthMode("reset");
      setAuthError(translate(language, "passwordResetSent"));
    } catch (error) {
      setAuthError(getLocalizedErrorMessage(error));
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

  async function startNewSupportThread() {
    if (!session?.access) {
      setStack([{ name: "login" }]);
      return null;
    }

    const thread = await apiRequest("/chat/threads/", {
      method: "POST",
      token: session.access,
      language,
      body: {
        title: `${translate(language, "supportChat")} #${chatThreads.length + 1}`,
      },
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
          body: { language, currency },
        });
        setProfile(nextProfile);
      } catch {
        // ignore
      }
      setStack((current) => (current.length > 1 ? current.slice(0, -1) : [{ name: "profile" }]));
      return;
    }

    setStack([{ name: "home" }]);
  }

  async function handleCreateBooking() {
    if (!scooter) {
      return;
    }

    if (!scooter.available) {
      setQuoteError(translate(language, "scooterUnavailable"));
      return;
    }
    if (!deliveryAddress.trim()) {
      setQuoteError(translate(language, "deliveryAddressRequired"));
      return;
    }
    if (quoteLoading || !quote) {
      setQuoteError(translate(language, "waitForPricing"));
      return;
    }
    if (!session?.access && (!bookingContact.fullName.trim() || !bookingContact.phone.trim())) {
      setQuoteError(translate(language, "guestContactRequired"));
      return;
    }

    setBookingSubmitting(true);
    try {
      const payload = buildCreateBookingPayload({
        scooter,
        range: bookingRange,
        selectedAddonIds: selectedAddons,
        deliveryZone,
        deliveryAddress,
        deliverySlot,
        paymentMethod,
        currency,
      });

      let accessToken = session?.access || null;
      let finalBooking = null;

      if (session?.access) {
        finalBooking = await apiRequest("/bookings/", {
          method: "POST",
          token: session.access,
          language,
          body: payload,
        });
      } else {
        const guestResult = await apiRequest("/bookings/guest-create/", {
          method: "POST",
          language,
          body: {
            ...payload,
            guest_full_name: bookingContact.fullName.trim(),
            guest_phone: bookingContact.phone.trim(),
            guest_has_telegram: bookingContact.hasTelegram,
            guest_has_wechat: bookingContact.hasWechat,
            guest_has_whatsapp: bookingContact.hasWhatsapp,
            language,
          },
        });

        finalBooking = guestResult.booking;
        if (guestResult.auth?.access && guestResult.auth?.refresh) {
          accessToken = guestResult.auth.access;
          await persistSession({
            access: guestResult.auth.access,
            refresh: guestResult.auth.refresh,
          });
          await loadPrivateData(guestResult.auth.access);
        }
      }

      if (!finalBooking) {
        throw new Error(translate(language, "bookingCreateFailed"));
      }

      if (paymentMethod === "online_card" || paymentMethod === "crypto") {
        if (!accessToken) {
          throw new Error(translate(language, "paymentSessionRequired"));
        }

        const payment = await apiRequest("/payments/create/", {
          method: "POST",
          token: accessToken,
          language,
          body: { booking_id: finalBooking.id, provider: paymentMethod === "crypto" ? "crypto" : "stripe" },
        });

        if (payment?.payment_url) {
          try {
            await Linking.openURL(payment.payment_url);
          } catch {
            setQuoteError(translate(language, "paymentRedirectHint"));
          }
        }
      }

      if (accessToken) {
        const bookingsData = await apiRequest("/bookings/", {
          token: accessToken,
          language,
        });
        const nextBookings = unwrapList(bookingsData);
        setBookings(nextBookings);
        await loadPrivateData(accessToken);
        const refreshedBooking = nextBookings.find((item) => item.id === finalBooking.id);
        if (refreshedBooking) {
          finalBooking = refreshedBooking;
        }
      }

      setStack([{ name: "confirmed", params: { booking: finalBooking } }]);
    } catch (error) {
      setQuoteError(getLocalizedErrorMessage(error));
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
      setPrivateError(getLocalizedErrorMessage(error));
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
      setThreadError(getLocalizedErrorMessage(error));
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

      setThreadSending(true);
      setThreadError("");
      const optimisticMessage = {
        id: `temp-${Date.now()}`,
        text,
        created_at: new Date().toISOString(),
        sender: { email: profile?.email || session?.user?.email || "" },
        pending: true,
      };
      setThreadMessages((current) => [...current, optimisticMessage]);
      setThreadMessage("");
      await apiRequest("/chat/messages/", {
        method: "POST",
        token: session.access,
        language,
        body: {
          thread_id: threadId,
          text,
        },
      });
      await refreshThreadMessages(threadId, session.access, { background: true });
      await loadPrivateData(session.access, { background: true });
    } catch (error) {
      setThreadMessages((current) => current.filter((item) => !item.pending));
      setThreadError(getLocalizedErrorMessage(error));
    } finally {
      setThreadSending(false);
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
      setSupportError(getLocalizedErrorMessage(error));
    }
  }

  function updateProfileField(key, value) {
    if (key === "currency" && isSupportedCurrency(value)) {
      setCurrency(value);
    }
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
          currency,
        },
      });
      setProfile(nextProfile);
    } catch (error) {
      setSettingsError(getLocalizedErrorMessage(error));
    } finally {
      setSettingsSaving(false);
    }
  }

  const currentLanguageOption = getLanguageOption(bootstrap?.languages, language);
  const appContentOverrides = bootstrap?.dictionaryOverrides?.app || {};
  const copy = useMemo(
    () =>
      new Proxy(
        {},
        {
          get(_target, prop) {
            if (typeof prop === "symbol") {
              return undefined;
            }
            return appContentOverrides[String(prop)] || translate(language, String(prop));
          },
        },
      ),
    [appContentOverrides, language],
  );
  const labels = {
    types: bootstrap?.content?.common?.types || {},
    paymentMethods: bootstrap?.content?.common?.paymentMethods || {},
    bookingStatuses: bootstrap?.content?.common?.bookingStatuses || {},
    specLabels: bootstrap?.content?.common?.specLabels || {},
    daysLabel: bootstrap?.content?.common?.days || copy.daysLabel,
  };
  const app = {
    addOnsCount: selectedAddons.length,
    addons,
    bookQuoteError: quoteError,
    bookings,
    chatThreads,
    content: bootstrap?.content || {},
    copy,
    currencies: SUPPORTED_CURRENCIES,
    currency,
    deliverySlots: bootstrap?.deliverySlots || DEFAULT_DELIVERY_SLOTS,
    fleet,
    language,
    languageLabel: currentLanguageOption?.label || language.toUpperCase(),
    labels,
    notifications,
    profile,
    quickReplies,
    sessionActive: Boolean(session?.access),
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
      signOut: () => signOut("home"),
      openScooter: (id) => {
        setSelectedScooterId(id);
        setStack((current) => [...current, { name: "detail" }]);
      },
      startBooking: () => {
        if (!scooter?.available) {
          setQuoteError(translate(language, "scooterUnavailable"));
          return;
        }
        setStack((current) => [...current, { name: "booking-dates" }]);
      },
      continueToDelivery: () => setStack((current) => [...current, { name: "delivery" }]),
      continueToPayment: () => {
        if (!deliveryAddress.trim()) {
          setQuoteError(translate(language, "deliveryAddressRequired"));
          return;
        }
        if (quoteLoading || !quote) {
          setQuoteError(translate(language, "waitForPricing"));
          return;
        }
        setStack((current) => [...current, { name: "payment" }]);
      },
      finishBooking: () => handleCreateBooking(),
      afterLanguageConfirm: () => handleAfterLanguageConfirm(),
    }),
    [bookingContact, deliveryAddress, language, paymentMethod, profile, quote, quoteLoading, scooter, session],
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
          <Text style={{ color: COLORS.black, fontSize: 18, fontWeight: "700", marginBottom: 10 }}>{translate(language, "backendConnectionError")}</Text>
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
      screen = <OnboardingScreen step={1} copy={copy} navigation={navigation} />;
      break;
    case "onboarding-2":
      screen = <OnboardingScreen step={2} copy={copy} navigation={navigation} />;
      break;
    case "onboarding-3":
      screen = <OnboardingScreen step={3} copy={copy} navigation={navigation} />;
      break;
    case "language":
      screen = (
        <LanguageScreen
          copy={copy}
          currencies={SUPPORTED_CURRENCIES}
          languages={bootstrap?.languages || []}
          navigation={navigation}
          selectedCurrency={currency}
          selectedLanguage={language}
          setSelectedCurrency={setCurrency}
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
          onToggleMode={handleAuthModeChange}
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
          scooter={scooter}
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
          navigation={navigation}
          scooter={scooter}
          selectedAddons={selectedAddons}
          setDeliveryAddress={setDeliveryAddress}
          setDeliverySlot={setDeliverySlot}
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
          bookingContact={bookingContact}
          deliveryAddress={deliveryAddress}
          deliverySlot={deliverySlot}
          navigation={navigation}
          onUpdateBookingContact={updateBookingContactField}
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
      screen = (
        <ProfileScreen
          app={app}
          navigation={navigation}
          onOpenSupportChat={async () => {
            const thread = await ensureSupportThread();
            if (thread) {
              await openThread(thread.id);
            }
          }}
        />
      );
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
    case "support":
      screen = (
        <SupportScreen
          app={app}
          error={supportError || privateError}
          loading={privateLoading}
          navigation={navigation}
          onOpenThread={openThread}
          onStartThread={async () => {
            const thread = await startNewSupportThread();
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
          sending={threadSending}
          messages={threadMessages}
          navigation={navigation}
          onSend={sendThreadMessage}
          onStartThread={async () => {
            const thread = await startNewSupportThread();
            if (thread) {
              await openThread(thread.id);
            }
          }}
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
          updateCurrency={(nextCurrency) => {
            setCurrency(nextCurrency);
            updateProfileField("currency", nextCurrency);
          }}
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
