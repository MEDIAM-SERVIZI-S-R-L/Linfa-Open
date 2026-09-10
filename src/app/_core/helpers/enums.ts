export enum StepVisita {
  Anamnesi = 0,
  AnamnesiAlimentare = 1,
  MNAKarnofsky = 2,
  ValutazioneNutrizionale = 3,
  Riepilogo = 4,
  Predefinita = 5
}

export enum StepPaziente {
  Anagrafica = 0,
  Privacy = 1,
  Riepilogo = 2
}

export enum Questionario {
  Mna = 1,
  Karnofsky = 2,
  NRS = 3,
  Must = 4
}
export enum TipoPrestazione {
  PrimaVisita = 1,
  VisitaControllo = 2,
  Sapio = 3,
  VisitaDomicilio = 4,
  NP = 5,
  NR = 6,
  VisitaDomicilio1=10000
}
export enum TipoRichiesta {
  Cup = 1,
  Interna = 2,
  Sapio = 3,
  AccettazioneDiretta = 4,
  Reparto= 5,
  Distretto=6

}

export enum TipoAlimentazione {
  NaturaleMista = 1,
  Artificiale = 2,
  Conclusioni = 6,
}

export enum TipoAlimentazioneString {
  NaturaleMista = 'Naturale',
  Artificiale = 'Artificiale',
  Conclusioni = 'Conclusioni',
}

export enum StatoVisita {
  DaIniziare = 20,
  Iniziata = 25,
  DaRefertare = 30,
  Terminata = 35,
  Firmata = 40,
  Cancellata = 99
}
export enum Pasto {
  Colazione = 1,
  Spuntino = 2,
  Pranzo = 3,
  Merenda = 4,
  Cena = 5,
  Integratori = 6,
  SpuntinoSerale = 7,
  LiquidiAssunti = 8,
  DietaUnica = 999
}

export enum PastoString{
  Colazione = "colazione",
  Spuntino = "spuntino mattutino",
  Pranzo = "pranzo",
  Merenda = "merenda",
  Cena = "cena",
  Integratori = "integratori",
  SpuntinoSerale = "spuntino serale",
  LiquidiAssunti = "liquidi assunti",
  DietaUnica = ''
}

export enum Giorno{
  Lunedi = 'lunedi',
  Martedi = 'martedi',
  Mercoledi = 'mercoledi',
  Giovedi = 'giovedi',
  Venerdi = 'venerdi',
  Sabato = 'sabato',
  Domenica = 'domenica'  
}

export enum Ruoli {
  Administrator = 1,
  Test = 2,
  SAPIOext = 3,
  Medico = 4,
  Dietista = 10,
  Amministrativo = 11,
  Domiciliare = 12,
  UtenteIntegrazione = 13,
  Guest = 0,
  Distretto = 15,
  FarmaciaOspedaliera = 16,
  Reparto = 14,
  Infermiere=17
}

export enum TipoEnti{
  Reparto = 3,
  Distretto = 4,
  FarmaciaOspedaliera = 5
}

export enum TipoIndirizzo {
  Domicilio = 1,
  Residenza = 2,
  Nascita = 3
}

export enum TipoProdotto {
  Solidi = 1,
  NutrizioneArtificiale = 2,
  Integratori = 3,
  Liquidi = 4,
  SacchePersonalizzate = 5
}
export enum TipoDocumento {
  RefertoNutrizione = 1,
  BIA = 2,
  AnalisiLaboratorio = 3,
  Monitoring = 4,
  Foto = 5,
  PianoTerapeutico = 10,
  Privacy = 11,
  Varie = 99,
}
export enum TipoNutrizioneArtificiale {
  Enterale = 1,
  Parenterale = 2,
}

export enum StatoRichiesta {
  DaAccettare = 5,
  Accettata = 10,
  Terminata = 15,
  Cancellata = 99
}
export enum ValiditaPassword {
  Valida = 10,
  InScadenza = 20,
  Scaduta = 99
}
export enum TipiAmminoacidi {
  Completi = 1,
  Essenziali = 2,
  Selettivi = 3,
  Negrolofici = 4,
}

export enum TipoAggiunta {
  Vitamine = 1,
  Oligoelementi = 2
}

/** nomi priopeta nel API */
export enum ProprietaConfig {
  Privacy = "privacy",
  FirmaDigitale = "DigitalSign",
  ProvaFirma = "provaFirmaDigitale",
  Intestazione = "intestazioneReferto",
  PrenotaProxVisita = "prenotaProssimaVisita",
  Sync = "sincronizzazione",
  CredenzialiApp = "credenziali",
  IntestazioneMediciFirma = "intestazioneMedici",
  RicercaEsterna="UrlExternaPatientSearch",
  ModuloOrderEntry="moduloOrderEntry",
  ModuloDistretto= "moduloDistretto",
  LDAP = "LDAP",
  InvioVersoMirth="UrlExtNotification",
  mailXPianoNutrizionale = "mailXPianoNutrizionale",
  TipiVisualizzazioneDieta = "TipiVisualizzazioneDieta",
  InvioRefertiSenzaFirma = "InvioRefertiSenzaFirma"
}

export enum Permessi {
  ModuloDashboard = 1,
  DettaglioDashboard = 2,
  CambioPasswordProfilo = 3,
  ModuloUtenti = 5,
  ModuloRichieste = 6,
  ModuloProdotti = 7,
  MostraDiete = 8,
  ModuloSupporto = 9,
  ModuloGestionePermessi = 16,
  AccessoNutrizioneNaturale = 17,
  AccessoConclusioni = 18,
  ConcludiVisita = 19,
  ImpersonificaUtente = 20,
  ControlloPasswordScaduta = 21,
  FirmaDigitale = 22,
  ForzaInizioVisita = 23,
  GestioneRuoli = 30,
  GestioneSacche = 31,
  ModuloStatistiche = 32,
  ModuloVisite = 33,
  ModuloPazienti = 34,
  ModuloProfilo = 35,
  AccessoNutrizioneArtificiale = 36,
  MostraPianiNutrizionali = 38,
  ModificaUtente = 39,
  ModificaProdotti = 40,
  TestSincronizzazione = 41,
}




export enum ChartTypes{
  Pie= 1,
  Label = 2, // mostra numero e la label on click apre modale con i dettaglio
  Line= 101,
  Bar= 102,
  Radar= 103,
  Polar=104,
  Doughnut= 3,
Test= 1000


}

export enum ChartTypeName{
  Pie= 'Pie',
  Label = 'Label', // mostra numero e la label on click apre modale con i dettaglio
  Line= 'Line',
  Bar= 'Bar',
  Radar= 'Radar',
  Polar='Polar',
  Doughnut= 'Doughnut',
  Test='Test'
}


/**
 * Analisi possono avere tre tipi diverse come risposta
 * bool - fa vedere check
 * double - si puo scrivere solo numero
 * string - permette di scriere il testo
 */
export enum TipoValoreAnalisi{
  Boolean="bool",
  Number="double",
  String="string"
}

/*
1 - attiva solo la ricerca in Linfa
2- solo esetena
3 - ricerca in tutte due le parti
*/
export enum TipoRicerca {
  Interna= 1,
  Esterna= 2,
  Entrambi =3
    }

export enum DatQueryRichieste{
  Cup = 2,
  Interne= 3,
  OrderEntry = 16,
  Distretto = 17
}

export enum mail{
  mailAssente = 'Mail assente'
}

export enum DatiAntropometriciString{
alimentazioneScelta = "Alimentazione scelta",
allettato = "Allettato",
altezza = "Altezza",
alvo = "Alvo",
attivita = "Attività",
bicipitale = "Plica bicipitale",
bmiattuale = "BMI attuale",
bmiottimale = "BMI ottimale",
braccio = "Braccio",
caloPonderale3Mesi = "Calo ponderale 3 mesi",
caloPonderale6Mesi = "Calo ponderale 6 mesi",
caloponderale = "Calo ponderale",
circAddominale = "Circonferenza addominale",
circPolso = "Circonferenza polso",
consistenzaPasto = "Consistenza pasto",
dataCaloPonderale= "",
dataInizioPatologia= "",
disfagia = "Disfagia",
diuresi= "Diuresi",
gradodisfagia= "Grado disfagia",
impedenza = 'Impedenza',
latoMisurazione= "lato misurazione",
lunghezzaUlna = "Lunghezza ulna",
malnutrizione = "Malnutrizione",
note = "Note",
pesoabituale = "Peso abituale",
pesoattuale = "Peso attuale",
pesomassimo= "Peso massimo",
pesominimo = "Peso minimo",
pesoottimale = "Peso ottimale",
piagheDecubito = "Piage da decubito",
polpaccio = "Polpaccio",
ritmoSonnoVeglia = "Ritmo sonno veglia",
rz = "Rz",
sottoscapolare = "Plica sottoscapolare",
sovrailiaca = "Plica sovrailica",
tipoFeci = "Tipo feci",
tricipitale = "Plica tricipitale",
wh = "Wh",
xc = "Xc"
}