import { injectable, unmanaged } from 'inversify';
import { DatabaseConnection } from '../database/connection';
import { eq, sql } from 'drizzle-orm';
import { PgTable } from 'drizzle-orm/pg-core';

@injectable()
export abstract class BaseRepository<T extends PgTable> {
    protected db: DatabaseConnection['db'];
    protected table: T;

    constructor(@unmanaged() dbConnection: DatabaseConnection, @unmanaged() table: T) {
        this.db = dbConnection.db;
        this.table = table;
    }

    async findAll(limit: number = 100, offset: number = 0) {
        return this.db.select().from(this.table).limit(limit).offset(offset);
    }

    async findById(id: string) {
        // Assuming the table has an 'id' column. 
        // Note: Generic type safety with drizzle tables can be tricky for specific columns logic.
        // We assume T has an id column or we perform a raw query or we use a more specific method in subclasses.
        // For Drizzle, usually you pass the schema object to operations.
        // A safer way in BaseRepository might be to just provide the db instance and let subclasses handle specifics,
        // or enforce an interface on the table schema.

        // For now, we will use a generic query assuming 'id' field exists, 
        // but Drizzle doesn't guarantee 'id' on generic PgTable type easily without extra type magic.
        // So we might implement finding by ID in subclasses or use `sql`.

        // But let's try to use the `eq` helper if possible.
        // In Drizzle, `table.id` might not be accessible on generic `T`.
        // We will leave `findById` to be implemented by concrete repositories or cast to any for this base generic.

        return (this.db.select().from(this.table).where(sql`${(this.table as any).id} = ${id}`)).then(res => res[0]);
    }

    async create(data: any) {
        return this.db.insert(this.table).values(data).returning().then(res => res[0]);
    }

    async update(id: string, data: any) {
        return this.db.update(this.table)
            .set(data)
            .where(sql`${(this.table as any).id} = ${id}`)
            .returning()
            .then(res => res[0]);
    }

    async delete(id: string) {
        return this.db.delete(this.table)
            .where(sql`${(this.table as any).id} = ${id}`)
            .returning()
            .then(res => res[0]);
    }
}
