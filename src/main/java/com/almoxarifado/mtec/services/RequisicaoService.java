package com.almoxarifado.mtec.services;

import com.almoxarifado.mtec.entities.Item;
import com.almoxarifado.mtec.entities.Requisicao;
import com.almoxarifado.mtec.enums.StatusRequisicao;
import com.almoxarifado.mtec.enums.TipoMovimentacao;
import com.almoxarifado.mtec.repositories.RequisicaoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class RequisicaoService {

    private final RequisicaoRepository requisicaoRepository;
    private final ItemService itemService;
    private final MovimentacaoService movimentacaoService;

    public RequisicaoService(RequisicaoRepository requisicaoRepository,
                             ItemService itemService,
                             MovimentacaoService movimentacaoService) {
        this.requisicaoRepository = requisicaoRepository;
        this.itemService = itemService;
        this.movimentacaoService = movimentacaoService;
    }

    public List<Requisicao> listarTodas() {
        return requisicaoRepository.findAll();
    }

    public List<Requisicao> listarPorStatus(StatusRequisicao status) {
        return requisicaoRepository.findByStatus(status);
    }

    public Requisicao buscarPorId(Long id) {
        return requisicaoRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Requisição não encontrada: " + id));
    }

    public Requisicao criar(Long itemId, String solicitante, String setor, int quantidade, String observacao) {
        Item item = itemService.buscarPorId(itemId);

        Requisicao requisicao = new Requisicao();
        requisicao.setItem(item);
        requisicao.setSolicitante(solicitante);
        requisicao.setSetor(setor);
        requisicao.setQuantidade(quantidade);
        requisicao.setData(LocalDate.now());
        requisicao.setObservacao(observacao);
        requisicao.setStatus(StatusRequisicao.PENDENTE);

        return requisicaoRepository.save(requisicao);
    }

    public Requisicao aprovar(Long requisicaoId) {
        Requisicao requisicao = buscarPorId(requisicaoId);

        if (requisicao.getStatus() != StatusRequisicao.PENDENTE) {
            throw new IllegalStateException("Somente requisições pendentes podem ser aprovadas.");
        }

        Item item = requisicao.getItem();
        if (requisicao.getQuantidade() > item.getEstoqueAtual()) {
            throw new IllegalStateException("Estoque insuficiente para aprovar esta requisição.");
        }

        requisicao.setStatus(StatusRequisicao.APROVADA);
        return requisicaoRepository.save(requisicao);
    }

    public Requisicao atender(Long requisicaoId) {
        Requisicao requisicao = buscarPorId(requisicaoId);

        if (requisicao.getStatus() != StatusRequisicao.APROVADA) {
            throw new IllegalStateException("Somente requisições aprovadas podem ser atendidas.");
        }

        Item item = requisicao.getItem();
        if (requisicao.getQuantidade() > item.getEstoqueAtual()) {
            throw new IllegalStateException("Estoque insuficiente para atender esta requisição.");
        }

        itemService.ajustarEstoque(item, -requisicao.getQuantidade());
        movimentacaoService.salvarMovimentacao(
                item,
                TipoMovimentacao.SAIDA,
                requisicao.getQuantidade(),
                "Requisição de " + requisicao.getSolicitante()
        );

        requisicao.setStatus(StatusRequisicao.ATENDIDA);
        return requisicaoRepository.save(requisicao);
    }

    public Requisicao cancelar(Long requisicaoId) {
        Requisicao requisicao = buscarPorId(requisicaoId);

        if (requisicao.getStatus() != StatusRequisicao.PENDENTE && requisicao.getStatus() != StatusRequisicao.APROVADA) {
            throw new IllegalStateException("Somente requisições pendentes ou aprovadas podem ser canceladas.");
        }

        requisicao.setStatus(StatusRequisicao.CANCELADA);
        return requisicaoRepository.save(requisicao);
    }
}