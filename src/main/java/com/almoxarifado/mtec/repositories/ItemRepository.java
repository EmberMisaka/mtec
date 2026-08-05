package com.almoxarifado.mtec.repositories;

import com.almoxarifado.mtec.entities.Item;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ItemRepository extends JpaRepository<Item, Long> {

}
