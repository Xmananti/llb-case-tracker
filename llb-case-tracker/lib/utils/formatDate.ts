export const formatDate = (date: Date | string | number): string => {
  const d =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatDateTime = (date: Date | string | number): string => {
  const d =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatTime = (date: Date | string | number): string => {
  const d =
    typeof date === "string" || typeof date === "number"
      ? new Date(date)
      : date;
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
