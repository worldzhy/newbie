const prismaExceptions = {
  P1000:
    "Authentication failed. The provided database credentials are not valid. Please ensure you've entered correct database credentials.",
  P1001:
    "We couldn't reach the database server. Please make sure your database server is running and accessible at the specified host and port.",
  P1002:
    'The connection to the database server timed out. Please try again later and ensure your database server is running at the specified host and port.',
  P1003:
    'The requested database does not exist. Please double-check the database name and location.',
  P1008: 'The operation took too long to complete. Please try again later.',
  P1009:
    'The specified database already exists on the server. Please choose a different name.',
  P1010:
    'Access denied. The user does not have permission to access the requested database.',
  P1011:
    'Error opening a secure connection. Please check the TLS configuration and try again.',
  P1012:
    "There's an issue with your schema configuration. Please review the schema definition and fix the reported errors.",
  P1013:
    'The provided database string is invalid. Please check the format and details of the string.',
  P1014:
    'The underlying kind for the specified model does not exist. Please check the model name and configuration.',
  P1015:
    'Your Prisma schema uses features not supported by the current database version. Please adjust your schema to match the database capabilities.',
  P1016:
    'Your raw query has an incorrect number of parameters. Please ensure the correct number of parameters is provided.',
  P1017: 'The server has closed the connection unexpectedly. Please try again.',
  P2000:
    'The provided value for the column is too long for its data type. Please provide a shorter value.',
  P2001: 'The requested record does not exist in the database.',
  P2002:
    "A unique constraint failed. The value you're trying to insert conflicts with existing data.",
  P2003:
    'A foreign key constraint failed. The specified value does not match any valid foreign key.',
  P2004:
    'A constraint failed on the database. Please review the database constraints and data being inserted.',
  P2005:
    'The value stored in the database for the specified field is invalid for its data type.',
  P2006:
    'The provided value for the specified field of the model is not valid. Please provide a valid value.',
  P2007:
    'A data validation error occurred. Please review the data and ensure it adheres to validation rules.',
  P2008:
    "Failed to parse the query. There's an issue with the provided query syntax.",
  P2009: 'Failed to validate the query. The query violates validation rules.',
  P2010: 'The raw query failed to execute. Error detail',
  P2011: 'A null constraint violation occurred on the specified constraint.',
  P2012:
    'A required value is missing at the specified path. Please provide the required value.',
  P2013:
    'The required argument is missing for the specified field on the specified object.',
  P2014:
    'The requested change would violate a required relation between models.',
  P2015:
    'A related record could not be found. Please ensure the related record exists.',
  P2016:
    "There's an error interpreting the query. Please review the query syntax and structure.",
  P2017:
    'The records for a relation between models are not connected. Please connect the related records.',
  P2018:
    'The required connected records were not found. Please ensure the necessary records exist.',
  P2019:
    "There's an error with the provided input data. Please review and correct the input.",
  P2020:
    'The provided value is out of range for the specified data type. Please provide a valid value.',
  P2021: 'The specified table does not exist in the current database.',
  P2022: 'The specified column does not exist in the current database.',
  P2023:
    "There's inconsistency in the data of the specified column. Please review and correct the data.",
  P2024:
    'Timed out fetching a new connection from the connection pool. Please retry later.',
  P2025:
    'An operation failed due to missing required dependent records. Please ensure all necessary records are present.',
  P2026:
    'The query uses a feature not supported by the current database provider.',
  P2027:
    'Multiple errors occurred on the database during query execution. Please review the errors and fix the issues.',
  P2028:
    'An error occurred with the transaction API. Please review and resolve the transaction-related issue.',
  P2030:
    'Cannot find a fulltext index for the search. Add a fulltext index to your schema using @@fulltext.',
  P2031:
    'Prisma requires MongoDB to be run as a replica set for transactions. Please set up MongoDB as a replica set.',
  P2033:
    'A number used in the query exceeds the limit of a 64-bit signed integer. Consider using BigInt as the field type for large integers.',
  P2034:
    'Transaction failed due to a write conflict or a deadlock. Please retry the transaction.',
  P3000:
    'Failed to create the database. There was an error during database creation.',
  P3001:
    'Migration contains destructive changes and possible data loss. Please review the migration.',
  P3002:
    'The attempted migration was rolled back due to an error. Please review the error details.',
  P3003:
    'The format of migrations has changed, and saved migrations are no longer valid. Please follow the provided steps to resolve this issue.',
  P3004:
    'The specified database is a system database and should not be modified using Prisma Migrate. Please select a different database.',
  P3005:
    'The database schema is not empty. Please follow the instructions to baseline an existing production database.',
  P3006: 'Migration failed to apply cleanly to the shadow database.',
  P3007:
    'Some requested preview features are not supported by the schema engine. Please remove them from your data model before using migrations.',
  P3008: 'The migration is already recorded as applied in the database.',
  P3009:
    'Migrate found failed migrations in the target database. New migrations will not be applied. Please follow the steps to resolve migration issues.',
  P3010:
    'The name of the migration is too long. It must not be longer than 200 characters (bytes).',
  P3011:
    'The migration cannot be rolled back as it was never applied to the database.',
  P3012:
    'The migration cannot be rolled back because it is not in a failed state.',
  P3013:
    'Datasource provider arrays are no longer supported in migrate. Please update your datasource configuration to use a single provider.',
  P3014:
    'Prisma Migrate could not create the shadow database. Please ensure the database user has permission to create databases.',
  P3015:
    'The migration file could not be found at the specified path. Please check the directory or restore the migration file.',
  P3016:
    'The fallback method for database resets failed. Migrate could not clean up the database entirely.',
  P3017:
    'The migration could not be found. Please ensure the migration exists and you provided the full name.',
  P3018:
    'A migration failed to apply. New migrations cannot be applied before the error is resolved.',
  P3019:
    'The datasource provider specified in your schema does not match the one specified in the migration_lock.toml. Please start a new migration history with the correct provider.',
  P3020:
    'Automatic creation of shadow databases is disabled on Azure SQL. Please set up a shadow database using the shadowDatabaseUrl attribute.',
  P3021:
    'Foreign keys cannot be created on this database. Please review how to handle this scenario.',
  P3022:
    'Direct execution of Data Definition Language (DDL) SQL statements is disabled on this database. Please review how to handle this scenario.',
  P5000: 'The server could not understand the request.',
  P5001: 'The request must be retried.',
  P5002:
    'The provided datasource is invalid. Please check the datasource URL and API key.',
  P5003: 'The requested resource does not exist.',
  P5004:
    'The requested feature is not yet implemented. Please wait for future updates.',
  P5005:
    'The schema needs to be uploaded. Please ensure the schema is uploaded before proceeding.',
  P5006: 'An unknown server error occurred. Please try again later.',
  P5007: 'Unauthorized connection. Please check your connection string.',
  P5008: 'Usage limit exceeded. Please retry later.',
  P5009: 'The request timed out. Please try again later.',
  P5010:
    'Cannot fetch data from the service. Please check your request and try again.',
  P5011:
    'The server understood the request but rejected it due to failed validation checks. Please ensure parameters are within valid ranges.',
  P5012: 'The specified engine version is not supported.',
  P5013: 'The engine did not start due to a health check timeout.',
  P5014: 'An unknown error occurred during engine startup.',
  P5015:
    'An error occurred with the interactive transaction. Please check the provided transaction ID and try again.',
};

export function getPrismaExceptionMessage(
  errorCode: string | undefined,
  fallbackMsg: string
): string {
  return `${errorCode}: ${prismaExceptions[errorCode || ''] || fallbackMsg}`;
}
