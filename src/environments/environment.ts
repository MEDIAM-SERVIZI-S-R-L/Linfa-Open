declare const require: any;

export const environment = {
  production: false,
//  apiUrl:'https://test-api.linfa-mediam.it/',
//  apiUrlV2:'https://test-api.linfa-mediam.it/v2/',
 apiUrl: 'https://007dev.linfa-mediam.it/api/',
 //apiUrlV2: 'https://007dev.linfa-mediam.it/www/',
 appVersion: require('../../package.json').version+'-local',

 // apiUrl: 'https://localhost:44374/',
   apiUrlV2: 'https://localhost:44374/',
  Url: 'https://localhost:44374/',

  urlApiFirmaDigitale: 'http://127.0.0.1:9000/',
  requestPathFirmaDigitale: 'api/Sign/',

  requestPath: 'Linfa/',
  server: "test",
  minCharsForDynSearch: 4,
  //** Propieta che indica dove è salvato il token localStorage o sessionStaorage */
  // saveIn: "localStorage"
  saveIn: "sessionStorage",

  intestazioneDocumenti: 'assets/_files-configurazioni/intestazione-documenti.json',

  //* nome del Token da cercare nel Header */
  tokenName: "X-Token",


};
