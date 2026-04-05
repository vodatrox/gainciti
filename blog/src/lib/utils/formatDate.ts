import { format, formatDistanceToNow, parseISO } from "date-fns";

export function formatDate(dateString: string): string {
  const date = parseISO(dateString);
  return format(date, "MMM d, yyyy");
}

export function formatRelativeDate(dateString: string): string {
  const date = parseISO(dateString);
  return formatDistanceToNow(date, { addSuffix: true });
}
