import { C, F, Header } from "@/components/street-souk-ui";
import { useAuth } from "@/context/auth-context";
import { useProfile } from "@/context/profile-context";
import {
  createJetronOrder,
  getJetronEvent,
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
  Alert,
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
const jetronEventSlug = "streetsouk-2026";
const steps = ["TICKETS", "YOUR DETAILS", "REVIEW"];

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

function StepProgress({ current }: { current: number }) {
  return (
    <View style={s.progress} accessibilityLabel={`Step ${current + 1} of 3`}>
      {steps.map((label, index) => {
        const complete = index < current;
        const active = index === current;
        return (
          <View key={label} style={s.progressItem}>
            <View style={s.progressTop}>
              <View
                style={[
                  s.progressDot,
                  active && s.progressDotActive,
                  complete && s.progressDotComplete,
                ]}
              >
                {complete ? (
                  <Ionicons name="checkmark" size={12} color={C.ink} />
                ) : (
                  <Text style={[s.progressNumber, active && s.progressNumberActive]}>
                    {index + 1}
                  </Text>
                )}
              </View>
              {index < steps.length - 1 && (
                <View style={[s.progressLine, complete && s.progressLineComplete]} />
              )}
            </View>
            <Text style={[s.progressLabel, active && s.progressLabelActive]}>
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize = "words",
  autoComplete,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: "default" | "email-address";
  autoCapitalize?: "none" | "words";
  autoComplete?: "email";
}) {
  return (
    <View style={s.fieldWrap}>
      <Text style={s.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={C.muted}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        autoComplete={autoComplete}
        style={s.input}
      />
    </View>
  );
}

export function TicketsScreen({ inTab = false }: { inTab?: boolean }) {
  const { eventSlug: eventSlugParam, pastEvent: pastEventParam } = useLocalSearchParams<{
    eventSlug?: string | string[];
    pastEvent?: string | string[];
  }>();
  const initialSlug = Array.isArray(eventSlugParam)
    ? eventSlugParam[0]
    : eventSlugParam;
  const preferredSlug = initialSlug ?? jetronEventSlug;
  const routeMarksEventPast = (Array.isArray(pastEventParam)
    ? pastEventParam[0]
    : pastEventParam) === "true";
  const { user } = useAuth();
  const { profile } = useProfile();
  const [events, setEvents] = useState<JetronEvent[]>([]);
  const [selectedSlug, setSelectedSlug] = useState(preferredSlug);
  const [tickets, setTickets] = useState<JetronTicket[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [deviceId, setDeviceId] = useState("");
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingTickets, setLoadingTickets] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [step, setStep] = useState(0);
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
        .filter(
          (ticket) =>
            ticketSku(ticket) && (quantities[ticketSku(ticket)] ?? 0) > 0,
        )
        .map((ticket) => ({
          sku: ticketSku(ticket),
          quantity: quantities[ticketSku(ticket)],
        })),
    [tickets, quantities],
  );
  const selectedCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
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
      const result = await listJetronEvents().catch(() => []);
      let lookupError: unknown;
      for (const slug of new Set([preferredSlug, jetronEventSlug])) {
        if (result.some((event) => event.slug === slug)) continue;
        try {
          result.push(await getJetronEvent(slug));
        } catch (error) {
          lookupError = error;
        }
      }
      if (result.length === 0) {
        throw lookupError instanceof Error
          ? lookupError
          : new Error("No ticket events could be found on Jetron.");
      }

      const fallbackSlug = result.some((event) => event.slug === preferredSlug)
        ? preferredSlug
        : result.some((event) => event.slug === jetronEventSlug)
          ? jetronEventSlug
          : result[0].slug;
      setEvents(result);
      setSelectedSlug((current) =>
        result.some((event) => event.slug === current)
          ? current
          : fallbackSlug,
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Could not load tickets right now.",
      );
    } finally {
      setLoadingEvents(false);
    }
  }, [preferredSlug]);

  useEffect(() => {
    setSelectedSlug(preferredSlug);
    setStep(0);
  }, [preferredSlug]);

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
    if (profile?.first_name) {
      setFirstName((value) => value || profile.first_name || "");
    }
    if (profile?.last_name) {
      setLastName((value) => value || profile.last_name || "");
    }
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
    setError(null);
  }

  function continueToDetails() {
    if (!selectedItems.length) {
      setError("Choose at least one ticket to continue.");
      return;
    }
    setError(null);
    setStep(1);
  }

  function continueToReview() {
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError("Add the ticket holder’s name and email to continue.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address for your tickets.");
      return;
    }
    setError(null);
    setStep(2);
  }

  async function checkout() {
    if (routeMarksEventPast) {
      setError("Ticket sales are closed for past events.");
      return;
    }
    if (!selectedEvent || !deviceId || selectedItems.length === 0) return;
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
          eventName: selectedEvent.name,
          ticketNames: Object.fromEntries(
            tickets.map((ticket) => [ticketSku(ticket), ticket.name]),
          ),
        },
      );
      if (order.status === "pending_payment" && order.checkoutUrl) {
        await WebBrowser.openBrowserAsync(order.checkoutUrl);
        setStep(0);
      } else if (order.status === "confirmed") {
        Alert.alert(
          "You’re all set!",
          order.reference
            ? `Your ticket order is confirmed.\nReference: ${order.reference}\nCheck email for confirmation.`
            : "Your free ticket order is confirmed. Check email for confirmation.",
          [{ text: "DONE", onPress: () => setStep(0) }],
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

  function handleContinue() {
    if (step === 0) continueToDetails();
    else if (step === 1) continueToReview();
    else checkout();
  }

  const eventCurrency = selectedEvent?.currency ?? tickets[0]?.currency ?? "NGN";
  const ticketIsAvailable = (ticket: JetronTicket) =>
    (!ticket.status || ticket.status.toLowerCase() === "available") &&
    (ticket.quantityLeft == null || ticket.quantityLeft > 0);
  const buttonLabel = ["CONTINUE TO DETAILS", "REVIEW ORDER", "CONTINUE TO PAYMENT"][step];

  return (
    <SafeAreaView style={s.safe}>
      <Header title="TICKETS" back={!inTab} />
      <StepProgress current={step} />
      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={s.intro}>
          <View style={s.introCopy}>
            <Text style={s.eyebrow}>STREET SOUK 2026 / YOUR WAY IN</Text>
            <Text style={s.title}>
              {step === 0 ? "PICK YOUR\nPASS." : step === 1 ? "WHO’S\nCOMING?" : "LOCK IT\nIN."}
            </Text>
          </View>
          <View style={s.ticketMark}>
            <Ionicons name="ticket" size={30} color={C.ink} />
            <Text style={s.ticketMarkText}>SS / 26</Text>
          </View>
        </View>

        {routeMarksEventPast && (
          <View style={s.pastEventNotice}>
            <Ionicons name="time-outline" size={18} color={C.muted} />
            <Text style={s.pastEventNoticeText}>
              Ticket sales are closed because this event has ended.
            </Text>
          </View>
        )}

        {step === 0 && (
          <>
            <View style={s.sectionHeading}>
              <View>
                <Text style={s.sectionKicker}>STEP 01</Text>
                <Text style={s.sectionTitle}>Choose your event</Text>
              </View>
              {loadingEvents && <ActivityIndicator color={C.neon} />}
            </View>
            {loadingEvents ? (
              <View style={s.loadingCard}>
                <ActivityIndicator color={C.neon} />
                <Text style={s.bodyCopy}>Finding your next day out…</Text>
              </View>
            ) : events.length === 0 ? (
              <View style={s.emptyCard}>
                <Ionicons name="ticket-outline" size={26} color={C.neon} />
                <Text style={s.ticketName}>No events available</Text>
                <Text style={s.bodyCopy}>
                  Events will appear here when tickets are published on Jetron.
                </Text>
                <Pressable onPress={loadEvents} style={s.retryButton}>
                  <Text style={s.retryText}>TRY AGAIN</Text>
                </Pressable>
              </View>
            ) : (
              <View style={s.eventList}>
                {events.map((event) => {
                  const selected = selectedSlug === event.slug;
                  const date = displayDate(event);
                  const place = event.location ?? event.venue;
                  return (
                    <Pressable
                      key={event.slug}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      onPress={() => {
                        if (selectedSlug !== event.slug) {
                          setSelectedSlug(event.slug);
                          setStep(0);
                          setError(null);
                        }
                      }}
                      style={[s.eventCard, selected && s.eventCardSelected]}
                    >
                      <View style={[s.eventIcon, selected && s.eventIconSelected]}>
                        <Ionicons
                          name="sparkles-outline"
                          size={21}
                          color={selected ? C.ink : C.neon}
                        />
                      </View>
                      <View style={s.eventCopy}>
                        <Text style={s.eventEyebrow}>
                          {selected ? "YOU’RE HERE FOR" : "UP NEXT"}
                        </Text>
                        <Text style={[s.eventName, selected && s.eventNameSelected]}>
                          {event.name}
                        </Text>
                        {!!(date || place) && (
                          <Text style={s.eventDetail}>
                            {[date, place].filter(Boolean).join("  ·  ")}
                          </Text>
                        )}
                      </View>
                      <Ionicons
                        name={selected ? "checkmark-circle" : "ellipse-outline"}
                        size={23}
                        color={selected ? C.ink : C.muted}
                      />
                    </Pressable>
                  );
                })}
              </View>
            )}

            {selectedEvent && (
              <>
                <View style={[s.sectionHeading, s.ticketHeading]}>
                  <View>
                    <Text style={s.sectionKicker}>MAKE IT YOURS</Text>
                    <Text style={s.sectionTitle}>Select your tickets</Text>
                  </View>
                  {loadingTickets && <ActivityIndicator color={C.neon} />}
                </View>
                {loadingTickets ? (
                  <View style={s.loadingCard}>
                    <ActivityIndicator color={C.neon} />
                    <Text style={s.bodyCopy}>Loading passes…</Text>
                  </View>
                ) : tickets.length === 0 && !error ? (
                  <View style={s.emptyCard}>
                    <Text style={s.ticketName}>Tickets aren’t on sale yet</Text>
                    <Text style={s.bodyCopy}>Check back soon for your pass.</Text>
                  </View>
                ) : (
                  tickets.map((ticket, index) => {
                    const sku = ticketSku(ticket);
                    const available = ticketIsAvailable(ticket);
                    const count = quantities[sku] ?? 0;
                    const max = Math.min(
                      ticket.quantityLeft ?? 10,
                      ticket.maximumPurchasableTicketCount ?? 10,
                    );
                    return (
                      <View
                        key={sku || `${ticket.name}-${index}`}
                        style={[s.passCard, count > 0 && s.passCardSelected]}
                      >
                        <View style={s.passTop}>
                          <View style={s.passText}>
                            <Text style={s.passEyebrow}>
                              {available ? "STREET SOUK / ADMISSION" : "CURRENTLY UNAVAILABLE"}
                            </Text>
                            <Text style={s.passName}>{ticket.name}</Text>
                            {!!ticket.description && (
                              <Text style={s.passDescription}>{ticket.description}</Text>
                            )}
                          </View>
                          <View style={s.passPriceWrap}>
                            <Text style={s.passPrice}>
                              {money(ticket.price, ticket.currency ?? eventCurrency)}
                            </Text>
                            <Text style={s.perTicket}>/ PASS</Text>
                          </View>
                        </View>
                        <View style={s.passDivider}>
                          <View style={s.notchLeft} />
                          <View style={s.dashLine} />
                          <View style={s.notchRight} />
                        </View>
                        <View style={s.passBottom}>
                          <Text style={[s.stockLabel, !available && s.soldOut]}>
                            {available ? "ADMIT ONE" : "SOLD OUT"}
                          </Text>
                          {available && !!sku && (
                            <View style={s.quantityControl}>
                              <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={`Remove one ${ticket.name}`}
                                disabled={count === 0}
                                onPress={() => changeQuantity(ticket, -1)}
                                style={[s.quantityButton, count === 0 && s.quantityDisabled]}
                              >
                                <Ionicons name="remove" size={17} color={C.paper} />
                              </Pressable>
                              <Text style={s.quantity}>{count}</Text>
                              <Pressable
                                accessibilityRole="button"
                                accessibilityLabel={`Add one ${ticket.name}`}
                                disabled={count >= max}
                                onPress={() => changeQuantity(ticket, 1)}
                                style={[s.quantityButton, count >= max && s.quantityDisabled]}
                              >
                                <Ionicons name="add" size={17} color={C.paper} />
                              </Pressable>
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })
                )}
              </>
            )}
          </>
        )}

        {step === 1 && (
          <>
            <View style={s.sectionHeading}>
              <View>
                <Text style={s.sectionKicker}>STEP 02</Text>
                <Text style={s.sectionTitle}>Ticket holder</Text>
              </View>
              <View style={s.stepIcon}>
                <Ionicons name="person-outline" size={20} color={C.neon} />
              </View>
            </View>
            <Text style={s.bodyCopy}>
              We’ll send your ticket and event updates to this inbox.
            </Text>
            <View style={s.formCard}>
              <Field
                label="FIRST NAME"
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Your first name"
              />
              <Field
                label="LAST NAME"
                value={lastName}
                onChangeText={setLastName}
                placeholder="Your last name"
              />
              <Field
                label="EMAIL ADDRESS"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={[s.sectionHeading, s.promoHeading]}>
              <View>
                <Text style={s.sectionKicker}>GOT A CODE?</Text>
                <Text style={s.sectionTitle}>Promo code</Text>
              </View>
              <Ionicons name="pricetag-outline" size={20} color={C.muted} />
            </View>
            <TextInput
              value={promoCode}
              onChangeText={setPromoCode}
              placeholder="Enter code (optional)"
              placeholderTextColor={C.muted}
              autoCapitalize="characters"
              style={s.promoInput}
            />
            <View style={s.inlineNote}>
              <Ionicons name="lock-closed-outline" size={15} color={C.muted} />
              <Text style={s.inlineNoteText}>Your details are only used for your order.</Text>
            </View>
          </>
        )}

        {step === 2 && (
          <>
            <View style={s.sectionHeading}>
              <View>
                <Text style={s.sectionKicker}>STEP 03</Text>
                <Text style={s.sectionTitle}>Your order</Text>
              </View>
              <View style={s.stepIcon}>
                <Ionicons name="receipt-outline" size={20} color={C.neon} />
              </View>
            </View>
            <View style={s.reviewCard}>
              <Text style={s.reviewEyebrow}>EVENT</Text>
              <Text style={s.reviewEvent}>{selectedEvent?.name}</Text>
              {!!(
                selectedEvent &&
                (displayDate(selectedEvent) || selectedEvent.location || selectedEvent.venue)
              ) && (
                <Text style={s.reviewDetail}>
                  {[displayDate(selectedEvent), selectedEvent.location ?? selectedEvent.venue]
                    .filter(Boolean)
                    .join("  ·  ")}
                </Text>
              )}
              <View style={s.reviewRule} />
              {selectedItems.map((item) => {
                const ticket = tickets.find((candidate) => ticketSku(candidate) === item.sku);
                if (!ticket) return null;
                return (
                  <View key={item.sku} style={s.orderLine}>
                    <View style={s.orderLineCopy}>
                      <Text style={s.orderName}>{ticket.name}</Text>
                      <Text style={s.orderQuantity}>QTY {item.quantity}</Text>
                    </View>
                    <Text style={s.orderPrice}>
                      {money(ticket.price * item.quantity, ticket.currency ?? eventCurrency)}
                    </Text>
                  </View>
                );
              })}
              {!!promoCode.trim() && (
                <View style={s.promoSummary}>
                  <Ionicons name="pricetag-outline" size={15} color={C.neon} />
                  <Text style={s.promoSummaryText}>CODE ENTERED · {promoCode.trim()}</Text>
                </View>
              )}
              <View style={s.reviewRule} />
              <View style={s.totalRow}>
                <View>
                  <Text style={s.totalLabel}>ESTIMATED TOTAL</Text>
                  <Text style={s.totalNote}>Final price confirmed by Jetron</Text>
                </View>
                <Text style={s.totalPrice}>{money(estimate, eventCurrency)}</Text>
              </View>
            </View>

            <View style={s.attendeeCard}>
              <View style={s.attendeeIcon}>
                <Ionicons name="person" size={17} color={C.ink} />
              </View>
              <View style={s.attendeeCopy}>
                <Text style={s.attendeeName}>{`${firstName.trim()} ${lastName.trim()}`}</Text>
                <Text style={s.attendeeEmail}>{email.trim()}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Edit ticket holder details"
                onPress={() => setStep(1)}
                style={s.editButton}
              >
                <Text style={s.editText}>EDIT</Text>
              </Pressable>
            </View>

            <View style={s.secureNote}>
              <Ionicons name="shield-checkmark-outline" size={19} color={C.neon} />
              <Text style={s.secureText}>
                Secure payment powered by Jetron. Your ticket will be delivered by email.
              </Text>
            </View>
          </>
        )}

        {!!error && (
          <View style={s.errorBox}>
            <Ionicons name="alert-circle-outline" size={19} color="#FF8D82" />
            <Text style={s.errorText}>{error}</Text>
          </View>
        )}
        {!!notice && (
          <View style={s.noticeBox}>
            <Ionicons name="checkmark-circle-outline" size={19} color={C.neon} />
            <Text style={s.notice}>{notice}</Text>
          </View>
        )}

        {!!selectedEvent && (
          <Pressable onPress={openJetronFallback} style={s.fallbackLink}>
            <Text style={s.fallbackText}>Need help? Buy directly on Jetron Ticket</Text>
            <Ionicons name="open-outline" size={14} color={C.muted} />
          </Pressable>
        )}
      </ScrollView>

      <View style={s.bottomBar}>
        {selectedCount > 0 ? (
          <View style={s.bottomSummary}>
            <Text style={s.bottomCount}>
              {selectedCount} {selectedCount === 1 ? "PASS" : "PASSES"}
            </Text>
            <Text style={s.bottomTotal}>{money(estimate, eventCurrency)}</Text>
          </View>
        ) : (
          <View style={s.bottomSummary}>
            <Text style={s.bottomHint}>
              {step === 0 ? "CHOOSE A PASS TO START" : `${steps[step]} / 03`}
            </Text>
          </View>
        )}
        <View style={s.bottomActions}>
          {step > 0 && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go to previous step"
              onPress={() => {
                setError(null);
                setStep((current) => current - 1);
              }}
              style={s.backStepButton}
            >
              <Ionicons name="arrow-back" size={19} color={C.paper} />
            </Pressable>
          )}
          <Pressable
            accessibilityRole="button"
            disabled={
              checkingOut ||
              !deviceId ||
              routeMarksEventPast ||
              (step === 0 && (selectedCount === 0 || loadingTickets || !selectedEvent))
            }
            onPress={handleContinue}
            style={[
              s.continueButton,
              step > 0 && s.continueButtonWithBack,
              (checkingOut || !deviceId || (step === 0 && selectedCount === 0)) &&
                s.continueDisabled,
            ]}
          >
            {checkingOut ? (
              <ActivityIndicator color={C.ink} />
            ) : (
              <>
                <Text style={s.continueText}>{buttonLabel}</Text>
                <Ionicons
                  name={step === 2 ? "lock-closed" : "arrow-forward"}
                  size={17}
                  color={C.ink}
                />
              </>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

export default TicketsScreen;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  progress: {
    flexDirection: "row",
    paddingHorizontal: 21,
    paddingTop: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: C.line,
  },
  progressItem: { flex: 1 },
  progressTop: { flexDirection: "row", alignItems: "center" },
  progressDot: {
    width: 23,
    height: 23,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: "center",
    justifyContent: "center",
  },
  progressDotActive: { backgroundColor: C.neon, borderColor: C.neon },
  progressDotComplete: { backgroundColor: C.green, borderColor: C.green },
  progressNumber: { color: C.paper, fontFamily: F.mono, fontSize: 9 },
  progressNumberActive: { color: C.ink },
  progressLine: { height: 1, flex: 1, backgroundColor: C.line, marginHorizontal: 7 },
  progressLineComplete: { backgroundColor: C.green },
  progressLabel: { color: C.paper, fontFamily: F.mono, fontSize: 8, marginTop: 6 },
  progressLabelActive: { color: C.neon },
  content: { paddingHorizontal: 19, paddingTop: 13, paddingBottom: 25 },
  intro: {
    minHeight: 133,
    padding: 17,
    marginTop: 8,
    marginBottom: 19,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.line,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  introCopy: { flex: 1 },
  pastEventNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    padding: 12,
    marginBottom: 17,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.line,
  },
  pastEventNoticeText: { flex: 1, color: C.paper, fontFamily: F.body, fontSize: 14 },
  eyebrow: { color: C.paper, fontFamily: F.mono, fontSize: 8, letterSpacing: 0.4 },
  title: { color: C.neon, fontFamily: F.display, fontSize: 34, lineHeight: 36, marginTop: 5 },
  ticketMark: {
    width: 69,
    height: 76,
    backgroundColor: C.neon,
    alignItems: "center",
    justifyContent: "center",
    transform: [{ rotate: "5deg" }],
  },
  ticketMarkText: { color: C.ink, fontFamily: F.mono, fontSize: 8, marginTop: 5 },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 12,
  },
  sectionKicker: { color: C.paper, fontFamily: F.mono, fontSize: 8, letterSpacing: 0.7 },
  sectionTitle: { color: C.neon, fontFamily: F.display, fontSize: 22, marginTop: 3 },
  eventList: { gap: 9 },
  eventCard: {
    minHeight: 86,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.line,
  },
  eventCardSelected: { borderColor: C.neon, backgroundColor: "#111D13" },
  eventIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.line,
  },
  eventIconSelected: { backgroundColor: C.neon, borderColor: C.neon },
  eventCopy: { flex: 1 },
  eventEyebrow: { color: C.paper, fontFamily: F.mono, fontSize: 7, letterSpacing: 0.5 },
  eventName: { color: C.neon, fontFamily: F.bodyBold, fontSize: 17, marginTop: 3 },
  eventNameSelected: { color: C.neon },
  eventDetail: { color: C.paper, fontFamily: F.body, fontSize: 12, marginTop: 2 },
  ticketHeading: { marginTop: 27, marginBottom: 12 },
  loadingCard: {
    minHeight: 88,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.line,
  },
  emptyCard: {
    alignItems: "flex-start",
    gap: 9,
    padding: 17,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.line,
  },
  retryButton: { paddingVertical: 9, paddingHorizontal: 13, borderWidth: 1, borderColor: C.neon, marginTop: 3 },
  retryText: { color: C.neon, fontFamily: F.mono, fontSize: 9 },
  passCard: {
    marginBottom: 11,
    paddingHorizontal: 15,
    paddingTop: 15,
    backgroundColor: C.panel,
    borderWidth: 1,
    borderColor: C.line,
  },
  passCardSelected: { borderColor: C.neon, backgroundColor: "#101A11" },
  passTop: { minHeight: 73, flexDirection: "row", justifyContent: "space-between", gap: 8 },
  passText: { flex: 1 },
  passEyebrow: { color: C.paper, fontFamily: F.mono, fontSize: 7, letterSpacing: 0.3 },
  passName: { color: C.neon, fontFamily: F.display, fontSize: 21, marginTop: 4 },
  passDescription: { color: C.paper, fontFamily: F.body, fontSize: 13, lineHeight: 17, marginTop: 2 },
  passPriceWrap: { alignItems: "flex-end", paddingTop: 1 },
  passPrice: { color: C.neon, fontFamily: F.display, fontSize: 19 },
  perTicket: { color: C.paper, fontFamily: F.mono, fontSize: 7, marginTop: 2 },
  passDivider: { height: 16, flexDirection: "row", alignItems: "center", marginHorizontal: -15 },
  notchLeft: { width: 9, height: 18, borderTopRightRadius: 10, borderBottomRightRadius: 10, backgroundColor: C.bg },
  notchRight: { width: 9, height: 18, borderTopLeftRadius: 10, borderBottomLeftRadius: 10, backgroundColor: C.bg },
  dashLine: { flex: 1, borderTopWidth: 1, borderStyle: "dashed", borderColor: C.line, marginHorizontal: 7 },
  passBottom: { minHeight: 46, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  stockLabel: { color: C.paper, fontFamily: F.mono, fontSize: 8, letterSpacing: 0.8 },
  soldOut: { color: "#FF8D82" },
  quantityControl: { flexDirection: "row", alignItems: "center", gap: 11 },
  quantityButton: { width: 31, height: 31, borderWidth: 1, borderColor: C.line, alignItems: "center", justifyContent: "center" },
  quantityDisabled: { opacity: 0.38 },
  quantity: { color: C.neon, fontFamily: F.mono, fontSize: 13, minWidth: 14, textAlign: "center" },
  bodyCopy: { color: C.paper, fontFamily: F.body, fontSize: 15, lineHeight: 21 },
  stepIcon: { width: 39, height: 39, borderWidth: 1, borderColor: C.line, alignItems: "center", justifyContent: "center" },
  formCard: { paddingHorizontal: 14, marginTop: 18, backgroundColor: C.panel, borderWidth: 1, borderColor: C.line },
  fieldWrap: { minHeight: 76, justifyContent: "center", borderBottomWidth: 1, borderBottomColor: C.line },
  fieldLabel: { color: C.paper, fontFamily: F.mono, fontSize: 8, letterSpacing: 0.5, marginBottom: 4 },
  input: { minHeight: 36, color: C.paper, fontFamily: F.body, fontSize: 17, paddingVertical: 5 },
  promoHeading: { marginTop: 24, marginBottom: 10 },
  promoInput: { minHeight: 52, paddingHorizontal: 14, color: C.paper, fontFamily: F.mono, fontSize: 12, backgroundColor: C.panel, borderWidth: 1, borderColor: C.line },
  inlineNote: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 13 },
  inlineNoteText: { color: C.paper, fontFamily: F.body, fontSize: 13 },
  reviewCard: { padding: 16, backgroundColor: C.panel, borderWidth: 1, borderColor: C.line },
  reviewEyebrow: { color: C.paper, fontFamily: F.mono, fontSize: 8, letterSpacing: 0.7 },
  reviewEvent: { color: C.neon, fontFamily: F.display, fontSize: 23, marginTop: 3 },
  reviewDetail: { color: C.paper, fontFamily: F.body, fontSize: 13, marginTop: 3 },
  reviewRule: { height: 1, backgroundColor: C.line, marginVertical: 15 },
  orderLine: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 13 },
  orderLineCopy: { flex: 1 },
  orderName: { color: C.neon, fontFamily: F.bodyBold, fontSize: 16 },
  orderQuantity: { color: C.paper, fontFamily: F.mono, fontSize: 8, marginTop: 2 },
  orderPrice: { color: C.paper, fontFamily: F.mono, fontSize: 11 },
  promoSummary: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 2 },
  promoSummaryText: { color: C.neon, fontFamily: F.mono, fontSize: 8 },
  totalRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  totalLabel: { color: C.paper, fontFamily: F.mono, fontSize: 8, letterSpacing: 0.4 },
  totalNote: { color: C.paper, fontFamily: F.body, fontSize: 12, marginTop: 3 },
  totalPrice: { color: C.neon, fontFamily: F.display, fontSize: 23 },
  attendeeCard: { minHeight: 70, flexDirection: "row", alignItems: "center", gap: 10, padding: 12, marginTop: 11, backgroundColor: C.panel, borderWidth: 1, borderColor: C.line },
  attendeeIcon: { width: 34, height: 34, backgroundColor: C.neon, alignItems: "center", justifyContent: "center" },
  attendeeCopy: { flex: 1 },
  attendeeName: { color: C.neon, fontFamily: F.bodyBold, fontSize: 15 },
  attendeeEmail: { color: C.paper, fontFamily: F.body, fontSize: 13, marginTop: 2 },
  editButton: { borderWidth: 1, borderColor: C.line, paddingHorizontal: 10, paddingVertical: 7 },
  editText: { color: C.neon, fontFamily: F.mono, fontSize: 8 },
  secureNote: { flexDirection: "row", alignItems: "center", gap: 9, padding: 13, marginTop: 12, backgroundColor: "#0B140D", borderWidth: 1, borderColor: C.line },
  secureText: { flex: 1, color: C.paper, fontFamily: F.body, fontSize: 13, lineHeight: 18 },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, marginTop: 15, borderWidth: 1, borderColor: "#873B35", backgroundColor: "#21100E" },
  errorText: { flex: 1, color: "#FF9B92", fontFamily: F.body, fontSize: 14 },
  noticeBox: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, marginTop: 15, borderWidth: 1, borderColor: C.line, backgroundColor: C.panel },
  notice: { flex: 1, color: C.neon, fontFamily: F.body, fontSize: 14 },
  fallbackLink: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 20 },
  fallbackText: { color: C.paper, fontFamily: F.body, fontSize: 13, textDecorationLine: "underline" },
  bottomBar: { paddingHorizontal: 17, paddingTop: 11, paddingBottom: 9, backgroundColor: C.bg, borderTopWidth: 1, borderTopColor: C.line },
  bottomSummary: { minHeight: 28, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  bottomCount: { color: C.paper, fontFamily: F.mono, fontSize: 9, letterSpacing: 0.6 },
  bottomHint: { color: C.paper, fontFamily: F.mono, fontSize: 9, letterSpacing: 0.4 },
  bottomTotal: { color: C.neon, fontFamily: F.display, fontSize: 20 },
  bottomActions: { flexDirection: "row", gap: 9, marginTop: 7 },
  backStepButton: { width: 48, height: 51, alignItems: "center", justifyContent: "center", backgroundColor: C.panel, borderWidth: 1, borderColor: C.line },
  continueButton: { minHeight: 51, flex: 1, paddingHorizontal: 15, backgroundColor: C.neon, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  continueButtonWithBack: { flex: 1 },
  continueDisabled: { opacity: 0.42 },
  continueText: { color: C.ink, fontFamily: F.mono, fontSize: 10, letterSpacing: 0.25 },
});
