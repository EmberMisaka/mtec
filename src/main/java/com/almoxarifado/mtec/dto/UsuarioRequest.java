package com.almoxarifado.mtec.dto;

import com.almoxarifado.mtec.enums.Perfil;

public record UsuarioRequest(String nome, String email, String senha, String confirmacaoSenha, Perfil perfil) {
}