import type { CommandHandler } from '../command-handler.interface';
import type { UpdateUserCommand } from './update-user.command';
import type { EventStore } from '../../../infrastructure/event-store/event-store.interface';
import { User } from '../../../domain/aggregates/user';

export class UpdateUserCommandHandler implements CommandHandler<UpdateUserCommand> {
    constructor(private eventStore: EventStore) {}

    async handle(command: UpdateUserCommand): Promise<void> {
        // First, get the existing events to reconstruct the user's state
        const events = await this.eventStore.getEventById(command.payload.userId);
        
        if (!events.length) {
            throw new Error(`User with ID ${command.payload.userId} not found`);
        }

        const user = new User(command.payload.userId);
        
        // Apply existing events to reconstruct the user's state
        events.forEach(event => {
            if (event.type === 'UserCreated') {
                user.create(event.payload.name, event.payload.email);
            }
            // Add other event types as needed
        });

        // Update the user
        user.update(command.payload.name, command.payload.email);

        // Save the new events
        await this.eventStore.saveEvents(user.getUncommittedEvents());
    }
}