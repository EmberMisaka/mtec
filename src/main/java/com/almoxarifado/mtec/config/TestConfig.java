package com.almoxarifado.mtec.config;

import com.almoxarifado.mtec.entities.Item;
import com.almoxarifado.mtec.repositories.ItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import java.util.Arrays;

@Configuration
@Profile("test")
public class TestConfig implements CommandLineRunner {

    @Autowired
    private ItemRepository itemRepository;

    @Override
    public void run(String... args) throws Exception {
        Item i1 = new Item(null, "Papel Higienico", "2", 1, 1, "Pampers", 2.55, "");
        Item i2 = new Item(null, "Café", "2", 1, 1, "Pampers", 30.00, "");

        itemRepository.saveAll(Arrays.asList(i1, i2));
    }
}
