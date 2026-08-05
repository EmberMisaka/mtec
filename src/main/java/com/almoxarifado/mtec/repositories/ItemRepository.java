package com.almoxarifado.mtec.repositories;

import com.almoxarifado.mtec.entities.Categoria;
import com.almoxarifado.mtec.entities.Item;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ItemRepository extends JpaRepository<Item, Long> {

    Optional<Item> findByNomeIgnoreCase(String nome);

    List<Item> findByCategoria(Categoria categoria);
}