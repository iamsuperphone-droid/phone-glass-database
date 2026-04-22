"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  CircleAlert,
  Loader2,
  Pencil,
  Plus,
  Search,
  X,
} from "lucide-react";

type GlassItem = {
  id: string;
  brand: string;
  model: string;
  type: string;
  vendor: string;
};

type Toast = {
  id: string;
  kind: "error" | "success" | "info";
  title: string;
  message?: string;
};

function uid(prefix = "t") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function normalizeMaybeArray(payload: unknown): GlassItem[] {
  if (Array.isArray(payload)) return payload as GlassItem[];
  if (payload && typeof payload === "object") {
    const maybe = (payload as { data?: unknown }).data;
    if (Array.isArray(maybe)) return maybe as GlassItem[];
  }
  return [];
}

function safeText(v: unknown) {
  if (v == null) return "";
  return String(v).trim();
}

function computeNextId(items: GlassItem[]) {
  let max = 0;
  for (const it of items) {
    const n = Number.parseInt(safeText(it.id), 10);
    if (Number.isFinite(n)) max = Math.max(max, n);
  }
  return String(max + 1);
}

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

function Modal(props: {
  open: boolean;
  title: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const { open, title, description, children, onClose } = props;
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        className="absolute inset-0 bg-zinc-950/30 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close modal"
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative w-full max-w-xl rounded-2xl border border-zinc-200 bg-white shadow-2xl outline-none dark:border-zinc-800 dark:bg-zinc-950"
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-200 p-5 dark:border-zinc-800">
          <div className="min-w-0">
            <div className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
              {title}
            </div>
            {description ? (
              <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {description}
              </div>
            ) : null}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function Field(props: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {props.label}
        </div>
        {props.hint ? (
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            {props.hint}
          </div>
        ) : null}
      </div>
      {props.children}
    </div>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={classNames(
        "h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none ring-0 placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/15",
        props.className,
      )}
    />
  );
}

function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={classNames(
        "h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none ring-0 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-blue-400 dark:focus:ring-blue-400/15",
        props.className,
      )}
    />
  );
}

function PrimaryButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    leftIcon?: React.ReactNode;
  },
) {
  const { leftIcon, className, ...rest } = props;
  return (
    <button
      {...rest}
      className={classNames(
        "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-500 dark:hover:bg-blue-600",
        className,
      )}
    >
      {leftIcon}
      <span>{props.children}</span>
    </button>
  );
}

function SecondaryButton(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    leftIcon?: React.ReactNode;
  },
) {
  const { leftIcon, className, ...rest } = props;
  return (
    <button
      {...rest}
      className={classNames(
        "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900",
        className,
      )}
    >
      {leftIcon}
      <span>{props.children}</span>
    </button>
  );
}

export default function Page() {
  const GAS_URL = process.env.NEXT_PUBLIC_GAS_URL || "";

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [items, setItems] = useState<GlassItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastTimers = useRef(new Map<string, number>());

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [addForm, setAddForm] = useState<{
    id: string;
    brand: string;
    model: string;
    type: string;
    vendor: string;
  }>({ id: "", brand: "", model: "", type: "", vendor: "" });

  const [editTarget, setEditTarget] = useState<GlassItem | null>(null);
  const [editForm, setEditForm] = useState<{
    id: string;
    type: string;
    vendor: string;
  }>({ id: "", type: "", vendor: "" });

  const [submitting, setSubmitting] = useState(false);

  const canUseApi = Boolean(GAS_URL);

  const addToast = (t: Omit<Toast, "id"> & { id?: string }) => {
    const id = t.id ?? uid("toast");
    setToasts((prev) => [{ id, kind: t.kind, title: t.title, message: t.message }, ...prev]);
    const existing = toastTimers.current.get(id);
    if (existing) window.clearTimeout(existing);
    const timer = window.setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
      toastTimers.current.delete(id);
    }, 4500);
    toastTimers.current.set(id, timer);
  };

  useEffect(() => {
    const timers = toastTimers.current;
    return () => {
      for (const t of timers.values()) window.clearTimeout(t);
      timers.clear();
    };
  }, []);

  useEffect(() => {
    const handle = window.setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => window.clearTimeout(handle);
  }, [query]);

  const fetchAbortRef = useRef<AbortController | null>(null);
  useEffect(() => {
    if (!canUseApi) return;

    fetchAbortRef.current?.abort();
    const ac = new AbortController();
    fetchAbortRef.current = ac;

    const run = async () => {
      try {
        setLoading(true);
        const url = new URL(GAS_URL);
        if (debouncedQuery) url.searchParams.set("q", debouncedQuery);
        const res = await fetch(url.toString(), {
          method: "GET",
          signal: ac.signal,
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`GET 失敗 (${res.status}) ${text}`.trim());
        }
        const json = (await res.json().catch(() => null)) as unknown;
        const list = normalizeMaybeArray(json).map((x) => ({
          id: safeText((x as GlassItem).id),
          brand: safeText((x as GlassItem).brand),
          model: safeText((x as GlassItem).model),
          type: safeText((x as GlassItem).type),
          vendor: safeText((x as GlassItem).vendor),
        }));
        setItems(list);
      } catch (e) {
        if ((e as { name?: string }).name === "AbortError") return;
        addToast({
          kind: "error",
          title: "讀取資料失敗",
          message: e instanceof Error ? e.message : "未知錯誤",
        });
      } finally {
        setLoading(false);
      }
    };

    void run();
    return () => ac.abort();
  }, [GAS_URL, canUseApi, debouncedQuery, refreshTick]);

  const nextSuggestedId = useMemo(() => computeNextId(items), [items]);

  const openAdd = () => {
    setAddForm((prev) => ({ ...prev, id: prev.id || nextSuggestedId }));
    setAddOpen(true);
  };

  const openEdit = (it: GlassItem) => {
    setEditTarget(it);
    setEditForm({
      id: safeText(it.id),
      type: safeText(it.type),
      vendor: safeText(it.vendor),
    });
    setEditOpen(true);
  };

  const postJson = async (payload: unknown) => {
    const res = await fetch(GAS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`POST 失敗 (${res.status}) ${text}`.trim());
    }
    const text = await res.text().catch(() => "");
    try {
      return JSON.parse(text) as unknown;
    } catch {
      return text as unknown;
    }
  };

  const onSubmitAdd = async () => {
    if (!canUseApi) {
      addToast({
        kind: "error",
        title: "缺少 API 設定",
        message: "請設定 NEXT_PUBLIC_GAS_URL 環境變數。",
      });
      return;
    }
    const brand = safeText(addForm.brand);
    const model = safeText(addForm.model);
    const type = safeText(addForm.type);
    const vendor = safeText(addForm.vendor);
    const id = safeText(addForm.id);

    if (!brand || !model || !type || !vendor) {
      addToast({
        kind: "error",
        title: "表單未完成",
        message: "請填寫：品牌、型號、類別、廠商。",
      });
      return;
    }

    try {
      setSubmitting(true);
      await postJson({ action: "ADD", id, brand, model, type, vendor });
      addToast({ kind: "success", title: "新增成功" });
      setAddOpen(false);
      setAddForm({ id: "", brand: "", model: "", type: "", vendor: "" });
      setRefreshTick((x) => x + 1);
    } catch (e) {
      addToast({
        kind: "error",
        title: "新增失敗",
        message: e instanceof Error ? e.message : "未知錯誤",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmitEdit = async () => {
    if (!canUseApi) {
      addToast({
        kind: "error",
        title: "缺少 API 設定",
        message: "請設定 NEXT_PUBLIC_GAS_URL 環境變數。",
      });
      return;
    }
    if (!editTarget) return;

    const id = safeText(editForm.id);
    const type = safeText(editForm.type);
    const vendor = safeText(editForm.vendor);

    if (!id || !type || !vendor) {
      addToast({
        kind: "error",
        title: "表單未完成",
        message: "請填寫：ID、類別、廠商。",
      });
      return;
    }

    try {
      setSubmitting(true);
      await postJson({
        action: "EDIT",
        oldBrand: safeText(editTarget.brand),
        oldModel: safeText(editTarget.model),
        id,
        type,
        vendor,
      });
      addToast({ kind: "success", title: "修改成功" });
      setEditOpen(false);
      setEditTarget(null);
      setRefreshTick((x) => x + 1);
    } catch (e) {
      addToast({
        kind: "error",
        title: "修改失敗",
        message: e instanceof Error ? e.message : "未知錯誤",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-50">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-2xl font-semibold tracking-tight">
                哈電族玻璃貼共用查詢系統
              </div>
              <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                內部工具：搜尋、快速新增與維護玻璃貼型號資料
              </div>
            </div>
            <div className="flex items-center gap-2">
              <SecondaryButton
                type="button"
                onClick={() => setRefreshTick((x) => x + 1)}
                disabled={!canUseApi || loading}
                leftIcon={
                  loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span className="h-4 w-4 rounded-full border border-zinc-300 dark:border-zinc-700" />
                  )
                }
                className="hidden sm:inline-flex"
              >
                重新整理
              </SecondaryButton>
              <PrimaryButton
                type="button"
                onClick={openAdd}
                disabled={!canUseApi}
                leftIcon={<Plus className="h-4 w-4" />}
              >
                新增型號
              </PrimaryButton>
            </div>
          </div>

          {!canUseApi ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100">
              <div className="flex items-start gap-3">
                <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold">
                    缺少環境變數 `NEXT_PUBLIC_GAS_URL`
                  </div>
                  <div className="mt-1 text-sm opacity-90">
                    請在 `.env.local` 設定 `NEXT_PUBLIC_GAS_URL` 指向你的
                    Google Apps Script API，才能開始讀取/新增/修改資料。
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400" />
                <TextInput
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="輸入關鍵字（品牌 / 型號 / 類別 / 廠商 / 編號）"
                  className="pl-10"
                />
              </div>
              <div className="flex items-center justify-between gap-2 sm:justify-end">
                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                  {loading ? "讀取中…" : `共 ${items.length} 筆`}
                </div>
                <SecondaryButton
                  type="button"
                  onClick={openAdd}
                  disabled={!canUseApi}
                  leftIcon={<Plus className="h-4 w-4" />}
                  className="sm:hidden"
                >
                  新增
                </SecondaryButton>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
            <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800 sm:px-5">
              <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                查詢結果
              </div>
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Loading</span>
                </div>
              ) : null}
            </div>

            {items.length === 0 && !loading ? (
              <div className="px-5 py-14 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-300">
                  <Search className="h-6 w-6" />
                </div>
                <div className="mt-4 text-base font-semibold">
                  找不到相關型號
                </div>
                <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  試試看更短的關鍵字，或點「新增型號」建立資料。
                </div>
                <div className="mt-5 flex justify-center">
                  <PrimaryButton
                    type="button"
                    onClick={openAdd}
                    disabled={!canUseApi}
                    leftIcon={<Plus className="h-4 w-4" />}
                  >
                    新增型號
                  </PrimaryButton>
                </div>
              </div>
            ) : null}

            {items.length > 0 ? (
              <>
                {/* Desktop table */}
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-zinc-50 text-xs text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400">
                      <tr>
                        <th className="px-5 py-3 font-semibold">編號</th>
                        <th className="px-5 py-3 font-semibold">品牌</th>
                        <th className="px-5 py-3 font-semibold">型號</th>
                        <th className="px-5 py-3 font-semibold">類別</th>
                        <th className="px-5 py-3 font-semibold">廠商</th>
                        <th className="px-5 py-3 font-semibold text-right">
                          操作
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {items.map((it) => (
                        <tr key={`${it.brand}-${it.model}-${it.id}`}>
                          <td className="px-5 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                            {it.id || "-"}
                          </td>
                          <td className="px-5 py-3 text-zinc-700 dark:text-zinc-300">
                            {it.brand || "-"}
                          </td>
                          <td className="px-5 py-3 text-zinc-700 dark:text-zinc-300">
                            {it.model || "-"}
                          </td>
                          <td className="px-5 py-3 text-zinc-700 dark:text-zinc-300">
                            {it.type || "-"}
                          </td>
                          <td className="px-5 py-3 text-zinc-700 dark:text-zinc-300">
                            {it.vendor || "-"}
                          </td>
                          <td className="px-5 py-3 text-right">
                            <button
                              className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
                              onClick={() => openEdit(it)}
                            >
                              <Pencil className="h-4 w-4" />
                              編輯
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="grid gap-3 p-4 md:hidden">
                  {items.map((it) => (
                    <div
                      key={`${it.brand}-${it.model}-${it.id}`}
                      className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                            {it.brand} {it.model}
                          </div>
                          <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                            編號：{it.id || "-"}
                          </div>
                        </div>
                        <button
                          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-100 dark:hover:bg-zinc-900"
                          onClick={() => openEdit(it)}
                        >
                          <Pencil className="h-4 w-4" />
                          編輯
                        </button>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900">
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">
                            類別
                          </div>
                          <div className="mt-0.5 font-semibold">
                            {it.type || "-"}
                          </div>
                        </div>
                        <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900">
                          <div className="text-xs text-zinc-500 dark:text-zinc-400">
                            廠商
                          </div>
                          <div className="mt-0.5 font-semibold">
                            {it.vendor || "-"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* Toasts */}
      <div className="fixed bottom-4 right-4 z-[60] flex w-[min(420px,calc(100vw-2rem))] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={classNames(
              "rounded-2xl border p-4 shadow-lg backdrop-blur",
              t.kind === "error" &&
                "border-red-200 bg-white/95 text-red-900 dark:border-red-900/60 dark:bg-zinc-950/90 dark:text-red-100",
              t.kind === "success" &&
                "border-emerald-200 bg-white/95 text-emerald-900 dark:border-emerald-900/60 dark:bg-zinc-950/90 dark:text-emerald-100",
              t.kind === "info" &&
                "border-zinc-200 bg-white/95 text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950/90 dark:text-zinc-100",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold">{t.title}</div>
                {t.message ? (
                  <div className="mt-1 text-sm opacity-90">{t.message}</div>
                ) : null}
              </div>
              <button
                className="rounded-lg p-1.5 opacity-70 transition hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10"
                onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add modal */}
      <Modal
        open={addOpen}
        title="新增型號"
        description="建立一筆新的玻璃貼型號資料"
        onClose={() => (submitting ? null : setAddOpen(false))}
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="編號 (ID)" hint="可保留預設或自行輸入">
              <TextInput
                value={addForm.id}
                onChange={(e) => setAddForm((p) => ({ ...p, id: e.target.value }))}
                placeholder={nextSuggestedId}
              />
            </Field>
            <Field label="類別" hint="例：半版 / 滿版">
              <SelectInput
                value={addForm.type}
                onChange={(e) => setAddForm((p) => ({ ...p, type: e.target.value }))}
              >
                <option value="">請選擇</option>
                <option value="半版">半版</option>
                <option value="滿版">滿版</option>
                <option value="其他">其他</option>
              </SelectInput>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="品牌" hint="例：三星 / Apple">
              <TextInput
                value={addForm.brand}
                onChange={(e) =>
                  setAddForm((p) => ({ ...p, brand: e.target.value }))
                }
                placeholder="例如：三星"
              />
            </Field>
            <Field label="型號" hint="例：A21S / iPhone 15">
              <TextInput
                value={addForm.model}
                onChange={(e) =>
                  setAddForm((p) => ({ ...p, model: e.target.value }))
                }
                placeholder="例如：iPhone 15"
              />
            </Field>
          </div>

          <Field label="廠商" hint="例：訊鋒">
            <TextInput
              value={addForm.vendor}
              onChange={(e) =>
                setAddForm((p) => ({ ...p, vendor: e.target.value }))
              }
              placeholder="例如：訊鋒"
            />
          </Field>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <SecondaryButton
              type="button"
              onClick={() => setAddOpen(false)}
              disabled={submitting}
            >
              取消
            </SecondaryButton>
            <PrimaryButton
              type="button"
              onClick={onSubmitAdd}
              disabled={submitting || !canUseApi}
              leftIcon={
                submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )
              }
            >
              送出新增
            </PrimaryButton>
          </div>
        </div>
      </Modal>

      {/* Edit modal */}
      <Modal
        open={editOpen}
        title="編輯資料"
        description={
          editTarget
            ? `鎖定條件：${editTarget.brand} ${editTarget.model}`
            : undefined
        }
        onClose={() => (submitting ? null : setEditOpen(false))}
      >
        {editTarget ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    原品牌
                  </div>
                  <div className="mt-0.5 font-semibold">
                    {editTarget.brand || "-"}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    原型號
                  </div>
                  <div className="mt-0.5 font-semibold">
                    {editTarget.model || "-"}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="編號 (ID)" hint="允許調整">
                <TextInput
                  value={editForm.id}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, id: e.target.value }))
                  }
                  placeholder="例如：123"
                />
              </Field>
              <Field label="類別" hint="允許調整">
                <SelectInput
                  value={editForm.type}
                  onChange={(e) =>
                    setEditForm((p) => ({ ...p, type: e.target.value }))
                  }
                >
                  <option value="">請選擇</option>
                  <option value="半版">半版</option>
                  <option value="滿版">滿版</option>
                  <option value="其他">其他</option>
                </SelectInput>
              </Field>
            </div>

            <Field label="廠商" hint="允許調整">
              <TextInput
                value={editForm.vendor}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, vendor: e.target.value }))
                }
                placeholder="例如：訊鋒"
              />
            </Field>

            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <SecondaryButton
                type="button"
                onClick={() => setEditOpen(false)}
                disabled={submitting}
              >
                取消
              </SecondaryButton>
              <PrimaryButton
                type="button"
                onClick={onSubmitEdit}
                disabled={submitting || !canUseApi}
                leftIcon={
                  submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Pencil className="h-4 w-4" />
                  )
                }
              >
                送出修改
              </PrimaryButton>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
