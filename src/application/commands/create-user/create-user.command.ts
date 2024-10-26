import type { Command } from '../../../domain/interfaces/command';

export interface CreateUserCommand extends Command {
    type: 'CreateUser';
    payload: {
        name: string;
        email: string;
    };
}
