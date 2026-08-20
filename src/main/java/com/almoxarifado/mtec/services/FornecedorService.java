package com.almoxarifado.mtec.services;

import com.almoxarifado.mtec.entities.Fornecedor;
import com.almoxarifado.mtec.repositories.FornecedorRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FornecedorService {

    private final FornecedorRepository fornecedorRepository;

    public FornecedorService(FornecedorRepository fornecedorRepository) {
        this.fornecedorRepository = fornecedorRepository;
    }

    public List<Fornecedor> listarTodos() {
        return fornecedorRepository.findAll();
    }

    public Fornecedor buscarPorId(Long id) {
        return fornecedorRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Fornecedor não encontrado: " + id));
    }

    public Fornecedor criar(Fornecedor fornecedor) {
        fornecedor.setCnpj(normalizarEValidarCnpj(fornecedor.getCnpj()));
        return fornecedorRepository.save(fornecedor);
    }

    public Fornecedor atualizar(Long id, Fornecedor dadosAtualizados) {
        Fornecedor fornecedor = buscarPorId(id);
        fornecedor.setRazaoSocial(dadosAtualizados.getRazaoSocial());
        fornecedor.setNomeFantasia(dadosAtualizados.getNomeFantasia());
        fornecedor.setCnpj(normalizarEValidarCnpj(dadosAtualizados.getCnpj()));
        fornecedor.setEndereco(dadosAtualizados.getEndereco());
        return fornecedorRepository.save(fornecedor);
    }

    public void deletar(Long id) {
        Fornecedor fornecedor = buscarPorId(id);
        fornecedorRepository.delete(fornecedor);
    }

    /**
     * Remove formatação (pontos, barra, traço) e valida os dígitos verificadores
     * do CNPJ (algoritmo padrão, módulo 11). Lança erro se inválido.
     */
    private String normalizarEValidarCnpj(String cnpjInformado) {
        String digitos = cnpjInformado == null ? "" : cnpjInformado.replaceAll("[^0-9]", "");

        if (digitos.length() != 14 || digitos.chars().distinct().count() == 1) {
            throw new IllegalArgumentException("CNPJ inválido.");
        }

        int[] n = digitos.chars().map(c -> c - '0').toArray();

        int[] peso1 = {5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
        int soma1 = 0;
        for (int i = 0; i < 12; i++) soma1 += n[i] * peso1[i];
        int resto1 = soma1 % 11;
        int dv1 = resto1 < 2 ? 0 : 11 - resto1;

        int[] peso2 = {6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2};
        int soma2 = 0;
        for (int i = 0; i < 13; i++) soma2 += n[i] * peso2[i];
        int resto2 = soma2 % 11;
        int dv2 = resto2 < 2 ? 0 : 11 - resto2;

        if (n[12] != dv1 || n[13] != dv2) {
            throw new IllegalArgumentException("CNPJ inválido.");
        }

        return digitos;
    }
}