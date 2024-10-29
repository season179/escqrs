interface Message {
    id: string;
    timestamp: Date;
    metadata: Record<string, any>;
}

interface Command extends Message {
    type: string;
    payload: any;
}

interface Event extends Message {
    type: string;
    aggregateId: string;
    version: number;
    payload: any;
}

interface Query extends Message {
    type: string;
    parameters: any;
}
