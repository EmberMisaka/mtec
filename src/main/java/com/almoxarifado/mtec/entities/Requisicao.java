package com.almoxarifado.mtec.entities;

import jakarta.persistence.*;

import java.io.Serial;
import java.math.BigDecimal;
import java.util.Objects;

@Entity
@Table(name = "tb_item")
public class Requisicao {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String nome;
    private String unidade;
    private Integer estoqueMinimo;
    private Integer estoqueAtual;
    private String marca;
    private BigDecimal precoCusto;
    private String imageUrl;

    public Requisicao(){}

    public Requisicao(Long id, String nome, String unidade, Integer estoqueMinimo, Integer estoqueAtual, String marca, BigDecimal precoCusto, String imageUrl) {
        this.id = id;
        this.nome = nome;
        this.unidade = unidade;
        this.estoqueMinimo = estoqueMinimo;
        this.estoqueAtual = estoqueAtual;
        this.marca = marca;
        this.precoCusto = precoCusto;
        this.imageUrl = imageUrl;
    }

    public Long getId() {
        return id;
    }

    public String getNome() {
        return nome;
    }

    public String getUnidade() {
        return unidade;
    }

    public Integer getEstoqueMinimo() {
        return estoqueMinimo;
    }

    public Integer getEstoqueAtual() {
        return estoqueAtual;
    }

    public String getMarca() {
        return marca;
    }

    public BigDecimal getPrecoCusto() {
        return precoCusto;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Requisicao that = (Requisicao) o;
        return Objects.equals(getId(), that.getId()) && Objects.equals(getNome(), that.getNome()) && Objects.equals(getUnidade(), that.getUnidade()) && Objects.equals(getEstoqueMinimo(), that.getEstoqueMinimo()) && Objects.equals(getEstoqueAtual(), that.getEstoqueAtual()) && Objects.equals(getMarca(), that.getMarca()) && Objects.equals(getPrecoCusto(), that.getPrecoCusto()) && Objects.equals(getImageUrl(), that.getImageUrl());
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(getId());
    }
}
