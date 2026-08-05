package com.almoxarifado.mtec.repositories;

import com.almoxarifado.mtec.entities.Item;
import com.almoxarifado.mtec.entities.Movimentacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovimentacaoRepository extends JpaRepository<Movimentacao, Long> {

    List<Movimentacao> findByItemOrderByDataDesc(Item item);
}