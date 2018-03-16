import {CommandUtils} from "typeorm/commands/CommandUtils";
import * as path from "path";

const chalk = require("chalk");

/**
 * Generates a new project with GraphStack.
 */
export class InitCommand {

    command = "init";
    describe = "Generates initial GraphStack project structure. " +
        "If name specified then creates files inside directory called as name. " +
        "If its not specified then creates files inside current directory.";

    builder(yargs: any) {
        return yargs
            .option("n", {
                alias: "name",
                describe: "Name of the project directory."
            })
            .option("db", {
                alias: "database",
                describe: "Database type you'll use in your project."
            });
    }

    async handler(argv: any) {
        try {
            const database = argv.database || "sqlite";
            const basePath = process.cwd() + (argv.name ? ("/" + argv.name) : "");
            const projectName = argv.name ? path.basename(argv.name) : undefined;
            await CommandUtils.createFile(basePath + "/package.json", InitCommand.getPackageJsonTemplate(projectName), false);
            if (database !== "sqlite")
                await CommandUtils.createFile(basePath + "/docker-compose.yml", InitCommand.getDockerComposeTemplate(database), false);
            await CommandUtils.createFile(basePath + "/.gitignore", InitCommand.getGitIgnoreFile());
            await CommandUtils.createFile(basePath + "/README.md", InitCommand.getReadmeTemplate({ docker: database !== "sqlite" }), false);
            await CommandUtils.createFile(basePath + "/tsconfig.json", InitCommand.getTsConfigTemplate());
            await CommandUtils.createFile(basePath + "/ormconfig.json", InitCommand.getOrmConfigTemplate(database));
            await CommandUtils.createFile(basePath + "/src/controller/UserController.ts", InitCommand.getUserControllerTemplate());
            await CommandUtils.createFile(basePath + "/src/controller/PhotoController.ts", InitCommand.getPhotoControllerTemplate());
            await CommandUtils.createFile(basePath + "/src/args/UsersArgs.ts", InitCommand.getUsersArgsTemplate());
            await CommandUtils.createFile(basePath + "/src/args/UserSaveArgs.ts", InitCommand.getUserSaveArgsTemplate());
            await CommandUtils.createFile(basePath + "/src/args/PhotoSaveArgs.ts", InitCommand.getPhotoSaveArgsTemplate());
            await CommandUtils.createFile(basePath + "/src/entity/User.ts", InitCommand.getUserEntityTemplate(database));
            await CommandUtils.createFile(basePath + "/src/entity/Photo.ts", InitCommand.getPhotoEntityTemplate(database));
            await CommandUtils.createFile(basePath + "/src/schema/model/User.graphql", InitCommand.getUserModelSchemaTemplate());
            await CommandUtils.createFile(basePath + "/src/schema/model/Photo.graphql", InitCommand.getPhotoModelSchemaTemplate());
            await CommandUtils.createFile(basePath + "/src/schema/controller/UserController.graphql", InitCommand.getUserControllerSchemaTemplate());
            await CommandUtils.createFile(basePath + "/src/schema/controller/PhotoController.graphql", InitCommand.getPhotoControllerSchemaTemplate());
            await CommandUtils.createFile(basePath + "/src/index.ts", InitCommand.getAppIndexTemplate());
            await CommandUtils.createDirectories(basePath + "/src/migration");

            // generate extra files for express application

            const packageJsonContents = await CommandUtils.readFile(basePath + "/package.json");
            await CommandUtils.createFile(basePath + "/package.json", InitCommand.appendPackageJson(packageJsonContents, database));

            if (argv.name) {
                console.log(chalk.green(`Project created inside ${chalk.blue(basePath)} directory.`));

            } else {
                console.log(chalk.green(`Project created inside current directory.`));
            }

        } catch (err) {
            console.log(chalk.black.bgRed("Error during project initialization:"));
            console.error(err);
            process.exit(1);
        }
    }

    // -------------------------------------------------------------------------
    // Protected Static Methods
    // -------------------------------------------------------------------------

    /**
     * Gets contents of the ormconfig file.
     */
    protected static getOrmConfigTemplate(database: string): string {
        const options: any = { };
        switch (database) {
            case "mysql":
                Object.assign(options, {
                    type: "mysql",
                    host: "localhost",
                    port: 3306,
                    username: "test",
                    password: "test",
                    database: "test",
                });
                break;
            case "mariadb":
                Object.assign(options, {
                    type: "mariadb",
                    host: "localhost",
                    port: 3306,
                    username: "test",
                    password: "test",
                    database: "test",
                });
                break;
            case "sqlite":
                Object.assign(options, {
                    type: "sqlite",
                    "database": "database.sqlite",
                });
                break;
            case "postgres":
                Object.assign(options, {
                    "type": "postgres",
                    "host": "localhost",
                    "port": 5432,
                    "username": "test",
                    "password": "test",
                    "database": "test",
                });
                break;
            case "mssql":
                Object.assign(options, {
                    "type": "mssql",
                    "host": "localhost",
                    "username": "sa",
                    "password": "Admin12345",
                    "database": "tempdb",
                });
                break;
            case "oracle":
                Object.assign(options, {
                    "type": "oracle",
                    "host": "localhost",
                    "username": "system",
                    "password": "oracle",
                    "port": 1521,
                    "sid": "xe.oracle.docker",
                });
                break;
            case "mongodb":
                Object.assign(options, {
                    "type": "mongodb",
                    "database": "test",
                });
                break;
        }
        Object.assign(options, {
            synchronize: true,
            logging: false,
            entities: [
                "src/entity/**/*.ts"
            ],
            migrations: [
                "src/migration/**/*.ts"
            ],
            subscribers: [
                "src/subscriber/**/*.ts"
            ],
            cli: {
                entitiesDir: "src/entity",
                migrationsDir: "src/migration",
                subscribersDir: "src/subscriber"
            }
        });
        return JSON.stringify(options, undefined, 3);
    }

    /**
     * Gets contents of the ormconfig file.
     */
    protected static getTsConfigTemplate(): string {
        return JSON.stringify({
            compilerOptions: {
                outDir: "./build",
                lib: ["es5", "es6", "es7", "esnext"],
                target: "es5",
                module: "commonjs",
                moduleResolution: "node",
                emitDecoratorMetadata: true,
                experimentalDecorators: true,
                sourceMap: true
            }
        }
        , undefined, 3);
    }

    /**
     * Gets contents of the .gitignore file.
     */
    protected static getGitIgnoreFile(): string {
        return `.idea/
.vscode/
node_modules/
build/
tmp/
temp/`;
    }

    /**
     * Gets contents of the user entity.
     */
    protected static getUserEntityTemplate(database: string): string {
        return `import {Entity, ${ database === "mongodb" ? "ObjectIdColumn, ObjectID" : "PrimaryGeneratedColumn, OneToMany" }, Column} from "typeorm";
import {Photo} from "./Photo";

@Entity()
export class User {

    ${ database === "mongodb" ? "@ObjectIdColumn()" : "@PrimaryGeneratedColumn()" }
    id: ${ database === "mongodb" ? "ObjectID" : "number" };

    @Column()
    firstName: string;

    @Column()
    lastName: string;

    @Column()
    age: number;
${ database !== "mongodb" ? `
    @OneToMany(() => Photo, photo => photo.user)
    photos: Photo[];
` : ""}

}
`;
    }

    /**
     * Gets contents of the photo entity.
     */
    protected static getPhotoEntityTemplate(database: string): string {
        return `import {Entity, ${ database === "mongodb" ? "ObjectIdColumn, ObjectID" : "PrimaryGeneratedColumn, ManyToOne" }, Column} from "typeorm";
import {User} from "./User";

@Entity()
export class Photo {

    ${ database === "mongodb" ? "@ObjectIdColumn()" : "@PrimaryGeneratedColumn()" }
    id: ${ database === "mongodb" ? "ObjectID" : "number" };

    @Column()
    filename: string;
${ database !== "mongodb" ? `
    @Column()
    userId: number;
    
    @ManyToOne(() => User, user => user.photos)
    user: User;
` : ""}

}
`;
    }

    /**
     * Gets contents of the user controller file.
     */
    protected static getUserControllerTemplate(): string {
        return `import {Controller, Mutation, Query} from "graphstack";
import {EntityManager, FindManyOptions} from "typeorm";
import {UsersArgs} from "../args/UsersArgs";
import {UserSaveArgs} from "../args/UserSaveArgs";
import {User} from "../entity/User";

@Controller()
export class UserController {

    constructor(private entityManager: EntityManager) {
    }

    @Query()
    users(args: UsersArgs): Promise<User[]> {
    
        const findOptions: FindManyOptions = {};
        if (args.limit)
            findOptions.skip = args.limit;
        if (args.offset)
            findOptions.take = args.offset;
            
        return this.entityManager.find(User, findOptions);
    }

    @Query()
    user({ id }: { id: number }): Promise<User> {
        return this.entityManager.findOne(User, id);
    }

    @Mutation()
    async userSave(args: UserSaveArgs): Promise<User> {
        const user = args.id ? await this.entityManager.findOne(User, args.id) : new User();
        user.firstName = args.firstName;
        user.lastName = args.lastName;
        return this.entityManager.save(user);
    }

    @Mutation()
    async userDelete({ id }: { id: number }): Promise<boolean> {
        const user = await this.entityManager.findOne(User, id);
        await this.entityManager.remove(user);
        return true;
    }

}`;
    }

    /**
     * Gets contents of the photo controller file.
     */
    protected static getPhotoControllerTemplate(): string {
        return `import {Controller, Mutation, Query} from "graphstack";
import {EntityManager} from "typeorm";
import {PhotoSaveArgs} from "../args/PhotoSaveArgs";
import {Photo} from "../entity/Photo";

@Controller()
export class PhotoController {

    constructor(private entityManager: EntityManager) {
    }

    @Query()
    photos(): Promise<Photo[]> {
        return this.entityManager.find(Photo);
    }

    @Query()
    photo({ id }: { id: number }): Promise<Photo> {
        return this.entityManager.findOne(Photo, id);
    }

    @Mutation()
    async photoSave(args: PhotoSaveArgs): Promise<Photo> {
        const photo = args.id ? await this.entityManager.findOne(Photo, args.id) : new Photo();
        photo.filename = args.filename;
        photo.userId = args.userId;
        return this.entityManager.save(photo);
    }

    @Mutation()
    async photoDelete({ id }: { id: number }): Promise<boolean> {
        const photo = await this.entityManager.findOne(Photo, id);
        await this.entityManager.remove(photo);
        return true;
    }

}`;
    }

    /**
     * Gets contents of the User graphql schema file.
     */
    protected static getUserModelSchemaTemplate(): string {
        return `type User {
    id: Int
    firstName: String
    lastName: String
    photos: [Photo]
}`;
    }

    /**
     * Gets contents of the Photo graphql schema file.
     */
    protected static getPhotoModelSchemaTemplate(): string {
        return `type Photo {
    id: Int
    filename: String
    userId: Int
    user: User
}`;
    }

    /**
     * Gets contents of the User controller file.
     */
    protected static getUserControllerSchemaTemplate(): string {
        return `type Query {
    users(limit: Int, offset: Int): [User]
    user(id: Int): User
}

type Mutation {
    userSave(id: Int, firstName: String, lastName: String): User
    userDelete(id: Int): Boolean
}`;
    }

    /**
     * Gets contents of the Photo controller file.
     */
    protected static getPhotoControllerSchemaTemplate(): string {
        return `type Query {
    photos: [Photo]
    photo(id: Int): Photo
}

type Mutation {
    photoSave(id: Int, filename: String, userId: Int): User
    photoDelete(id: Int): Boolean
}`;
    }

    /**
     * Gets contents of the UsersArgs file.
     */
    protected static getUsersArgsTemplate(): string {
        return `export interface UsersArgs {

    limit?: number;
    offset?: number;

}`;
    }

    /**
     * Gets contents of the UserSaveArgs file.
     */
    protected static getUserSaveArgsTemplate(): string {
        return `export interface UserSaveArgs {

    id?: number;
    firstName: string;
    lastName: string;

}`;
    }

    /**
     * Gets contents of the PhotoSaveArgs file.
     */
    protected static getPhotoSaveArgsTemplate(): string {
        return `export interface PhotoSaveArgs {

    id?: number;
    filename: string;
    userId: number;

}`;
    }

    /**
     * Gets contents of the main (index) application file.
     */
    protected static getAppIndexTemplate(): string {
        return `import {bootstrap} from "graphstack";

bootstrap({
    port: 3000,
    cors: true,
    controllers: [__dirname + "/controller/**/*.ts"],
    resolvers: [__dirname + "/resolver/**/*.ts"],
    schemas: [__dirname + "/schema/**/*.graphql"]
});
`;
    }

    /**
     * Gets contents of the new package.json file.
     */
    protected static getPackageJsonTemplate(projectName?: string): string {
        return JSON.stringify({
            name: projectName || "graphstack-project",
            version: "0.0.1",
            description: "Awesome project developed with GraphStack framework.",
            devDependencies: {
            },
            dependencies: {
            },
            scripts: {
            }
        }, undefined, 3);
    }

    /**
     * Gets contents of the new docker-compose.yml file.
     */
    protected static getDockerComposeTemplate(database: string): string {

        switch (database) {
            case "mysql":
                return `version: '3'
services:

  mysql:
    image: "mysql:5.7.10"
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: "admin"
      MYSQL_USER: "test"
      MYSQL_PASSWORD: "test"
      MYSQL_DATABASE: "test"

`;
            case "mariadb":
                return `version: '3'
services:

  mariadb:
    image: "mariadb:10.1.16"
    ports:
      - "3306:3306"
    environment:
      MYSQL_ROOT_PASSWORD: "admin"
      MYSQL_USER: "test"
      MYSQL_PASSWORD: "test"
      MYSQL_DATABASE: "test"

`;
            case "postgres":
                return `version: '3'
services:

  postgres:
    image: "postgres:9.6.1"
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: "test"
      POSTGRES_PASSWORD: "test"
      POSTGRES_DB: "test"

`;
            case "sqlite":
                return `version: '3'
services:
`;
            case "oracle":
                throw new Error(`You cannot initialize a project with docker for Oracle driver yet.`); // todo: implement for oracle as well

            case "mssql":
                return `version: '3'
services:

  mssql:
    image: "microsoft/mssql-server-linux:rc2"
    ports:
      - "1433:1433"
    environment:
      SA_PASSWORD: "Admin12345"
      ACCEPT_EULA: "Y"

`;
            case "mongodb":
                return `version: '3'
services:

  mongodb:
    image: "mongo:3.4.1"
    container_name: "typeorm-mongodb"
    ports:
      - "27017:27017"

`;
        }
        return "";
    }

    /**
     * Gets contents of the new readme.md file.
     */
    protected static getReadmeTemplate(options: { docker: boolean }): string {
        let template = `# Awesome Project with GraphStack
        
Steps to run this project:

1. Run \`npm i\` command
`;

        if (options.docker) {
            template += `2. Run \`docker-compose up\` command
`;
        } else {
            template += `2. Setup database settings inside \`ormconfig.json\` file
`;
        }

        template += `3. Run \`npm start\` command
        
To start testing things you can execute following queries:
        
\`\`\`graphql
# 1. First few users
mutation UserSaveBulkMutation {
  johny: userSave(firstName: "Johny", lastName: "Cage") {
    id
  }
  linda: userSave(firstName: "Linda", lastName: "Cage") {
    id
  }
}

# 2. List users
query UserListQuery {
  users {
    id
    firstName
    lastName
  }
}

# 3. Get user by id
query UserByIdQuery {
  user(id: 1) {
    id
    firstName
    lastName
  }
}

# 4. Save some photos
mutation PhotoSaveBulkMutation {
  johnyFirstPhoto: photoSave(filename: "johny1.jpg", userId: 1) {
    id
  }
  johnySecondPhoto: photoSave(filename: "johny2.jpg", userId: 1) {
    id
  }
  lindaFirstPhoto: photoSave(filename: "linda1.jpg", userId: 2) {
    id
  }
  lindaSecondPhoto: photoSave(filename: "linda2.jpg", userId: 2) {
    id
  }
}

# 5. Get all photos and their authors
query PhotoListWithUserQuery {
  photos {
    id
    filename
    user {
      id
      firstName
      lastName
    }
  }
}

# 6. Get all users and their photos
query UserListWithPhotosQuery {
  users {
    id
    firstName
    lastName
    photos {
      id
      filename
    }
  }
}
\`\`\`

`;
        return template;
    }

    /**
     * Appends to a given package.json template everything needed.
     */
    protected static appendPackageJson(packageJsonContents: string, database: string): string {
        const packageJson = JSON.parse(packageJsonContents);

        if (!packageJson.devDependencies) packageJson.devDependencies = {};
        Object.assign(packageJson.devDependencies, {
            "ts-node": "^5.0.1",
            // "@types/node": "^8.0.29",
            "typescript": "^2.7.2"
        });

        if (!packageJson.dependencies) packageJson.dependencies = {};
        Object.assign(packageJson.dependencies, {
            "graphstack": require("../package.json").version
        });

        switch (database) {
            case "mysql":
            case "mariadb":
                packageJson.dependencies["mysql"] = "^2.14.1";
                break;
            case "postgres":
                packageJson.dependencies["pg"] = "^7.3.0";
                break;
            case "sqlite":
                packageJson.dependencies["sqlite3"] = "^3.1.10";
                break;
            case "oracle":
                packageJson.dependencies["oracledb"] = "^1.13.1";
                break;
            case "mssql":
                packageJson.dependencies["mssql"] = "^4.0.4";
                break;
            case "mongodb":
                packageJson.dependencies["mongodb"] = "^2.2.31";
                break;
        }

        if (!packageJson.scripts) packageJson.scripts = {};
        Object.assign(packageJson.scripts, {
            start: /*(docker ? "docker-compose up && " : "") + */"ts-node src/index.ts"
        });
        return JSON.stringify(packageJson, undefined, 3);
    }

}
