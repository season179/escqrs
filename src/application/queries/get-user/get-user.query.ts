export interface GetUserQuery {
    type: "GetUser";
    payload: {
        userId: string;
    }
}