import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {PrismaService} from '@framework/prisma/prisma.service';
import {
  CreateBucketCommand,
  DeleteBucketCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  GetObjectCommandInput,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import {getSignedUrl} from '@aws-sdk/s3-request-presigner';

@Injectable()
export class AwsS3Service {
  private client: S3Client;
  private bucket: string;
  private signedUrlExpiresIn: number;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService
  ) {
    this.client = new S3Client({
      region: this.config.getOrThrow<string>('microservices.aws-s3.region'),
      credentials: {
        accessKeyId: this.config.getOrThrow<string>(
          'microservices.aws-s3.accessKeyId'
        )!,
        secretAccessKey: this.config.getOrThrow<string>(
          'microservices.aws-s3.secretAccessKey'
        )!,
      },
    });
    this.bucket = this.config.getOrThrow<string>('microservices.aws-s3.bucket');
    this.signedUrlExpiresIn = this.config.getOrThrow<number>(
      'microservices.aws-s3.signedUrlExpiresIn'
    );
  }

  async createBucket(bucketName: string) {
    return await this.client.send(
      new CreateBucketCommand({Bucket: bucketName})
    );
  }

  async deleteBucket(bucketName: string) {
    return await this.client.send(
      new DeleteBucketCommand({Bucket: bucketName})
    );
  }

  async getObject(params: GetObjectCommandInput) {
    const {Bucket, Key} = params;
    return await this.client.send(new GetObjectCommand({Bucket, Key}));
  }

  async createFolder(params: {
    bucket?: string;
    name: string;
    parentId?: string;
  }) {
    let s3Key = params.name;
    if (params.parentId) {
      s3Key =
        (await this.getFilePathString(params.parentId)) + '/' + params.name;
    }

    const output = await this.client.send(
      new PutObjectCommand({
        Bucket: params.bucket,
        Key: s3Key + '/',
      })
    );

    return await this.prisma.s3File.create({
      data: {
        name: params.name,
        type: 'Folder',
        s3Bucket: params.bucket ?? this.bucket,
        s3Key: s3Key,
        s3Response: output as object,
        parentId: params.parentId,
      },
    });
  }

  async uploadFile(params: {
    bucket?: string;
    file: Express.Multer.File;
    parentId?: string;
  }) {
    // [step 1] Get workflow folder.
    let s3Key: string = params.file.originalname;
    if (params.parentId) {
      s3Key =
        (await this.getFilePathString(params.parentId)) +
        '/' +
        params.file.originalname;
    }

    // [step 2] Put file to AWS S3.
    const output = await this.client.send(
      new PutObjectCommand({
        Bucket: params.bucket ?? this.bucket,
        Key: s3Key,
        Body: params.file.buffer,
      })
    );

    // [step 3] Create a record.
    return await this.prisma.s3File.create({
      data: {
        name: params.file.originalname,
        type: params.file.mimetype,
        size: params.file.size,
        s3Bucket: params.bucket ?? this.bucket,
        s3Key: s3Key,
        s3Response: output as object,
        parentId: params.parentId,
      },
    });
  }

  async deleteFile(fileId: string) {
    const file = await this.prisma.s3File.findFirstOrThrow({
      where: {id: fileId},
    });

    try {
      await this.deleteFileInS3Recursively({
        bucket: file.s3Bucket,
        key: file.s3Key,
      });
      await this.deleteFileInDatabaseRecursively(fileId);
    } catch (error) {
      // TODO (developer) - Handle exception
      throw error;
    }
  }

  async getFilePath(fileId: string) {
    const path: object[] = [];

    // [step 1] Get current file.
    const file = await this.prisma.s3File.findFirstOrThrow({
      where: {id: fileId},
      select: {id: true, name: true, type: true, parentId: true},
    });
    path.push(file);

    // [step 2] Get parent file.
    if (file.parentId) {
      path.push(...(await this.getFilePath(file.parentId)));
    } else {
      // Do nothing.
    }

    return path;
  }

  /** Get a signed URL to access an S3 object for signedUrlExpiresIn seconds */
  async getSignedDownloadUrl(params: {bucket?: string; path: string}) {
    const command = new GetObjectCommand({
      Bucket: params.bucket ?? this.bucket,
      Key: params.path,
    });
    return await getSignedUrl(this.client, command, {
      expiresIn: this.signedUrlExpiresIn,
    });
  }

  async getSignedUploadUrl(params: {bucket?: string; path: string}) {
    const command = new PutObjectCommand({
      Bucket: params.bucket ?? this.bucket,
      Key: params.path,
    });
    return await getSignedUrl(this.client, command, {
      expiresIn: this.signedUrlExpiresIn,
    });
  }

  /**
   * Remove directories and their contents recursively
   */
  private async deleteFileInS3Recursively(params: {
    bucket: string;
    key: string;
  }) {
    try {
      // [step 1] List objects
      const listResponse = await this.client.send(
        new ListObjectsV2Command({Bucket: params.bucket, Prefix: params.key})
      );
      if (!listResponse.Contents || listResponse.Contents.length === 0) {
        return;
      }

      // [step 2] Delete objects
      await this.client.send(
        new DeleteObjectsCommand({
          Bucket: params.bucket,
          Delete: {
            Objects: listResponse.Contents.map(content => {
              return {Key: content.Key};
            }),
          },
        })
      );

      // https://docs.aws.amazon.com/AmazonS3/latest/API/API_ListObjectsV2.html
      // IsTruncated: Set to false if all of the results were returned. Set to true if more keys are available to return. If the number of results exceeds that specified by MaxKeys, all of the results might not be returned.
      if (listResponse.IsTruncated) {
        await this.deleteFileInS3Recursively(params);
      }
    } catch (error) {
      // TODO (developer) - Handle exception
      throw error;
    }
  }

  /**
   * Remove directories and their contents recursively
   */
  private async deleteFileInDatabaseRecursively(fileId: string) {
    // [step 1] Delete file.
    await this.prisma.s3File.delete({where: {id: fileId}});

    // [step 2] Delete files in the folder.
    const filesInFolder = await this.prisma.s3File.findMany({
      where: {parentId: fileId},
      select: {id: true},
    });

    for (let i = 0; i < filesInFolder.length; i++) {
      await this.deleteFileInDatabaseRecursively(filesInFolder[i].id);
    }
  }

  private async getFilePathString(fileId: string) {
    let path = '';

    // [step 1] Get current file.
    const file = await this.prisma.s3File.findFirstOrThrow({
      where: {id: fileId},
      select: {id: true, name: true, type: true, parentId: true},
    });
    path = file.name;

    // [step 2] Get parent file.
    if (file.parentId) {
      path = (await this.getFilePathString(file.parentId)) + '/' + path;
    } else {
      // Do nothing.
    }

    return path;
  }
}
