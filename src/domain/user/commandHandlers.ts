import { CommandHandler } from "../../command/decorators";
import type { Command, CommandHandler as ICommandHandler } from "../../command/types";
import { EventStore } from "../../event/EventStore";
import { User } from "./User";

@CommandHandler("CreateUser")
export class CreateUserHandler implements ICommandHandler {
    private eventStore: EventStore;
    constructor(eventStore: EventStore) {
        this.eventStore = eventStore;
        
    }

    async handle(command: Command): Promise<void> {
        const { email, name } = command.payload;
        const user = new User(command.payload.id);
        user.create(email, name);
        await this.eventStore.save(user);
    }
}

@CommandHandler("UpdateUserProfile")
export class UpdateUserProfileHandler implements ICommandHandler {
    constructor(private eventStore: EventStore) {}

    async handle(command: Command): Promise<void> {
        const user = await this.eventStore.load(User, command.payload.id);

        user.updateProfile(command.payload.name);
        await this.eventStore.save(user);
    }
}

@CommandHandler("DeactivateUser")
export class DeactivateUserHandler implements ICommandHandler {
    constructor(private eventStore: EventStore) {}

    async handle(command: Command): Promise<void> {
        const user = await this.eventStore.load(User, command.payload.id);

        user.deactivate();
        await this.eventStore.save(user);
    }
}
