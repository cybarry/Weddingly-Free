export function formatPrice(price: number, currency: string = "USD"): string {
  try {
    // Try to format as proper ISO currency code (e.g. "USD", "NGN", "GBP")
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency: currency.trim(),
    }).format(price);
  } catch (error) {
    // Fallback: If currency is an arbitrary symbol like "₦" or "$", 
    // or an invalid code, just prepend it and format the number locally.
    const symbol = currency.trim() || "$";
    const formattedNumber = new Intl.NumberFormat("en").format(price);
    
    // If it's a known symbol, attach without space, otherwise use space
    const isSymbol = /^[^a-zA-Z0-9]+$/.test(symbol);
    return isSymbol ? `${symbol}${formattedNumber}` : `${symbol} ${formattedNumber}`;
  }
}
