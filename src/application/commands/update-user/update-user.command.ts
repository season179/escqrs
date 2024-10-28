import type { Command } from '../../../domain/interfaces/command';

export interface UpdateUserCommand extends Command {
    type: 'UpdateUser';
    payload: {
        userId: string;
        name: string;
        email: string;
    };
}
