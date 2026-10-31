import { C, F, Header, PageTitle } from "@/components/street-souk-ui";
import { useAuth } from "@/context/auth-context";
import { useProfile } from "@/context/profile-context";
import {
  createJetronOrder,
  listJetronEvents,
  listJetronTickets,
  reserveJetronTickets,
} from "@/lib/jetron";
import type { JetronEvent, JetronTicket } from "@/lib/jetron";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const deviceStorageKey = "jetron:device-id";

function newDeviceId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    return (char === "x" ? random : (random & 0x3) | 0x8).toString(16);
  });
}

function money(amount: number, currency = "NGN") {
  try {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount / 100);
  } catch {
    return `${currency} ${(amount / 100).toLocaleString()}`;
  }
}

function displayDate(event: JetronEvent) {
  const rawDate = event.startsAt ?? event.date;
  if (!rawDate) return null;
  const parsed = new Date(rawDate);
  return Number.isNaN(parsed.getTime())
    ? rawDate
    : parsed.toLocaleDateString(undefined, {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}

function ticketSku(ticket: JetronTicket) {
  return ticket.sku ?? ticket.id ?? "";
}

export default function TicketsScreen() {
  const { eventSlug: eventSlugParam } = useLocalSearchParams<{
    eventSlug?: string | string[];
  }>();
  const initialSlug = Array.isArray(eventSlugParam)
    ? eventSlugParam[0]
    : eventSlugParam;
  const { user } = useAuth();
  const { profile } = useProfile();
  const [events, setEvents] = useState<JetronEvent[]>([]);
  const [selectedSlug, setSelectedSlug] = useState(initialSlug ?? "");
  const [tickets, setTickets] = useState<JetronTicket[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [deviceId, setDeviceId] = useState("");
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState(profile?.first_name ?? "");
  const [lastName, setLastName] = useState(profile?.last_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [promoCode, setPromoCode] = useState("");
  const [notice, setNotice] = useState("");

  const selectedEvent = events.find((event) => event.slug === selectedSlug);
  const selectedItems = useMemo(
    () =>
      tickets
        .filter((ticket) => ticketSku(ticket) && (quantities[ticketSku(ticket)] ?? 0) > 0)
        .map((ticket) => ({
          sku: ticketSku(ticket),
          quantity: quantities[ticketSku(ticket)],
        })),
    [tickets, quantities],
  );
  const estimate = useMemo(
    () =>
      tickets.reduce(
        (sum, ticket) =>
          sum + ticket.price * (quantities[ticketSku(ticket)] ?? 0),
        0,
      ),
    [tickets, quantities],
  );

  const loadEvents = useCallback(async () => {
    setLoadingEvents(true);
    setError(null);
    try {
      const result = await listJetronEvents();
      setEvents(result);
      setSelectedSlug((current) => {
        if (current && result.some((event) => event.slug === current)) {
          return current;
        }
        if (initialSlug && result.some((event) => event.slug === initialSlug)) {
          return initialSlug;
        }
        return result[0]?.slug ?? "";
      });
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load tickets right now.",
      );
    } finally {
      setLoadingEvents(false);
    }
  }, [initialSlug]);

  useEffect(() => {
    loadEvents();
    AsyncStorage.getItem(deviceStorageKey).then((saved) => {
      if (saved) {
        setDeviceId(saved);
      } else {
        const created = newDeviceId();
        setDeviceId(created);
        AsyncStorage.setItem(deviceStorageKey, created).catch(() => {});
      }
    });
  }, [loadEvents]);

  useEffect(() => {
    if (!selectedSlug) {
      setTickets([]);
      return;
    }
    let active = true;
    setLoadingTickets(true);
    setError(null);
    setQuantities({});
    setNotice("");
    listJetronTickets(selectedSlug)
      .then((result) => {
        if (active) setTickets(result);
      })
      .catch((loadError) => {
        if (active) {
          setTickets([]);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load ticket types.",
          );
        }
      })
      .finally(() => {
        if (active) setLoadingTickets(false);
      });
    return () => {
      active = false;
    };
  }, [selectedSlug]);

  useEffect(() => {
    if (profile?.first_name) setFirstName((value) => value || profile.first_name || "");
    if (profile?.last_name) setLastName((value) => value || profile.last_name || "");
    if (user?.email) setEmail((value) => value || user.email || "");
  }, [profile, user]);

  function changeQuantity(ticket: JetronTicket, delta: number) {
    const sku = ticketSku(ticket);
    if (!sku) return;
    setQuantities((current) => {
      const maxPurchasable = Math.min(
        ticket.quantityLeft ?? 10,
        ticket.maximumPurchasableTicketCount ?? 10,
      );
      const next = Math.max(
        0,
        Math.min(maxPurchasable, (current[sku] ?? 0) + delta),
      );
      return { ...current, [sku]: next };
    });
  }

  async function checkout() {
    if (!selectedEvent || !deviceId || selectedItems.length === 0) return;
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError("Enter your first name, last name, and email to continue.");
      return;
    }
    setCheckingOut(true);
    setError(null);
    setNotice("");
    try {
      const reservation = await reserveJetronTickets(
        selectedEvent.slug,
        selectedItems,
        deviceId,
        promoCode.trim() || undefined,
      );
      const order = await createJetronOrder(
        selectedEvent.slug,
        reservation,
        {
          email: email.trim(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        },
      );
      if (order.status === "pending_payment" && order.checkoutUrl) {
        await WebBrowser.openBrowserAsync(order.checkoutUrl);
      } else if (order.status === "confirmed") {
        setNotice(
          order.reference
            ? `Your order is confirmed. Reference: ${order.reference}`
            : "Your free ticket order is confirmed.",
        );
      } else {
        setNotice("Your order was created. Check your email for ticket updates.");
      }
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Checkout could not be completed. Please try again.",
      );
    } finally {
      setCheckingOut(false);
    }
  }

  async function openJetronFallback() {
    if (selectedEvent?.slug) {
      await WebBrowser.openBrowserAsync(
        `https://jtr.rsvp/${encodeURIComponent(selectedEvent.slug)}`,
      );
    }
  }

  const eventCurrency = selectedEvent?.currency ?? tickets[0]?.currency ?? "NGN";
  const ticketIsAvailable = (ticket: JetronTicket) =>
    (!ticket.status || ticket.status.toLowerCase() === "available") &&
    (ticket.quantityLeft == null || ticket.quantityLeft > 0);

  return (
    <SafeAreaView style={s.safe}>
      <Header title="TICKETS" back />
      <ScrollView
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <PageTitle eyebrow="YOUR WAY IN" title="GET TICKETS" />

        <Text style={s.sectionLabel}>SELECT AN EVENT</Text>
        {loadingEvents ? (
          <View style={s.loadingRow}>
            <ActivityIndicator color={C.neon} />
            <Text style={s.muted}>Loading events from Jetron…</Text>
          </View>
        ) : events.length === 0 ? (
          <View style={s.emptyState}>
            <Ionicons name="ticket-outline" size={25} color={C.neon} />
            <Text style={s.emptyTitle}>NO EVENTS AVAILABLE</Text>
            <Text style={s.muted}>
              Events will show here once they are published on Jetron with tickets available.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={loadEvents}
              style={s.retryButton}
            >
              <Text style={s.retryText}>TRY AGAIN</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.eventList}
          >
            {events.map((event) => (
              <Pressable
                key={event.slug}
                accessibilityRole="button"
                accessibilityState={{ selected: selectedSlug === event.slug }}
                onPress={() => setSelectedSlug(event.slug)}
                style={[s.eventCard, selectedSlug === event.slug && s.eventCardSelected]}
              >
                <Text style={[s.eventName, selectedSlug === event.slug && s.selectedText]}>
                  {event.name}
                </Text>
                {!!(displayDate(event) || event.location || event.venue) && (
                  <Text style={s.eventDetail}>
                    {[displayDate(event), event.location ?? event.venue]
                      .filter(Boolean)
                      .join(" · ")}
                  </Text>
                )}
              </Pressable>
            ))}
          </ScrollView>
        )}

        {selectedEvent && (
          <>
            <View style={s.divider} />
            <View style={s.sectionHeading}>
              <Text style={s.sectionTitle}>CHOOSE YOUR TICKETS</Text>
              {loadingTickets && <ActivityIndicator color={C.neon} size="small" />}
            </View>
            {!loadingTickets && tickets.length === 0 && !error && (
              <Text style={s.muted}>Ticket types will appear here when they go on sale.</Text>
            )}
            {tickets.map((ticket, index) => {
              const sku = ticketSku(ticket);
              const available = ticketIsAvailable(ticket);
              const count = quantities[sku] ?? 0;
              return (
                <View key={sku || `${ticket.name}-${index}`} style={s.ticketCard}>
                  <View style={s.ticketInfo}>
                    <Text style={s.ticketName}>{ticket.name}</Text>
                    {!!ticket.description && (
                      <Text style={s.ticketDescription}>{ticket.description}</Text>
                    )}
                    <Text style={s.ticketPrice}>{money(ticket.price, ticket.currency ?? eventCurrency)}</Text>
                    {!available && <Text style={s.soldOut}>SOLD OUT</Text>}
                  </View>
                  {available && !!sku && (
                    <View style={s.quantityControl}>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Remove one ${ticket.name}`}
                        onPress={() => changeQuantity(ticket, -1)}
                        style={s.quantityButton}
                      >
                        <Ionicons name="remove" size={18} color={C.paper} />
                      </Pressable>
                      <Text style={s.quantity}>{count}</Text>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Add one ${ticket.name}`}
                        onPress={() => changeQuantity(ticket, 1)}
                        style={s.quantityButton}
                      >
                        <Ionicons name="add" size={18} color={C.paper} />
                      </Pressable>
                    </View>
                  )}
                </View>
              );
            })}

            {tickets.length > 0 && (
              <>
                <Text style={s.sectionLabel}>TICKET HOLDER</Text>
                <View style={s.formCard}>
                  <TextInput
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="First name"
                    placeholderTextColor={C.muted}
                    autoCapitalize="words"
                    style={s.input}
                  />
                  <TextInput
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Last name"
                    placeholderTextColor={C.muted}
                    autoCapitalize="words"
                    style={s.input}
                  />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Email address"
                    placeholderTextColor={C.muted}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    style={[s.input, s.lastInput]}
                  />
                </View>

                <Text style={s.sectionLabel}>PROMO CODE · OPTIONAL</Text>
                <TextInput
                  value={promoCode}
                  onChangeText={setPromoCode}
                  placeholder="Enter a promo code"
                  placeholderTextColor={C.muted}
                  autoCapitalize="characters"
                  style={s.promoInput}
                />
                {selectedItems.length > 0 && (
                  <View style={s.totalRow}>
                    <Text style={s.totalLabel}>ESTIMATED TOTAL</Text>
                    <Text style={s.totalPrice}>{money(estimate, eventCurrency)}</Text>
                  </View>
                )}
              </>
            )}
          </>
        )}

        {!!error && (
          <View style={s.errorBox}>
            <Ionicons name="alert-circle-outline" size={19} color="#FF7A70" />
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}
        {!!notice && <Text style={s.notice}>{notice}</Text>}

        {selectedEvent && selectedItems.length > 0 && (
          <Pressable
            accessibilityRole="button"
            disabled={checkingOut || !deviceId}
            onPress={checkout}
            style={[s.buyButton, (checkingOut || !deviceId) && s.disabled]}
          >
            {checkingOut ? (
              <ActivityIndicator color={C.ink} />
            ) : (
              <>
                <Text style={s.buyButtonText}>CONTINUE TO PAYMENT</Text>
                <Ionicons name="arrow-forward" size={18} color={C.ink} />
              </>
            )}
          </Pressable>
        )}
        <Text style={s.checkoutNote}>
          Payment is completed securely with Jetron. Your tickets will be sent to the email above.
        </Text>
        {!!selectedEvent && (
          <Pressable onPress={openJetronFallback} style={s.fallbackLink}>
            <Text style={s.fallbackText}>Having trouble buying? Open this event on Jetron Ticket</Text>
            <Ionicons name="open-outline" size={14} color={C.muted} />
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  content: { paddingHorizontal: 20, paddingBottom: 42 },
  sectionLabel: {
    color: C.muted,
    fontFamily: F.mono,
    fontSize: 10,
    letterSpacing: 0.8,
    marginTop: 18,
    marginBottom: 9,
  },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 16 },
  muted: { color: C.muted, fontFamily: F.body, fontSize: 15, lineHeight: 21 },
  emptyState: {
    alignItems: "flex-start",
    gap: 10,
    padding: 16,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.line,
  },
  emptyTitle: { color: C.neon, fontFamily: F.mono, fontSize: 11 },
  retryButton: { borderWidth: 1, borderColor: C.line, paddingHorizontal: 14, paddingVertical: 9, marginTop: 2 },
  retryText: { color: C.paper, fontFamily: F.mono, fontSize: 10 },
  eventList: { gap: 9, paddingBottom: 2 },
  eventCard: {
    width: 230,
    minHeight: 74,
    padding: 13,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.line,
    justifyContent: "center",
  },
  eventCardSelected: { borderColor: C.neon },
  eventName: { color: C.paper, fontFamily: F.bodyBold, fontSize: 17 },
  selectedText: { color: C.neon },
  eventDetail: { color: C.muted, fontFamily: F.body, fontSize: 12, marginTop: 4 },
  divider: { height: 1, backgroundColor: C.line, marginTop: 21, marginBottom: 18 },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  sectionTitle: { color: C.neon, fontFamily: F.mono, fontSize: 10, letterSpacing: 0.8 },
  ticketCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 14,
    marginBottom: 9,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.line,
  },
  ticketInfo: { flex: 1, paddingRight: 8 },
  ticketName: { color: C.paper, fontFamily: F.bodyBold, fontSize: 17 },
  ticketDescription: { color: C.muted, fontFamily: F.body, fontSize: 13, marginTop: 3 },
  ticketPrice: { color: C.neon, fontFamily: F.mono, fontSize: 12, marginTop: 7 },
  soldOut: { color: "#FF7A70", fontFamily: F.mono, fontSize: 9, marginTop: 6 },
  quantityControl: { flexDirection: "row", alignItems: "center", gap: 10 },
  quantityButton: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: C.line,
  },
  quantity: { color: C.paper, fontFamily: F.mono, fontSize: 13, minWidth: 12, textAlign: "center" },
  formCard: { paddingHorizontal: 14, backgroundColor: C.panel, borderWidth: 1, borderColor: C.line },
  input: {
    minHeight: 48,
    color: C.paper,
    fontFamily: F.body,
    fontSize: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  lastInput: { borderBottomWidth: 0 },
  promoInput: {
    minHeight: 48,
    paddingHorizontal: 13,
    color: C.paper,
    fontFamily: F.body,
    fontSize: 15,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.line,
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: C.line,
    marginTop: 17,
    paddingTop: 15,
  },
  totalLabel: { color: C.muted, fontFamily: F.mono, fontSize: 10 },
  totalPrice: { color: C.neon, fontFamily: F.display, fontSize: 23 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#873B35",
    backgroundColor: "#21100E",
  },
  errorText: { flex: 1, color: "#FF9B92", fontFamily: F.body, fontSize: 14 },
  notice: { color: C.neon, fontFamily: F.body, fontSize: 15, marginTop: 14 },
  buyButton: {
    minHeight: 52,
    marginTop: 20,
    paddingHorizontal: 15,
    backgroundColor: C.green,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  disabled: { opacity: 0.55 },
  buyButtonText: { color: C.ink, fontFamily: F.mono, fontSize: 11 },
  checkoutNote: { color: C.muted, fontFamily: F.body, fontSize: 13, lineHeight: 18, marginTop: 10 },
  fallbackLink: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 20 },
  fallbackText: { color: C.muted, fontFamily: F.body, fontSize: 13, textDecorationLine: "underline" },
});
