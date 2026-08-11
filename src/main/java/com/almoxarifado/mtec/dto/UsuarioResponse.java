package com.almoxarifado.mtec.dto;

import com.almoxarifado.mtec.entities.Usuario;
import com.almoxarifado.mtec.enums.Perfil;

public record UsuarioResponse(Long id, String nome, String email, Perfil perfil) {
    public static UsuarioResponse de(Usuario u) {
        return new UsuarioResponse(u.getId(), u.getNome(), u.getUsername(), u.getPerfil());
    }
}