package com.clubfoot.inscription;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Test d'intégration : nécessite un PostgreSQL (voir docker-compose.yml en local,
 * service Postgres dans la CI). Chaque test est annulé (rollback) à la fin.
 */
@SpringBootTest
@Transactional
class InscriptionControllerTest {

    private static final String JSON_VALIDE = """
            {
              "prenom": "Léa",
              "nom": "Martin",
              "dateNaissance": "2016-05-12",
              "emailParent": "Parent@Example.com",
              "telephoneParent": "06 12 34 56 78"
            }
            """;

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

    @BeforeEach
    void init() {
        mockMvc = MockMvcBuilders.webAppContextSetup(context).build();
    }

    @Test
    void creeUneInscription() throws Exception {
        mockMvc.perform(post("/api/inscriptions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(JSON_VALIDE))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.prenom").value("Léa"))
                .andExpect(jsonPath("$.nom").value("Martin"))
                .andExpect(jsonPath("$.dateNaissance").value("2016-05-12"))
                // les coordonnées du parent ne sont jamais renvoyées
                .andExpect(jsonPath("$.emailParent").doesNotExist())
                .andExpect(jsonPath("$.telephoneParent").doesNotExist());
    }

    @Test
    void rejetteLesDonneesInvalides() throws Exception {
        String json = """
                {
                  "prenom": "",
                  "nom": "Martin",
                  "dateNaissance": "2016-05-12",
                  "emailParent": "pas-un-email",
                  "telephoneParent": "06 12 34 56 78"
                }
                """;

        mockMvc.perform(post("/api/inscriptions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erreurs.prenom").exists())
                .andExpect(jsonPath("$.erreurs.emailParent").exists());
    }

    @Test
    void rejetteUneDateDeNaissanceDansLeFutur() throws Exception {
        String json = """
                {
                  "prenom": "Léa",
                  "nom": "Martin",
                  "dateNaissance": "2999-01-01",
                  "emailParent": "parent@example.com",
                  "telephoneParent": "0612345678"
                }
                """;

        mockMvc.perform(post("/api/inscriptions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.erreurs.dateNaissance").exists());
    }

    @Test
    void refuseUneInscriptionEnDouble() throws Exception {
        mockMvc.perform(post("/api/inscriptions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(JSON_VALIDE))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/inscriptions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(JSON_VALIDE))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Cette inscription existe déjà"));
    }
}
