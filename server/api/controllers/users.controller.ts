import { Request, Response } from 'express';
import { controller, httpGet, httpPost, httpPut, httpDelete } from 'inversify-express-utils';
import { inject } from 'inversify';
import { UserRepository } from '../../data/repositories/user.repository';
import { ApiResponse } from '../../shared/api-response';

@controller('/users')
export class UsersController {
    constructor(@inject('UserRepository') private userRepo: UserRepository) { }

    @httpGet('/')
    async getUsers(req: Request, res: Response) {
        // Here we could parse pagination from req.query (e.g. limit, offset)
        const filters = req.query;
        // In this implementation BaseRepository handles findAll()
        const items = await this.userRepo.findAll();

        // Return paginated shape to match UI
        res.json(ApiResponse.success({
            items,
            total: items.length, // Placeholder, usually a count query
            page: Number(filters.page || 1),
            pageSize: Number(filters.pageSize || 50),
            totalPages: 1
        }));
    }

    @httpPost('/')
    async createUser(req: Request, res: Response) {
        const payload = req.body;
        // You'd normally hash passwords and do validation here
        const result = await this.userRepo.create(payload);
        res.status(201).json(ApiResponse.success(result));
    }

    @httpPut('/:id')
    async updateUser(req: Request, res: Response) {
        const id = req.params.id;
        const payload = req.body;
        const result = await this.userRepo.update(id, payload);
        res.json(ApiResponse.success(result));
    }

    @httpDelete('/:id')
    async deleteUser(req: Request, res: Response) {
        const id = req.params.id;
        await this.userRepo.delete(id);
        res.status(204).send(); // Or res.json(ApiResponse.success({ success: true })) depending on standard
    }
}
