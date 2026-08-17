package com.almoxarifado.mtec.controllers;

import com.almoxarifado.mtec.dto.RequisicaoRequest;
import com.almoxarifado.mtec.entities.Requisicao;
import com.almoxarifado.mtec.entities.Usuario;
import com.almoxarifado.mtec.enums.StatusRequisicao;
import com.almoxarifado.mtec.services.RequisicaoService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requisicoes")
public class RequisicaoController {

    private final RequisicaoService requisicaoService;

    public RequisicaoController(RequisicaoService requisicaoService) {
        this.requisicaoService = requisicaoService;
    }

    @GetMapping
    public List<Requisicao> listar(@RequestParam(required = false) StatusRequisicao status) {
        return status == null
                ? requisicaoService.listarTodas()
                : requisicaoService.listarPorStatus(status);
    }

    @GetMapping("/{id}")
    public Requisicao buscarPorId(@PathVariable Long id) {
        return requisicaoService.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Requisicao criar(@RequestBody RequisicaoRequest request, @AuthenticationPrincipal Usuario usuarioLogado) {
        return requisicaoService.criar(
                request.itemId(), usuarioLogado.getNome(), request.setor(),
                request.quantidade(), request.observacao()
        );
    }

    @PutMapping("/{id}/aprovar")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR')")
    public Requisicao aprovar(@PathVariable Long id) {
        return requisicaoService.aprovar(id);
    }

    @PutMapping("/{id}/atender")
    public Requisicao atender(@PathVariable Long id) {
        return requisicaoService.atender(id);
    }

    @PutMapping("/{id}/cancelar")
    @PreAuthorize("hasAnyRole('ADMIN', 'GESTOR')")
    public Requisicao cancelar(@PathVariable Long id) {
        return requisicaoService.cancelar(id);
    }
}