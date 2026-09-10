/*  dto data transfer object  */

/**
 *Enum contiene il nomi di classe css che saranno inseripe per diverso dipo di notifica
 *
 * @export
 * @enum {number}
 */
export enum SnackBarType{
    ok="skOk",
    error="skError",
    warning="skWarning"
}
interface ISnackBarBox{
messaggio: string;
tipo: SnackBarType;
}


/**
 *  Object Notifica ha due propieta
 * .messaggio - testo da visualizzare 
 * .tipo - errore, ok o warning
 * @export
 * @class SnackBarBox
 * @implements {ISnackBarBox}
 */
export class SnackBarBox implements ISnackBarBox{
    messaggio: string;
    tipo: SnackBarType;
    }