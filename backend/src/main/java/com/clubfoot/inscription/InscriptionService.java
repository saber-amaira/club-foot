package com.clubfoot.inscription;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
public class InscriptionService {

    private final InscriptionRepository repository;

    public InscriptionService(InscriptionRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public InscriptionResponse creer(InscriptionRequest demande) {
        Inscription inscription = new Inscription(
                demande.prenom().trim(),
                demande.nom().trim(),
                demande.dateNaissance(),
                demande.emailParent().trim().toLowerCase(Locale.ROOT),
                demande.telephoneParent().trim()
        );
        return InscriptionResponse.from(repository.save(inscription));
    }
}
