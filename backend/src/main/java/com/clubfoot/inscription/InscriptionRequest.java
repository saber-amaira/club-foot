package com.clubfoot.inscription;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record InscriptionRequest(
        @NotBlank(message = "Le prénom est obligatoire")
        @Size(max = 100, message = "100 caractères maximum")
        String prenom,

        @NotBlank(message = "Le nom est obligatoire")
        @Size(max = 100, message = "100 caractères maximum")
        String nom,

        @NotNull(message = "La date de naissance est obligatoire")
        @Past(message = "La date de naissance doit être dans le passé")
        LocalDate dateNaissance,

        @NotBlank(message = "L'email du parent est obligatoire")
        @Email(message = "Email invalide")
        @Size(max = 254, message = "254 caractères maximum")
        String emailParent,

        @NotBlank(message = "Le téléphone du parent est obligatoire")
        @Pattern(regexp = "^[0-9+()\\s.-]{6,20}$", message = "Téléphone invalide")
        String telephoneParent
) {
}
