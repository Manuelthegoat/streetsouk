import type { Vendor } from "@/lib/types";

export const MAP_WIDTH = 1600;
export const MAP_HEIGHT = 1120;

export type MapCategory =
  | "STAGE"
  | "VENDOR"
  | "FOOD"
  | "ACTIVITY"
  | "SERVICE"
  | "AMENITY"
  | "ACCESSIBILITY"
  | "ENTRANCE"
  | "EXIT"
  | "WATER"
  | "TRANSPORT";

export type MapPoint = { x: number; y: number };
export type MapPlace = MapPoint & {
  id: string;
  name: string;
  category: MapCategory;
  icon: string;
  detail?: string;
  boothCode?: string;
  accessNode: string;
  connector: MapPoint[];
};

type PlaceSeed = Omit<MapPlace, "connector"> & {
  approach?: MapPoint[];
};

const accessNodes: Record<string, { point: MapPoint; name: string }> = {
  entry: { point: { x: 800, y: 185 }, name: "Main Entry" },
  north: { point: { x: 800, y: 300 }, name: "North Walkway" },
  center: { point: { x: 800, y: 535 }, name: "Main Spine" },
  stage: { point: { x: 640, y: 535 }, name: "Stage Walkway" },
  west: { point: { x: 150, y: 535 }, name: "West Walkway" },
  east: { point: { x: 1450, y: 535 }, name: "East Walkway" },
  south: { point: { x: 800, y: 820 }, name: "South Walkway" },
  southGate: { point: { x: 800, y: 900 }, name: "South Gate" },
};

type RouteEdge = {
  from: string;
  to: string;
  points: MapPoint[];
  forward: string;
  backward: string;
};

const routeEdges: RouteEdge[] = [
  {
    from: "entry",
    to: "north",
    points: [{ x: 800, y: 185 }, { x: 800, y: 300 }],
    forward: "Head south from the Main Entry along the central access road.",
    backward: "Head north along the central access road to the Main Entry.",
  },
  {
    from: "north",
    to: "center",
    points: [{ x: 800, y: 300 }, { x: 800, y: 535 }],
    forward: "Continue south to the Main Spine.",
    backward: "Follow the Main Spine north toward the North Walkway.",
  },
  {
    from: "center",
    to: "stage",
    points: [{ x: 800, y: 535 }, { x: 640, y: 535 }],
    forward: "Follow the Main Spine west toward the stage area.",
    backward: "Follow the Main Spine east toward the central wayfinding point.",
  },
  {
    from: "stage",
    to: "west",
    points: [{ x: 640, y: 535 }, { x: 150, y: 535 }],
    forward: "Continue west along the Main Spine toward the West Exit.",
    backward: "Follow the Main Spine east toward the stage walkway.",
  },
  {
    from: "center",
    to: "east",
    points: [{ x: 800, y: 535 }, { x: 1450, y: 535 }],
    forward: "Follow the Main Spine east toward the East Exit.",
    backward: "Follow the Main Spine west toward the central wayfinding point.",
  },
  {
    from: "center",
    to: "south",
    points: [{ x: 800, y: 535 }, { x: 800, y: 820 }],
    forward: "Head south on the central walkway toward South Gate.",
    backward: "Head north on the central walkway toward the Main Spine.",
  },
  {
    from: "south",
    to: "southGate",
    points: [{ x: 800, y: 820 }, { x: 800, y: 900 }],
    forward: "Continue south to South Gate.",
    backward: "Walk north from South Gate toward the central walkway.",
  },
];

function makePlace(seed: PlaceSeed): MapPlace {
  const access = accessNodes[seed.accessNode].point;
  const defaultApproach =
    access.x === seed.x || access.y === seed.y
      ? []
      : [{ x: seed.x, y: access.y }];
  const connector = [access, ...(seed.approach ?? defaultApproach), { x: seed.x, y: seed.y }]
    .filter((point, index, all) =>
      index === 0 || point.x !== all[index - 1].x || point.y !== all[index - 1].y,
    );
  return { ...seed, connector };
}

const placeSeeds: PlaceSeed[] = [
  { id: "main-entry", name: "Main Entry", category: "ENTRANCE", icon: "enter-outline", x: 800, y: 145, accessNode: "entry", detail: "Tickets and bag check" },
  { id: "west-exit", name: "West Exit", category: "EXIT", icon: "exit-outline", x: 60, y: 535, accessNode: "west" },
  { id: "east-exit", name: "East Exit", category: "EXIT", icon: "exit-outline", x: 1535, y: 535, accessNode: "east" },
  { id: "south-emergency-exit", name: "South Emergency Exit", category: "EXIT", icon: "exit-outline", x: 800, y: 1040, accessNode: "southGate" },
  { id: "accessible-drop-off", name: "Accessible Drop-Off", category: "ACCESSIBILITY", icon: "accessibility-outline", x: 350, y: 967, accessNode: "west", detail: "Step-free route and staff assistance", approach: [{ x: 150, y: 900 }, { x: 350, y: 900 }] },
  { id: "main-stage", name: "Main Stage", category: "STAGE", icon: "musical-notes-outline", x: 360, y: 325, accessNode: "stage", detail: "North Stage Arena", approach: [{ x: 640, y: 325 }] },
  { id: "vip-viewing", name: "VIP Viewing", category: "STAGE", icon: "star-outline", x: 245, y: 404, accessNode: "stage", detail: "Wristband access", approach: [{ x: 640, y: 404 }] },
  { id: "accessible-viewing", name: "Accessible Viewing", category: "ACCESSIBILITY", icon: "accessibility-outline", x: 468, y: 404, accessNode: "stage", detail: "Step-free platform", approach: [{ x: 640, y: 404 }] },
  { id: "side-stage", name: "Side Stage", category: "STAGE", icon: "musical-notes-outline", x: 265, y: 770, accessNode: "west", detail: "Sound / Culture Stage", approach: [{ x: 150, y: 770 }] },
  { id: "quiet-zone", name: "Quiet Zone", category: "AMENITY", icon: "volume-mute-outline", x: 495, y: 770, accessNode: "west", detail: "Low-volume rest area", approach: [{ x: 150, y: 770 }] },
  { id: "vendor-v01", name: "Threads · V01", category: "VENDOR", icon: "shirt-outline", x: 731, y: 310, accessNode: "north", boothCode: "V01", detail: "Streetwear Vendor Village", approach: [{ x: 800, y: 430 }, { x: 731, y: 430 }] },
  { id: "vendor-v02", name: "Sneakers · V02", category: "VENDOR", icon: "shirt-outline", x: 836, y: 310, accessNode: "north", boothCode: "V02", detail: "Streetwear Vendor Village", approach: [{ x: 800, y: 430 }, { x: 836, y: 430 }] },
  { id: "vendor-v03", name: "Vintage · V03", category: "VENDOR", icon: "shirt-outline", x: 941, y: 310, accessNode: "north", boothCode: "V03", detail: "Streetwear Vendor Village", approach: [{ x: 800, y: 430 }, { x: 941, y: 430 }] },
  { id: "vendor-v04", name: "Design · V04", category: "VENDOR", icon: "shirt-outline", x: 731, y: 395, accessNode: "north", boothCode: "V04", detail: "Streetwear Vendor Village", approach: [{ x: 800, y: 430 }, { x: 731, y: 430 }] },
  { id: "vendor-v05", name: "Accessories · V05", category: "VENDOR", icon: "shirt-outline", x: 836, y: 395, accessNode: "north", boothCode: "V05", detail: "Streetwear Vendor Village", approach: [{ x: 800, y: 430 }, { x: 836, y: 430 }] },
  { id: "vendor-v06", name: "Custom · V06", category: "VENDOR", icon: "shirt-outline", x: 941, y: 395, accessNode: "north", boothCode: "V06", detail: "Streetwear Vendor Village", approach: [{ x: 800, y: 430 }, { x: 941, y: 430 }] },
  { id: "food-f01", name: "Grill · F01", category: "FOOD", icon: "restaurant-outline", x: 1141, y: 312, accessNode: "east", boothCode: "F01", detail: "Food Court", approach: [{ x: 1450, y: 450 }, { x: 1141, y: 450 }] },
  { id: "food-f02", name: "Rice & Bowls · F02", category: "FOOD", icon: "restaurant-outline", x: 1266, y: 312, accessNode: "east", boothCode: "F02", detail: "Food Court", approach: [{ x: 1450, y: 450 }, { x: 1266, y: 450 }] },
  { id: "food-f03", name: "Vegan Bites · F03", category: "FOOD", icon: "restaurant-outline", x: 1405, y: 312, accessNode: "east", boothCode: "F03", detail: "Food Court", approach: [{ x: 1450, y: 450 }, { x: 1405, y: 450 }] },
  { id: "food-f04", name: "Desserts · F04", category: "FOOD", icon: "restaurant-outline", x: 1141, y: 392, accessNode: "east", boothCode: "F04", detail: "Food Court", approach: [{ x: 1450, y: 450 }, { x: 1141, y: 450 }] },
  { id: "food-f05", name: "Coffee · F05", category: "FOOD", icon: "restaurant-outline", x: 1266, y: 392, accessNode: "east", boothCode: "F05", detail: "Food Court", approach: [{ x: 1450, y: 450 }, { x: 1266, y: 450 }] },
  { id: "food-f06", name: "Water & Juice · F06", category: "FOOD", icon: "restaurant-outline", x: 1405, y: 392, accessNode: "east", boothCode: "F06", detail: "Food Court", approach: [{ x: 1450, y: 450 }, { x: 1405, y: 450 }] },
  { id: "custom-lab", name: "Custom Lab", category: "ACTIVITY", icon: "color-palette-outline", x: 760, y: 679, accessNode: "center", detail: "Live printing", approach: [{ x: 800, y: 700 }] },
  { id: "photo-booth", name: "Photo Booth", category: "ACTIVITY", icon: "camera-outline", x: 922, y: 679, accessNode: "center", detail: "360° camera", approach: [{ x: 800, y: 700 }, { x: 922, y: 700 }] },
  { id: "community-lounge", name: "Community Lounge", category: "AMENITY", icon: "people-outline", x: 840, y: 780, accessNode: "center", detail: "Seating, charging and meet-up point", approach: [{ x: 800, y: 700 }] },
  { id: "info-desk", name: "Information & Lost and Found", category: "SERVICE", icon: "information-circle-outline", x: 1147, y: 674, accessNode: "east", approach: [{ x: 1450, y: 674 }, { x: 1147, y: 674 }] },
  { id: "first-aid", name: "First Aid", category: "SERVICE", icon: "medkit-outline", x: 1287, y: 674, accessNode: "east", approach: [{ x: 1450, y: 674 }, { x: 1287, y: 674 }] },
  { id: "security", name: "Security", category: "SERVICE", icon: "shield-outline", x: 1422, y: 674, accessNode: "east", approach: [{ x: 1450, y: 674 }, { x: 1422, y: 674 }] },
  { id: "official-merch", name: "Official Merch", category: "VENDOR", icon: "bag-outline", x: 1422, y: 764, accessNode: "east", detail: "Official goods", approach: [{ x: 1450, y: 700 }, { x: 1422, y: 700 }] },
  { id: "all-gender-restroom", name: "All-Gender Restroom", category: "AMENITY", icon: "male-female-outline", x: 710, y: 978, accessNode: "southGate", approach: [{ x: 800, y: 978 }] },
  { id: "accessible-restroom", name: "Accessible Restroom", category: "ACCESSIBILITY", icon: "accessibility-outline", x: 845, y: 978, accessNode: "southGate", approach: [{ x: 800, y: 978 }] },
  { id: "ride-pickup", name: "Ride Pick-Up", category: "TRANSPORT", icon: "car-outline", x: 1145, y: 984, accessNode: "southGate", approach: [{ x: 800, y: 984 }, { x: 1145, y: 984 }] },
  { id: "shuttle", name: "Shuttle", category: "TRANSPORT", icon: "bus-outline", x: 1280, y: 984, accessNode: "southGate", approach: [{ x: 800, y: 984 }, { x: 1280, y: 984 }] },
  { id: "bike-parking", name: "Bike Parking", category: "TRANSPORT", icon: "bicycle-outline", x: 1417, y: 984, accessNode: "southGate", approach: [{ x: 800, y: 984 }, { x: 1417, y: 984 }] },
  { id: "water-north-west", name: "Water Point · West", category: "WATER", icon: "water-outline", x: 625, y: 535, accessNode: "center" },
  { id: "water-north-east", name: "Water Point · East", category: "WATER", icon: "water-outline", x: 1035, y: 535, accessNode: "center" },
  { id: "water-south-west", name: "Water Point · South West", category: "WATER", icon: "water-outline", x: 625, y: 875, accessNode: "south", approach: [{ x: 800, y: 875 }] },
  { id: "water-south-east", name: "Water Point · South East", category: "WATER", icon: "water-outline", x: 1035, y: 875, accessNode: "south", approach: [{ x: 800, y: 875 }] },
  { id: "brand-wall", name: "Brand Wall", category: "ACTIVITY", icon: "image-outline", x: 197, y: 600, accessNode: "west", detail: "Photo and sponsor backdrop", approach: [{ x: 150, y: 600 }] },
  { id: "creator-pit", name: "Creator Pit", category: "ACTIVITY", icon: "videocam-outline", x: 372, y: 600, accessNode: "west", detail: "Interview point", approach: [{ x: 150, y: 600 }] },
  { id: "water-refill", name: "Water Refill", category: "WATER", icon: "water-outline", x: 545, y: 600, accessNode: "west", detail: "Free refill station", approach: [{ x: 150, y: 600 }] },
  { id: "wayfinding", name: "Map & Wayfinding", category: "SERVICE", icon: "map-outline", x: 875, y: 533, accessNode: "center" },
];

export const MAP_PLACES: MapPlace[] = placeSeeds.map(makePlace);

function normalizeBooth(value: string | null) {
  const match = value?.toUpperCase().match(/\b([VF])\s*0?(\d{1,2})\b/);
  return match ? `${match[1]}${match[2].padStart(2, "0")}` : null;
}

export function placesWithVendors(vendors: Vendor[]) {
  const byBooth = new Map<string, Vendor[]>();
  for (const vendor of vendors) {
    const boothCode = normalizeBooth(vendor.booth);
    if (!boothCode) continue;
    const matches = byBooth.get(boothCode) ?? [];
    matches.push(vendor);
    byBooth.set(boothCode, matches);
  }

  return MAP_PLACES.flatMap((place) => {
    if (!place.boothCode) return [place];
    const matches = byBooth.get(place.boothCode);
    if (!matches?.length) return [place];
    return matches.map((vendor) => ({
      ...place,
      id: `vendor-${vendor.id}`,
      name: vendor.name,
      detail: `Booth ${place.boothCode} · ${vendor.category}`,
    }));
  });
}

function distance(points: MapPoint[]) {
  return points.slice(1).reduce((total, point, index) => {
    const previous = points[index];
    return total + Math.hypot(point.x - previous.x, point.y - previous.y);
  }, 0);
}

function shortestPath(start: string, end: string) {
  if (start === end) return [];
  const distances = new Map<string, number>(
    Object.keys(accessNodes).map((node) => [node, Number.POSITIVE_INFINITY]),
  );
  const previous = new Map<string, { node: string; edge: RouteEdge; forward: boolean }>();
  const pending = new Set(Object.keys(accessNodes));
  distances.set(start, 0);

  while (pending.size) {
    let current: string | undefined;
    for (const candidate of pending) {
      if (current === undefined || distances.get(candidate)! < distances.get(current)!) {
        current = candidate;
      }
    }
    if (current === undefined || distances.get(current) === Number.POSITIVE_INFINITY) break;
    pending.delete(current);
    if (current === end) break;

    for (const edge of routeEdges) {
      const forward = edge.from === current;
      const backward = edge.to === current;
      if (!forward && !backward) continue;
      const next = forward ? edge.to : edge.from;
      if (!pending.has(next)) continue;
      const cost = distance(edge.points);
      const alternative = distances.get(current)! + cost;
      if (alternative < distances.get(next)!) {
        distances.set(next, alternative);
        previous.set(next, { node: current, edge, forward });
      }
    }
  }

  const legs: { edge: RouteEdge; forward: boolean }[] = [];
  let cursor = end;
  while (cursor !== start) {
    const step = previous.get(cursor);
    if (!step) return [];
    legs.push({ edge: step.edge, forward: step.forward });
    cursor = step.node;
  }
  return legs.reverse();
}

function joinPaths(paths: MapPoint[][]) {
  return paths.flat().filter((point, index, all) => {
    if (index === 0) return true;
    const previous = all[index - 1];
    return point.x !== previous.x || point.y !== previous.y;
  });
}

export function getDirections(from: MapPlace, to: MapPlace) {
  if (from.id === to.id) {
    return { points: [from], steps: ["You are already at this location."] };
  }

  const legs = shortestPath(from.accessNode, to.accessNode);
  const paths: MapPoint[][] = [[...from.connector].reverse()];
  const steps = [`Start at ${from.name}.`];

  if (from.accessNode !== to.accessNode && !legs.length) return null;

  for (const leg of legs) {
    paths.push(leg.forward ? leg.edge.points : [...leg.edge.points].reverse());
    steps.push(leg.forward ? leg.edge.forward : leg.edge.backward);
  }

  paths.push(to.connector);
  steps.push(`Follow the local aisle to ${to.name}${to.detail ? ` (${to.detail})` : ""}.`);

  return { points: joinPaths(paths), steps };
}
