/*
 * Entity: User
 */
export class User {
  public readonly id: string;
  private _name: string;


  // --------------------------------------------------------------------------
  // Constructor
  // --------------------------------------------------------------------------

  private constructor(
    id: string,
    name: string,
  ) {
    this.id = id;
    this._name = name;
  }


  // --------------------------------------------------------------------------
  // Factory Method: The only way to create a new user
  // --------------------------------------------------------------------------

  public static create(
    name: string,
    id?: string,
  ): User {
    return new User(
      id ? id : Math.random().toString(36).substring(2, 9),
      name
    );
  }


  // --------------------------------------------------------------------------
  // Getters
  // --------------------------------------------------------------------------

  public get name(): string {
    return this._name;
  }


  // --------------------------------------------------------------------------
  // Setters
  // --------------------------------------------------------------------------

  public set name(name: string) {
    this._name = name;
  }
}
