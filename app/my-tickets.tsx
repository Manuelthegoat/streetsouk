import { C, F, Header } from "@/components/street-souk-ui";
import { useAuth } from "@/context/auth-context";
import { lookupAttendeeTickets, type TicketOrder } from "@/lib/attendee-tickets";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import * as ScreenCapture from "expo-screen-capture";
import QRCode from "react-native-qrcode-svg";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type TicketTab = "upcoming" | "past";

function formatDate(value?: string, timezone?: string) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  try {
    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
      ...(timezone ? { timeZone: timezone } : {}),
    });
  } catch {
    return date.toLocaleString();
  }
}

function statusLabel(status: string) {
  switch (status) {
    case "VALID": return "READY TO USE";
    case "TRANSFER_PENDING": return "TRANSFER PENDING";
    case "USED": return "USED";
    case "LOCKED": return "LOCKED";
    default: return status.replace(/_/g, " ");
  }
}

export default function MyTicketsScreen() {
  const router = useRouter();
  const { eventSlug: eventSlugParam } = useLocalSearchParams<{ eventSlug?: string | string[] }>();
  const eventSlug = Array.isArray(eventSlugParam) ? eventSlugParam[0] : eventSlugParam;
  const { user } = useAuth();
  const [tab, setTab] = useState<TicketTab>("upcoming");
  const [orders, setOrders] = useState<TicketOrder[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  const loadTickets = useCallback(async (cursor?: string, force = false) => {
    if (!user) {
      setOrders([]);
      setNextCursor(null);
      setLoading(false);
      return;
    }

    const append = !!cursor;
    const currentRequest = ++requestId.current;
    if (append) setLoadingMore(true);
    else {
      setLoading(true);
      setOrders([]);
      setNextCursor(null);
    }
    if (force && !append) setRefreshing(true);
    setError(null);

    try {
      const page = await lookupAttendeeTickets({
        used: tab === "past",
        ...(eventSlug ? { eventSlug } : {}),
        ...(cursor ? { cursor } : {}),
      });
      if (currentRequest !== requestId.current) return;
      setOrders((previous) => append ? [...previous, ...page.items] : page.items);
      setNextCursor(page.nextCursor ?? null);
    } catch {
      if (currentRequest !== requestId.current) return;
      setError("Your tickets could not be loaded. Please try again.");
      if (!append) setOrders([]);
    } finally {
      if (currentRequest === requestId.current) {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    }
  }, [eventSlug, tab, user?.id]);

  useFocusEffect(
    useCallback(() => {
      // Jetron QR codes can change after a transfer. Clear old codes and fetch
      // fresh ticket state every time this screen becomes active.
      void loadTickets();
      if (Platform.OS !== "web") {
        void ScreenCapture.preventScreenCaptureAsync("my-tickets").catch(() => {});
        if (Platform.OS === "ios") {
          void ScreenCapture.enableAppSwitcherProtectionAsync(0.8).catch(() => {});
        }
      }
      return () => {
        requestId.current += 1;
        setOrders([]);
        setNextCursor(null);
        if (Platform.OS !== "web") {
          void ScreenCapture.allowScreenCaptureAsync("my-tickets").catch(() => {});
          if (Platform.OS === "ios") {
            void ScreenCapture.disableAppSwitcherProtectionAsync().catch(() => {});
          }
        }
      };
    }, [loadTickets]),
  );

  const tickets = useMemo(
    () => orders.flatMap((order) =>
      (order.tickets ?? []).map((ticket) => ({ order, ticket })),
    ),
    [orders],
  );

  return (
    <SafeAreaView style={s.safe}>
      <Header title="MY TICKETS" back />
      <ScrollView contentContainerStyle={s.content}>
        <Text style={s.kicker}>STREET SOUK · ADMISSION</Text>
        <Text style={s.title}>Your tickets</Text>
        <Text style={s.intro}>
          {eventSlug
            ? "Your passes for this event." 
            : "Your passes and entry codes, all in one place."}
        </Text>

        {!user ? (
          <View style={s.emptyCard}>
            <Ionicons name="person-circle-outline" size={31} color={C.neon} />
            <Text style={s.emptyTitle}>Sign in to see your tickets</Text>
            <Text style={s.emptyCopy}>
              Sign in with the verified email address used to buy or receive your tickets.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push("/sign-in")}
              style={s.actionButton}
            >
              <Text style={s.actionText}>SIGN IN</Text>
              <Ionicons name="arrow-forward" size={17} color={C.ink} />
            </Pressable>
          </View>
        ) : (
          <>
            <View style={s.accountRow}>
              <Ionicons name="mail-outline" size={16} color={C.muted} />
              <Text style={s.accountEmail}>{user.email}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Refresh tickets"
                disabled={refreshing || loading}
                onPress={() => void loadTickets(undefined, true)}
                style={s.refreshButton}
              >
                {refreshing ? <ActivityIndicator size="small" color={C.neon} /> : <Ionicons name="refresh" size={17} color={C.neon} />}
              </Pressable>
            </View>

            <View style={s.tabs}>
              {(["upcoming", "past"] as const).map((value) => (
                <Pressable
                  key={value}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: tab === value }}
                  onPress={() => setTab(value)}
                  style={[s.tab, tab === value && s.tabActive]}
                >
                  <Text style={[s.tabText, tab === value && s.tabTextActive]}>
                    {value === "upcoming" ? "UPCOMING" : "PAST / USED"}
                  </Text>
                </Pressable>
              ))}
            </View>

            {loading ? (
              <View style={s.stateCard}>
                <ActivityIndicator color={C.neon} />
                <Text style={s.stateCopy}>Loading current ticket details...</Text>
              </View>
            ) : error && !tickets.length ? (
              <View style={s.emptyCard}>
                <Ionicons name="alert-circle-outline" size={27} color="#FF8D82" />
                <Text style={s.emptyCopy}>{error}</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void loadTickets(undefined, true)}
                  style={s.retryButton}
                >
                  <Text style={s.retryText}>TRY AGAIN</Text>
                </Pressable>
              </View>
            ) : tickets.length ? (
              <View style={s.ticketList}>
                {tickets.map(({ order, ticket }) => {
                  const ticketDate = formatDate(ticket.date ?? order.event.date, order.event.timezone);
                  const unlockDate = formatDate(ticket.unlocksAt, order.event.timezone);
                  const scannedDate = formatDate(ticket.scannedAt, order.event.timezone);
                  return (
                    <View key={ticket.id} style={s.ticketCard}>
                      <View style={s.cardTop}>
                        <View style={s.ticketIcon}>
                          <Image
                            source={require("@/assets/images/stret-bite.png")}
                            style={s.ticketIconImage}
                            resizeMode="contain"
                            accessibilityLabel="Stret Bite"
                          />
                        </View>
                        <View style={s.cardHeading}>
                          <Text style={s.ticketEyebrow}>STREET SOUK PASS</Text>
                          <Text style={s.eventName}>{order.event.name}</Text>
                        </View>
                        <View style={[s.statusBadge, ticket.status === "VALID" && s.statusValid]}>
                          <View style={[s.statusDot, ticket.status === "VALID" && s.statusDotValid]} />
                          <Text style={[s.statusText, ticket.status === "VALID" && s.statusTextValid]}>
                            {ticket.status === "VALID" ? "VALID" : statusLabel(ticket.status)}
                          </Text>
                        </View>
                      </View>

                      <Text style={s.ticketName}>{ticket.name || order.ticketName}</Text>
                      <View style={s.separator} />

                      {!!ticketDate && (
                        <View style={s.eventDate}>
                          <Ionicons name="calendar-outline" size={17} color={C.muted} />
                          <View style={s.detailCopy}>
                            <Text style={s.detailLabel}>EVENT DATE</Text>
                            <Text style={s.eventDateText}>{ticketDate}</Text>
                          </View>
                        </View>
                      )}

                      {ticket.status === "VALID" && ticket.qrCode ? (
                        <View style={s.qrPanel}>
                          <View style={s.qrFrame}>
                            <QRCode value={ticket.qrCode} size={196} backgroundColor="#FFFFFF" color="#050505" />
                          </View>
                          <Text style={s.qrCaption}>Show this code at the venue entrance</Text>
                        </View>
                      ) : ticket.status === "LOCKED" ? (
                        <View style={s.ticketNote}>
                          <Ionicons name="lock-closed-outline" size={17} color={C.muted} />
                          <Text style={s.ticketNoteText}>
                            {unlockDate ? `Your entry code unlocks ${unlockDate}.` : "Your entry code is not available yet."}
                          </Text>
                        </View>
                      ) : ticket.status === "USED" ? (
                        <View style={s.ticketNote}>
                          <Ionicons name="checkmark-circle-outline" size={17} color={C.muted} />
                          <Text style={s.ticketNoteText}>
                            {scannedDate ? `Scanned ${scannedDate}.` : "This ticket has already been scanned."}
                          </Text>
                        </View>
                      ) : ticket.status === "TRANSFER_PENDING" ? (
                        <View style={s.ticketNote}>
                          <Ionicons name="git-compare-outline" size={17} color={C.muted} />
                          <Text style={s.ticketNoteText}>
                            Transfer pending. The ticket can be used after the recipient accepts it or the transfer is cancelled.
                          </Text>
                        </View>
                      ) : (
                        <View style={s.ticketNote}>
                          <Ionicons name="information-circle-outline" size={17} color={C.muted} />
                          <Text style={s.ticketNoteText}>Refresh this page for the latest ticket status.</Text>
                        </View>
                      )}

                      <View style={s.separator} />
                      <View style={s.metaRow}>
                        <View style={s.metaItem}>
                          <Ionicons name="ticket-outline" size={17} color={C.muted} />
                          <View style={s.detailCopy}>
                            <Text style={s.detailLabel}>TICKET</Text>
                            <Text numberOfLines={1} style={s.metaValue}>{ticket.name || order.ticketName}</Text>
                          </View>
                        </View>
                        <View style={s.metaItem}>
                          <Ionicons name="receipt-outline" size={17} color={C.muted} />
                          <View style={s.detailCopy}>
                            <Text style={s.detailLabel}>ORDER</Text>
                            <Text numberOfLines={1} style={s.metaValue}>{order.id}</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : error ? (
              <View style={s.emptyCard}>
                <Ionicons name="alert-circle-outline" size={27} color="#FF8D82" />
                <Text style={s.emptyCopy}>{error}</Text>
                <Pressable onPress={() => void loadTickets(undefined, true)} style={s.retryButton}>
                  <Text style={s.retryText}>TRY AGAIN</Text>
                </Pressable>
              </View>
            ) : (
              <View style={s.emptyCard}>
                <Image
                  source={require("@/assets/images/stret-bite.png")}
                  style={s.emptyTicketImage}
                  resizeMode="contain"
                  accessibilityLabel="Stret Bite"
                />
                <Text style={s.emptyTitle}>{tab === "upcoming" ? "No upcoming tickets" : "No past tickets"}</Text>
                <Text style={s.emptyCopy}>
                  {tab === "upcoming"
                    ? "Tickets you bought or received for upcoming events will appear here."
                    : "Used tickets and tickets for past events will appear here."}
                </Text>
              </View>
            )}

            {!!error && !!tickets.length && <Text style={s.inlineError}>{error}</Text>}
            {!!nextCursor && !loading && (
              <Pressable
                accessibilityRole="button"
                disabled={loadingMore}
                onPress={() => void loadTickets(nextCursor)}
                style={s.loadMore}
              >
                {loadingMore ? <ActivityIndicator color={C.neon} /> : <Text style={s.retryText}>LOAD MORE</Text>}
              </Pressable>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#050705" },
  content: { padding: 20, paddingBottom: 48 },
  kicker: { color: C.neon, fontFamily: F.mono, fontSize: 9, letterSpacing: 1.2 },
  title: { color: "#F6F7F5", fontFamily: F.bodyBold, fontSize: 34, letterSpacing: -0.8, marginTop: 8 },
  intro: { color: "#A5AAA5", fontFamily: F.body, fontSize: 15, lineHeight: 21, marginTop: 5, marginBottom: 20 },
  accountRow: { minHeight: 46, flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 18, paddingHorizontal: 13, borderRadius: 14, backgroundColor: "#111411" },
  accountEmail: { flex: 1, color: "#C3C8C2", fontFamily: F.body, fontSize: 12 },
  refreshButton: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 18 },
  tabs: { flexDirection: "row", padding: 4, marginBottom: 18, borderRadius: 14, backgroundColor: "#111411" },
  tab: { flex: 1, alignItems: "center", paddingVertical: 11, borderRadius: 11 },
  tabActive: { backgroundColor: "#252B24" },
  tabText: { color: "#929891", fontFamily: F.bodyBold, fontSize: 12 },
  tabTextActive: { color: "#F6F7F5" },
  ticketList: { gap: 16 },
  ticketCard: { padding: 18, borderRadius: 25, borderWidth: 1, borderColor: "#283328", backgroundColor: "#0D100D" },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 11 },
  ticketIcon: { width: 40, height: 40, alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: 12, backgroundColor: "#151D14" },
  ticketIconImage: { width: 38, height: 38 },
  emptyTicketImage: { width: 48, height: 48 },
  cardHeading: { flex: 1, gap: 3 },
  ticketEyebrow: { color: "#A0A79F", fontFamily: F.mono, fontSize: 8, letterSpacing: 0.7 },
  eventName: { color: "#F6F7F5", fontFamily: F.bodyBold, fontSize: 17 },
  ticketName: { color: "#B9BFB8", fontFamily: F.body, fontSize: 13, marginTop: 13 },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 9, paddingVertical: 7, borderRadius: 15, borderWidth: 1, borderColor: "#454B44" },
  statusValid: { borderColor: "#467D21", backgroundColor: "#101A0B" },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#929891" },
  statusDotValid: { backgroundColor: C.neon },
  statusText: { color: "#B0B6AF", fontFamily: F.bodyBold, fontSize: 9 },
  statusTextValid: { color: C.neon },
  separator: { height: 1, marginTop: 16, backgroundColor: "#282D28" },
  eventDate: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginTop: 15 },
  detailCopy: { flex: 1, gap: 4 },
  detailLabel: { color: "#929891", fontFamily: F.bodyBold, fontSize: 9, letterSpacing: 0.5 },
  eventDateText: { flex: 1, color: "#F0F2EF", fontFamily: F.bodyBold, fontSize: 13, lineHeight: 18 },
  qrPanel: { alignItems: "center", paddingVertical: 18, marginTop: 14, borderRadius: 18, backgroundColor: "#090B09" },
  qrFrame: { padding: 9, borderRadius: 16, backgroundColor: "#FFFFFF" },
  qrCaption: { color: "#A5AAA5", fontFamily: F.body, fontSize: 12, textAlign: "center", marginTop: 12 },
  metaRow: { flexDirection: "row", gap: 14, marginTop: 15 },
  metaItem: { flex: 1, flexDirection: "row", alignItems: "flex-start", gap: 9 },
  metaValue: { color: "#F0F2EF", fontFamily: F.bodyBold, fontSize: 12 },
  ticketNote: { flexDirection: "row", alignItems: "center", gap: 9, padding: 13, marginTop: 14, borderRadius: 13, backgroundColor: "#151815" },
  ticketNoteText: { flex: 1, color: "#D1D5D0", fontFamily: F.body, fontSize: 13, lineHeight: 18 },
  stateCard: { minHeight: 120, gap: 12, alignItems: "center", justifyContent: "center", borderRadius: 20, backgroundColor: "#111411" },
  stateCopy: { color: "#A5AAA5", fontFamily: F.body, fontSize: 13 },
  emptyCard: { alignItems: "center", gap: 11, padding: 22, borderRadius: 20, backgroundColor: "#111411" },
  emptyTitle: { color: "#F6F7F5", fontFamily: F.bodyBold, fontSize: 19, textAlign: "center" },
  emptyCopy: { color: "#A5AAA5", fontFamily: F.body, fontSize: 14, lineHeight: 20, textAlign: "center" },
  actionButton: { minHeight: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9, paddingHorizontal: 18, marginTop: 5, borderRadius: 24, backgroundColor: C.neon },
  actionText: { color: C.ink, fontFamily: F.bodyBold, fontSize: 13 },
  retryButton: { paddingHorizontal: 16, paddingVertical: 10, marginTop: 4, borderRadius: 16, borderWidth: 1, borderColor: C.neon },
  retryText: { color: C.neon, fontFamily: F.bodyBold, fontSize: 12 },
  loadMore: { minHeight: 46, alignItems: "center", justifyContent: "center", marginTop: 14, borderRadius: 23, borderWidth: 1, borderColor: "#467D21" },
  inlineError: { color: "#FF8D82", fontFamily: F.body, fontSize: 12, textAlign: "center", marginTop: 10 },
});
