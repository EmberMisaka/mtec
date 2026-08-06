package com.almoxarifado.mtec.controllers;

import com.almoxarifado.mtec.dto.AjusteRequest;
import com.almoxarifado.mtec.dto.EntradaRequest;
import com.almoxarifado.mtec.dto.SaidaRequest;
import com.almoxarifado.mtec.entities.Movimentacao;
import com.almoxarifado.mtec.services.MovimentacaoService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/movimentacoes")
public class MovimentacaoController {

    private final MovimentacaoService movimentacaoService;

    public MovimentacaoController(MovimentacaoService movimentacaoService) {
        this.movimentacaoService = movimentacaoService;
    }

    @GetMapping
    public List<Movimentacao> listar() {
        return movimentacaoService.listarTodas();
    }

    @GetMapping("/item/{itemId}")
    public List<Movimentacao> listarPorItem(@PathVariable Long itemId) {
        return movimentacaoService.listarPorItem(itemId);
    }

    @PostMapping("/entrada")
    @ResponseStatus(HttpStatus.CREATED)
    public Movimentacao registrarEntrada(@RequestBody EntradaRequest request) {
        return movimentacaoService.registrarEntrada(request.itemId(), request.quantidade(), request.observacao());
    }

    @PostMapping("/saida")
    @ResponseStatus(HttpStatus.CREATED)
    public Movimentacao registrarSaida(@RequestBody SaidaRequest request) {
        return movimentacaoService.registrarSaida(request.itemId(), request.quantidade(), request.observacao());
    }

    @PostMapping("/ajuste")
    @ResponseStatus(HttpStatus.CREATED)
    public Movimentacao registrarAjuste(@RequestBody AjusteRequest request) {
        return movimentacaoService.registrarAjusteInventario(request.itemId(), request.contagemFisica(), request.observacao());
    }
}