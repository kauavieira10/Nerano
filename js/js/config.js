/* js/config.js — configuração do dashboard NERANO */
const CONFIG = {
  apiBase: '',   // mesma origem (o proxy roda no próprio servidor)

  // Colunas fixadas conforme a planilha "Diário Performance".
  //  'auto' = detecta pelo cabeçalho · número = índice (0=A) · texto = nome do cabeçalho
  COLUMNS: {
    data:          'data',
    verbaGoogle:   'verba google',
    leadsGoogle:   'lead google',
    verbaFacebook: 'verba fb',
    leadsFacebook: 'lead plataforma fb'
  }
};

/* Metas do mês (vindas do bloco de resumo da planilha).
   São escaladas proporcionalmente quando você filtra um período menor. */
const META_ALL = { verba: 5950, leads: 162, cpl: 36.73 };
const META_G   = { verba: 2000, leads: 50,  cpl: 40.00 };
const META_F   = { verba: 3950, leads: 112, cpl: 35.27 };
