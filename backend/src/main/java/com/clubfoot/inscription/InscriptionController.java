package com.clubfoot.inscription;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

/**
 * Pas d'endpoint de liste : les données d'enfants ne doivent pas être lisibles publiquement.
 */
@RestController
@RequestMapping("/api/inscriptions")
public class InscriptionController {

    private final InscriptionService service;

    public InscriptionController(InscriptionService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<InscriptionResponse> creer(@Valid @RequestBody InscriptionRequest demande) {
        InscriptionResponse creee = service.creer(demande);
        return ResponseEntity.created(URI.create("/api/inscriptions/" + creee.id())).body(creee);
    }
}
