import convict from 'convict';

/**
 * Format addition for vars which are sensitive, and needs to be decoded before accessing.
 */
convict.addFormat({
    name: "sensitive",
    validate: () => {
    },
});

const conf = convict({
    env: {
        format: ['development', 'production', 'test'],
        default: 'development',
        env: 'NODE_ENV',
    },
    application: {
        name: {
            format: '*',
            default: "short-list-supplier",
            env: 'APP_NAME',
        },
        logging: {
            basePath: {
                format: '*',
                default: `short-list-supplier-app-logs`,
                env: 'LOGGING_PATH',
            },
            level: {
                format: ['detail', 'compact'],
                default: `detail`,
                env: 'LOGGING_LEVEL',
            },
        },
        bodyParser: {
            limit: {
                format: '*',
                default: "50mb",
                env: 'BODY_PARSER_LIMIT',
            }
        }
    },
    server: {
        port: {
            format: 'port',
            default: 3001,
            env: 'APP_PORT',
        },
    },
    database: {
        host: {
            format: '*',
            default: '127.0.0.1',
            env: 'DB_HOSTNAME',
        },
        port: {
            format: 'port',
            default: 27017,
            env: 'DB_PORT',
        },
        name: {
            format: '*',
            default: 'admin',           // טיכונט, חשמונאים, רמת החייל
            //default: 'mivne_tzibur',  // בית מארס          
            env: 'DB_NAME',
        },
        username: {
            format: '*',
            default: 'admin',
            env: 'DB_USERNAME',
        },
        password: {
            format: '*',
            default: 'admin',
            env: 'DB_PASSWORD',
        },
        poolSize: {
            format: '*',
            default: 10,
            env: 'MONGO_POOLSIZE',
        }
    },
    restClient: {
        requestTimeOut: 90000,
    },

    pager: {
        defaultLimit: 5,
        defaultPage: 1,
        defaultSortBy: "createdAt",
        defaultSortOrder: -1
    },
});

conf.validate({ allowed: 'strict' });

export default conf.getProperties();
