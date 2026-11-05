/** Price formatting shared by server and client components. */
export function formatPrice(price: number | null): string {
  if (price === null) return "สอบถามราคา";
  return `฿${price.toLocaleString("en-US")}.00`;
}

export function formatThaiDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function lineInquiry(item: {
  slug: string;
  name: string;
  size?: string;
  color?: string;
  qty: number;
}): string {
  const bits = [item.name];
  if (item.color) bits.push(item.color);
  if (item.size) bits.push(`size ${item.size}`);
  bits.push(`× ${item.qty}`);
  return bits.join(" · ");
}
