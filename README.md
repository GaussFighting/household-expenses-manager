Household Expenses Manager

A serverless web application for managing household expenses. The application uses React for the frontend and AWS services for authentication, API processing, data storage, and automated deployments.

Table of Contents

Overview

Architecture

AWS Services

Environments

CI/CD Pipeline

Local Development

Configuration and Secrets

Deployment Process

Security and IAM

Overview

The application is built using a serverless architecture. The frontend communicates with an API Gateway REST API, which invokes AWS Lambda functions. Lambda functions process requests and access data stored in DynamoDB.

Amazon Cognito provides user authentication. AWS CodePipeline and CodeBuild automate testing, building, and deployment.

The project supports separate development and production environments, with independent DynamoDB tables and environment-specific Lambda aliases.

Architecture

flowchart TB
    User([User / Browser])

    subgraph Frontend["Frontend"]
        React["React Application"]
        CFDev["CloudFront - Develop"]
        CFProd["CloudFront - Production"]
    end

    subgraph Auth["Authentication"]
        Cognito["Amazon Cognito"]
    end

    subgraph API["Backend - API Gateway REST API"]
        APIDev["Develop Stage"]
        APIProd["Production Stage"]
    end

    subgraph Lambda["AWS Lambda"]
        DevAlias["Develop Aliases"]
        ProdAlias["Production Aliases"]
    end

    subgraph Database["Amazon DynamoDB"]
        DevTables[("payments-develop<br/>payment-types-develop")]
        ProdTables[("payments<br/>payment-types")]
    end

    User --> CFDev
    User --> CFProd
    CFDev --> React
    CFProd --> React

    React --> Cognito
    React --> APIDev
    React --> APIProd

    APIDev --> DevAlias
    APIProd --> ProdAlias

    DevAlias --> DevTables
    ProdAlias --> ProdTables

    CI["AWS CodePipeline"] --> CB["AWS CodeBuild"]
    CB --> DevAlias
    CB --> ProdAlias
    CB --> CFDev
    CB --> CFProd

The diagram shows the logical architecture. Frontend hosting and deployment details depend on the configured CloudFront origins and pipeline actions.

Request flow

The user opens the React application delivered through CloudFront.

The frontend authenticates the user through Amazon Cognito.

The frontend sends HTTP requests to the appropriate API Gateway stage.

API Gateway invokes the corresponding Lambda function through the environment-specific alias.

The Lambda function reads or writes data in the appropriate DynamoDB tables.

The API response is returned to the frontend.

AWS Services

Service

Responsibility

Amazon CloudFront

Delivers the frontend through separate development and production distributions.

Amazon API Gateway

Exposes REST API endpoints and routes requests to Lambda functions.

AWS Lambda

Executes backend business logic using Node.js 24 and ES modules.

Amazon DynamoDB

Stores payments and payment types.

Amazon Cognito

Handles user authentication and token verification.

AWS Systems Manager Parameter Store

Stores environment-specific configuration and secrets.

AWS CodePipeline

Orchestrates the CI/CD workflow.

AWS CodeBuild

Installs dependencies, runs build commands, packages Lambdas, and deploys application components.

Amazon CloudWatch

Stores Lambda and build logs for troubleshooting.

Amazon SNS

Supports notification-related functionality, including reminder processing.

AWS IAM

Controls access to AWS services and resources.

Environments

The application uses two environments.

Setting

Development

Production

Pipeline name

expenses-manager-develop

expenses-manager-prod

API Gateway stage

develop

v1

Lambda alias

develop

production

Frontend distribution

https://d22lbbpxtf9zwk.cloudfront.net

https://d1arjmw1ioj7hx.cloudfront.net

Payments table

payments-develop

payments

Payment types table

payment-types-develop

payment-types

Parameter prefix

/expenses-manager-develop/

/expenses-manager-prod/

The environments use separate DynamoDB tables but share the Cognito user pool.

API endpoints

Development:

https://pfawuqu0j2.execute-api.eu-central-1.amazonaws.com/develop

Production:

https://pfawuqu0j2.execute-api.eu-central-1.amazonaws.com/v1

Frontend builds should use the appropriate API base URL for their target environment.

CI/CD Pipeline

AWS CodePipeline orchestrates the deployment workflow, while AWS CodeBuild executes the configured build and deployment commands.

Typical workflow

flowchart TD
    A["Source code change"] --> B["AWS CodePipeline"]
    B --> C["Unit tests"]
    C --> D["ESLint"]
    D --> E["Build application"]
    E --> F["Load parameters from Parameter Store"]
    F --> G["Package Lambda functions"]
    G --> H["Upload code to Lambda"]
    H --> I["Update Lambda environment variables"]
    I --> J["Publish Lambda versions"]
    J --> K["Create or update aliases"]
    K --> L["Deploy frontend artifacts"]

The exact order and conditions depend on the configured CodePipeline actions and buildspec overrides.

Lambda deployment

The deployment script performs the following operations for each configured Lambda:

Creates a temporary staging directory.

Copies index.js and any available package metadata.

Copies node_modules if present.

Includes the shared CORS utility when required and adjusts its import path for the deployment package.

Creates a ZIP deployment package.

Uploads the ZIP using aws lambda update-function-code.

Updates the Lambda environment variables.

Publishes a numbered Lambda version.

Creates or updates the environment-specific alias.

The aliases point to published versions:

getPayments:develop    -> Published development version
getPayments:production -> Published production version

API Gateway integrations target the appropriate alias. Updating an alias moves it to a new published version without requiring the frontend to change its API URL.

Build configuration

The buildspec.yml file defines the CodeBuild phases and commands.

The env.parameter-store section loads configuration from Parameter Store. The build phase checks required parameters, builds the application, selects the target environment, and defines the deployment functions.

The artifacts section collects the frontend build output from the build directory.

Local Development

Prerequisites

Install the following tools:

Node.js 24.x

npm

Git

AWS CLI, if you need to access AWS resources

Appropriate AWS credentials and permissions for any AWS operations

1. Clone the repository

git clone <REPOSITORY_URL>
cd <REPOSITORY_DIRECTORY>

Replace the placeholders with your repository URL and directory name.

2. Install frontend dependencies

From the repository root:

npm install

3. Configure the frontend

Create a local .env.local file in the React project root if the application uses Create React App environment variables.

Example:

REACT_APP_API_URL=https://pfawuqu0j2.execute-api.eu-central-1.amazonaws.com/develop

Use the variable name expected by the frontend code. Create React App requires environment variables exposed to browser code to use the REACT_APP_ prefix.

Do not place client secrets or other confidential values in frontend environment variables. Frontend variables are included in the generated JavaScript bundle.

4. Start the development server

For a project whose package.json defines the standard Create React App scripts:

npm start

The application will normally be available at:

http://localhost:3000

If the project uses a different frontend framework or start script, follow the scripts defined in its package.json.

5. Backend development

Each Lambda function is stored in its own directory under lambdas/.

Examples:

lambdas/
├── login/
├── authoriser/
├── getPayments/
├── createPayment/
├── updatePayment/
├── deletePayment/
├── getPaymentTypes/
├── createPaymentType/
├── updatePaymentType/
├── deletePaymentType/
└── utils/
    └── cors.js

The exact repository may contain additional functions.

The login and authoriser directories have their own dependency installation steps in the current build configuration:

cd lambdas/login
npm ci
cd ../..

cd lambdas/authoriser
npm ci
cd ../..

Run these commands when preparing those functions locally, provided their package-lock.json files are present.

The deployed backend uses AWS resources. Local development therefore requires the appropriate API configuration, Cognito setup, and access to the relevant environment. Avoid using production data for development and testing.

Configuration and Secrets

Application configuration is stored in AWS Systems Manager Parameter Store.

The build process reads parameters using the CODE_PIPELINE_NAME environment variable to select the appropriate prefix.

Parameter

Purpose

API_KEY

API key configuration, where applicable

TABLE_PAYMENTS

Payments DynamoDB table name

TABLE_PAYMENT_TYPES

Payment types DynamoDB table name

ALLOWED_ORIGINS

Allowed frontend origins for CORS

COGNITO_CLIENT_ID

Cognito app client identifier

COGNITO_CLIENT_SECRET

Cognito app client secret

COGNITO_USER_POOL_ID

Cognito user pool identifier

Example parameter paths:

/expenses-manager-develop/TABLE_PAYMENTS
/expenses-manager-prod/TABLE_PAYMENTS

Secrets must not be committed to source control. Use Parameter Store and IAM permissions to control access. Parameters stored as SecureString may require additional KMS permissions, depending on the encryption key configuration.

Changing a Parameter Store value does not automatically update an already published Lambda version. Run the deployment process to update the Lambda configuration, publish a new version, and move the appropriate alias.

Deployment Process

Development deployment

Push the intended changes to the development branch.

Allow the configured development pipeline to run.

Review test, lint, build, and deployment results.

Verify the development aliases, Lambda configuration, API stage, and frontend.

Production deployment

Review and test the changes before merging or promoting them to the production branch.

Allow the configured production pipeline to run.

Review the pipeline results and deployment logs.

Verify the production aliases, API stage, frontend, and DynamoDB configuration.

Branch names and pipeline triggers must match the actual repository and CodePipeline configuration.

Deployment verification

After deployment, verify:

The pipeline completed successfully.

Lambda aliases point to the intended published versions.

Lambda environment variables contain the correct environment-specific values.

API Gateway stages invoke the correct Lambda aliases.

CORS allows the intended frontend origin.

Lambda execution roles have the required permissions for DynamoDB and other services.

CloudWatch logs do not show invocation or permission errors.

The frontend uses the correct API base URL.

Security and IAM

The application relies on IAM roles and policies to control access between AWS services.

Recommended practices:

Grant CodeBuild only the permissions needed for its specific responsibilities.

Keep testing and linting roles separate from deployment roles.

Restrict Lambda execution roles to the tables and actions each function needs.

Protect Parameter Store secrets and KMS keys.

Never commit credentials or expose backend secrets in the React bundle.

Keep development and production data separate.

Review Cognito token validation, API authorization, CORS configuration, and API Gateway settings.

Environment isolation note: Lambda aliases are different versions of the same underlying function and share its execution role. If development and production aliases use the same Lambda function, that role may have permissions for both environments' tables. Stronger IAM isolation requires separate Lambda functions and execution roles per environment.

License
