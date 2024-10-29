import { QueryHandler } from "../../query/decorators";
import type {
    Query,
    QueryHandler as IQueryHandler,
    QueryResult,
} from "../../query/types";
import { EventStore } from "../../event/EventStore";
import { User } from "./User";

@QueryHandler("GetUser")
export class GetUserHandler implements IQueryHandler<Query> {
    constructor(private eventStore: EventStore) {}

    async handle(query: Query): Promise<QueryResult> {
        const user = await this.eventStore.load(User, query.parameters.id);

        return { data: user.getState() };
    }
}
