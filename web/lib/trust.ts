export const globalRegions = [
  { id: "usa", label: "USA", lat: 40.7, lng: -74.0 },
  { id: "uk", label: "UK", lat: 51.5, lng: -0.1 },
  { id: "europe", label: "Europe", lat: 52.5, lng: 13.4 },
  { id: "middle-east", label: "Middle East", lat: 25.2, lng: 55.3 },
  { id: "australia", label: "Australia", lat: -33.9, lng: 151.2 },
] as const;

const hub = globalRegions[0];

export const worldMapConnections = globalRegions.slice(1).map((region) => ({
  start: { lat: hub.lat, lng: hub.lng, label: hub.label },
  end: { lat: region.lat, lng: region.lng, label: region.label },
}));

export const clientLogos = [
  { name: "NordScale", initials: "NS" },
  { name: "Vertex Labs", initials: "VL" },
  { name: "Apex Realty", initials: "AR" },
  { name: "Pulse Health", initials: "PH" },
  { name: "Meridian SaaS", initials: "MS" },
  { name: "Catalyst Agency", initials: "CA" },
] as const;

export const complianceBadges = [
  {
    id: "gdpr",
    label: "GDPR",
    description: "EU data protection compliant",
  },
  {
    id: "soc2",
    label: "SOC 2",
    description: "Enterprise security standards",
  },
  {
    id: "enterprise-security",
    label: "Enterprise Security",
    description: "Bank-grade infrastructure",
  },
  {
    id: "ai-safety",
    label: "AI Safety Standards",
    description: "Responsible AI practices",
  },
] as const;
