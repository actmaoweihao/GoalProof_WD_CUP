import type { Address } from "viem";

export function shortAddress(address?: Address | string) {
  return address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "未连接";
}

export function formatKickoff(timestamp: bigint | number) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(Number(timestamp) * 1000));
}

export function formatCountdown(target: bigint | number, now = Date.now()) {
  const seconds = Math.max(0, Number(target) - Math.floor(now / 1000));
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours) return `${hours}小时 ${minutes % 60}分`;
  return `${minutes}分 ${seconds % 60}秒`;
}
