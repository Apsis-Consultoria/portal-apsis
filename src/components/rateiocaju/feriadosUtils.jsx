/**
 * Feriados nacionais fixos (MM-DD)
 */
const FERIADOS_NACIONAIS = [
  "01-01", // Confraternização Universal
  "04-21", // Tiradentes
  "05-01", // Dia do Trabalho
  "09-07", // Independência
  "10-12", // Nossa Senhora Aparecida
  "11-02", // Finados
  "11-15", // Proclamação da República
  "12-25", // Natal
];

/**
 * Feriados específicos de SP (MM-DD)
 */
const FERIADOS_SP = [
  ...FERIADOS_NACIONAIS,
  "01-25", // Aniversário de SP
  "07-09", // Revolução Constitucionalista
];

/**
 * Feriados específicos de RJ (MM-DD)
 */
const FERIADOS_RJ = [
  ...FERIADOS_NACIONAIS,
  "01-20", // São Sebastião (padroeiro do RJ)
  "11-20", // Consciência Negra (feriado municipal RJ)
];

/**
 * Feriados móveis por ano (Carnaval, Páscoa, Corpus Christi)
 * Calculados automaticamente
 */
function calcularPascoa(ano) {
  const a = ano % 19;
  const b = Math.floor(ano / 100);
  const c = ano % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(ano, mes - 1, dia);
}

function getFeriadosMoveis(ano) {
  const pascoa = calcularPascoa(ano);
  const carnavалTerca = new Date(pascoa); carnavалTerca.setDate(pascoa.getDate() - 47);
  const carnavalSegunda = new Date(pascoa); carnavalSegunda.setDate(pascoa.getDate() - 48);
  const sextaSanta = new Date(pascoa); sextaSanta.setDate(pascoa.getDate() - 2);
  const corpusChristi = new Date(pascoa); corpusChristi.setDate(pascoa.getDate() + 60);

  return [carnavalSegunda, carnavалTerca, sextaSanta, pascoa, corpusChristi];
}

function toMMDD(date) {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${m}-${d}`;
}

/**
 * Calcula dias úteis de segunda a sexta sem feriados para um estado em um mês/ano
 * @param {number} ano
 * @param {number} mes - 1 a 12
 * @param {"SP"|"RJ"} estado
 * @returns {number}
 */
export function calcularDiasUteis(ano, mes, estado) {
  const feriadosFixos = estado === "SP" ? FERIADOS_SP : FERIADOS_RJ;
  const feriadosMoveis = getFeriadosMoveis(ano).map(toMMDD);
  const todosFeriados = new Set([...feriadosFixos, ...feriadosMoveis]);

  let diasUteis = 0;
  const diasNoMes = new Date(ano, mes, 0).getDate();

  for (let dia = 1; dia <= diasNoMes; dia++) {
    const date = new Date(ano, mes - 1, dia);
    const diaSemana = date.getDay(); // 0=Dom, 6=Sab
    if (diaSemana === 0 || diaSemana === 6) continue;
    const mmdd = toMMDD(date);
    if (todosFeriados.has(mmdd)) continue;
    diasUteis++;
  }

  return diasUteis;
}

export function formatMes(mesRef) {
  if (!mesRef) return "";
  const [ano, mes] = mesRef.split("-");
  const meses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
  return `${meses[parseInt(mes) - 1]}/${ano}`;
}