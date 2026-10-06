"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bookmark,
  Check,
  ChevronDown,
  Download,
  FileText,
  FileUp,
  ListChecks,
  Menu,
  RotateCcw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { domains, questionBank, sourceSummary, type Question } from "@/lib/question-bank";
import { studyGuides } from "@/lib/study-guides";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const storageKey = "aws-security-scs-c03-study-state";
const pageSize = 40;
const domainOrder = ["detection", "incident-response", "infrastructure", "iam", "data-protection", "governance"];

function loadStoredState() {
  const raw = window.localStorage.getItem(storageKey);
  if (!raw) return { answers: {}, bookmarks: [], customQuestions: [] };

  try {
    const state = JSON.parse(raw);
    return {
      answers: state.answers ?? {},
      bookmarks: state.bookmarks ?? [],
      customQuestions: state.customQuestions ?? [],
    };
  } catch {
    window.localStorage.removeItem(storageKey);
    return { answers: {}, bookmarks: [], customQuestions: [] };
  }
}

function sameAnswer(a: number[] = [], b: number[] = []) {
  return a.length === b.length && [...a].sort().every((item, index) => item === [...b].sort()[index]);
}

function hasAnswered(question: Question, selected: number[] = []) {
  return question.type === "single"
    ? selected.length > 0
    : selected.length >= question.answer.length;
}

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function InlineMarkdown({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={index} className="rounded border border-cyan-300/20 bg-slate-950 px-1.5 py-0.5 font-mono text-[0.9em] text-cyan-100">
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={index} className="font-semibold text-slate-50">{part.slice(2, -2)}</strong>;
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

function MarkdownTable({ rows }: { rows: string[] }) {
  const parsed = rows
    .map((row) => row.trim().replace(/^\|/, "").replace(/\|$/, "").split("|").map((cell) => cell.trim()))
    .filter((cells) => cells.length > 1);
  const [header, divider, ...body] = parsed;
  if (!header || !divider) return null;

  return (
    <div className="my-5 overflow-x-auto rounded-md border border-slate-700/80">
      <table className="w-full min-w-[640px] border-collapse text-left text-sm">
        <thead className="bg-slate-800/90 text-slate-100">
          <tr>
            {header.map((cell, index) => (
              <th key={index} className="border-b border-slate-700 px-3 py-2 font-semibold">
                <InlineMarkdown text={cell} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((cells, rowIndex) => (
            <tr key={rowIndex} className="odd:bg-slate-900/40 even:bg-slate-900/15">
              {header.map((_, cellIndex) => (
                <td key={cellIndex} className="border-t border-slate-800 px-3 py-2 align-top text-slate-300">
                  <InlineMarkdown text={cells[cellIndex] ?? ""} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MarkdownGuide({ content }: { content: string }) {
  const blocks = useMemo(() => {
    const lines = content.split("\n");
    const output: Array<{ type: string; text?: string; level?: number; lines?: string[]; lang?: string; ordered?: boolean }> = [];
    let paragraph: string[] = [];
    let list: string[] = [];
    let orderedList = false;
    let code: string[] | null = null;
    let codeLang = "";
    let table: string[] = [];

    function flushParagraph() {
      if (paragraph.length) {
        output.push({ type: "paragraph", text: paragraph.join(" ") });
        paragraph = [];
      }
    }
    function flushList() {
      if (list.length) {
        output.push({ type: "list", lines: list, ordered: orderedList });
        list = [];
        orderedList = false;
      }
    }
    function flushTable() {
      if (table.length) {
        output.push({ type: "table", lines: table });
        table = [];
      }
    }

    for (const rawLine of lines) {
      const line = rawLine.replace(/\s+$/g, "");
      if (code) {
        if (line.startsWith("```")) {
          output.push({ type: "code", lines: code, lang: codeLang });
          code = null;
          codeLang = "";
        } else {
          code.push(line);
        }
        continue;
      }

      if (line.startsWith("```")) {
        flushParagraph();
        flushList();
        flushTable();
        code = [];
        codeLang = line.slice(3).trim();
        continue;
      }

      if (!line.trim()) {
        flushParagraph();
        flushList();
        flushTable();
        continue;
      }

      if (line.trim() === "---") {
        flushParagraph();
        flushList();
        flushTable();
        output.push({ type: "rule" });
        continue;
      }

      if (/^#{1,6}\s+/.test(line)) {
        flushParagraph();
        flushList();
        flushTable();
        const marker = line.match(/^#+/)?.[0] ?? "##";
        output.push({ type: "heading", level: marker.length, text: line.slice(marker.length).trim() });
        continue;
      }

      if (line.startsWith("|")) {
        flushParagraph();
        flushList();
        table.push(line);
        continue;
      }

      const unordered = /^\s*[-*]\s+/.test(line);
      const ordered = /^\s*\d+\.\s+/.test(line);
      if (unordered || ordered) {
        flushParagraph();
        flushTable();
        if (list.length && orderedList !== ordered) flushList();
        orderedList = ordered;
        list.push(line.replace(/^\s*[-*]\s+/, "").replace(/^\s*\d+\.\s+/, ""));
        continue;
      }

      if (line.startsWith(">")) {
        flushParagraph();
        flushList();
        flushTable();
        output.push({ type: "quote", text: line.replace(/^>\s?/, "") });
        continue;
      }

      flushList();
      flushTable();
      paragraph.push(line.trim());
    }

    flushParagraph();
    flushList();
    flushTable();
    if (code) output.push({ type: "code", lines: code, lang: codeLang });
    return output;
  }, [content]);

  return (
    <div className="study-markdown max-w-none text-slate-300">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const level = block.level ?? 2;
          const id = slugify(block.text ?? `section-${index}`);
          const Tag = (`h${Math.min(level, 4)}` as keyof JSX.IntrinsicElements);
          const className = level === 1
            ? "mb-5 mt-2 scroll-mt-24 text-3xl font-semibold text-slate-50"
            : level === 2
              ? "mb-4 mt-10 scroll-mt-24 border-t border-slate-800 pt-6 text-2xl font-semibold text-slate-50"
              : level === 3
                ? "mb-3 mt-7 scroll-mt-24 text-xl font-semibold text-cyan-100"
                : "mb-2 mt-5 scroll-mt-24 text-lg font-semibold text-slate-100";
          return <Tag id={id} key={index} className={className}><InlineMarkdown text={block.text ?? ""} /></Tag>;
        }
        if (block.type === "paragraph") {
          return <p key={index} className="my-3 text-[15px] leading-7 text-slate-300"><InlineMarkdown text={block.text ?? ""} /></p>;
        }
        if (block.type === "quote") {
          return <blockquote key={index} className="my-4 border-l-4 border-cyan-400/60 bg-cyan-400/10 px-4 py-3 text-[15px] leading-7 text-cyan-50"><InlineMarkdown text={block.text ?? ""} /></blockquote>;
        }
        if (block.type === "list") {
          const Tag = block.ordered ? "ol" : "ul";
          return (
            <Tag key={index} className={`my-4 space-y-2 pl-6 text-[15px] leading-7 text-slate-300 ${block.ordered ? "list-decimal" : "list-disc"}`}>
              {(block.lines ?? []).map((item, itemIndex) => <li key={itemIndex}><InlineMarkdown text={item} /></li>)}
            </Tag>
          );
        }
        if (block.type === "code") {
          return (
            <div key={index} className="my-5 overflow-hidden rounded-md border border-slate-700 bg-slate-950">
              {block.lang ? <div className="border-b border-slate-800 px-3 py-1.5 text-xs uppercase tracking-wide text-slate-500">{block.lang}</div> : null}
              <pre className="overflow-x-auto p-4 text-sm leading-6 text-cyan-50"><code>{(block.lines ?? []).join("\n")}</code></pre>
            </div>
          );
        }
        if (block.type === "table") return <MarkdownTable key={index} rows={block.lines ?? []} />;
        if (block.type === "rule") return <hr key={index} className="my-8 border-slate-800" />;
        return null;
      })}
    </div>
  );
}

function CollapsiblePanel({
  icon,
  title,
  meta,
  children,
  open,
  onOpenChange,
}: {
  icon: React.ReactNode;
  title: string;
  meta: string;
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (value: boolean) => void;
}) {
  return (
    <Collapsible open={open} onOpenChange={onOpenChange} className="overflow-hidden rounded-md border border-slate-700/80 bg-slate-900/80 shadow-2xl shadow-slate-950/30">
      <CollapsibleTrigger className="flex min-h-16 w-full items-center justify-between gap-4 px-4 py-3 text-left transition hover:bg-slate-800/70 sm:px-5">
        <span className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-md border border-cyan-300/25 bg-cyan-300/10 text-cyan-200">
            {icon}
          </span>
          <span className="min-w-0">
            <span className="block truncate text-base font-semibold text-slate-50">{title}</span>
            <span className="mt-0.5 block text-sm text-slate-400">{meta}</span>
          </span>
        </span>
        <ChevronDown className={`size-5 shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
}

export default function Home() {
  const [activeDomainId, setActiveDomainId] = useState(domainOrder[0]);
  const [taskFilter, setTaskFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [answers, setAnswers] = useState<Record<string, number[]>>({});
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [customQuestions, setCustomQuestions] = useState<Question[]>([]);
  const [importText, setImportText] = useState("");
  const [importMessage, setImportMessage] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [visibleLimit, setVisibleLimit] = useState(pageSize);
  const [studyOpen, setStudyOpen] = useState(true);
  const [questionsOpen, setQuestionsOpen] = useState(true);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileTopicsOpen, setMobileTopicsOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const state = loadStoredState();
      setAnswers(state.answers);
      setBookmarks(state.bookmarks);
      setCustomQuestions(state.customQuestions);
      setHydrated(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ answers, bookmarks, customQuestions }),
    );
  }, [answers, bookmarks, customQuestions, hydrated]);

  const questions = useMemo(
    () => [...questionBank, ...customQuestions],
    [customQuestions],
  );

  const activeDomain = domains.find((domain) => domain.id === activeDomainId) ?? domains[0];
  const activeGuide = studyGuides.find((guide) => guide.domainId === activeDomainId);
  const activeQuestions = questions.filter((question) => question.domainId === activeDomainId);
  const activeDomainNumber = domainOrder.indexOf(activeDomainId) + 1;

  const tasks = useMemo(() => [...new Set(activeQuestions.map((question) => question.task))].sort(), [activeQuestions]);

  const matchingQuestions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return activeQuestions.filter((question) => {
      const taskMatch = taskFilter === "all" || question.task === taskFilter;
      const textMatch =
        !normalized ||
        [question.stem, question.task, question.explanation, ...question.choices]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      return taskMatch && textMatch;
    });
  }, [activeQuestions, taskFilter, query]);

  const visibleQuestions = useMemo(
    () => matchingQuestions.slice(0, visibleLimit),
    [matchingQuestions, visibleLimit],
  );

  const answered = questions.filter((question) => hasAnswered(question, answers[question.id])).length;
  const correct = questions.filter((question) => sameAnswer(answers[question.id], question.answer)).length;
  const score = answered ? Math.round((correct / answered) * 100) : 0;
  const activeAnswered = activeQuestions.filter((question) => hasAnswered(question, answers[question.id])).length;

  function chooseDomain(domainId: string) {
    setActiveDomainId(domainId);
    setTaskFilter("all");
    setQuery("");
    setVisibleLimit(pageSize);
    setStudyOpen(true);
    setQuestionsOpen(true);
    setMobileTopicsOpen(false);
    window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  function selectAnswer(question: Question, choiceIndex: number) {
    if (question.type === "single") {
      setAnswers((current) => ({ ...current, [question.id]: [choiceIndex] }));
      return;
    }

    setAnswers((current) => {
      const selected = new Set(current[question.id] ?? []);
      if (selected.has(choiceIndex)) selected.delete(choiceIndex);
      else selected.add(choiceIndex);
      return { ...current, [question.id]: [...selected] };
    });
  }

  function toggleBookmark(id: string) {
    setBookmarks((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  }

  function importQuestions() {
    try {
      const parsed = JSON.parse(importText);
      const incoming = Array.isArray(parsed) ? parsed : parsed.questions;
      if (!Array.isArray(incoming)) throw new Error("Expected an array or { questions: [] }.");
      const cleaned = incoming.map((item: Partial<Question>, index: number): Question => {
        if (!item.stem || !Array.isArray(item.choices) || !Array.isArray(item.answer)) {
          throw new Error(`Question ${index + 1} is missing stem, choices, or answer.`);
        }
        return {
          id: item.id ?? `imported-${Date.now()}-${index}`,
          domainId: item.domainId ?? activeDomainId,
          task: item.task ?? "Imported",
          type: item.type === "multi" ? "multi" : "single",
          stem: item.stem,
          choices: item.choices,
          answer: item.answer,
          explanation: item.explanation ?? "No explanation added yet.",
          source: "Imported",
        };
      });
      setCustomQuestions((current) => [...current, ...cleaned]);
      setImportText("");
      setImportMessage(`Imported ${cleaned.length} question${cleaned.length === 1 ? "" : "s"}.`);
    } catch (error) {
      setImportMessage(error instanceof Error ? error.message : "Import failed.");
    }
  }

  function exportProgress() {
    const payload = JSON.stringify({ answers, bookmarks, customQuestions }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "aws-security-scs-c03-progress.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-slate-800 bg-slate-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-11 place-items-center rounded-md border border-cyan-300/30 bg-cyan-300/10 text-cyan-200">
              <ShieldCheck className="size-6" />
            </span>
            <div>
              <p className="text-sm font-semibold text-cyan-200">AWS Security Specialty SCS-C03</p>
              <h1 className="text-2xl font-semibold tracking-normal text-slate-50">
                Study guides and practice workspace
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Full topic guides from the MD files, paired with the interactive question bank.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center sm:min-w-[360px]">
            <div className="rounded-md border border-slate-800 bg-slate-900 px-3 py-2">
              <p className="text-xs text-slate-400">Answered</p>
              <p className="text-lg font-semibold text-slate-50">{answered}/{questions.length}</p>
            </div>
            <div className="rounded-md border border-slate-800 bg-slate-900 px-3 py-2">
              <p className="text-xs text-slate-400">Score</p>
              <p className="text-lg font-semibold text-slate-50">{score}%</p>
            </div>
            <div className="rounded-md border border-slate-800 bg-slate-900 px-3 py-2">
              <p className="text-xs text-slate-400">Saved</p>
              <p className="text-lg font-semibold text-slate-50">{bookmarks.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-4 px-4 py-4 sm:px-6 lg:grid-cols-[310px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-4 lg:h-[calc(100vh-2rem)] lg:overflow-y-auto">
          <div className="rounded-md border border-slate-800 bg-slate-900/90 p-3 shadow-2xl shadow-slate-950/30 sm:p-4">
            <button
              className="flex w-full items-center justify-between gap-3 rounded-md border border-slate-700 px-3 py-2 text-left lg:hidden"
              onClick={() => setMobileTopicsOpen((current) => !current)}
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                <Menu className="size-4" /> Topics
              </span>
              <ChevronDown className={`size-4 text-slate-400 transition ${mobileTopicsOpen ? "rotate-180" : ""}`} />
            </button>

            <div className={`${mobileTopicsOpen ? "mt-3 block" : "hidden"} lg:mt-0 lg:block`}>
              <div className="mb-4 hidden items-center justify-between lg:flex">
                <h2 className="text-base font-semibold text-slate-50">Topics</h2>
                <Badge variant="outline" className="border-cyan-300/30 text-cyan-100">6 domains</Badge>
              </div>
              <div className="space-y-2">
                {domains.map((domain) => {
                  const count = questions.filter((question) => question.domainId === domain.id).length;
                  const done = questions.filter((question) => question.domainId === domain.id && hasAnswered(question, answers[question.id])).length;
                  const domainNumber = domainOrder.indexOf(domain.id) + 1;
                  return (
                    <button
                      key={domain.id}
                      className={`w-full rounded-md border px-3 py-3 text-left transition ${
                        activeDomainId === domain.id
                          ? "border-cyan-300/60 bg-cyan-300/10 shadow-[inset_3px_0_0_rgba(103,232,249,0.85)]"
                          : "border-slate-800 bg-slate-950/40 hover:border-slate-600 hover:bg-slate-800/60"
                      }`}
                      onClick={() => chooseDomain(domain.id)}
                    >
                      <span className="flex min-w-0 items-center justify-between gap-2">
                        <span className="min-w-0 text-sm font-semibold text-slate-50">Topic {domainNumber}: {domain.name}</span>
                        <span className="text-xs text-cyan-200">{domain.weight}%</span>
                      </span>
                      <span className="mt-2 block text-xs text-slate-400">
                        {count} questions · {done} answered
                      </span>
                    </button>
                  );
                })}
              </div>

              <section className="mt-4 rounded-md border border-slate-800 bg-slate-950/50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-semibold text-slate-50">Progress</h2>
                  <Button
                    size="icon-sm"
                    variant="outline"
                    aria-label="Reset answers"
                    onClick={() => setAnswers({})}
                    className="border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"
                  >
                    <RotateCcw className="size-4" />
                  </Button>
                </div>
                <Progress value={questions.length ? (answered / questions.length) * 100 : 0} />
                <div className="mt-4 space-y-3">
                  {domains.map((domain) => {
                    const domainQuestions = questions.filter((question) => question.domainId === domain.id);
                    const done = domainQuestions.filter((question) => hasAnswered(question, answers[question.id])).length;
                    return (
                      <div key={domain.id}>
                        <div className="mb-1 flex justify-between gap-2 text-xs text-slate-400">
                          <span>{domain.name}</span>
                          <span>{done}/{domainQuestions.length}</span>
                        </div>
                        <Progress value={domainQuestions.length ? (done / domainQuestions.length) * 100 : 0} />
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>
          </div>
        </aside>

        <section className="min-w-0 space-y-4">
          <div className="rounded-md border border-slate-800 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_32%),linear-gradient(135deg,#101827,#0f172a_52%,#111827)] p-4 shadow-2xl shadow-slate-950/40 sm:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge className="bg-cyan-300 text-slate-950">Topic {activeDomainNumber}</Badge>
                  <Badge variant="outline" className="border-slate-600 text-slate-200">{activeDomain.weight}% exam weight</Badge>
                  <Badge variant="outline" className="border-slate-600 text-slate-200">{activeQuestions.length} questions</Badge>
                </div>
                <h2 className="text-3xl font-semibold tracking-normal text-slate-50 sm:text-4xl">{activeDomain.name}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                  Read the full study material first, then drill the questions for the same topic. Both sections are collapsible and scroll independently so the page stays manageable.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:min-w-[320px]">
                <div className="rounded-md border border-slate-700 bg-slate-950/60 p-3">
                  <p className="text-xs text-slate-400">Topic progress</p>
                  <p className="text-lg font-semibold text-slate-50">{activeAnswered}/{activeQuestions.length}</p>
                </div>
                <div className="rounded-md border border-slate-700 bg-slate-950/60 p-3">
                  <p className="text-xs text-slate-400">Study source</p>
                  <p className="truncate text-sm font-semibold text-slate-50">{activeGuide?.sourceFile ?? "MD guide"}</p>
                </div>
              </div>
            </div>
          </div>

          <CollapsiblePanel
            icon={<FileText className="size-5" />}
            title="Study material"
            meta={`Full Markdown guide for ${activeDomain.name}`}
            open={studyOpen}
            onOpenChange={setStudyOpen}
          >
            <div className="border-t border-slate-800 bg-slate-950/50 p-4 sm:p-5">
              <div className="max-h-[72vh] overflow-y-auto pr-1 scrollbar-thin scrollbar-gutter-stable">
                {activeGuide ? <MarkdownGuide content={activeGuide.content} /> : <p className="text-slate-400">No study guide found for this topic.</p>}
              </div>
            </div>
          </CollapsiblePanel>

          <CollapsiblePanel
            icon={<ListChecks className="size-5" />}
            title="Question bank"
            meta={`${matchingQuestions.length.toLocaleString()} matching questions · answers reveal immediately after selection`}
            open={questionsOpen}
            onOpenChange={setQuestionsOpen}
          >
            <div className="border-t border-slate-800 bg-slate-950/50 p-4 sm:p-5">
              <div className="mb-4 rounded-md border border-slate-800 bg-slate-900/80 p-4">
                <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_240px]">
                  <label className="relative block">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
                    <input
                      className="h-11 w-full rounded-md border border-slate-700 bg-slate-950 pl-10 pr-3 text-base text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                      value={query}
                      onChange={(event) => {
                        setQuery(event.target.value);
                        setVisibleLimit(pageSize);
                      }}
                      placeholder="Search services, scenarios, tasks"
                    />
                  </label>
                  <select
                    className="h-11 rounded-md border border-slate-700 bg-slate-950 px-3 text-sm text-slate-100 outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-300/20"
                    value={taskFilter}
                    onChange={(event) => {
                      setTaskFilter(event.target.value);
                      setVisibleLimit(pageSize);
                    }}
                  >
                    <option value="all">All tasks</option>
                    {tasks.map((task) => (
                      <option key={task} value={task}>{task}</option>
                    ))}
                  </select>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {tasks.map((task) => (
                    <button
                      key={task}
                      className={`rounded-md border px-3 py-1.5 text-sm transition ${
                        taskFilter === task
                          ? "border-cyan-300 bg-cyan-300 text-slate-950"
                          : "border-slate-700 text-slate-300 hover:bg-slate-800"
                      }`}
                      onClick={() => {
                        setTaskFilter(taskFilter === task ? "all" : task);
                        setVisibleLimit(pageSize);
                      }}
                    >
                      {task}
                    </button>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-400">
                  <span>{matchingQuestions.length.toLocaleString()} matching questions</span>
                  <span>of {activeQuestions.length.toLocaleString()} in this topic</span>
                  {visibleQuestions.length < matchingQuestions.length ? (
                    <span>showing first {visibleQuestions.length.toLocaleString()}</span>
                  ) : null}
                </div>
              </div>

              <div className="max-h-[78vh] space-y-4 overflow-y-auto pr-1 scrollbar-thin scrollbar-gutter-stable">
                {visibleQuestions.map((question, index) => {
                  const selected = answers[question.id] ?? [];
                  const isAnswered = hasAnswered(question, selected);
                  const isCorrect = sameAnswer(selected, question.answer);
                  return (
                    <article key={question.id} className="rounded-md border border-slate-800 bg-slate-900/90">
                      <div className="border-b border-slate-800 p-4">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <Badge className="bg-cyan-300 text-slate-950">{activeDomain.name}</Badge>
                          <Badge variant="secondary" className="bg-slate-800 text-slate-200">{question.task}</Badge>
                          <Badge variant="outline" className="border-slate-600 text-slate-300">{question.type === "multi" ? "Multi-select" : "Single answer"}</Badge>
                          <Badge variant="outline" className="border-slate-600 text-slate-300">{question.source}</Badge>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="grid size-8 shrink-0 place-items-center rounded-md border border-cyan-300/30 bg-cyan-300/10 text-sm font-semibold text-cyan-100">
                            {index + 1}
                          </span>
                          <h3 className="min-w-0 text-lg font-semibold leading-7 text-slate-50">{question.stem}</h3>
                          <Button
                            size="icon-sm"
                            variant={bookmarks.includes(question.id) ? "default" : "outline"}
                            className={`ml-auto ${bookmarks.includes(question.id) ? "bg-cyan-300 text-slate-950 hover:bg-cyan-200" : "border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"}`}
                            aria-label="Bookmark question"
                            onClick={() => toggleBookmark(question.id)}
                          >
                            <Bookmark className="size-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid gap-2 p-4">
                        {question.choices.map((choice, choiceIndex) => {
                          const chosen = selected.includes(choiceIndex);
                          const correctChoice = question.answer.includes(choiceIndex);
                          const reveal = isAnswered && (chosen || correctChoice);
                          return (
                            <button
                              key={`${question.id}-${choiceIndex}`}
                              className={`grid min-h-12 grid-cols-[28px_minmax(0,1fr)_24px] items-center gap-3 rounded-md border px-3 py-2 text-left transition ${
                                reveal && correctChoice
                                  ? "border-emerald-300/70 bg-emerald-400/12"
                                  : reveal && chosen
                                    ? "border-rose-300/70 bg-rose-400/12"
                                    : chosen
                                      ? "border-cyan-300/70 bg-cyan-300/10"
                                      : "border-slate-700 bg-slate-950/60 hover:border-slate-500 hover:bg-slate-800/70"
                              }`}
                              onClick={() => selectAnswer(question, choiceIndex)}
                            >
                              <span className="grid size-7 place-items-center rounded-md border border-current text-sm font-semibold text-slate-200">
                                {String.fromCharCode(65 + choiceIndex)}
                              </span>
                              <span className="text-sm leading-5 text-slate-200">{choice}</span>
                              {reveal && correctChoice ? (
                                <Check className="size-5 text-emerald-300" />
                              ) : reveal && chosen ? (
                                <X className="size-5 text-rose-300" />
                              ) : null}
                            </button>
                          );
                        })}
                      </div>
                      {isAnswered ? (
                        <div className={`border-t px-4 py-3 ${isCorrect ? "border-emerald-300/20 bg-emerald-400/10" : "border-rose-300/20 bg-rose-400/10"}`}>
                          <p className="text-sm font-semibold text-slate-50">{isCorrect ? "Correct" : "Review this one"}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-300">{question.explanation}</p>
                        </div>
                      ) : null}
                    </article>
                  );
                })}
                {visibleQuestions.length === 0 ? (
                  <div className="rounded-md border border-slate-800 bg-slate-900 p-8 text-center">
                    <p className="font-semibold text-slate-50">No questions match the current filters.</p>
                    <p className="mt-1 text-sm text-slate-400">Clear search or switch tasks to keep going.</p>
                  </div>
                ) : null}
                {visibleQuestions.length < matchingQuestions.length ? (
                  <div className="rounded-md border border-slate-800 bg-slate-900 p-4 text-center">
                    <p className="mb-3 text-sm text-slate-400">
                      Showing {visibleQuestions.length.toLocaleString()} of {matchingQuestions.length.toLocaleString()} matching questions.
                    </p>
                    <Button onClick={() => setVisibleLimit((current) => current + pageSize)} className="bg-cyan-300 text-slate-950 hover:bg-cyan-200">
                      Load more questions
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          </CollapsiblePanel>

          <CollapsiblePanel
            icon={<FileUp className="size-5" />}
            title="Import, export, and sources"
            meta="Optional tools for progress backup and your own allowed questions"
            open={toolsOpen}
            onOpenChange={setToolsOpen}
          >
            <div className="grid gap-4 border-t border-slate-800 bg-slate-950/50 p-4 sm:p-5 xl:grid-cols-[minmax(0,1fr)_360px]">
              <section className="rounded-md border border-slate-800 bg-slate-900/80 p-4">
                <h3 className="font-semibold text-slate-50">Add your own bank</h3>
                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Paste questions you are allowed to reuse as JSON. Imported questions join the topic selector and keep the instant answer reveal.
                </p>
                <Textarea
                  className="mt-3 min-h-40 border-slate-700 bg-slate-950 text-sm text-slate-100 placeholder:text-slate-600"
                  value={importText}
                  onChange={(event) => setImportText(event.target.value)}
                  placeholder='[{"domainId":"iam","task":"Authorization","type":"single","stem":"...","choices":["..."],"answer":[0],"explanation":"..."}]'
                />
                {importMessage ? <p className="mt-2 text-sm text-cyan-100">{importMessage}</p> : null}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button onClick={importQuestions} className="gap-2 bg-cyan-300 text-slate-950 hover:bg-cyan-200">
                    <FileUp className="size-4" />
                    Import
                  </Button>
                  <Button onClick={exportProgress} variant="outline" className="gap-2 border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800">
                    <Download className="size-4" />
                    Export
                  </Button>
                </div>
              </section>

              <section className="rounded-md border border-slate-800 bg-slate-900/80 p-4">
                <h3 className="font-semibold text-slate-50">Question sources</h3>
                <div className="mt-3 space-y-2">
                  {sourceSummary.map((source) => (
                    <div key={source.source} className="flex items-center justify-between gap-3 text-sm">
                      <span className="min-w-0 truncate text-slate-300">{source.source}</span>
                      <Badge variant="outline" className="border-slate-600 text-slate-300">{source.count.toLocaleString()}</Badge>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  The guides are the final MD materials from this workspace. The practice cards keep source labels, and answers appear immediately once a question is answered.
                </p>
              </section>
            </div>
          </CollapsiblePanel>
        </section>
      </div>
    </main>
  );
}
