import { useEffect } from "react";

export default function AppConciliacao() {
  useEffect(() => {
    window.open("https://apsis-conciliacao.app", "_blank");
    window.history.back();
  }, []);

  return null;
}