# Comprehensive Development Plan for Earn Wage Account Microservice (Updated)

## Table of Contents

1. [Introduction](#1-introduction)
2. [Architecture Overview](#2-architecture-overview)
3. [Technology Stack](#3-technology-stack)
4. [Event Sourcing and CQRS Implementation](#4-event-sourcing-and-cqrs-implementation)
5. [Microservice Design](#5-microservice-design)
   - [5.1 Command Side](#51-command-side)
   - [5.2 Query Side](#52-query-side)
   - [5.3 Saga and Process Management](#53-saga-and-process-management)
6. [Database Schema](#6-database-schema)
7. [API Endpoints](#7-api-endpoints)
8. [Code Quality and Best Practices](#8-code-quality-and-best-practices)
9. [Deployment Strategy](#9-deployment-strategy)
10. [Performance Optimization](#10-performance-optimization)
11. [Development Roadmap](#11-development-roadmap)
12. [Conclusion](#12-conclusion)

---

## 1. Introduction

This document outlines a comprehensive plan to develop a RESTful microservice using the **Fastify** framework for handling **Earn Wage Accounts**. The microservice allows employers to grant credits to employee accounts, and employees can withdraw, top up mobile plans, or make bill payments from their accumulated credits. The account resets to zero every month, restarting the credit accrual process.

The development will adhere to event sourcing and CQRS principles, leveraging TypeScript and the Bun runtime, inspired by the Axon Framework but built independently. The application will support **PostgreSQL** databases, and be containerized using Docker for deployment on Kubernetes.

Special attention will be paid to code quality to ensure reliability in production environments. Unique identifiers will be generated using **nanoid** instead of UUIDs, and TypeScript configuration will enforce type-only imports where necessary due to the `verbatimModuleSyntax` setting.

---

## 2. Architecture Overview

The microservice will follow a **modular architecture** based on event sourcing and CQRS patterns, separating read and write operations to optimize scalability and performance.

- **Command Side**: Handles all write operations, processing commands that mutate the state of the Earn Wage Accounts.
- **Query Side**: Handles all read operations, providing optimized data retrieval through projections.
- **Event Store**: Centralized storage for all events, providing an immutable audit trail.
- **Sagas**: Manage complex business processes and orchestrate between aggregates.
- **API Layer**: Exposes RESTful endpoints using Fastify for client interactions.
- **Deployment**: Dockerized application deployed on Kubernetes for scalability and resilience.

---

## 3. Technology Stack

- **Language**: TypeScript
- **Runtime**: Bun
- **Web Framework**: Fastify
- **Databases**: PostgreSQL 
- **Unique Identifier Generation**: nanoid (avoiding UUID)
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **Messaging**: In-process messaging (initially), Azure Service Bus (if necessary)
- **Serialization**: JSON (default), with options for Protobuf or Avro
- **Version Control**: Git
- **Testing**: Jest or Mocha with Chai
- **CI/CD**: GitHub Actions or Azure DevOps
- **TypeScript Configuration**: As per the provided `tsconfig.json`, with `verbatimModuleSyntax` enabled and type-only imports enforced.

---

## 4. Event Sourcing and CQRS Implementation

### 4.1 Event Sourcing

- **Event Store**: Implement an event store supporting PostgreSQL to record all state changes as a sequence of immutable events.
- **Event Versioning**: Each event will have a version number to handle schema evolution.
- **Event Upcasting**: Transform older event versions into newer formats during loading to maintain compatibility.
- **Event Identification**:
  - Each event must have a unique ID generated using `nanoid`.
  - Events must be linked to an `uid` (employment ID) to represent employment, ensuring operations are tightly tied to employment.

### 4.2 CQRS (Command Query Responsibility Segregation)

- **Command Side**: Processes commands that change the state of aggregates (e.g., credit granting, withdrawals).
- **Query Side**: Provides read-only views optimized for client queries, updated via event projections.
- **Type Imports**:
  - With `verbatimModuleSyntax` enabled in `tsconfig.json`, ensure that all type imports are done using type-only imports to comply with the configuration.

---

## 5. Microservice Design

### 5.1 Command Side

#### 5.1.1 Commands

- **GrantCreditCommand**: Allows employers to add credits to an employee's account via `uid`.
- **WithdrawCreditCommand**: Enables employees to withdraw credits, ensuring they don't exceed available balance.
- **TopUpMobilePlanCommand**: Allows direct top-up of mobile plans from the account.
- **BillPaymentCommand**: Facilitates bill payments directly from the account.
- **ProcessReversalCommand**: Handles reversals, crediting back the account when notified by banks or service providers.
- **ResetAccountCommand**: Resets the account balance to zero monthly via `uid`.

#### 5.1.2 Aggregates

- **EarnWageAccountAggregate**: Represents the account, enforcing business rules and processing commands.
  - The aggregate must tie accounts and operations to the `uid`.

#### 5.1.3 Command Handlers

- Use TypeScript decorators to define command handlers within aggregates.
- **Validation**: Ensure all commands are validated for required fields and business rules before processing.
  - Enforce that operations are tied to the correct `uid`.
- **Unique Identifiers**:
  - Use `nanoid` for generating unique identifiers for aggregates and events.

#### 5.1.4 Command Bus

- Implement a custom **Command Bus** for asynchronous command dispatching.
- Design the Command Bus to be extensible for future distributed processing.

### 5.2 Query Side

#### 5.2.1 Projections

- **AccountBalanceProjection**: Provides current balance and transaction history via `uid`.
- **MonthlyStatementProjection**: Summarizes account activities for the month.
- **ReversalHistoryProjection**: Tracks all reversal transactions.

#### 5.2.2 Query Handlers

- Implement query handlers using decorators to respond to client queries.
- Ensure that queries retrieve data based on `uid`.

#### 5.2.3 Query Bus

- A custom **Query Bus** to route and handle query requests efficiently.

#### 5.2.4 Subscription Queries

- Use **Server-Sent Events (SSE)** to provide real-time updates to clients.
- Implement client reconnection logic to resume from the last received event.

### 5.3 Saga and Process Management

#### 5.3.1 Sagas

- **ReversalSaga**: Manages the reversal process when notified by banks or service providers.
- **MonthlyResetSaga**: Orchestrates the monthly account reset process via `uid`.

#### 5.3.2 Saga Persistence

- Store saga states in the database to ensure persistence across system restarts.
- Implement timeout mechanisms to handle incomplete processes.

---

## 6. Database Schema

### 6.1 Event Store Tables

- **Events Table**
  - `event_id` (string, nanoid)
  - `aggregate_id` (string, nanoid)
  - `uid` (string) // Employment ID
  - `event_type` (string)
  - `version` (integer)
  - `timestamp` (datetime)
  - `payload` (JSON)

- **Snapshots Table**
  - `snapshot_id` (string, nanoid)
  - `aggregate_id` (string, nanoid)
  - `version` (integer)
  - `timestamp` (datetime)
  - `state` (JSON)

### 6.2 Saga Tables

- **Sagas Table**
  - `saga_id` (string, nanoid)
  - `state` (JSON)
  - `status` (string)
  - `timeout` (datetime)
  - `metadata` (JSON)

### 6.3 Projection Tables

- **AccountBalances Table**
  - `account_id` (string, nanoid)
  - `uid` (string)
  - `current_balance` (decimal)
  - `last_updated` (datetime)

- **TransactionHistory Table**
  - `transaction_id` (string, nanoid)
  - `account_id` (string, nanoid)
  - `uid` (string)
  - `type` (string)
  - `amount` (decimal)
  - `timestamp` (datetime)
  - `metadata` (JSON)

---

## 7. API Endpoints

### 7.1 Command Endpoints

- **POST** `/accounts/{uid}/credits`
  - **Description**: Grant credits to an account.
  - **Request Body**: `{ "amount": decimal }`

- **POST** `/accounts/{uid}/withdrawals`
  - **Description**: Withdraw credits from an account.
  - **Request Body**: `{ "amount": decimal }`

- **POST** `/accounts/{uid}/mobile-top-up`
  - **Description**: Top up a mobile plan from the account.
  - **Request Body**: `{ "mobileNumber": string, "amount": decimal }`

- **POST** `/accounts/{uid}/bill-payments`
  - **Description**: Make a bill payment from the account.
  - **Request Body**: `{ "billId": string, "amount": decimal }`

- **POST** `/accounts/{uid}/reversals`
  - **Description**: Process a reversal transaction.
  - **Request Body**: `{ "transactionId": string, "amount": decimal }`

### 7.2 Query Endpoints

- **GET** `/accounts/{uid}/balance`
  - **Description**: Retrieve the current account balance.

- **GET** `/accounts/{uid}/transactions`
  - **Description**: Retrieve transaction history.

- **GET** `/accounts/{uid}/monthly-statement`
  - **Description**: Retrieve the monthly statement.

- **GET** `/accounts/{uid}/subscribe`
  - **Description**: Subscribe to real-time updates via SSE.

### 7.3 Administrative Endpoints

- **POST** `/accounts/reset`
  - **Description**: Trigger the monthly reset of all accounts via `uid` (secured endpoint).

---

## 8. Code Quality and Best Practices

### 8.1 Code Standards

- Enforce strict TypeScript rules as per the provided `tsconfig.json`, with `"strict": true` and `"noUnusedLocals": false`.
- Use ESLint and Prettier for code linting and formatting.
- Ensure that type-only imports are used where necessary, especially with `verbatimModuleSyntax` enabled.

### 8.2 Testing

- Write comprehensive unit tests for all modules using Jest or Mocha with Chai.
- Implement integration tests for critical paths.
- Use test coverage tools to ensure a high percentage of code coverage.

### 8.3 Code Reviews

- Implement a mandatory code review process for all pull requests.
- Use GitHub or GitLab's code review features to facilitate discussions and approvals.

### 8.4 Continuous Integration/Continuous Deployment (CI/CD)

- Set up automated testing pipelines using GitHub Actions or Jenkins.
- Integrate code quality checks into the CI pipeline.
- Automate deployments to staging environments after passing all tests.

### 8.5 Documentation

- Maintain up-to-date documentation for code, APIs, and system architecture.
- Use tools like JSDoc for inline code documentation.
- Generate API documentation using Swagger or OpenAPI.

### 8.6 Error Handling and Logging

- Implement comprehensive error handling with meaningful error messages.
- Use logging libraries to log errors and important events.
- Ensure that sensitive information is not logged.

### 8.7 Security

- Conduct regular security audits.
- Use static code analysis tools to detect vulnerabilities.
- Ensure that all dependencies are up-to-date and free of known vulnerabilities.

---

## 9. Deployment Strategy

### 9.1 Dockerization

- Create a Dockerfile to containerize the application.
- Use multi-stage builds to optimize image size.
- Ensure that production code is built with optimizations and minifications where appropriate.

### 9.2 Kubernetes Deployment

- Define Kubernetes manifests for Deployment, Service, ConfigMaps, and Secrets.
- Use Kubernetes ConfigMaps and Secrets for configuration and sensitive data.
- Set up Horizontal Pod Autoscaler (HPA) for scalability.
- Ensure inter-pod communication for distributed processing.

### 9.3 Stateless Design

- Design services to be stateless to facilitate scaling.
- Avoid singleton patterns; if necessary, manage shared state via the database.

### 9.4 Environment Management

- Use environment variables for configuration settings.
- Implement different configurations for development, testing, and production environments.

---

## 10. Performance Optimization

### 10.1 Event Replay and Snapshotting

- Implement automatic snapshotting after a configurable number of events or time intervals.
- Optimize snapshot size to include only necessary state.
- Use indexing on aggregate IDs and timestamps for quick event retrieval.

### 10.2 Handling Large Event Streams

- Process events in batches to optimize memory usage.
- Use incremental replay by replaying only events after the last snapshot.

### 10.3 Real-Time Updates

- Utilize SSE for efficient handling of many concurrent client connections.
- Implement connection pooling for database interactions.
- Handle backpressure by throttling updates under heavy load.

### 10.4 Database Optimization

- Index critical fields in the database for faster queries.
- Prune old snapshots and events that are no longer needed.

---

## 11. Development Roadmap

### Phase 1: Project Setup and Core Functionality (Weeks 1-4)

- Set up the project structure with Fastify, TypeScript, and Bun runtime.
- Configure TypeScript according to the provided `tsconfig.json`.
- Implement the command and event buses.
- Develop the `EarnWageAccountAggregate` and basic command handlers.
- Set up the event store with support for PostgreSQL.
- Create initial API endpoints for granting credits and withdrawals via `uid`.
- Set up ESLint, Prettier, and other code quality tools.

### Phase 2: Event Sourcing and CQRS Implementation (Weeks 5-8)

- Implement event sourcing handlers and event upcasting.
- Develop projections and query handlers for the query side.
- Implement the Query Bus and initial query endpoints.
- Set up snapshotting mechanisms.
- Implement SSE for subscription queries.
- Write unit tests for new components.

### Phase 3: Saga Implementation and Additional Features (Weeks 9-12)

- Develop sagas for handling reversals and monthly resets via `uid`.
- Implement saga persistence and timeout mechanisms.
- Add endpoints for mobile top-up and bill payments.
- Implement process reversals and account reset functionalities.
- Ensure all identifiers are generated using `nanoid`.

### Phase 4: Testing and Optimization (Weeks 13-16)

- Write unit and integration tests for all components.
- Optimize performance for event replay and real-time updates.
- Conduct load testing and optimize database queries.
- Implement logging and monitoring tools.
- Ensure type-only imports are correctly used throughout the codebase.

### Phase 5: Deployment and Scalability (Weeks 17-20)

- Dockerize the application and set up Kubernetes deployment.
- Configure environment-specific settings using ConfigMaps and Secrets.
- Set up CI/CD pipelines for automated testing and deployment.
- Perform end-to-end testing in a production-like environment.
- Ensure code quality standards are met before deployment.

### Phase 6: Documentation and Finalization (Weeks 21-24)

- Prepare comprehensive documentation for the codebase.
- Write API documentation using tools like Swagger or OpenAPI.
- Conduct security audits and address any vulnerabilities.
- Finalize the application and prepare for production release.
- Re-verify that code quality standards are upheld.

---

## 12. Conclusion

This development plan outlines the creation of a robust, scalable microservice for handling Earn Wage Accounts using Fastify and adhering to event sourcing and CQRS principles. By leveraging TypeScript and the Bun runtime, and deploying on Kubernetes, the application is designed for high performance and scalability.

Special emphasis is placed on code quality, ensuring that the application is production-ready and reliable. Unique identifiers are generated using `nanoid`, and TypeScript configurations enforce strict typing and module syntax, including type-only imports as required by `verbatimModuleSyntax`.

The plan ensures that all critical features are addressed, including command and query separation, event sourcing, snapshotting, sagas, and real-time updates. It also emphasizes performance optimization, stateless service design, and adherence to best practices in software development and deployment.

---

**Note**: This plan is flexible and may be adjusted based on new requirements or changes in project scope. Regular meetings and progress reviews should be conducted to ensure alignment with project goals.
