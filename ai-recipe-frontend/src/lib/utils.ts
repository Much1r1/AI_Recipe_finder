import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const formatCurrency = (priceInCents: number): string => {
  const KES_CONVERSION_RATE = 130;
  const priceInUsd = priceInCents / 100;
  const priceInKes = priceInUsd * KES_CONVERSION_RATE;

  return `KES ${Math.round(priceInKes).toLocaleString()}`;
};
