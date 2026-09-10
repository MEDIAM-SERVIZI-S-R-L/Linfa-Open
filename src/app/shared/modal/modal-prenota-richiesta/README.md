# Ricerca Esterna - Flusso 

La ricerca funziona in questo modo (flusso):
1) Seleziono tipo ti ricerca 
2) Cerco paziente

#### **Per ricerca esterna**

3) Se è stata selezionata la ricerca interna chiedo l'utente se deve partire anche la ricerca esterna per verificare se paziente esiste anche fuori 

4) Se c'e' match do il risultato lo chiedo vuoi usare questo paziente per una nuova richiesta 

**Richiesta esterna**

5) parte la ricerca e do il risultato 


**Richiesta esterna e interna**

6) Parte la ricerca nel DB Linfa e al esterno 
7) Mostro risultato 
8) seleziono il paziente - comportamento dipende dal tipo del paziente che è stato selezionato

    - Paziente interno : ripeto punto 3 e 4
    - Paziente esterno: non viene fatto niente procedo con creazione della richiesta paziente esterno


