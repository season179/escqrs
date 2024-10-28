import type { Command, CommandHandler } from "./types";

export const commandHandlers = new Map<string, CommandHandler>();

export function CommandHandler(commandType: string) {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (command: Command) {
            return await originalMethod.call(this, command);
        };

        commandHandlers.set(commandType, descriptor.value);
        return descriptor;
    };
}
