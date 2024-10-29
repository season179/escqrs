import type { Saga, SagaManager, SagaRepository } from "./types";
import type { Event } from "../event/types";
import type { EventBus } from "../event/EventBus";
import { SagaNotFoundError } from "./types";

export class SimpleSagaManager implements SagaManager {
    private sagas = new Map<string, Saga>();
    private sagaTypes = new Map<string, new (...args: any[]) => Saga>();

    constructor(
        private sagaRepository: SagaRepository,
        private eventBus: EventBus
    ) {}

    /**
     * Register a saga type for creation
     */
    registerSaga<T extends Saga>(sagaType: new (...args: any[]) => T): void {
        this.sagaTypes.set(sagaType.name, sagaType);
    }

    /**
     * Start a new saga
     */
    async startSaga(
        sagaType: new (...args: any[]) => Saga,
        data: any
    ): Promise<void> {
        const saga = new sagaType(data);
        await saga.start();
        await this.saveSaga(saga);
        this.sagas.set(saga.id, saga);
    }

    /**
     * Handle an event and route it to relevant sagas
     */
    async handleEvent(event: Event): Promise<void> {
        // Find sagas that are interested in this event
        for (const saga of this.sagas.values()) {
            await saga.handleEvent(event);
            await this.saveSaga(saga);

            if (saga.isCompleted()) {
                await this.sagaRepository.delete(saga.id);
                this.sagas.delete(saga.id);
            }

            if (saga.hasTimedOut()) {
                // Handle timeout logic, e.g., mark as failed
                saga.state = "TimedOut";
                await this.saveSaga(saga);
                this.sagas.delete(saga.id);
            }
        }
    }

    /**
     * Save the saga state
     */
    private async saveSaga(saga: Saga): Promise<void> {
        const sagaData = {
            id: saga.id,
            state: saga.state,
            data: saga.data,
            createdAt: saga.createdAt,
            updatedAt: new Date(),
        };

        await this.sagaRepository.save(sagaData);
    }

    /**
     * Load sagas from the repository (e.g., on startup)
     */
    async loadSagas(): Promise<void> {
        // Implement loading sagas from the repository
        // For simplicity, assume we have a method to get all sagas
        // Alternatively, use a query to get sagas that are not completed
        // const sagaDatas = await this.sagaRepository.findAllActive();
        // for (const sagaData of sagaDatas) {
        //   const sagaType = this.sagaTypes.get(sagaData.type);
        //   if (sagaType) {
        //     const saga = new sagaType(sagaData.data, sagaData.id);
        //     saga.state = sagaData.state;
        //     saga.createdAt = sagaData.createdAt;
        //     saga.updatedAt = sagaData.updatedAt;
        //     this.sagas.set(saga.id, saga);
        //   }
        // }
    }
}
