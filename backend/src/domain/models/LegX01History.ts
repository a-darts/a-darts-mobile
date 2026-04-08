import { ThrowX01 } from "./ThrowX01";

export class LegX01History {
    private readonly _legNumber: number;
    private readonly _setNumber: number;
    private readonly _throws: ThrowX01[];

    constructor(
        legNumber: number,
        setNumber: number,
        throws: ThrowX01[],
    ) {
        this._legNumber = legNumber;
        this._setNumber = setNumber;
        this._throws = [...throws];
    }
}
