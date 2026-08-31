/**
 * Constantes compartilhadas entre controllers e rotas.
 * Mantidas em um único lugar para não haver divergência entre a
 * validação de entrada (express-validator) e as regras de negócio
 * do controller.
 */

/** Valores válidos para o status de um chamado. */
const STATUS_CHAMADO = ['Aberto', 'Em Atendimento', 'Concluído'];

module.exports = { STATUS_CHAMADO };
