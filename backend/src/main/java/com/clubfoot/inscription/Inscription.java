package com.clubfoot.inscription;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "inscription")
public class Inscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "prenom", nullable = false, length = 100)
    private String prenom;

    @Column(name = "nom", nullable = false, length = 100)
    private String nom;

    @Column(name = "date_naissance", nullable = false)
    private LocalDate dateNaissance;

    @Column(name = "email_parent", nullable = false, length = 254)
    private String emailParent;

    @Column(name = "telephone_parent", nullable = false, length = 20)
    private String telephoneParent;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected Inscription() {
        // requis par JPA
    }

    public Inscription(String prenom, String nom, LocalDate dateNaissance,
                       String emailParent, String telephoneParent) {
        this.prenom = prenom;
        this.nom = nom;
        this.dateNaissance = dateNaissance;
        this.emailParent = emailParent;
        this.telephoneParent = telephoneParent;
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public String getPrenom() {
        return prenom;
    }

    public String getNom() {
        return nom;
    }

    public LocalDate getDateNaissance() {
        return dateNaissance;
    }

    public String getEmailParent() {
        return emailParent;
    }

    public String getTelephoneParent() {
        return telephoneParent;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
