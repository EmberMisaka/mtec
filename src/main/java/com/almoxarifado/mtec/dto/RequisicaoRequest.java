package com.almoxarifado.mtec.dto;

public record RequisicaoRequest(Long itemId, String solicitante, String setor, Integer quantidade, String observacao) {
}