
export interface StatoCivile {
    id: number;
    statoCivile: string;
}
export interface Convivenze {
    id: number;
    convivenza: string;
}
export interface TitoliStudio {
    id: number;
    titoloStudio: string;
}
export interface LivelliPrivacy {
    id: number;
    livelloPrivacy: string;
}
export interface GradoParentela {
    id: number;
    gradoParentela: string;
}

export interface Regione {
    idRegione: number;
    cod: string;
    regione: string;
}

export interface Provincia {
    idProvincia: number;
    provincia: string;
    cod: string;
}
export interface Comune {
    idComune: number;
    comune: string;
}

export interface Tutore {
    nome: string;
    cognome: string;
    sesso: string;
    cf: string;
    dataNascita: any;
    gradoParentela: number;
    cartaIdentita: string;
    telefono: string;
    altroGradoParentela: string;
    id: number;
}

export interface TipoProdottoLista {
    id: number;
    tipoProdotto: string;
}
export interface TipoAlimentazioneArtificialeLista {
    id: number;
    artificiale: string;
}
export interface CategoriaAlimentare {
    id: number;
    categoriaAlimentare: string;
}
export interface UnitaMisura {
    id: number;
    categoriaAlimentare: string;
}

export interface AggiuntaMiscela {
    tipo: number;
    aggiunta: string;
    quantita: number;
}

export interface ProfiloUtente {
    nome: string;
    cognome: string;
    username: string;
    email: string;
    matricola: string;
    ruolo: string;
    dataPassword: string;
}