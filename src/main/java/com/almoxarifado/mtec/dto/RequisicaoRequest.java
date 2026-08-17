package com.almoxarifado.mtec.dto;

public record RequisicaoRequest(Long itemId, String setor, Integer quantidade, String observacao) {
}