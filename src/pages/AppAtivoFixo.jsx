import { useEffect } from "react";

export default function AppAtivoFixo() {
  useEffect(() => {
    window.open("https://invativos.apsis.com.br/", "_blank");
    window.history.back();
  }, []);

  return null;
}