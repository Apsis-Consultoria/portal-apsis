import { useEffect } from "react";

export default function AppImoveis() {
  useEffect(() => {
    window.open("https://apsis-imoveis.app", "_blank");
    window.history.back();
  }, []);

  return null;
}