package com.almoxarifado.mtec.services;

import com.almoxarifado.mtec.entities.Item;
import com.almoxarifado.mtec.repositories.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ItemService {

    @Autowired
    private ItemRepository repository;

    public List<Item> findAll() {
        return repository.findAll();
    }

    public Item findById(Long id){
        Optional<Item> obj = repository.findById(id);
        return obj.get();
    }
}
