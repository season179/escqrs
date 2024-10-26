import type { Command } from '../../domain/interfaces/command';

export interface CommandHandler<T extends Command> {
    handle(command: T): Promise<any>;
}
