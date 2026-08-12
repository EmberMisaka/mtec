package com.almoxarifado.mtec.services;

import com.almoxarifado.mtec.entities.Item;
import com.almoxarifado.mtec.repositories.ItemRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ItemService {

    private final ItemRepository itemRepository;

    public ItemService(ItemRepository itemRepository) {
        this.itemRepository = itemRepository;
    }

    public List<Item> listarTodos() {
        return itemRepository.findAll();
    }

    public Item buscarPorId(Long id) {
        return itemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Item não encontrado: " + id));
    }

    public Item criar(Item item) {
        return itemRepository.save(item);
    }

    public Item atualizar(Long id, Item dadosAtualizados) {
        Item item = buscarPorId(id);
        item.setNome(dadosAtualizados.getNome());
        item.setCategoria(dadosAtualizados.getCategoria());
        item.setUnidade(dadosAtualizados.getUnidade());
        item.setEstoqueMinimo(dadosAtualizados.getEstoqueMinimo());
        item.setMarca(dadosAtualizados.getMarca());
        item.setPrecoCusto(dadosAtualizados.getPrecoCusto());
        return itemRepository.save(item);
        // note: estoqueAtual não entra aqui de propósito — ver observação abaixo
        // note: a imagem também não entra aqui de propósito — é gerenciada à parte via salvarImagem/removerImagem
    }

    public void deletar(Long id) {
        Item item = buscarPorId(id);
        itemRepository.delete(item);
    }

    /**
     * Salva o arquivo de imagem enviado pelo usuário (qualquer formato de imagem:
     * png, jpeg, gif etc.), substituindo a imagem anterior do item, se houver.
     */
    public Item salvarImagem(Long id, byte[] dados, String contentType) {
        Item item = buscarPorId(id);
        item.setImagem(dados);
        item.setImagemContentType(contentType);
        return itemRepository.save(item);
    }

    public void removerImagem(Long id) {
        Item item = buscarPorId(id);
        item.setImagem(null);
        item.setImagemContentType(null);
        itemRepository.save(item);
    }

    /**
     * Usado internamente por MovimentacaoService e RequisicaoService
     * para alterar o saldo em estoque, sempre acompanhado do registro
     * de uma Movimentacao correspondente.
     */
    Item ajustarEstoque(Item item, int delta) {
        item.setEstoqueAtual(item.getEstoqueAtual() + delta);
        return itemRepository.save(item);
    }
}