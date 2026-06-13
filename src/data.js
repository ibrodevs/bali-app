const DAY_MS = 24 * 60 * 60 * 1000;

const ADDON_COPY = {
  helmet_full: {
    ru: { name: "Закрытый шлем", description: "Премиальный закрытый шлем с чистым визором и удобной посадкой." },
    zh: { name: "全盔", description: "高品质全盔，配有清晰面罩，佩戴舒适。" },
    id: { name: "Helm Full-Face", description: "Helm full-face premium dengan visor bersih dan nyaman dipakai." },
    de: { name: "Integralhelm", description: "Hochwertiger Integralhelm mit klarem Visier und angenehmem Sitz." },
    fr: { name: "Casque intégral", description: "Casque intégral premium avec visière propre et port confortable." },
  },
  insurance: {
    ru: { name: "Полная страховка", description: "Дополнительная защита для более спокойной поездки." },
    zh: { name: "全额保险", description: "额外保障，让旅程更安心。" },
    id: { name: "Asuransi penuh", description: "Perlindungan tambahan untuk perjalanan yang lebih tenang." },
    de: { name: "Vollversicherung", description: "Zusätzlicher Schutz für eine entspanntere Fahrt." },
    fr: { name: "Assurance complète", description: "Protection supplémentaire pour un trajet plus serein." },
  },
  gps: {
    ru: { name: "GPS-навигатор", description: "Навигация для удобного построения маршрутов по Бали." },
    zh: { name: "GPS 导航", description: "帮助您在巴厘岛更轻松地规划路线。" },
    id: { name: "Navigator GPS", description: "Bantuan navigasi untuk perencanaan rute yang mudah di Bali." },
    de: { name: "GPS-Navigator", description: "Navigation für eine einfache Routenplanung auf Bali." },
    fr: { name: "Navigateur GPS", description: "Aide à la navigation pour planifier facilement vos trajets à Bali." },
  },
  raincoat: {
    ru: { name: "Дождевик", description: "Лёгкая защита от тропического дождя." },
    zh: { name: "雨披", description: "适合热带阵雨的轻便防雨层。" },
    id: { name: "Jas hujan", description: "Lapisan hujan ringan untuk hujan tropis." },
    de: { name: "Regenponcho", description: "Leichter Regenschutz für tropische Schauer." },
    fr: { name: "Poncho de pluie", description: "Protection légère contre les averses tropicales." },
  },
  phone_mount: {
    ru: { name: "Держатель для телефона", description: "Надёжное крепление для телефона и навигации." },
    zh: { name: "手机支架", description: "牢固的手机支架，方便查看地图和免提导航。" },
    id: { name: "Dudukan ponsel", description: "Holder ponsel yang aman untuk peta dan visibilitas hands-free." },
    de: { name: "Handyhalterung", description: "Sichere Handyhalterung für Karten und freie Sicht." },
    fr: { name: "Support téléphone", description: "Support sécurisé pour téléphone, cartes et visibilité mains libres." },
  },
  wifi: {
    ru: { name: "Карманный WiFi 4G", description: "Мобильный интернет для навигации и связи." },
    zh: { name: "随身 WiFi 4G", description: "便携网络，方便导航和通讯。" },
    id: { name: "Pocket WiFi 4G", description: "Koneksi portabel untuk navigasi dan pesan." },
    de: { name: "Pocket WiFi 4G", description: "Mobiles Internet für Navigation und Nachrichten." },
    fr: { name: "Pocket WiFi 4G", description: "Connexion portable pour la navigation et la messagerie." },
  },
  helmet_open: {
    ru: { name: "Открытый шлем", description: "Более лёгкий вариант для коротких городских поездок." },
    zh: { name: "开放式头盔", description: "更轻便的头盔，适合短途城市骑行。" },
    id: { name: "Helm open-face", description: "Pilihan helm yang lebih ringan untuk perjalanan kota yang singkat." },
    de: { name: "Offener Helm", description: "Leichtere Helmoption für kurze Fahrten in der Stadt." },
    fr: { name: "Casque ouvert", description: "Option de casque plus légère pour les courts trajets urbains." },
  },
  bag: {
    ru: { name: "Задняя сумка", description: "Компактная сумка для пляжных вещей и повседневных мелочей." },
    zh: { name: "后置包", description: "适合沙滩用品或随身物品的紧凑行李方案。" },
    id: { name: "Tas belakang", description: "Pilihan bagasi ringkas untuk perlengkapan pantai atau kebutuhan harian." },
    de: { name: "Hecktasche", description: "Kompakte Gepäcklösung für Strandsachen oder das Nötigste." },
    fr: { name: "Sac arrière", description: "Solution de bagage compacte pour les affaires de plage ou l'essentiel." },
  },
};

const ADDON_KEY_BY_NAME = {
  "full-face helmet": "helmet_full",
  "full face helmet": "helmet_full",
  "закрытый шлем": "helmet_full",
  "full insurance": "insurance",
  "полная страховка": "insurance",
  "gps navigator": "gps",
  "gps-навигатор": "gps",
  "rain poncho": "raincoat",
  "дождевик": "raincoat",
  "phone mount": "phone_mount",
  "держатель для телефона": "phone_mount",
  "pocket wifi 4g": "wifi",
  "карманный wifi 4g": "wifi",
  "open-face helmet": "helmet_open",
  "open face helmet": "helmet_open",
  "открытый шлем": "helmet_open",
  "rear bag": "bag",
  "задняя сумка": "bag",
};

const LOCALES = {
  en: "en-US",
  ru: "ru-RU",
  zh: "zh-CN",
  id: "id-ID",
  de: "de-DE",
  fr: "fr-FR",
};

export const SUPPORTED_CURRENCIES = [
  { code: "USD", symbol: "$" },
  { code: "RUB", symbol: "₽" },
  { code: "EUR", symbol: "€" },
  { code: "CNY", symbol: "¥" },
  { code: "AUD", symbol: "A$" },
  { code: "IDR", symbol: "Rp" },
];

export const SUPPORTED_LANGUAGES = [
  { api_code: "en", label: "English", flag: "🇬🇧" },
  { api_code: "ru", label: "Русский", flag: "🇷🇺" },
  { api_code: "zh", label: "中文", flag: "🇨🇳" },
  { api_code: "id", label: "Bahasa Indonesia", flag: "🇮🇩" },
  { api_code: "de", label: "Deutsch", flag: "🇩🇪" },
  { api_code: "fr", label: "Français", flag: "🇫🇷" },
];

export const CURRENCY_RATES = {
  USD: 1,
  RUB: 98.5,
  EUR: 0.92,
  CNY: 7.24,
  AUD: 1.52,
  IDR: 15650,
};

export const DEFAULT_DELIVERY_SLOTS = ["09:00", "12:00", "16:00", "19:00"];
export const DEFAULT_RENTAL_TIME_OPTIONS = ["08:00", "09:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];

function parseTimeParts(value = "09:00") {
  const [hoursRaw, minutesRaw] = String(value || "09:00").split(":");
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);
  return {
    hours: Number.isFinite(hours) ? hours : 9,
    minutes: Number.isFinite(minutes) ? minutes : 0,
  };
}

function applyTimeToDate(dateValue, timeValue = "09:00") {
  const next = new Date(dateValue);
  const { hours, minutes } = parseTimeParts(timeValue);
  next.setHours(hours, minutes, 0, 0);
  return next;
}

export function getLocale(language = "en") {
  return LOCALES[language] || LOCALES.en;
}

export function isSupportedCurrency(currency = "USD") {
  return SUPPORTED_CURRENCIES.some((item) => item.code === currency);
}

export function convertAmount(amount, fromCurrency = "USD", toCurrency = "USD") {
  const normalizedAmount = Number.isFinite(Number(amount)) ? Number(amount) : 0;
  const safeFrom = isSupportedCurrency(fromCurrency) ? fromCurrency : "USD";
  const safeTo = isSupportedCurrency(toCurrency) ? toCurrency : "USD";
  const fromRate = CURRENCY_RATES[safeFrom] || 1;
  const toRate = CURRENCY_RATES[safeTo] || 1;
  return (normalizedAmount / fromRate) * toRate;
}

export function startOfLocalDay(date = new Date()) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function addDays(date, amount) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function createInitialBookingRange() {
  const start = addDays(startOfLocalDay(), 1);
  const end = addDays(start, 3);

  return {
    start: start.getTime(),
    end: end.getTime(),
    startTime: "09:00",
    endTime: "09:00",
  };
}

export function getBookingDuration(range) {
  if (!range?.start || !range?.end) {
    return 1;
  }

  const startAt = applyTimeToDate(range.start, range.startTime || "09:00");
  const endAt = applyTimeToDate(range.end, range.endTime || range.startTime || "09:00");
  const diff = endAt.getTime() - startAt.getTime();
  return Math.max(1, Math.ceil(diff / DAY_MS));
}

export function getSelectedRentalDays(range) {
  if (!range?.start || !range?.end) {
    return [];
  }

  const days = [];
  for (let cursor = range.start; cursor <= range.end; cursor += DAY_MS) {
    days.push(cursor);
  }
  return days;
}

export function buildCalendarMonth(range, language = "en") {
  const focusDate = new Date(range.start || Date.now());
  const monthStart = new Date(focusDate.getFullYear(), focusDate.getMonth(), 1);
  const monthEnd = new Date(focusDate.getFullYear(), focusDate.getMonth() + 1, 0);
  const leadingEmpty = (monthStart.getDay() + 6) % 7;
  const today = startOfLocalDay().getTime();
  const locale = getLocale(language);

  return {
    label: new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(monthStart),
    leadingEmpty,
    days: Array.from({ length: monthEnd.getDate() }, (_, index) => {
      const current = new Date(monthStart);
      current.setDate(index + 1);
      current.setHours(0, 0, 0, 0);

      return {
        day: index + 1,
        timestamp: current.getTime(),
        disabled: current.getTime() < today,
      };
    }),
  };
}

export function getWeekdayLabels(language = "en") {
  const formatter = new Intl.DateTimeFormat(getLocale(language), { weekday: "short" });
  const monday = new Date(Date.UTC(2024, 0, 1));

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setUTCDate(monday.getUTCDate() + index);
    return formatter.format(day);
  });
}

export function formatMoney(value, currency = "USD", language = "en") {
  const amount = Number(value || 0);
  try {
    return new Intl.NumberFormat(getLocale(language), {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "IDR" ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(currency === "IDR" ? 0 : 2)}`;
  }
}

export function formatConvertedMoney(value, fromCurrency = "USD", toCurrency = "USD", language = "en") {
  return formatMoney(convertAmount(value, fromCurrency, toCurrency), toCurrency, language);
}

export function formatBookingTotal(booking, targetCurrency = "USD", language = "en") {
  const totalUsd = Number(booking?.total_price || booking?.total_usd || 0);
  return formatConvertedMoney(totalUsd, "USD", targetCurrency, language);
}

export function formatDate(value, language = "en", options = { month: "short", day: "numeric" }) {
  return new Intl.DateTimeFormat(getLocale(language), options).format(new Date(value));
}

export function formatDateTime(value, language = "en", options = { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) {
  return new Intl.DateTimeFormat(getLocale(language), options).format(new Date(value));
}

export function formatDateRange(range, language = "en") {
  return `${formatDate(range.start, language)} - ${formatDate(range.end, language)}`;
}

function normalizeUiLanguage(language = "en") {
  const short = String(language || "en").split("-")[0];
  return ["en", "ru", "zh", "id", "de", "fr"].includes(short) ? short : "en";
}

function pluralizeRuDays(value) {
  const mod10 = value % 10;
  const mod100 = value % 100;
  if (mod10 === 1 && mod100 !== 11) return "день";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "дня";
  return "дней";
}

export function formatRateRange(minDays, maxDays, language = "en") {
  const locale = normalizeUiLanguage(language);
  if (locale === "ru") {
    if (maxDays == null) return `${minDays}+ дней`;
    if (minDays === maxDays) return `${minDays} ${pluralizeRuDays(minDays)}`;
    return `${minDays}-${maxDays} дней`;
  }
  if (locale === "zh") {
    if (maxDays == null) return `${minDays}天以上`;
    if (minDays === maxDays) return `${minDays}天`;
    return `${minDays}-${maxDays}天`;
  }
  if (locale === "id") {
    if (maxDays == null) return `${minDays}+ hari`;
    if (minDays === maxDays) return `${minDays} hari`;
    return `${minDays}-${maxDays} hari`;
  }
  if (locale === "de") {
    if (maxDays == null) return `${minDays}+ Tage`;
    if (minDays === maxDays) return `${minDays} Tag`;
    return `${minDays}-${maxDays} Tage`;
  }
  if (locale === "fr") {
    if (maxDays == null) return `${minDays}+ jours`;
    if (minDays === maxDays) return `${minDays} jour`;
    return `${minDays}-${maxDays} jours`;
  }
  if (maxDays == null) return `${minDays}+ days`;
  if (minDays === maxDays) return `${minDays} day`;
  return `${minDays}-${maxDays} days`;
}

export function formatBillingLabel(billingPeriodDays, language = "en") {
  const locale = normalizeUiLanguage(language);
  if (locale === "ru") {
    if (billingPeriodDays === 1) return "в день";
    return `за ${billingPeriodDays} ${pluralizeRuDays(billingPeriodDays)}`;
  }
  if (locale === "zh") {
    if (billingPeriodDays === 1) return "每天";
    return `每${billingPeriodDays}天`;
  }
  if (locale === "id") {
    if (billingPeriodDays === 1) return "per hari";
    return `per ${billingPeriodDays} hari`;
  }
  if (locale === "de") {
    if (billingPeriodDays === 1) return "pro Tag";
    return `pro ${billingPeriodDays} Tage`;
  }
  if (locale === "fr") {
    if (billingPeriodDays === 1) return "par jour";
    return `par ${billingPeriodDays} jours`;
  }
  if (billingPeriodDays === 1) return "per day";
  return `per ${billingPeriodDays} days`;
}

export function formatAppliedTariffLabel(tariff, language = "en") {
  if (!tariff) {
    return "";
  }
  return `${formatRateRange(tariff.min_days, tariff.max_days, language)} · ${formatBillingLabel(tariff.billing_period_days, language)}`;
}

export function getLanguageOption(languages = [], apiCode = "en") {
  return languages.find((item) => item.api_code === apiCode) || languages[0] || null;
}

export function getDefaultVehicle(fleet = []) {
  return fleet[0] || null;
}

export function getVehicleById(fleet = [], id) {
  return fleet.find((item) => item.id === id) || getDefaultVehicle(fleet);
}

export function getDefaultZone(zones = []) {
  return zones[0] || null;
}

export function getZoneById(zones = [], zoneId) {
  if (!zones.length) {
    return null;
  }
  return zones.find((item) => String(item.id) === String(zoneId)) || zones[0];
}

export function getAddonsByIds(addons = [], ids = []) {
  const selected = new Set(ids.map(String));
  return addons.filter((item) => selected.has(String(item.id)));
}

function normalizeAddonKey(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "_")
    .replace(/[^a-z0-9_-\u0400-\u04ff]/g, "");
}

function resolveAddonCopyKey(addon) {
  const codeKey = normalizeAddonKey(addon?.code);
  if (ADDON_COPY[codeKey]) {
    return codeKey;
  }

  const rawName = String(addon?.name || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
  return ADDON_KEY_BY_NAME[rawName] || null;
}

export function localizeAddon(addon, language = "en") {
  if (!addon) {
    return addon;
  }

  if (language === "en") {
    return addon;
  }

  const addonKey = resolveAddonCopyKey(addon);
  const fallback = addonKey ? ADDON_COPY[addonKey]?.[language] : null;
  if (!fallback) {
    return addon;
  }

  return {
    ...addon,
    name: fallback.name || addon.name,
    description: fallback.description || addon.description,
  };
}

export function getScooterPrimaryImage(scooter) {
  return scooter?.mainImage || scooter?.main_image || scooter?.imageUrl || scooter?.gallery?.[0]?.image || null;
}

export function getScooterGallery(scooter) {
  const images = [
    scooter?.mainImage,
    scooter?.main_image,
    scooter?.imageUrl,
    ...(Array.isArray(scooter?.gallery) ? scooter.gallery.map((item) => item?.image) : []),
  ].filter(Boolean);

  return Array.from(new Set(images));
}

export function getAddonTotalPrice(addon, rentalDays = 1) {
  const unitPrice = Number(addon?.priceUSD || addon?.price_usd || addon?.price || 0);
  const priceType = String(addon?.priceType || addon?.price_type || "fixed").toLowerCase();
  return unitPrice * (priceType === "per_day" ? Math.max(1, rentalDays) : 1);
}

export function buildLocalBookingPreview({ addons = [], currency = "USD", deliveryZone, language = "en", quote, range, scooter, selectedAddonIds = [] }) {
  if (quote) {
    return {
      duration: Number(quote.rental_days || getBookingDuration(range)),
      rentalCost: convertAmount(Number(quote.base_price || 0), "USD", currency),
      addonsTotal: convertAmount(Number(quote.add_ons_price || 0), "USD", currency),
      deliveryFee: convertAmount(Number(quote.delivery_price || 0), "USD", currency),
      discountAmount: convertAmount(Number(quote.discount_amount || 0), "USD", currency),
      markupAmount: convertAmount(Number(quote.markup_amount || 0), "USD", currency),
      total: convertAmount(Number(quote.total_price || 0), "USD", currency),
      currency,
      addons: getAddonsByIds(addons, selectedAddonIds),
      zone: deliveryZone,
      appliedTariff: quote.applied_tariff || null,
      appliedTariffLabel: formatAppliedTariffLabel(quote.applied_tariff, language),
      effectiveDailyPrice: quote.applied_tariff
        ? convertAmount(Number(quote.applied_tariff.effective_daily_price_usd || 0), "USD", currency)
        : convertAmount(Number(scooter?.priceUSD || 0), "USD", currency),
    };
  }

  const duration = getBookingDuration(range);
  const selectedAddons = getAddonsByIds(addons, selectedAddonIds);
  const rentalCostUSD = Number(scooter?.priceUSD || 0) * duration;
  const addonsTotalUSD = selectedAddons.reduce((sum, item) => sum + getAddonTotalPrice(item, duration), 0);
  const deliveryFeeUSD = Number(deliveryZone?.deliveryFeeUSD || 0);
  const rentalCost = convertAmount(rentalCostUSD, "USD", currency);
  const addonsTotal = convertAmount(addonsTotalUSD, "USD", currency);
  const deliveryFee = convertAmount(deliveryFeeUSD, "USD", currency);

  return {
    duration,
    rentalCost,
    addonsTotal,
    deliveryFee,
    discountAmount: 0,
    markupAmount: 0,
    total: rentalCost + addonsTotal + deliveryFee,
    currency,
    addons: selectedAddons,
    zone: deliveryZone,
    appliedTariff: null,
    appliedTariffLabel: "",
    effectiveDailyPrice: convertAmount(Number(scooter?.priceUSD || 0), "USD", currency),
  };
}

export function vehicleMatchesCategory(vehicle, category) {
  if (!category || category === "all") return true;
  if (category === "available") return Boolean(vehicle.available);
  return vehicle.type === category;
}

export function vehicleMatchesSearch(vehicle, search) {
  if (!search) return true;
  const value = search.toLowerCase();
  const name = String(vehicle?.name || "").toLowerCase();
  const engine = String(vehicle?.engine || "").toLowerCase();
  const typeLabel = String(vehicle?.typeLabel || "").toLowerCase();
  return (
    name.includes(value) ||
    engine.includes(value) ||
    typeLabel.includes(value)
  );
}

export function toApiDateTime(dateValue, slot = "09:00") {
  const date = new Date(dateValue);
  const [hours, minutes] = slot.split(":").map(Number);
  const next = new Date(date);
  next.setHours(hours || 9, minutes || 0, 0, 0);
  return next.toISOString();
}

export function buildCreateBookingPayload({
  scooter,
  range,
  selectedAddonIds,
  deliveryZone,
  deliveryAddress,
  deliverySlot,
  paymentMethod,
  currency = "USD",
  promoCode = "",
}) {
  const apiPaymentMethod = paymentMethod === "crypto" ? "online_card" : paymentMethod;
  return {
    scooter_id: scooter.id,
    start_datetime: toApiDateTime(range.start, range.startTime || "09:00"),
    end_datetime: toApiDateTime(range.end, range.endTime || range.startTime || "09:00"),
    delivery_time: toApiDateTime(range.start, deliverySlot || range.startTime || "09:00"),
    add_on_ids: selectedAddonIds,
    payment_method: apiPaymentMethod,
    currency,
    delivery_address: deliveryAddress,
    delivery_latitude: deliveryZone?.latitude,
    delivery_longitude: deliveryZone?.longitude,
    promo_code: promoCode || undefined,
  };
}

export function unwrapList(data) {
  if (Array.isArray(data)) {
    return data;
  }
  if (Array.isArray(data?.results)) {
    return data.results;
  }
  return [];
}

export function formatBookingStatus(booking, statusLabels = {}) {
  return statusLabels?.[booking.status] || booking.status;
}

export function buildBookingDeliveryLabel(booking, language = "en") {
  if (booking.delivery_time) {
    const prefix = formatDateTime(booking.delivery_time, language);
    if (booking.delivery_address) {
      return `${prefix} - ${booking.delivery_address}`;
    }
    return prefix;
  }

  if (booking.delivery_address) {
    return booking.delivery_address;
  }

  return formatDateRange(
    {
      start: new Date(booking.start_datetime).getTime(),
      end: new Date(booking.end_datetime).getTime(),
    },
    language,
  );
}
