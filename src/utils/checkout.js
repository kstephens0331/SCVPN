import { supabase } from "../supabaseClient";

export async function startCheckout(payload) {
  const { data, error } = await supabase.functions.invoke("checkout", { body: payload });
  if (error) {
    console.error(error);
    alert(error.message || "Checkout error");
    return;
  }
  if (!data?.url) {
    alert("Checkout did not return a URL");
    return;
  }
  window.location.href = data.url;
}
