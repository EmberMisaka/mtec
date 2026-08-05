package com.almoxarifado.mtec.repositories;

import com.almoxarifado.mtec.entities.Item;
import com.almoxarifado.mtec.entities.Requisicao;
import com.almoxarifado.mtec.enums.StatusRequisicao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RequisicaoRepository extends JpaRepository<Requisicao, Long> {

    List<Requisicao> findByStatus(StatusRequisicao status);

    List<Requisicao> findByItem(Item item);
}