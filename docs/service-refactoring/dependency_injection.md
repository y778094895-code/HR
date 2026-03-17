# Dependency Injection Guide

## 1. Principles
- **Inversion of Control**: Components do not create their dependencies.
- **Interface Segregation**: Depend on interfaces, not concrete classes.

## 2. Implementation (Server)
We use `InversifyJS`.

### Registration
Register bindings in `server/shared/di/container.ts`:
```typescript
this.container.bind<IEmployeeService>('IEmployeeService').to(EmployeeService);
```

### Usage
Inject dependencies in constructors:
```typescript
constructor(@inject('IEmployeeService') private employeeService: IEmployeeService) {}
```

## 3. Factories & Modules
- **ServiceFactory**: Creates complex services or strategies.
- **ModuleManager**: Manages module lifecycle and dependencies.
