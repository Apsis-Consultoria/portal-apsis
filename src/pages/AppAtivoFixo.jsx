import { useEffect } from "react";

export default function AppAtivoFixo() {
  useEffect(() => {
    window.open("https://apsis-ativo-fixo.app", "_blank");
    window.history.back();
  }, []);

  return null;
}