"use client";

import {
	Calendar,
	CheckCircle2,
	ChevronDown,
	Clock,
	Copy,
	Cpu,
	FileOutput,
	MemoryStick,
	Play,
	Plus,
	RotateCcw,
	Server,
	Timer,
	X,
	XCircle,
	Zap,
} from "lucide-react";
import { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import {
	type ComputeCluster,
	computeClusters,
	type Pipeline,
	pipelines,
} from "@/data/mock";
import { cn, timeAgo, primaryBtnClass } from "@/lib/utils";

const statusConfig = {
	active: { dotColor: "bg-emerald-400", label: "Active" },
	paused: { dotColor: "bg-yellow-400", label: "Paused" },
	error: { dotColor: "bg-red-400", label: "Error" },
} as const;

const formatDuration = (ms: number) => {
	const s = Math.floor(ms / 1000);
	const m = Math.floor(s / 60);
	const remaining = s % 60;
	return m > 0 ? `${m}m ${remaining}s` : `${remaining}s`;
};

const PipelineCard = ({
	pipeline,
	isSelected,
	onSelect,
}: {
	pipeline: Pipeline;
	isSelected: boolean;
	onSelect: () => void;
}) => {
	const status = statusConfig[pipeline.status];

	return (
		<button
			type="button"
			onClick={onSelect}
			className={cn(
				"w-full text-left bg-bg-secondary border rounded-xl p-5 transition-colors",
				isSelected
					? "border-accent/40 bg-accent/3"
					: "border-border-subtle hover:border-border-default",
			)}
		>
			<div className="flex items-center justify-between">
				<span className="text-[15px] font-medium text-text-primary">
					{pipeline.name}
				</span>
				<span className="flex items-center gap-1.5 text-[11px] font-mono text-text-secondary">
					<span className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`} />
					{status.label}
				</span>
			</div>

			<p className="text-[13px] text-text-secondary mt-1 line-clamp-2">
				{pipeline.description}
			</p>

			<div className="flex items-center gap-5 mt-3">
				<div className="flex items-center gap-1.5">
					<Clock size={12} className="text-text-muted" />
					<span className="font-mono text-[11px] text-text-muted">
						{pipeline.schedule}
					</span>
				</div>
				<div className="flex items-center gap-1.5">
					<Play size={12} className="text-text-muted" />
					<span className="font-mono text-[11px] text-text-muted">
						{timeAgo(pipeline.lastRun)}
					</span>
				</div>
				<div className="flex items-center gap-1.5">
					<Timer size={12} className="text-text-muted" />
					<span className="font-mono text-[11px] text-text-muted">
						{formatDuration(pipeline.avgDuration)}
					</span>
				</div>
			</div>
		</button>
	);
};

const PythonCodeView = ({ code }: { code: string }) => {
	const lines = code.split("\n");

	return (
		<div className="font-mono text-[12px] leading-5 overflow-auto h-full">
			<table className="w-full border-collapse">
				<tbody>
					{lines.map((line, i) => (
						// biome-ignore lint/suspicious/noArrayIndexKey: stable list from code.split
						<tr key={`line-${i}`} className="hover:bg-white/5">
							<td className="text-right text-text-muted select-none px-4 py-0 w-[1%] whitespace-nowrap align-top">
								{i + 1}
							</td>
							<td className="text-text-secondary px-4 py-0 whitespace-pre">
								<PythonLine line={line} />
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

const PythonLine = ({ line }: { line: string }) => {
	const parts: { text: string; className: string }[] = [];
	let remaining = line;

	const commentIdx = findCommentStart(remaining);
	let commentPart = "";
	if (commentIdx >= 0) {
		commentPart = remaining.slice(commentIdx);
		remaining = remaining.slice(0, commentIdx);
	}

	const tokens = tokenize(remaining);
	parts.push(...tokens);

	if (commentPart) {
		parts.push({ text: commentPart, className: "text-text-muted italic" });
	}

	if (parts.length === 0) return <span>{line}</span>;

	return (
		<>
			{parts.map((part, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: stable token list per render
				<span key={`token-${i}`} className={part.className}>
					{part.text}
				</span>
			))}
		</>
	);
};

const KEYWORDS = new Set([
	"import",
	"from",
	"def",
	"class",
	"return",
	"if",
	"else",
	"elif",
	"for",
	"in",
	"not",
	"and",
	"or",
	"is",
	"None",
	"True",
	"False",
	"with",
	"as",
	"try",
	"except",
	"finally",
	"raise",
	"yield",
	"lambda",
	"global",
	"nonlocal",
	"pass",
	"break",
	"continue",
	"while",
]);

const BUILTINS = new Set([
	"print",
	"len",
	"range",
	"int",
	"float",
	"str",
	"list",
	"dict",
	"set",
	"tuple",
	"round",
	"sum",
	"abs",
	"max",
	"min",
	"sorted",
	"isinstance",
	"enumerate",
	"zip",
	"map",
	"filter",
	"type",
]);

const findCommentStart = (line: string): number => {
	let inString = false;
	let stringChar = "";
	for (let i = 0; i < line.length; i++) {
		const ch = line[i];
		if (inString) {
			if (ch === stringChar && line[i - 1] !== "\\") inString = false;
		} else if (ch === '"' || ch === "'") {
			if (line.slice(i, i + 3) === '"""' || line.slice(i, i + 3) === "'''") {
				return -1;
			}
			inString = true;
			stringChar = ch;
		} else if (ch === "#") {
			return i;
		}
	}
	return -1;
};

const tokenize = (code: string): { text: string; className: string }[] => {
	const result: { text: string; className: string }[] = [];
	const regex =
		/("""[\s\S]*?"""|'''[\s\S]*?'''|f"[^"]*"|"[^"]*"|'[^']*'|@\w[\w.]*|\b\d+\.?\d*\b|\b\w+\b|[^\w\s]+|\s+)/g;
	for (let match = regex.exec(code); match !== null; match = regex.exec(code)) {
		const token = match[0];

		if (token.startsWith('"""') || token.startsWith("'''")) {
			result.push({ text: token, className: "text-emerald-400" });
		} else if (
			token.startsWith('"') ||
			token.startsWith("'") ||
			token.startsWith('f"')
		) {
			result.push({ text: token, className: "text-emerald-400" });
		} else if (token.startsWith("@")) {
			result.push({ text: token, className: "text-amber-400" });
		} else if (/^\d/.test(token)) {
			result.push({ text: token, className: "text-orange-300" });
		} else if (KEYWORDS.has(token)) {
			result.push({ text: token, className: "text-violet-400" });
		} else if (BUILTINS.has(token)) {
			result.push({ text: token, className: "text-sky-400" });
		} else if (/^\w+$/.test(token)) {
			result.push({ text: token, className: "text-text-primary" });
		} else if (/^\s+$/.test(token)) {
			result.push({ text: token, className: "" });
		} else {
			result.push({ text: token, className: "text-text-muted" });
		}
	}

	return result;
};

const DetailPanel = ({
	pipeline,
	onClose,
}: {
	pipeline: Pipeline;
	onClose: () => void;
}) => {
	const [activeTab, setActiveTab] = useState<"code" | "runs" | "config">(
		"code",
	);
	const status = statusConfig[pipeline.status];

	return (
		<div className="flex flex-col h-[calc(100vh-120px)] bg-bg-secondary border border-border-subtle rounded-xl overflow-hidden">
			{/* Panel header */}
			<div className="flex items-center justify-between px-5 py-3.5 border-b border-border-subtle shrink-0">
				<div className="flex items-center gap-3 min-w-0">
					<span className="text-[15px] font-medium text-text-primary truncate">
						{pipeline.name}
					</span>
					<span className="flex items-center gap-1.5 text-[11px] font-mono text-text-secondary shrink-0">
						<span className={`w-1.5 h-1.5 rounded-full ${status.dotColor}`} />
						{status.label}
					</span>
				</div>
				<div className="flex items-center gap-2 shrink-0">
					<button
						type="button"
						className="flex items-center gap-1.5 text-[12px] text-accent hover:text-accent-hover font-medium transition-colors px-2.5 py-1 rounded-md hover:bg-accent/5"
					>
						<Play size={12} />
						Run Now
					</button>
					<button
						type="button"
						onClick={onClose}
						className="text-text-muted hover:text-text-secondary transition-colors p-1"
					>
						<X size={16} />
					</button>
				</div>
			</div>

			{/* Tabs */}
			<div className="flex items-center gap-1 px-5 pt-2 border-b border-border-subtle shrink-0">
				{(["code", "runs", "config"] as const).map((tab) => (
					<button
						type="button"
						key={tab}
						onClick={() => setActiveTab(tab)}
						className={cn(
							"px-3 py-2 text-[12px] font-medium -mb-px transition-colors capitalize",
							activeTab === tab
								? "text-text-primary border-b-2 border-accent"
								: "text-text-muted hover:text-text-secondary",
						)}
					>
						{tab === "code"
							? "Code"
							: tab === "runs"
								? "Run History"
								: "Configuration"}
					</button>
				))}
			</div>

			{/* Content */}
			<div className="flex-1 overflow-hidden">
				{activeTab === "code" && (
					<div className="h-full flex flex-col">
						{/* File bar */}
						<div className="flex items-center justify-between px-5 py-2 border-b border-border-subtle bg-bg-primary/50 shrink-0">
							<div className="flex items-center gap-2">
								<span className="text-[11px] font-mono text-text-muted">
									pipelines/
								</span>
								<span className="text-[11px] font-mono text-text-secondary">
									{pipeline.id}.py
								</span>
							</div>
							<div className="flex items-center gap-2">
								<button
									type="button"
									className="text-text-muted hover:text-text-secondary transition-colors p-1"
									title="Copy code"
								>
									<Copy size={13} />
								</button>
							</div>
						</div>

						{/* Code */}
						<div className="flex-1 overflow-auto py-3 bg-bg-primary/30">
							<PythonCodeView code={pipeline.code} />
						</div>

						{/* Footer */}
						<div className="flex items-center justify-between px-5 py-2.5 border-t border-border-subtle bg-bg-primary/50 shrink-0">
							<span className="text-[10px] font-mono text-text-muted">
								Python 3.12 · Kraken SDK v0.0.4
							</span>
							<div className="flex items-center gap-3">
								<span className="text-[10px] font-mono text-text-muted">
									{pipeline.code.split("\n").length} lines
								</span>
								<button
									type="button"
									className={cn("rounded-md px-3 py-1.5 text-[11px]", primaryBtnClass)}
								>
									Save & Deploy
								</button>
							</div>
						</div>
					</div>
				)}

				{activeTab === "runs" && (
					<div className="p-5 overflow-auto h-full space-y-2">
						{pipeline.recentRuns.map((run) => (
							<div
								key={run.id}
								className="flex items-center gap-4 px-4 py-3 rounded-lg bg-bg-primary border border-border-subtle"
							>
								{run.status === "success" ? (
									<CheckCircle2 size={14} className="text-success shrink-0" />
								) : (
									<XCircle size={14} className="text-error shrink-0" />
								)}
								<span className="text-[12px] font-mono text-text-muted w-14 shrink-0">
									{new Date(run.startedAt).toLocaleTimeString("en-US", {
										hour: "2-digit",
										minute: "2-digit",
										hour12: false,
									})}
								</span>
								<span className="text-[12px] text-text-primary flex-1">
									{run.status === "success"
										? `${run.recordsProcessed.toLocaleString()} records`
										: "Failed"}
								</span>
								<span className="text-[11px] font-mono text-text-muted">
									{formatDuration(run.duration)}
								</span>
								<button
									type="button"
									className="text-text-muted hover:text-text-secondary transition-colors p-0.5"
									title="Replay"
								>
									<RotateCcw size={12} />
								</button>
							</div>
						))}
					</div>
				)}

				{activeTab === "config" && (
					<div className="p-5 overflow-auto h-full space-y-5">
						<div>
							<span className="text-[11px] font-mono uppercase tracking-wider text-text-muted mb-2 block">
								Schedule
							</span>
							<div className="flex items-center gap-2">
								<Calendar size={14} className="text-text-muted" />
								<span className="text-[13px] text-text-primary font-mono">
									{pipeline.schedule}
								</span>
							</div>
						</div>

						<div className="border-t border-border-subtle" />

						<div>
							<span className="text-[11px] font-mono uppercase tracking-wider text-text-muted mb-2 block">
								Output Format
							</span>
							<div className="flex items-center gap-2">
								<FileOutput size={14} className="text-text-muted" />
								<span className="text-[13px] text-text-primary font-mono">
									{pipeline.outputFormat}
								</span>
							</div>
						</div>

						<div className="border-t border-border-subtle" />

						<div>
							<span className="text-[11px] font-mono uppercase tracking-wider text-text-muted mb-2 block">
								Avg Duration
							</span>
							<span className="text-[13px] text-text-primary font-mono">
								{formatDuration(pipeline.avgDuration)}
							</span>
						</div>

						<div className="border-t border-border-subtle" />

						<div>
							<span className="text-[11px] font-mono uppercase tracking-wider text-text-muted mb-2 block">
								Last Run
							</span>
							<span className="text-[13px] text-text-primary font-mono">
								{timeAgo(pipeline.lastRun)}
							</span>
						</div>

						<div>
							<span className="text-[11px] font-mono uppercase tracking-wider text-text-muted mb-2 block">
								Next Run
							</span>
							<span className="text-[13px] text-text-primary font-mono">
								{pipeline.nextRun === "-"
									? "\u2014"
									: timeAgo(pipeline.nextRun)}
							</span>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

const clusterStatusConfig = {
	healthy: { dotColor: "bg-emerald-400", label: "Healthy" },
	degraded: { dotColor: "bg-yellow-400", label: "Degraded" },
	offline: { dotColor: "bg-red-400", label: "Offline" },
} as const;

const ComputeSelector = ({
	activeCluster,
	onSelect,
}: {
	activeCluster: ComputeCluster;
	onSelect: (cluster: ComputeCluster) => void;
}) => {
	const [open, setOpen] = useState(false);
	const clusterStatus = clusterStatusConfig[activeCluster.status];

	return (
		<div className="bg-bg-secondary border border-border-subtle rounded-xl p-4 mb-5">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
						<Server size={15} className="text-accent" />
					</div>
					<div>
						<div className="flex items-center gap-2">
							<span className="text-[13px] font-medium text-text-primary">
								Compute Cluster
							</span>
							<span className="flex items-center gap-1 text-[10px] font-mono text-text-secondary">
								<span
									className={`w-1.5 h-1.5 rounded-full ${clusterStatus.dotColor}`}
								/>
								{clusterStatus.label}
							</span>
						</div>
						<span className="text-[11px] text-text-muted">
							All pipelines execute on the selected cluster
						</span>
					</div>
				</div>

				<button
					type="button"
					onClick={() => setOpen(!open)}
					className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border-subtle hover:border-border-default bg-bg-primary text-[12px] text-text-primary font-medium transition-colors"
				>
					{activeCluster.name}
					<ChevronDown
						size={13}
						className={cn(
							"text-text-muted transition-transform",
							open && "rotate-180",
						)}
					/>
				</button>
			</div>

			{/* Cluster specs bar */}
			<div className="flex items-center gap-6 mt-3 pt-3 border-t border-border-subtle">
				<div className="flex items-center gap-1.5">
					<Cpu size={12} className="text-text-muted" />
					<span className="text-[11px] font-mono text-text-secondary">
						{activeCluster.vcpus} vCPUs
					</span>
				</div>
				<div className="flex items-center gap-1.5">
					<MemoryStick size={12} className="text-text-muted" />
					<span className="text-[11px] font-mono text-text-secondary">
						{activeCluster.memoryGb} GB RAM
					</span>
				</div>
				{activeCluster.gpus > 0 && (
					<div className="flex items-center gap-1.5">
						<Zap size={12} className="text-text-muted" />
						<span className="text-[11px] font-mono text-text-secondary">
							{activeCluster.gpus}x {activeCluster.gpuModel}
						</span>
					</div>
				)}
				<div className="flex items-center gap-1.5">
					<Server size={12} className="text-text-muted" />
					<span className="text-[11px] font-mono text-text-secondary">
						Max {activeCluster.maxConcurrentPipelines} concurrent
					</span>
				</div>

				{/* Utilization bar */}
				<div className="flex items-center gap-2 ml-auto">
					<span className="text-[10px] font-mono text-text-muted uppercase tracking-wider">
						Utilization
					</span>
					<div className="w-24 h-1.5 rounded-full bg-white/14 overflow-hidden">
						<div
							className={cn(
								"h-full rounded-full transition-all",
								activeCluster.utilization > 85
									? "bg-error"
									: activeCluster.utilization > 60
										? "bg-warning"
										: "bg-success",
							)}
							style={{ width: `${activeCluster.utilization}%` }}
						/>
					</div>
					<span className="text-[11px] font-mono text-text-secondary tabular-nums">
						{activeCluster.utilization}%
					</span>
				</div>
			</div>

			{/* Cluster selector dropdown */}
			{open && (
				<div className="mt-3 pt-3 border-t border-border-subtle grid grid-cols-3 gap-2">
					{computeClusters.map((cluster) => {
						const isActive = cluster.id === activeCluster.id;
						const status = clusterStatusConfig[cluster.status];
						return (
							<button
								type="button"
								key={cluster.id}
								onClick={() => {
									onSelect(cluster);
									setOpen(false);
								}}
								className={cn(
									"text-left p-3 rounded-lg border transition-colors",
									isActive
										? "border-accent/40 bg-accent/4"
										: "border-border-subtle hover:border-border-default bg-bg-primary",
								)}
							>
								<div className="flex items-center justify-between mb-1.5">
									<span className="text-[12px] font-medium text-text-primary">
										{cluster.name}
									</span>
									<span className="flex items-center gap-1 text-[10px] font-mono text-text-muted">
										<span
											className={`w-1 h-1 rounded-full ${status.dotColor}`}
										/>
										{status.label}
									</span>
								</div>
								<div className="flex items-center gap-3 text-[10px] font-mono text-text-muted">
									<span>{cluster.vcpus} vCPU</span>
									<span>{cluster.memoryGb} GB</span>
									{cluster.gpus > 0 && <span>{cluster.gpus} GPU</span>}
								</div>
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
};

const PipelinesPage = () => {
	const [selected, setSelected] = useState<Pipeline | null>(pipelines[0]);
	const [activeCluster, setActiveCluster] = useState<ComputeCluster>(
		computeClusters[0],
	);

	return (
		<div>
			<PageHeader
				title="Pipelines"
				subtitle="Data transformation and ingestion workflows"
				actions={
					<button
						type="button"
						className={cn("flex items-center gap-2 rounded-md px-3 py-1.5 text-[11px]", primaryBtnClass)}
					>
						<Plus size={15} />
						New Pipeline
					</button>
				}
			/>

			<ComputeSelector
				activeCluster={activeCluster}
				onSelect={setActiveCluster}
			/>

			<div className="flex gap-4">
				{/* Pipeline list */}
				<div
					className={cn(
						"space-y-3 shrink-0 transition-all",
						selected ? "w-95" : "w-full",
					)}
				>
					{pipelines.map((pipeline) => (
						<PipelineCard
							key={pipeline.id}
							pipeline={pipeline}
							isSelected={selected?.id === pipeline.id}
							onSelect={() =>
								setSelected(selected?.id === pipeline.id ? null : pipeline)
							}
						/>
					))}
				</div>

				{/* Detail panel */}
				{selected && (
					<div className="flex-1 min-w-0">
						<DetailPanel
							pipeline={selected}
							onClose={() => setSelected(null)}
						/>
					</div>
				)}
			</div>
		</div>
	);
};

export default PipelinesPage;
