const DAY_MS = 24 * 60 * 60 * 1000;

const LOCALES = {
  en: "en-US",
  ru: "ru-RU",
  zh: "zh-CN",
  id: "id-ID",
  de: "de-DE",
  fr: "fr-FR",
};

export const DEFAULT_DELIVERY_SLOTS = ["09:00", "12:00", "16:00", "19:00"];

export function getLocale(language = "en") {
  return LOCALES[language] || LOCALES.en;
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
  };
}

export function getBookingDuration(range) {
  if (!range?.start || !range?.end) {
    return 1;
  }

  return Math.max(1, Math.round((range.end - range.start) / DAY_MS));
}

export function getSelectedRentalDays(range) {
  return Array.from({ length: getBookingDuration(range) }, (_, index) => range.start + index * DAY_MS);
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

export function formatDate(value, language = "en", options = { month: "short", day: "numeric" }) {
  return new Intl.DateTimeFormat(getLocale(language), options).format(new Date(value));
}

export function formatDateTime(value, language = "en", options = { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) {
  return new Intl.DateTimeFormat(getLocale(language), options).format(new Date(value));
}

export function formatDateRange(range, language = "en") {
  const checkout = new Date(range.end);
  const lastRideDay = addDays(checkout, -1);
  return `${formatDate(range.start, language)} - ${formatDate(lastRideDay.getTime(), language)}`;
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

export function buildLocalBookingPreview({ addons = [], deliveryZone, quote, range, scooter, selectedAddonIds = [] }) {
  if (quote) {
    return {
      duration: Number(quote.rental_days || getBookingDuration(range)),
      rentalCost: Number(quote.base_price || 0),
      addonsTotal: Number(quote.add_ons_price || 0),
      deliveryFee: Number(quote.delivery_price || 0),
      discountAmount: Number(quote.discount_amount || 0),
      markupAmount: Number(quote.markup_amount || 0),
      total: Number(quote.total_price || 0),
      addons: getAddonsByIds(addons, selectedAddonIds),
      zone: deliveryZone,
    };
  }

  const duration = getBookingDuration(range);
  const selectedAddons = getAddonsByIds(addons, selectedAddonIds);
  const rentalCost = Number(scooter?.priceUSD || 0) * duration;
  const addonsTotal = selectedAddons.reduce((sum, item) => sum + Number(item.priceUSD || 0), 0);
  const deliveryFee = Number(deliveryZone?.deliveryFeeUSD || 0);

  return {
    duration,
    rentalCost,
    addonsTotal,
    deliveryFee,
    discountAmount: 0,
    markupAmount: 0,
    total: rentalCost + addonsTotal + deliveryFee,
    addons: selectedAddons,
    zone: deliveryZone,
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
  return (
    vehicle.name.toLowerCase().includes(value) ||
    vehicle.engine.toLowerCase().includes(value) ||
    vehicle.typeLabel.toLowerCase().includes(value)
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
}) {
  return {
    scooter_id: scooter.id,
    start_datetime: toApiDateTime(range.start, "09:00"),
    end_datetime: toApiDateTime(range.end, "09:00"),
    delivery_time: toApiDateTime(range.start, deliverySlot),
    add_on_ids: selectedAddonIds,
    payment_method: paymentMethod,
    currency,
    delivery_address: deliveryAddress,
    delivery_latitude: deliveryZone?.latitude,
    delivery_longitude: deliveryZone?.longitude,
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
