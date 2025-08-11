## General Guidelines

- Use JSDoc-style documentation comments (/\*_ ... _/) to describe the purpose, type, or constraints of classes, properties, and methods.
- Use numbered inline comments (e.g., // 1., // 2.) only inside method bodies to annotate logical steps.
- Do not use numbered comments for class properties, class definitions, decorators, or above any code blocks.
- Ensure comments are concise, clear, and relevant to the code they describe.

## For Class Definitions

- Add a JSDoc comment above the class to describe its purpose and functionality.
- Do not add numbered comments for the class itself or its decorators (e.g., @Entity).
- Example:

```ts
/**
 * Log entity for storing system logs
 * Represents log entries for operations and errors in the system
 */
@Entity("logs")
export class Log {}
```

## For Class Properties

- Add a JSDoc comment above each property to describe its purpose, type, or constraints.
- Do not add numbered comments (e.g., // 1., // 2.) for properties or above them.

- Example:

```ts
/**
 * Unique identifier for the log entry
 */
@PrimaryGeneratedColumn('uuid')
id: string;

/**
 * Log level (info, warning, error)
 */
@Column({ type: 'varchar', length: 10, nullable: false })
level: 'info' | 'warning' | 'error';

/**
 * Source of the log (component or module that generated it)
 */
@Column({ type: 'varchar', length: 100, nullable: false })
source: string;

/**
 * Log message content
 */
@Column({ type: 'text', nullable: false })
message: string;

/**
 * Timestamp when the log was created
 */
@CreateDateColumn({ name: 'created_at' })
createdAt: Date;
```

## For Class Methods

- Add a JSDoc comment above each method to describe its purpose, parameters, and return value (if applicable).
- Inside the method body, use numbered comments (e.g., // 1., // 2.) to annotate logical steps when appropriate.
- Example:

```ts
/**
 * Getter for level
 * @returns The log level
 */
get Level(): 'info' | 'warning' | 'error' {
  return this.level;
}

/**
 * Setter for level
 * @param level - The log level to set (info, warning, error)
 */
set Level(level: 'info' | 'warning' | 'error') {
  // 1. Handle input validation
  if (level !== 'info' && level !== 'warning' && level !== 'error') {
    throw new Error('Invalid log level');
  }

  // 2. Assign the value
  this.level = level;
}
```

## Incorrect Examples (Avoid These)

- Do not add numbered comments above or for properties:

```ts
// 1. Primary identification
// 1.1 Unique identifier for the log entry
@PrimaryGeneratedColumn('uuid')
id: string;
Do not group properties under numbered sections:
ts
// 2. Log information
// 2.1 Timestamp when the log was created
@CreateDateColumn()
created_at: Date;
Do not add numbered comments outside method bodies:
ts
// 1. Log information
@Column({
  type: 'varchar',
  length: 10,
  nullable: false
})
level: 'info' | 'warning' | 'error';

```

## Additional Notes

- Ensure numbered comments inside methods are used only when they add clarity to the logical flow (e.g., for complex methods with distinct steps).
- For simple methods or getters/setters with minimal logic, numbered comments may be omitted if they do not add value.
- When generating code, prioritize consistency in comment style and structure across all classes and files.

## We use a three-section numeric comment prefix to clearly separate

### the three main phases of any function or code block:

1.\* → Input Handling
• All code that deals with inputs, e.g.:
– Parameter validation
– Type checks and sanitization
– Default-value setup

2.\* → Core Processing
• All code where the “business logic” happens, e.g.:
– Transformations
– Calculations
– Side-effects (e.g. writing to a database)

3.\* → Output Handling
• All code that produces or returns results, e.g.:
– Return statements
– Emitting events, console logs, or API responses
– Final cleanup or teardown

Numbering conventions:
– Top-level prefixes: 1, 2, 3
– Subsections: 1.1, 1.2, 2.1, 2.2.1, 3.1, etc.
– Nested deeper where necessary (e.g. 1.1.1) to keep the flow clear.

- Example:

```ts
info(message, source = 'SYSTEM') {
  // 1. Handle input.
  // 1.1 Validate `source`.
  if (source !== 'SYSTEM' && source !== 'DEVICE') {
    throw new Error('Invalid source');
  }

  // 1.2 Validate `message`.
  if (typeof message !== 'string') {
    throw new Error('Invalid message');
  }

  // 2. Core processing.
  const displaySource = sourceInChalk(source);
  console.log(`${now()} [${chalk.green.bold('INFO')}] [${displaySource}] ${message}`);

  // 3. Output result.
  return { message, source };
}
```

– Nested deeper only if needed (e.g. 1.1.1)

- Incorrect Example:

```ts
const formatXAxisTick = (hour: number): string => {
  // 1. Input handling – No validation needed
  // 2. Core processing – No transformation needed
  // 3. Output handling
  // 3.1 Return formatted hour
  return `${hour}:00`
}
```

- Correct Example:

```ts
const formatXAxisTick = (hour: number): string => {
  // 3. Output handling
  return `${hour}:00`
}
```

## For maintain the code readable and easy to understand.

- To keep the code readable and easy to understand, we should not use the line number over 120 characters.
- To refactor the code if it exceeds 120 lines, we should use the following steps:
  1. Identify the code that is hard to read.
  2. Refactor the code to be more readable.
  3. Keep the code clean and easy to understand.
  4. Keep the code maintainable and easy to maintain.
  5. Keep the code easy to understand.
  6. Keep the code easy to maintain.
