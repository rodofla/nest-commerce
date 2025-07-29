export interface IHashingAdapter {
  /**
   * Genera un hash seguro a partir de un string en texto plano de forma asíncrona.
   *
   * @param plain - El string en texto plano a hashear.
   * @returns Una promesa que resuelve con el hash generado.
   *
   * @remarks
   * El saltRounds está preconfigurado en 10 por defecto.
   */
  hash(plain: string): Promise<string>;

  /**
   * Compara un string en texto plano con un hash existente de forma asíncrona.
   *
   * @param plain - El string en texto plano a comparar.
   * @param hash - El hash contra el que se compara.
   * @returns Una promesa que resuelve en true si coinciden, false si no.
   */
  compare(plain: string, hash: string): Promise<boolean>;

  /**
   * Genera un hash seguro a partir de un string en texto plano de forma síncrona.
   *
   * @param plain - El string en texto plano a hashear.
   * @returns El hash generado.
   *
   * @remarks
   * El saltRounds está preconfigurado en 10 por defecto.
   */
  hashSync(plain: string): string;

  /**
   * Compara un string en texto plano con un hash existente de forma síncrona.
   *
   * @param plain - El string en texto plano a comparar.
   * @param hash - El hash contra el que se compara.
   * @returns true si coinciden, false si no.
   */
  compareSync(plain: string, hash: string): boolean;
}
