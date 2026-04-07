import { MatchX01Service } from "../../application/services/MatchX01Service";
import { AsyncStorageMatchX01Repository } from "../adapters/AsyncStorageMatchX01Repository";

export default class MatchX01ServiceFactory {
    private static instance: MatchX01Service | null = null;

    private constructor() { }

    public static getInstance(): MatchX01Service {
        if (!this.instance) {
            const repository = new AsyncStorageMatchX01Repository();
            this.instance = new MatchX01Service(repository);
        }
        return this.instance;
    }
}
