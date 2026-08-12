package com.almoxarifado.mtec.controllers;

import com.almoxarifado.mtec.entities.Item;
import com.almoxarifado.mtec.services.ItemService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/itens")
public class ItemController {

    private final ItemService itemService;

    public ItemController(ItemService itemService) {
        this.itemService = itemService;
    }

    @GetMapping
    public List<Item> listar() {
        return itemService.listarTodos();
    }

    @GetMapping("/{id}")
    public Item buscarPorId(@PathVariable Long id) {
        return itemService.buscarPorId(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('ADMIN')")
    public Item criar(@RequestBody Item item) {
        return itemService.criar(item);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Item atualizar(@PathVariable Long id, @RequestBody Item item) {
        return itemService.atualizar(id, item);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void deletar(@PathVariable Long id) {
        itemService.deletar(id);
    }

    /* ---------- Imagem do item ----------
       Aceita qualquer arquivo de imagem (png, jpeg, gif etc.) enviado via multipart,
       em vez de receber apenas uma URL de texto. */

    @PostMapping("/{id}/imagem")
    @PreAuthorize("hasRole('ADMIN')")
    public Item enviarImagem(@PathVariable Long id, @RequestParam("arquivo") MultipartFile arquivo) {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new IllegalArgumentException("Selecione um arquivo de imagem");
        }
        String contentType = arquivo.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("O arquivo enviado precisa ser uma imagem (png, jpeg, gif etc.)");
        }
        try {
            return itemService.salvarImagem(id, arquivo.getBytes(), contentType);
        } catch (IOException e) {
            throw new IllegalStateException("Não foi possível processar o arquivo de imagem");
        }
    }

    @GetMapping("/{id}/imagem")
    public ResponseEntity<byte[]> obterImagem(@PathVariable Long id) {
        Item item = itemService.buscarPorId(id);
        byte[] imagem = item.getImagem();
        if (imagem == null || imagem.length == 0) {
            return ResponseEntity.notFound().build();
        }
        MediaType tipo;
        try {
            tipo = MediaType.parseMediaType(item.getImagemContentType());
        } catch (Exception e) {
            tipo = MediaType.APPLICATION_OCTET_STREAM;
        }
        return ResponseEntity.ok().contentType(tipo).body(imagem);
    }

    @DeleteMapping("/{id}/imagem")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('ADMIN')")
    public void removerImagem(@PathVariable Long id) {
        itemService.removerImagem(id);
    }
}