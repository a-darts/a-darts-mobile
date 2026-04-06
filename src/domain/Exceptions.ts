export class BustException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "BustException";
    }
}

export class InvalidThrowException extends Error {
    constructor(message: string) {
        super(message);
        this.name = "InvalidThrowException";
    }
}
