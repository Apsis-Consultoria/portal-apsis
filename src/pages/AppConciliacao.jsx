import { useEffect } from "react";

export default function AppConciliacao() {
  useEffect(() => {
    window.open("https://invativos.apsis.com.br/admin/inventories", "_blank");
    window.history.back();
  }, []);

  return null;
}