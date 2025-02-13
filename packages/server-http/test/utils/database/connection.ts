/*
 * Copyright (c) 2021.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    createDatabase, dropDatabase, setDataSource, unsetDataSource, useDataSource,
} from 'typeorm-extension';
import {
    DataSource,
} from 'typeorm';
import {
    DatabaseRootSeederResult,
    DatabaseSeeder,
    extendDataSourceOptions,
} from '@authup/server-database';

export async function useTestDatabase() : Promise<DatabaseRootSeederResult> {
    const options = extendDataSourceOptions({
        type: 'better-sqlite3',
        database: ':memory:',
    });

    await createDatabase({ options });

    const dataSource = new DataSource(options);
    await dataSource.initialize();
    await dataSource.synchronize();

    setDataSource(dataSource);

    const core = new DatabaseSeeder({
        robotEnabled: true,
    });

    return core.run(dataSource);
}

export async function dropTestDatabase() {
    const dataSource = await useDataSource();
    await dataSource.destroy();

    const { options } = dataSource;

    unsetDataSource();

    await dropDatabase({ options });
}
