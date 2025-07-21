/**
 * Fichier de déclaration pour résoudre les problèmes d'importation avec les aliases de chemins
 * Ce fichier aide TypeScript à comprendre les imports utilisant @model/* etc.
 */

// Pour @model/types/*
declare module '@model/types/*' {
  const value: any;
  export = value;
  export * from '../../../model/types/*';
}

// Pour @orm/*
declare module '@orm/*' {
  const value: any;
  export = value;
  export * from '../../../utility/ORM/*';
}

// Pour @error/*
declare module '@error/*' {
  const value: any;
  export = value;
  export * from '../../../utility/error/*';
}

// Pour @routes/*
declare module '@routes/*' {
  const value: any;
  export = value;
  export * from '../../../routes/*';
}

// Pour @controllers/*
declare module '@controllers/*' {
  const value: any;
  export = value;
  export * from '../../../controllers/*';
}

// Pour @logging/*
declare module '@logging/*' {
  const value: any;
  export = value;
  export * from '../../../utility/logging/*';
}
