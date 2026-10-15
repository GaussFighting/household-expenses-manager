# Household Expenses Manager

A serverless web application for managing household expenses. The application uses React for the frontend and AWS services for authentication, API processing, data storage, and automated deployments.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Request Flow](#request-flow)
- [AWS Services](#aws-services)
- [Environments](#environments)
- [CI/CD Pipeline](#cicd-pipeline)
- [Lambda Deployment Strategy](#lambda-deployment-strategy)
- [Local Development](#local-development)
- [Configuration and Secrets](#configuration-and-secrets)
- [Deployment Process](#deployment-process)
- [Security and IAM](#security-and-iam)
- [Troubleshooting](#troubleshooting)

## Overview

The application is built using a serverless architecture. The frontend communicates with an Amazon API Gateway REST API, which invokes AWS Lambda functions. Lambda functions process requests and access data stored in Amazon DynamoDB.

Amazon Cognito provides user authentication. AWS CodePipeline and AWS CodeBuild automate testing, building, and deployment.

The project supports separate development and production environments, with independent DynamoDB tables and environment-specific Lambda aliases.

## Architecture

The following diagram illustrates the main components and their logical relationships.

```mermaid
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

    subgraph API["Amazon API Gateway REST API"]
        APIDev["Develop Stage"]
        APIProd["Production Stage"]
    end

    subgraph Lambda["AWS Lambda"]
        DevAlias["Develop Aliases"]
        ProdAlias["Production Aliases"]
    end

    subgraph Database["Amazon DynamoDB"]
        DevTables[("payments-develop / payment-types-develop")]
        ProdTables[("payments / payment-types")]
    end

    subgraph CICD["CI/CD"]
        Pipeline["AWS CodePipeline"]
        Build["AWS CodeBuild"]
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

    Pipeline --> Build
    Build -.-> DevAlias
    Build -.-> ProdAlias
