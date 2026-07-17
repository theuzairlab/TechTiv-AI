"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  defaultWorkflowPositions,
  workflowEdges,
  workflowPipeline,
  type NodePosition,
} from "@/lib/workflow";
import { WorkflowNodeCard } from "@/components/sections/workflow/workflow-node-card";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { cn } from "@/lib/utils";

type LineCoords = {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
};

type DragState = {
  id: string;
  offsetX: number;
  offsetY: number;
};

const EXECUTION_STEP_MS = 900;

export function WorkflowCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [positions, setPositions] = useState(defaultWorkflowPositions);
  const [dragOffsets, setDragOffsets] = useState<Record<string, NodePosition>>({});
  const [lines, setLines] = useState<LineCoords[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [dragging, setDragging] = useState<DragState | null>(null);

  const updateLines = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const nextLines: LineCoords[] = [];

    for (const edge of workflowEdges) {
      const fromEl = nodeRefs.current[edge.from];
      const toEl = nodeRefs.current[edge.to];
      if (!fromEl || !toEl) continue;

      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();

      nextLines.push({
        id: `${edge.from}-${edge.to}`,
        x1: fromRect.left + fromRect.width / 2 - containerRect.left,
        y1: fromRect.top + fromRect.height / 2 - containerRect.top,
        x2: toRect.left + toRect.width / 2 - containerRect.left,
        y2: toRect.top + toRect.height / 2 - containerRect.top,
      });
    }

    setLines(nextLines);
  }, []);

  useEffect(() => {
    updateLines();
    window.addEventListener("resize", updateLines);
    return () => window.removeEventListener("resize", updateLines);
  }, [positions, dragOffsets, updateLines]);

  const runWorkflow = useCallback(() => {
    if (isRunning) return;
    setIsRunning(true);
    setActiveStep(0);

    let step = 0;
    const interval = window.setInterval(() => {
      step += 1;
      if (step >= workflowPipeline.length) {
        window.clearInterval(interval);
        window.setTimeout(() => {
          setIsRunning(false);
          setActiveStep(-1);
        }, 1200);
        return;
      }
      setActiveStep(step);
    }, EXECUTION_STEP_MS);
  }, [isRunning]);

  const resetLayout = () => {
    setPositions(defaultWorkflowPositions);
    setDragOffsets({});
    setActiveStep(-1);
    setIsRunning(false);
    requestAnimationFrame(updateLines);
  };

  const handlePointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
    id: string,
  ) => {
    if (isRunning) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging({
      id,
      offsetX: event.clientX,
      offsetY: event.clientY,
    });
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const dx = ((event.clientX - dragging.offsetX) / containerRect.width) * 100;
    const dy = ((event.clientY - dragging.offsetY) / containerRect.height) * 100;

    setDragOffsets((prev) => ({
      ...prev,
      [dragging.id]: {
        x: (prev[dragging.id]?.x ?? 0) + dx,
        y: (prev[dragging.id]?.y ?? 0) + dy,
      },
    }));

    setDragging({
      id: dragging.id,
      offsetX: event.clientX,
      offsetY: event.clientY,
    });

    requestAnimationFrame(updateLines);
  };

  const handlePointerUp = () => {
    if (!dragging) return;

    setPositions((prev) => {
      const offset = dragOffsets[dragging.id] ?? { x: 0, y: 0 };
      const base = prev[dragging.id] ?? defaultWorkflowPositions[dragging.id];
      return {
        ...prev,
        [dragging.id]: {
          x: Math.min(92, Math.max(2, base.x + offset.x)),
          y: Math.min(78, Math.max(8, base.y + offset.y)),
        },
      };
    });

    setDragOffsets((prev) => {
      const next = { ...prev };
      delete next[dragging.id];
      return next;
    });

    setDragging(null);
    requestAnimationFrame(updateLines);
  };

  const getNodePosition = (id: string): NodePosition => {
    const base = positions[id] ?? defaultWorkflowPositions[id];
    const offset = dragOffsets[id] ?? { x: 0, y: 0 };
    return { x: base.x + offset.x, y: base.y + offset.y };
  };

  const activeEdgeIndex = activeStep >= 1 ? activeStep - 1 : activeStep === 0 ? 0 : -1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm text-text-muted">
          <span className="ui-dot flex h-2 w-2 rounded-full" />
          Drag nodes to rearrange · Click run to simulate execution
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={resetLayout} disabled={isRunning}>
            Reset Layout
          </Button>
          <Button size="sm" onClick={runWorkflow} disabled={isRunning}>
            {isRunning ? "Running…" : "▶ Run Workflow"}
          </Button>
        </div>
      </div>

      <GlassPanel className="relative overflow-hidden p-4 sm:p-6">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-grid opacity-30"
        />

        <div
          ref={containerRef}
          className="relative min-h-[420px] w-full md:min-h-[480px]"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <svg className="pointer-events-none absolute inset-0 h-full w-full">
            {lines.map((line, index) => {
              const isActive =
                isRunning &&
                (index === activeEdgeIndex ||
                  index < activeEdgeIndex);
              const isPulse = isRunning && index === activeEdgeIndex;

              const midX = (line.x1 + line.x2) / 2;
              const cpY = Math.min(line.y1, line.y2) - 40;

              return (
                <g key={line.id}>
                  <path
                    d={`M ${line.x1} ${line.y1} Q ${midX} ${cpY} ${line.x2} ${line.y2}`}
                    fill="none"
                    stroke="var(--accent-cyan)"
                    strokeWidth={isActive ? 2 : 1.5}
                    strokeOpacity={isActive ? 0.5 : 0.15}
                  />
                  {isPulse ? (
                    <circle r="4" fill="var(--accent-cyan)">
                      <animateMotion
                        dur={`${EXECUTION_STEP_MS}ms`}
                        repeatCount="1"
                        fill="freeze"
                        path={`M ${line.x1} ${line.y1} Q ${midX} ${cpY} ${line.x2} ${line.y2}`}
                      />
                      <animate
                        attributeName="opacity"
                        values="0;1;1;0"
                        dur={`${EXECUTION_STEP_MS}ms`}
                        repeatCount="1"
                      />
                    </circle>
                  ) : null}
                </g>
              );
            })}
          </svg>

          {workflowPipeline.map((node, index) => {
            const pos = getNodePosition(node.id);
            const isActive = isRunning && activeStep === index;
            const isExecuted = isRunning && activeStep > index;
            const isHovered = hoveredId === node.id;

            return (
              <div
                key={node.id}
                ref={(el) => {
                  nodeRefs.current[node.id] = el;
                }}
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2 touch-none"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                }}
                onPointerDown={(event) => handlePointerDown(event, node.id)}
              >
                <WorkflowNodeCard
                  node={node}
                  active={isActive || isHovered}
                  executed={isExecuted}
                  isRunning={isRunning}
                  onPointerEnter={() => setHoveredId(node.id)}
                  onPointerLeave={() => setHoveredId(null)}
                />
              </div>
            );
          })}
        </div>

        {isRunning && activeStep >= 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-center gap-3 rounded-xl border border-accent-cyan/30 bg-accent-cyan/5 px-4 py-3"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-cyan opacity-60" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent-cyan" />
            </span>
            <p className="text-sm text-text-primary">
              Executing:{" "}
              <span className="font-medium text-accent-cyan">
                {workflowPipeline[activeStep]?.label}
              </span>
            </p>
          </motion.div>
        ) : null}
      </GlassPanel>

      {/* Mobile-friendly vertical step list */}
      <ol className="grid gap-2 md:hidden">
        {workflowPipeline.map((node, index) => (
          <li
            key={node.id}
            className={cn(
              "flex items-center gap-3 rounded-xl border border-glass-border bg-bg-secondary/50 px-4 py-3 text-sm",
              isRunning && activeStep === index && "border-accent-cyan/40 bg-accent-cyan/5",
            )}
          >
            <span className="text-base">{node.icon}</span>
            <span className="text-text-primary">{node.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
