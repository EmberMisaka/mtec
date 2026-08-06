package com.almoxarifado.mtec.services;

import com.almoxarifado.mtec.entities.Item;
import com.almoxarifado.mtec.entities.Movimentacao;
import com.almoxarifado.mtec.enums.TipoMovimentacao;
import com.almoxarifado.mtec.repositories.MovimentacaoRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class MovimentacaoService {

    private final MovimentacaoRepository movimentacaoRepository;
    private final ItemService itemService;

    public MovimentacaoService(MovimentacaoRepository movimentacaoRepository, ItemService itemService) {
        this.movimentacaoRepository = movimentacaoRepository;
        this.itemService = itemService;
    }

    public List<Movimentacao> listarTodas() {
        return movimentacaoRepository.findAllByOrderByDataDesc();
    }

    public List<Movimentacao> listarPorItem(Long itemId) {
        Item item = itemService.buscarPorId(itemId);
        return movimentacaoRepository.findByItemOrderByDataDesc(item);
    }

    public Movimentacao registrarEntrada(Long itemId, int quantidade, String observacao) {
        if (quantidade <= 0) {
            throw new IllegalArgumentException("Quantidade de entrada deve ser maior que zero.");
        }
        Item item = itemService.buscarPorId(itemId);
        itemService.ajustarEstoque(item, quantidade);
        return salvarMovimentacao(item, TipoMovimentacao.ENTRADA, quantidade, observacao);
    }

    public Movimentacao registrarSaida(Long itemId, int quantidade, String observacao) {
        if (quantidade <= 0) {
            throw new IllegalArgumentException("Quantidade de saída deve ser maior que zero.");
        }
        Item item = itemService.buscarPorId(itemId);
        itemService.ajustarEstoque(item, -quantidade);
        return salvarMovimentacao(item, TipoMovimentacao.SAIDA, quantidade, observacao);
    }

    public Movimentacao registrarAjusteInventario(Long itemId, int contagemFisica, String observacao) {
        Item item = itemService.buscarPorId(itemId);
        int diferenca = contagemFisica - item.getEstoqueAtual();
        itemService.ajustarEstoque(item, diferenca);
        return salvarMovimentacao(item, TipoMovimentacao.AJUSTE, diferenca, observacao);
    }

    Movimentacao salvarMovimentacao(Item item, TipoMovimentacao tipo, int quantidade, String observacao) {
        Movimentacao movimentacao = new Movimentacao();
        movimentacao.setItem(item);
        movimentacao.setTipo(tipo);
        movimentacao.setQuantidade(quantidade);
        movimentacao.setData(LocalDate.now());
        movimentacao.setObservacao(observacao);
        return movimentacaoRepository.save(movimentacao);
    }
}