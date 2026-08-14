package com.almoxarifado.mtec.controllers;

import com.almoxarifado.mtec.dto.UsuarioRequest;
import com.almoxarifado.mtec.dto.UsuarioResponse;
import com.almoxarifado.mtec.entities.Usuario;
import com.almoxarifado.mtec.repositories.UsuarioRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@PreAuthorize("hasRole('ADMIN')")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioController(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public List<UsuarioResponse> listar() {
        return usuarioRepository.findAll().stream().map(UsuarioResponse::de).toList();
    }
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id, @AuthenticationPrincipal Usuario usuarioLogado) {
        if (usuarioLogado.getId().equals(id)) {
            throw new IllegalStateException("Você não pode excluir seu próprio usuário.");
        }
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado: " + id));
        usuarioRepository.delete(usuario);
    }
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioResponse criar(@RequestBody UsuarioRequest request) {
        if (request.nome() == null || request.nome().isBlank()) {
            throw new IllegalArgumentException("Informe o nome do usuário");
        }
        if (request.email() == null || request.email().isBlank()) {
            throw new IllegalArgumentException("Informe o e-mail do usuário");
        }
        if (request.senha() == null || request.senha().length() < 6) {
            throw new IllegalArgumentException("A senha deve ter pelo menos 6 caracteres");
        }
        if (request.perfil() == null) {
            throw new IllegalArgumentException("Selecione o perfil do usuário");
        }
        if (usuarioRepository.findByEmail(request.email()).isPresent()) {
            throw new IllegalArgumentException("Já existe um usuário cadastrado com este e-mail");
        }
        Usuario usuario = new Usuario();
        usuario.setNome(request.nome());
        usuario.setEmail(request.email());
        usuario.setSenha(passwordEncoder.encode(request.senha()));
        usuario.setPerfil(request.perfil());
        return UsuarioResponse.de(usuarioRepository.save(usuario));
    }
}