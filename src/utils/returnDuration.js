export const formatReturnDuration = (value) => {
  const total = Math.max(0, Math.round(Number(value || 0) * 1440));
  const parts = [
    [Math.floor(total / 1440), "day"],
    [Math.floor((total % 1440) / 60), "hour"],
    [total % 60, "minute"],
  ].filter(([amount]) => amount > 0);
  return parts.map(([amount, unit]) => `${amount} ${unit}${amount === 1 ? "" : "s"}`).join(" ") || "0 minutes";
};

