/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "zchat",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      region: "us-east-1",
      providers:{
        aws:{
          profile:"personal"
        }
      }
    };
  },
  async run() {
    const zeroVersion = '0.16.2025022800'

    // execSync(
    //   "npm list @rocicorp/zero | grep @rocicorp/zero | cut -f 3 -d @"
    // )
    //   .toString()
    //   .trim();



    console.log("================================================");
    console.log(zeroVersion);


    const replicationBucket = new sst.aws.Bucket(`replication-bucket`);

    // VPC Configuration
    const vpc = new sst.aws.Vpc(`vpc`, {
      az: 2,
      nat: "ec2",
    });

    // ECS Cluster
    const cluster = new sst.aws.Cluster(`cluster`, {
      vpc,
    });


    // const conn = new sst.Secret("PostgresConnectionString");
    // const zeroAuthSecret = new sst.Secret("ZeroAuthSecret");

    // Common environment variables
    const commonEnv = {
      ZERO_UPSTREAM_DB: process.env.ZERO_UPSTREAM_DB!,
      ZERO_CVR_DB: process.env.ZERO_CVR_DB!,
      ZERO_CHANGE_DB: process.env.ZERO_CHANGE_DB!,
      ZERO_AUTH_SECRET: process.env.ZERO_AUTH_SECRET!,
      ZERO_REPLICA_FILE: "sync-replica.db",
      ZERO_LITESTREAM_BACKUP_URL: $interpolate`s3://${replicationBucket.name}/backup`,
      ZERO_IMAGE_URL: `rocicorp/zero:${zeroVersion}`,
      ZERO_CVR_MAX_CONNS: "10",
      ZERO_UPSTREAM_MAX_CONNS: "10",
      ZERO_AUTO_RESET: "true",

      ZERO_LOG_LEVEL: "info",
      ZERO_LITESTREAM_LOG_LEVEL: "info",
    };



    // Replication Manager Service
    const replicationManager = cluster.addService(`replication-manager`, {
      cpu: "2 vCPU",
      memory: "4 GB",
      image: commonEnv.ZERO_IMAGE_URL,
      link: [replicationBucket],
      health: {
        command: ["CMD-SHELL", "curl -f http://localhost:4849/ || exit 1"],
        interval: "5 seconds",
        retries: 3,
        startPeriod: "300 seconds",
      },
      environment: {
        ...commonEnv,
        ZERO_CHANGE_MAX_CONNS: "3",
        ZERO_NUM_SYNC_WORKERS: "0",
      },
      loadBalancer: {
        public: false,
        ports: [
          {
            listen: "80/http",
            forward: "4849/http",
          },
        ],
      },
      transform: {
        loadBalancer: {
          idleTimeout: 3600,
        },
        target: {
          healthCheck: {
            enabled: true,
            path: "/keepalive",
            protocol: "HTTP",
            interval: 5,
            healthyThreshold: 2,
            timeout: 3,
          },
        },
      },
    });

    // View Syncer Service
    const viewSyncer = cluster.addService(`view-syncer`, {
      cpu: "2 vCPU",
      memory: "4 GB",
      image: commonEnv.ZERO_IMAGE_URL,
      link: [replicationBucket],
      health: {
        command: ["CMD-SHELL", "curl -f http://localhost:4848/ || exit 1"],
        interval: "5 seconds",
        retries: 3,
        startPeriod: "300 seconds",
      },
      environment: {
        ...commonEnv,
        ZERO_CHANGE_STREAMER_URI: replicationManager.url.apply((val) =>
          val.replace("http://", "ws://"),
        ),
      },
      logging: {
        retention: "1 month",
      },
      loadBalancer: {
        domain: {
          cert: "arn:aws:acm:us-east-1:845467305134:certificate/1edefe07-880d-43e2-92c6-8f26028a1fe6",
          name: "zchat-zero.iamfitsum.com",
          dns:false
        },
        public: true,
        rules: [
          { listen: "443/https", forward: "4848/http" },
          { listen: "80/http", forward: "4848/http" }
        ],
      },
      transform: {
        target: {
          healthCheck: {
            enabled: true,
            path: "/keepalive",
            protocol: "HTTP",
            interval: 5,
            healthyThreshold: 2,
            timeout: 3,
          },
          stickiness: {
            enabled: true,
            type: "lb_cookie",
            cookieDuration: 120,
          },
          loadBalancingAlgorithmType: "least_outstanding_requests",
        },
      },
    });

    // const permissionsDeployer = new sst.aws.Function(
    //   "zero-permissions-deployer",
    //   {
    //     handler: "./functions/src/permissions.deploy",
    //     vpc,
    //     environment: { ["ZERO_UPSTREAM_DB"]: conn.value },
    //     copyFiles: [{ from: "./src/schema.ts", to: "./schema.ts" }],
    //     nodejs: { install: [`@rocicorp/zero`] },
    //   }
    // );

    // new aws.lambda.Invocation(
    //   "invoke-zero-permissions-deployer",
    //   {
    //     // Invoke the Lambda on every deploy.
    //     input: Date.now().toString(),
    //     functionName: permissionsDeployer.name,
    //   },
    //   { dependsOn: viewSyncer }
    // );


    // const MyApp = new sst.aws.SvelteKit("MyApp", {
    //   environment: {
    //     ...commonEnv,
    //     GOOGLE_GENERATIVE_AI_API_KEY: process.env.GOOGLE_GENERATIVE_AI_API_KEY!,
    //     PUBLIC_SERVER: viewSyncer.url,
    //   }
    //   ,
    //   server: {
    //     runtime: "nodejs22.x",
    //   },
    //   domain: {
    //     cert: "arn:aws:acm:us-east-1:845467305134:certificate/1edefe07-880d-43e2-92c6-8f26028a1fe6",
    //     name: "zchat.iamfitsum.com",
    //     dns:false

    //   }
    // });

    const MyApp = new sst.aws.Service("MyService", {
      cluster,
      // image:"a5890e3e67e5:latest",
      loadBalancer: {
        public: true,
        domain: {
          cert: "arn:aws:acm:us-east-1:845467305134:certificate/1edefe07-880d-43e2-92c6-8f26028a1fe6",
          name: "zchat1.iamfitsum.com",
          dns:false
        },
        ports: [{ listen: "80/http", forward: "3000/http" },{ listen: "443/https", forward: "3000/https" }],
      },
      dev: {
        command: "bun run dev",
      },
    });




    return {
      appUrl: MyApp.url,
    };

  },
});
