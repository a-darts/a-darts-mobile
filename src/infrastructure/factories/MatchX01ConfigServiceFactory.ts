import { MatchX01ConfigService } from "../../application/services/MatchX01ConfigService";
import { IMatchX01Repository } from "../../domain/ports/IMatchX01Repository";
import { AsyncStorageMatchX01Repository } from "../adapters/AsyncStorageMatchX01Repository";

export default class MatchX01ConfigServiceFactory {
    private static instance: MatchX01ConfigService;

    private constructor() { }

    public static getInstance(): MatchX01ConfigService {
        if (!MatchX01ConfigServiceFactory.instance) {
            const repository: IMatchX01Repository = new AsyncStorageMatchX01Repository();
            this.instance = new MatchX01ConfigService(repository);
        }
        return this.instance;
    }
}
