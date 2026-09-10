import { IIcd9DTO } from "../_dtos/in";


interface IIcd9{
    icd9: string,
    descrizione: string,
    cod: string
}

export class Icd9 implements IIcd9{
    icd9: string;
    descrizione: string;
    cod: string;

    constructor(item : IIcd9DTO) {
        this.icd9 = item.icd9;
        this.descrizione = item.descr;
        this.cod = item.cod  
    }
}