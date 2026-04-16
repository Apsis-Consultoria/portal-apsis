import { useEffect } from "react";

export default function AppImoveis() {
  useEffect(() => {
    window.open("https://imoveis.apsis.com.br/", "_blank");
    window.history.back();
  }, []);

  return null;
}