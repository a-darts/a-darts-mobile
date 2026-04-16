/*
 * Entity: User
 */
export class User {
  public readonly id: string;
  private _name: string;


  // --------------------------------------------------------------------------
  // Constructor
  // --------------------------------------------------------------------------

  constructor(
    id: string,
    name: string,
  ) {
    this.id = id;
    this._name = name || 'Jugador';
  }


  // --------------------------------------------------------------------------
  // Factory Method: The only way to create a new user
  // --------------------------------------------------------------------------

  public static create(
    name: string,
  ): User {
    const id = Math.random().toString(36).substring(2, 9);
    return new User(id, name);
  }
}
