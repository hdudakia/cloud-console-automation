# Cloud Console Automation Script

This Node.js script is designed to automate the login process for AWS and Azure consoles (other cloud providers will be added later), allowing users to quickly access and manage multiple services across different regions and cloud environments. The script is ideal for **ClickOps** tasks, increasing productivity during tech demos, and efficiently managing UI components across regions and clouds.

## Features

- Automated login to **AWS** and **Azure** cloud portals.
- Open common AWS and Azure service tabs concurrently (IAM, VPC, EC2, AKS, Virtual Machines, Networking, etc.).
- Handles multiple regions for AWS services.
- Supports non-headless mode for visibility during demonstrations.
- Convenient for **ClickOps** workflows and tech demos across multiple UIs and regions.

## Requirements

- Node.js v14+ installed on your system
- An `npm` package manager
- Chromium (handled by Playwright, which will download it automatically).

Note: The script uses Playwright, which will automatically download and instantiate Chromium unless you specify a different browser. No additional installation is needed if Chromium is not installed locally. If you already have Google Chrome installed, Playwright will still manage the Chromium instance separately, so no conflicts will arise.

## Packages Required

The following Node.js packages are required to run this script:

- `playwright` (for browser automation)
- `prompts` (for interactive CLI prompts)
- `fs` and `path` (for handling files like JSON secrets)


## Setup

### Step 1: Clone the Repository

Clone this repository to your local system:

```bash
git clone https://github.com/hdudakia/cloud-console-automation.git
cd cloud-console-automation
```


### Step 2: Install Dependencies

Run the following command to install the required Node.js packages:

```bash
npm install playwright prompts fs path
```

### Step 3: Create `secrets.json`

Create a secrets.json file in the root directory of the project. This file will store the login credentials for AWS and Azure accounts. Below is an example of how the secrets.json file should look:

```
{
  "aws_account": "your-aws-account-id",
  "aws_username": "your-aws-username",
  "aws_password": "your-aws-password",
  "azure_email": "your-azure-email",
  "azure_password": "your-azure-password"
}
```

Ensure that you update this file with your correct cloud account credentials.

### Step 4: Run the Script

To run the script, use the following command:

```
node chromium-cloud-tabs.js
```

You will be prompted to select your cloud provider and, if AWS is selected, a region.



