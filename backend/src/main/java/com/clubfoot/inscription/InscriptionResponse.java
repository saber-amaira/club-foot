package com.clubfoot.inscription;

import java.time.Instant;
import java.time.LocalDate;

/**
 * Réponse volontairement minimale : les coordonnées du parent ne sont jamais renvoyées.
 */
public record InscriptionResponse(
        Long id,
        String prenom,
        String nom,
        LocalDate dateNaissance,
        Instant createdAt
) {

    public static InscriptionResponse from(Inscription inscription) {
        return new InscriptionResponse(
                inscription.getId(),
                inscription.getPrenom(),
                inscription.getNom(),
                inscription.getDateNaissance(),
                inscription.getCreatedAt()
        );
    }
}
