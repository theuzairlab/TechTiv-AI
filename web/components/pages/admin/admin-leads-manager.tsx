"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  Mail,
  Phone,
  Building2,
  Trash2,
  Search,
  X,
  Save,
  User,
  StickyNote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { AdminPageHeader } from "@/components/pages/admin/admin-page-header";
import { LeadStatusBadge } from "@/components/pages/admin/lead-status-badge";
import {
  formatLeadInterest,
  LEAD_STATUSES,
  leadStatusLabels,
  type LeadStatus,
} from "@/lib/leads";
import {
  formatDiscoveryAnswers,
  formatLeadDate,
  formatMetadata,
  formatRelativeTime,
  getSourceLabel,
} from "@/lib/leads-format";
import { cn } from "@/lib/utils";

export type LeadRecord = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  phone: string | null;
  industry: string | null;
  interest: string | null;
  message: string | null;
  notes: string | null;
  status: LeadStatus;
  source: string;
  discoveryAnswers: unknown;
  metadata: unknown;
  createdAt: string;
};

const selectClassName =
  "h-11 w-full rounded-xl border border-glass-border bg-bg-secondary/80 px-4 text-sm text-text-primary backdrop-blur-sm transition-colors focus:border-accent-cyan/50 focus:outline-none focus:ring-2 focus:ring-accent-cyan/20";

type AdminLeadsManagerProps = {
  initialLeads: LeadRecord[];
  statusCounts: Record<string, number>;
};

export function AdminLeadsManager({
  initialLeads,
  statusCounts,
}: AdminLeadsManagerProps) {
  const searchParams = useSearchParams();
  const [leads, setLeads] = useState(initialLeads);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "ALL">("ALL");
  const [status, setStatus] = useState<LeadStatus>("NEW");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const selectedLead = useMemo(
    () => leads.find((lead) => lead.id === selectedId) ?? null,
    [leads, selectedId],
  );

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesStatus = statusFilter === "ALL" || lead.status === statusFilter;
      const matchesSearch =
        !query ||
        lead.name.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query) ||
        (lead.company?.toLowerCase().includes(query) ?? false);
      return matchesStatus && matchesSearch;
    });
  }, [leads, search, statusFilter]);

  const openLead = useCallback((lead: LeadRecord) => {
    setSelectedId(lead.id);
    setStatus(lead.status);
    setNotes(lead.notes ?? "");
    setError(null);
    setSaved(false);
    setShowDeleteConfirm(false);
  }, []);

  useEffect(() => {
    const leadId = searchParams.get("lead");
    const statusParam = searchParams.get("status");
    if (statusParam && LEAD_STATUSES.includes(statusParam as LeadStatus)) {
      setStatusFilter(statusParam as LeadStatus);
    }
    if (!leadId) return;
    const lead = leads.find((item) => item.id === leadId);
    if (lead) openLead(lead);
  }, [searchParams, leads, openLead]);

  const hasChanges =
    selectedLead &&
    (status !== selectedLead.status || notes !== (selectedLead.notes ?? ""));

  const handleSave = async () => {
    if (!selectedId || !selectedLead) return;

    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const response = await fetch(`/api/leads/${selectedId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });

      const data = (await response.json()) as {
        lead?: LeadRecord;
        error?: string;
        details?: string;
      };

      if (!response.ok) {
        setError(data.details ?? data.error ?? "Failed to save changes");
        return;
      }

      if (data.lead) {
        const updated = {
          ...data.lead,
          createdAt: new Date(data.lead.createdAt).toISOString(),
        };
        setLeads((prev) =>
          prev.map((lead) => (lead.id === selectedId ? updated : lead)),
        );
        setSaved(true);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedId) return;

    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/leads/${selectedId}`, { method: "DELETE" });
      if (!response.ok) {
        setError("Failed to delete lead");
        return;
      }

      setLeads((prev) => prev.filter((lead) => lead.id !== selectedId));
      setSelectedId(null);
      setShowDeleteConfirm(false);
    } finally {
      setDeleting(false);
    }
  };

  const discoveryRows = selectedLead
    ? formatDiscoveryAnswers(selectedLead.discoveryAnswers)
    : [];
  const metadataRows = selectedLead ? formatMetadata(selectedLead.metadata) : [];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Lead management"
        description="Review submissions, update pipeline status, and save internal notes."
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(["NEW", "CONTACTED", "QUALIFIED", "PROPOSAL_SENT"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={cn(
              "rounded-2xl border p-4 text-left transition-all",
              statusFilter === s
                ? "border-brand-cyan/40 bg-brand-cyan/10 ring-1 ring-brand-cyan/20"
                : "border-border-subtle bg-bg-secondary/30 hover:border-border-highlight",
            )}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
              {leadStatusLabels[s]}
            </p>
            <p className="mt-1 font-display text-2xl font-bold text-text-primary">
              {statusCounts[s] ?? 0}
            </p>
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <GlassPanel variant="elevated" className="overflow-hidden">
          <div className="border-b border-border-subtle p-4">
            <div className="relative">
              <Search
                size={16}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                type="search"
                placeholder="Search name, email, company…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cn(selectClassName, "pl-10")}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <FilterChip
                active={statusFilter === "ALL"}
                onClick={() => setStatusFilter("ALL")}
                label={`All (${leads.length})`}
              />
              {LEAD_STATUSES.map((s) => (
                <FilterChip
                  key={s}
                  active={statusFilter === s}
                  onClick={() => setStatusFilter(s)}
                  label={leadStatusLabels[s]}
                />
              ))}
            </div>
          </div>

          <div className="max-h-[calc(100vh-20rem)] overflow-y-auto">
            {filteredLeads.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-sm text-text-muted">No leads match your filters.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border-subtle/60">
                {filteredLeads.map((lead) => {
                  const active = selectedId === lead.id;
                  return (
                    <li key={lead.id}>
                      <button
                        type="button"
                        onClick={() => openLead(lead)}
                        className={cn(
                          "w-full px-4 py-4 text-left transition-colors",
                          active ? "bg-brand-cyan/8" : "hover:bg-bg-secondary/30",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate font-medium text-text-primary">
                              {lead.name}
                            </p>
                            <p className="truncate text-sm text-text-muted">{lead.email}</p>
                            {lead.company ? (
                              <p className="mt-1 truncate text-xs text-text-muted">
                                {lead.company}
                              </p>
                            ) : null}
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-2">
                            <LeadStatusBadge status={lead.status} />
                            <span className="text-[10px] text-text-muted">
                              {formatRelativeTime(lead.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <p className="text-xs text-brand-cyan">
                            {getSourceLabel(lead.source)}
                          </p>
                          {lead.notes ? (
                            <span className="flex items-center gap-1 text-[10px] text-text-muted">
                              <StickyNote size={10} />
                              Note
                            </span>
                          ) : null}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </GlassPanel>

        <GlassPanel variant="elevated" className="min-h-[28rem] p-0">
          {selectedLead ? (
            <div className="flex h-full flex-col">
              <div className="border-b border-border-subtle p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-display text-xl font-semibold text-text-primary">
                        {selectedLead.name}
                      </h2>
                      <LeadStatusBadge status={selectedLead.status} />
                    </div>
                    <p className="mt-1 text-sm text-text-muted">
                      Submitted {formatLeadDate(selectedLead.createdAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label="Close lead"
                    className="rounded-lg p-2 text-text-muted hover:bg-bg-secondary/60"
                    onClick={() => setSelectedId(null)}
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto p-5">
                <DetailRow icon={Mail} label="Email" value={selectedLead.email} />
                {selectedLead.phone ? (
                  <DetailRow icon={Phone} label="Phone" value={selectedLead.phone} />
                ) : null}
                {selectedLead.company ? (
                  <DetailRow icon={Building2} label="Company" value={selectedLead.company} />
                ) : null}
                {selectedLead.industry ? (
                  <DetailRow icon={User} label="Industry" value={selectedLead.industry} />
                ) : null}

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                    Source
                  </p>
                  <p className="mt-1 text-sm text-text-primary">
                    {getSourceLabel(selectedLead.source)}
                  </p>
                </div>

                {selectedLead.interest ? (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                      Interest
                    </p>
                    <p className="mt-1 text-sm text-text-primary">
                      {formatLeadInterest(selectedLead.interest)}
                    </p>
                  </div>
                ) : null}

                {selectedLead.message ? (
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
                      Message
                    </p>
                    <p className="mt-2 rounded-xl border border-border-subtle bg-bg-secondary/30 p-4 text-sm leading-relaxed text-text-primary">
                      {selectedLead.message}
                    </p>
                  </div>
                ) : null}

                {discoveryRows.length > 0 ? (
                  <InfoBlock title="Discovery profile" rows={discoveryRows} />
                ) : null}

                {metadataRows.length > 0 ? (
                  <InfoBlock title="Additional details" rows={metadataRows} />
                ) : null}
              </div>

              <div className="border-t border-border-subtle p-5">
                <div className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="lead-status"
                      className="text-sm font-medium text-text-primary"
                    >
                      Status
                    </label>
                    <select
                      id="lead-status"
                      className={selectClassName}
                      value={status}
                      onChange={(e) => {
                        setStatus(e.target.value as LeadStatus);
                        setSaved(false);
                      }}
                    >
                      {LEAD_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {leadStatusLabels[s]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="lead-notes"
                      className="flex items-center gap-1.5 text-sm font-medium text-text-primary"
                    >
                      <StickyNote size={14} className="text-brand-cyan" />
                      Internal notes
                    </label>
                    <textarea
                      id="lead-notes"
                      rows={3}
                      placeholder="Add follow-up notes for next time you review this lead…"
                      className={cn(selectClassName, "h-auto resize-none py-3")}
                      value={notes}
                      onChange={(e) => {
                        setNotes(e.target.value);
                        setSaved(false);
                      }}
                    />
                    <p className="text-xs text-text-muted">
                      Notes are only visible to admins, not the lead.
                    </p>
                  </div>
                </div>

                {showDeleteConfirm ? (
                  <div className="mt-4 rounded-xl border border-accent-rose/30 bg-accent-rose/5 p-4">
                    <p className="text-sm text-text-primary">
                      Delete this lead permanently?
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="bg-accent-rose text-white hover:bg-accent-rose/90"
                        disabled={deleting}
                        onClick={handleDelete}
                      >
                        {deleting ? "Deleting…" : "Confirm delete"}
                      </Button>
                    </div>
                  </div>
                ) : null}

                {error ? <p className="mt-3 text-sm text-accent-rose">{error}</p> : null}
                {saved ? (
                  <p className="mt-3 text-sm text-brand-cyan">Changes saved.</p>
                ) : null}

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button onClick={handleSave} disabled={saving || !hasChanges}>
                    <Save size={14} className="mr-2" />
                    {saving ? "Saving…" : "Save changes"}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 size={14} className="mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full min-h-[28rem] flex-col items-center justify-center p-8 text-center">
              <User size={32} className="mb-3 text-faint" />
              <p className="font-medium text-text-primary">Select a lead to review</p>
              <p className="mt-1 max-w-xs text-sm text-text-muted">
                Update status, add internal notes, or remove spam entries.
              </p>
            </div>
          )}
        </GlassPanel>
      </div>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active
          ? "border-brand-cyan/40 bg-brand-cyan/10 text-brand-cyan"
          : "border-border-subtle text-text-muted hover:text-text-primary",
      )}
    >
      {label}
    </button>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={16} className="mt-0.5 shrink-0 text-brand-cyan" />
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
          {label}
        </p>
        <p className="mt-0.5 text-sm text-text-primary">{value}</p>
      </div>
    </div>
  );
}

function InfoBlock({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; value: string }[];
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-text-muted">
        {title}
      </p>
      <dl className="mt-2 space-y-2 rounded-xl border border-border-subtle bg-bg-secondary/30 p-4">
        {rows.map((row) => (
          <div key={row.label} className="grid gap-1 sm:grid-cols-[120px_1fr]">
            <dt className="text-xs text-text-muted">{row.label}</dt>
            <dd className="text-sm text-text-primary">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
