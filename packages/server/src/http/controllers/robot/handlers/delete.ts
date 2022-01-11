import { getRepository } from 'typeorm';
import { ForbiddenError } from '@typescript-error/http';
import {
    PermissionID,
} from '@typescript-auth/domains';
import { ExpressRequest, ExpressResponse } from '../../../type';
import { RobotEntity } from '../../../../domains';

export async function deleteClientRouteHandler(req: ExpressRequest, res: ExpressResponse) : Promise<any> {
    const { id } = req.params;

    const repository = getRepository(RobotEntity);
    const entity = await repository.findOne(id);

    if (!req.ability.hasPermission(PermissionID.ROBOT_DROP)) {
        if (!entity.user_id) {
            throw new ForbiddenError();
        }

        if (
            entity.user_id &&
            entity.user_id !== req.userId
        ) {
            throw new ForbiddenError();
        }
    }

    await repository.remove(entity);

    return res.respondDeleted();
}
