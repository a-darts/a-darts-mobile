export class Board {
    private readonly _shortId: string;

    // --------------------------------------------------------------------------
    // Constructor
    // --------------------------------------------------------------------------

    constructor(
        shortId: string,
    ) {
        this._shortId = shortId;
    }

    // -------------------------------------------------------------------------
    // Getters
    // -------------------------------------------------------------------------

    public get shortId(): string {
        return this._shortId;
    }
}
