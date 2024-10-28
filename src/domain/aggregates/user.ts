import { AggregateRoot } from './aggregate-root';

export class User extends AggregateRoot {
    private name: string = '';
    private email: string = '';

    create(name: string, email: string): void {
        this.addEvent('UserCreated', { name, email });
        this.apply({ name, email });
    }

    update(name: string, email: string): void {
        this.addEvent('UserUpdated', { name, email });
        this.apply({ name, email });
    }

    private apply(data: { name: string, email: string }): void {
        this.name = data.name;
        this.email = data.email;
    }
}
