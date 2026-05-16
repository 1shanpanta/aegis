// SPDX-License-Identifier: Apache-2.0
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const toHex = (bytes: Uint8Array | undefined): string => {
  if (!bytes) return "";
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

export const shortHex = (bytes: Uint8Array | undefined, head = 6, tail = 4): string => {
  const hex = toHex(bytes);
  if (!hex) return "—";
  if (hex.length <= head + tail) return `0x${hex}`;
  return `0x${hex.slice(0, head)}…${hex.slice(-tail)}`;
};

export const formatUsd = (cents: bigint): string => {
  const dollars = Number(cents) / 100;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(dollars);
};
