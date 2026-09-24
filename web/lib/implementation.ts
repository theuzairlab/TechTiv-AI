export const IMPLEMENTATION_STATUSES = [
  "REQUESTED",
  "REVIEWING",
  "SCOPING",
  "IN_PROGRESS",
  "DELIVERED",
  "CLOSED",
] as const;

export type ImplementationStatus = (typeof IMPLEMENTATION_STATUSES)[number];

export const implementationStatusLabels: Record<ImplementationStatus, string> = {
  REQUESTED: "Requested",
  REVIEWING: "Reviewing",
  SCOPING: "Scoping",
  IN_PROGRESS: "In progress",
  DELIVERED: "Delivered",
  CLOSED: "Closed",
};

export const implementationStatusVariants: Record<
  ImplementationStatus,
  "cyan" | "violet" | "lime" | "rose" | "default"
> = {
  REQUESTED: "cyan",
  REVIEWING: "violet",
  SCOPING: "violet",
  IN_PROGRESS: "lime",
  DELIVERED: "lime",
  CLOSED: "default",
};

export const implementationStatusHelp: Record<ImplementationStatus, string> = {
  REQUESTED: "New request — pick this up and contact the client",
  REVIEWING: "We're reviewing what they asked for",
  SCOPING: "We're defining the build plan",
  IN_PROGRESS: "The team is building it",
  DELIVERED: "Ready for the client to use",
  CLOSED: "Finished and closed",
};
