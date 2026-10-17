"use client";

import type { ReactNode } from "react";
import { PriceConversion } from "@/components/price-conversion";
import { formatMoney } from "@/lib/exchange-rates";
import { farmRecordCurrency } from "@/lib/farm-money";
import type { FarmRecordPayload } from "@/lib/farm-types";

/** Empty and malformed records must never acquire an invented zero price. */
export function farmMoneyAmount(value: unknown): number | null {
  const amount = typeof value === "number" ? value : typeof value === "string" && value.trim() !== "" ? Number(value) : NaN;
  return Number.isFinite(amount) ? amount : null;
}

export function isFarmMoneyField(recordType: FarmRecordPayload["recordType"], field: string): boolean {
  return recordType === "finance" && field === "amount" || recordType === "plan" && ["costPerUnit", "expectedRevenue"].includes(field);
}

/** Monetary controls need the whole record width on phones and two-card tablets. */
export function farmMoneyDetailClass(recordType: FarmRecordPayload["recordType"], field: string): string {
  return isFarmMoneyField(recordType, field) || recordType === "plan" && field === "totals" ? "col-span-full lg:col-span-1" : "";
}

/** Read-only equivalent next to the actual original amount, including explicit signed results. */
export function FarmMoneyValue({ amount, currency, allowNegative = false }: { amount: unknown; currency: string | null; allowNegative?: boolean }) {
  const numeric = farmMoneyAmount(amount);
  const valid = numeric !== null && (allowNegative || numeric >= 0);
  return <div className="min-w-0 break-words" data-farm-money>
    <span>{numeric === null ? String(amount ?? "Sin importe") : formatMoney(numeric, currency || "Moneda sin definir")}</span>
    {valid && currency ? <PriceConversion amount={numeric} currency={currency} allowNegative={allowNegative} /> : <p className="mt-1 text-xs">Importe o moneda pendiente de revisión.</p>}
  </div>;
}

const totalLabels: Record<string, string> = { feed: "Insumo total (kg)", water: "Agua estimada (L)", area: "Área estimada (m²)", variableCost: "Costo variable", margin: "Margen preliminar" };

/** Only known monetary fields use currency; counts, weights, dates and areas stay as recorded. */
export function FarmRecordValue({ record, field, value, renderValue = value => String(value ?? "Sin definir") }: {
  record: Pick<FarmRecordPayload, "recordType" | "data">;
  field: string;
  value: unknown;
  renderValue?: (value: unknown) => ReactNode;
}) {
  const currency = farmRecordCurrency(record.data);
  if (isFarmMoneyField(record.recordType, field)) return <FarmMoneyValue amount={value} currency={currency} />;
  if (record.recordType === "plan" && field === "totals" && value && typeof value === "object" && !Array.isArray(value)) {
    return <dl className="space-y-3">{Object.entries(value).map(([key, amount]) => <div className="min-w-0" key={key}>
      <dt className="text-xs font-semibold">{totalLabels[key] ?? key}</dt>
      <dd>{key === "variableCost" || key === "margin" ? <FarmMoneyValue amount={amount} currency={currency} allowNegative={key === "margin"} /> : renderValue(amount)}</dd>
    </div>)}</dl>;
  }
  return <>{renderValue(value)}</>;
}
