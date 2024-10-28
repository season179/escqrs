import { v4 as uuidv4 } from "uuid";
import type { Command } from "./types";
import { CommandBus } from "./CommandBus";

export class CommandGateway {
    constructor(private commandBus: CommandBus) {}

    async send<T extends Command>(
        commandType: string,
        payload: any,
        metadata: Record<string, any> = {}
    ): Promise<void> {
        const command: Command = {
            id: uuidv4(),
            type: commandType,
            payload,
            metadata,
            timestamp: new Date(),
        };

        await this.commandBus.dispatch(command);
    }
}
