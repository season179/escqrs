import { nanoid } from 'nanoid';
import type { CommandHandler } from '../command-handler.interface';
import type { CreateUserCommand } from './create-user.command';
import type { EventStore } from '../../../infrastructure/event-store/event-store.interface';
import { User } from '../../../domain/aggregates/user';

export class CreateUserCommandHandler implements CommandHandler<CreateUserCommand> {
    constructor(private eventStore: EventStore) {}

    async handle(command: CreateUserCommand): Promise<string> {
        const userId = `usr-${nanoid()}`; // UserId is also the aggregateId
        const user = new User(userId);
        
        user.create(
            command.payload.name,
            command.payload.email
        );

        await this.eventStore.saveEvents(user.getUncommittedEvents());
        
        return userId;
    }
}
