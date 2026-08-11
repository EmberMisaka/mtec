package com.almoxarifado.mtec.config;

import com.almoxarifado.mtec.entities.Categoria;
import com.almoxarifado.mtec.repositories.CategoriaRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataBasePopulation implements CommandLineRunner {

    private final CategoriaRepository categoriaRepository;

    public DataBasePopulation(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @Override
    public void run(String... args) {

        if (categoriaRepository.count() > 0) {
            return;
        }
        List<Categoria> categorias = List.of(
                new Categoria("Informática"),
                new Categoria("Periféricos"),
                new Categoria("Materiais de Escritório"),
                new Categoria("Limpeza"),
                new Categoria("Ferramentas"),
                new Categoria("Elétrica"),
                new Categoria("Hidráulica"),
                new Categoria("EPI"),
                new Categoria("Móveis"),
                new Categoria("Copa e Cozinha"),
                new Categoria("Descartáveis"),
                new Categoria("Papelaria"),
                new Categoria("Cabos e Conectores"),
                new Categoria("Redes"),
                new Categoria("Equipamentos"),
                new Categoria("Peças de Reposição"),
                new Categoria("Manutenção"),
                new Categoria("Materiais de Construção"),
                new Categoria("Organização e Armazenamento"),
                new Categoria("Outros")
        );

        categoriaRepository.saveAll(categorias);
    }
}