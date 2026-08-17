package com.almoxarifado.mtec.dto;

public record EntradaRequest(Long itemId, Integer quantidade, String observacao, String linkPecom, String numeroPecom, String numeroNf) {
}