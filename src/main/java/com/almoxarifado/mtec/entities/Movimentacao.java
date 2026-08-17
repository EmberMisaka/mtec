package com.almoxarifado.mtec.entities;

import com.almoxarifado.mtec.enums.TipoMovimentacao;
import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "movimentacao")
public class Movimentacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoMovimentacao tipo;

    @Column(nullable = false)
    private Integer quantidade;

    @Column(nullable = false)
    private LocalDate data;

    @Column(name = "link_pecom")
    private String linkPecom;

    @Column(name = "numero_pecom")
    private String numeroPecom;

    @Column(name = "numero_nf")
    private String numeroNf;

    private String observacao;

    public Movimentacao() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Item getItem() {
        return item;
    }

    public void setItem(Item item) {
        this.item = item;
    }

    public TipoMovimentacao getTipo() {
        return tipo;
    }

    public void setTipo(TipoMovimentacao tipo) {
        this.tipo = tipo;
    }

    public Integer getQuantidade() {
        return quantidade;
    }

    public void setQuantidade(Integer quantidade) {
        this.quantidade = quantidade;
    }

    public LocalDate getData() {
        return data;
    }

    public void setData(LocalDate data) {
        this.data = data;
    }

    public String getObservacao() {
        return observacao;
    }

    public void setObservacao(String observacao) {
        this.observacao = observacao;
    }

    public String getLinkPecom() {return linkPecom;}

    public void setLinkPecom(String linkPecom) {this.linkPecom = linkPecom;}

    public String getNumeroPecom() {return numeroPecom;}

    public void setNumeroPecom(String numeroPecom) {this.numeroPecom = numeroPecom;}

    public String getNumeroNf() {return numeroNf;}

    public void setNumeroNf(String numeroNf) {this.numeroNf = numeroNf;}
}