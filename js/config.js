/* js/config.js — configuração do dashboard */
const CONFIG = {
  // mesma origem: o frontend chama o proxy do próprio servidor
  apiBase: '',

  // Mapeamento de colunas da planilha.
  //  'auto'  -> detecta pelo cabeçalho (ignora acentos/maiúsculas)
  //  número  -> índice fixo da coluna (0 = A, 1 = B, 2 = C ...)
  //  texto   -> nome exato do cabeçalho
  COLUMNS: {
    data:          'auto',
    verbaGoogle:   'auto',
    leadsGoogle:   'auto',
    verbaFacebook: 'auto',
    leadsFacebook: 'auto'
  }
};

/* Metas do período (base de 30 dias). São escaladas proporcionalmente
   quando você filtra um período menor. */
const META_ALL = { verba: 24000, leads: 520, cpl: 42 };
const META_G   = { verba: 13000, leads: 300, cpl: 43 };
const META_F   = { verba: 11000, leads: 220, cpl: 48 };
