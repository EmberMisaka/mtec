package com.almoxarifado.mtec.controllers;

import com.almoxarifado.mtec.entities.Item;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(value = "/items")
public class ItemController {

    @GetMapping
    public ResponseEntity<Item> findAll(){
        Item i = new Item(1L, "Papel Higiênico", "3", 1, 1, "Pampers", 3.55, "");
        return ResponseEntity.ok().body(i);
    }
}
