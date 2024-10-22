const { chromium } = require('playwright'); // Or 'firefox' or 'webkit'
const fs = require('fs'); // File system module
const path = require('path');
const prompts = require('prompts'); // For user input prompts

// Function to launch AWS console automation
const runAWSConsoleAutomation = async (cloudProvider, region) => {
    // Validate region input
    if (!region) {
        console.error('❌ Region is not specified. Please provide a valid region.');
        return;
    }

    console.log(`🚀 Cloud Provider: ${cloudProvider}, Region: ${region}`); // Log to check input

    // Load the secrets from the JSON file
    let secrets;
    try {
        const fileContents = fs.readFileSync(path.join(__dirname, 'secrets.json'), 'utf8');
        secrets = JSON.parse(fileContents); // Parse JSON to object
    } catch (e) {
        console.error('❌ Error reading the JSON file:', e);
        return;
    }

    // Launch the browser
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1700, height: 1080 }, // Adjust width if necessary
    });
    const page = await context.newPage();

    // Go to AWS main page and click the "Sign In" button
    console.log('🚀 Navigating to AWS homepage...');
    await page.goto('https://aws.amazon.com/');
    console.log('🚀 Clicking on "Sign In"...');
    await page.click('a[href*="console/home?nc2=h_ct&src=header-signin"]');
    await page.waitForNavigation();

    // Fill in the login form using values from the JSON file
    console.log('🚀 Filling in account credentials...');
    await page.fill('input[name="account"]', secrets.aws_account);
    await page.fill('input[name="username"]', secrets.aws_username);
    await page.fill('input[name="password"]', secrets.aws_password);
    await page.click('#signin_button');
    await page.waitForNavigation();

    // Go to the AWS console home page for the selected region
    console.log(`🚀 Navigating to AWS console home page for region: ${region}...`);
    await page.goto(`https://${region}.console.aws.amazon.com/console/home?region=${region}`);
    await page.waitForLoadState('domcontentloaded');

    // Accept cookies on the home page
    try {
        await page.click('button[data-id="awsccc-cb-btn-accept"]');
        console.log('🍪 Cookies accepted on:', page.url());
    } catch (err) {
        console.log('🍪 No "Accept All" button found on the home page');
    }

    // Construct service URLs
    const serviceUrls = [
        `https://${region}.console.aws.amazon.com/iam/home`, // IAM
        `https://${region}.console.aws.amazon.com/vpc/home`, // VPC
        `https://${region}.console.aws.amazon.com/ec2/home`, // EC2
        `https://${region}.console.aws.amazon.com/eks/home`, // EKS
    ];

    // Open all service tabs concurrently
    const pages = await Promise.all(serviceUrls.map(async (url) => {
        const newPage = await context.newPage();
        await newPage.goto(url);
        await newPage.waitForLoadState('domcontentloaded');

        // Log the page load message
        console.log(`⏳ Page loaded for: ${newPage.url()}`);

        // Accept cookies on the service page if it exists, with a timeout
        try {
            await Promise.race([
                newPage.click('button[data-id="awsccc-cb-btn-accept"]'),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 10000)),
            ]);
            console.log('🍪 Cookies accepted on:', newPage.url());
        } catch (err) {
            console.log(`🍪 No "Accept All" button found for: ${newPage.url()}`);
        }

        return newPage; // Return the new page
    }));

    // Keep the browser open
    console.log('😎 All AWS service pages opened successfully.');
    console.log(`💀 AWS Console is running. PID: ${process.pid}`);
    console.log('💀 To terminate this process, use: kill -9 ' + process.pid);
    console.log('💤 To avoid accidentally killing this process, use "Ctrl+Z" followed by "bg" to background it. You can later terminate it with the PID command if needed.');

    // Prevent Node.js from exiting immediately
    await new Promise(() => { /* Keep the event loop running */ });
};


// Function to launch Azure console automation
const runAzureConsoleAutomation = async (cloudProvider) => {
    console.log(`🚀 Cloud Provider: ${cloudProvider}`); // Log to check input

    // Load the secrets from the JSON file
    let secrets;
    try {
        const fileContents = fs.readFileSync(path.join(__dirname, 'secrets.json'), 'utf8');
        secrets = JSON.parse(fileContents); // Parse JSON to object
    } catch (e) {
        console.error('❌ Error reading the JSON file:', e);
        return;
    }

    // Launch the browser
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        viewport: { width: 1700, height: 1080 }, // Adjust width if necessary
    });
    const page = await context.newPage();

    // Go to Azure main page
    console.log('🚀 Navigating to Azure homepage...');
    await page.goto('https://portal.azure.com/');

    // Fill in the email address
    console.log('🚀 Entering email...');
    await page.fill('input[type="email"]', secrets.azure_email);
    await page.click('#idSIButton9'); // Click the "Next" button
    await page.waitForNavigation();

    // Wait for the password field to be visible
    console.log('🚀 Waiting for the password field...');
    await page.waitForSelector('input[type="password"]', { timeout: 10000 }); // Wait up to 10 seconds
    await page.click('input[type="password"]'); // Click to focus
    await page.waitForTimeout(1000); // Wait for 1 second
    await page.fill('input[type="password"]', secrets.azure_password); // Fill in the password
    await page.click('#idSIButton9'); // Click the "Sign In" button
    await page.waitForNavigation();

    // Wait for the "Stay signed in?" popup to appear and click "Yes"
    try {
        console.log('🚀 Waiting for the "Stay signed in?" popup...');
        await page.waitForSelector('text=Stay signed in?', { timeout: 10000 });
        await page.click('input#idSIButton9[value="Yes"]'); // Click the "Yes" button
        console.log('✅ Clicked "Yes" on the "Stay signed in?" popup.');
    } catch (error) {
        console.log('❌ No "Stay signed in?" popup appeared or failed to click "Yes":', error);
    }

    // After logging in, open common tabs in Azure
    console.log('🚀 Opening common Azure tabs...');

    const tabs = [
        { url: 'https://portal.azure.com/#browse/resourcegroups', name: 'Resource Groups' }, // Resource Groups
        { url: 'https://portal.azure.com/#browse/Microsoft.ContainerService%2FmanagedClusters', name: 'AKS' }, // AKS
        { url: 'https://portal.azure.com/#browse/Microsoft.Compute%2FVirtualMachines', name: 'Virtual Machines' }, // Virtual Machines
        { url: 'https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps/ApplicationsListBlade', name: 'IAM/RBAC' }, // IAM/RBAC
        { url: 'https://portal.azure.com/#blade/HubsExtension/BrowseResource/resourceType/Microsoft.Network%2FvirtualNetworks', name: 'Networking' }, // Networking
    ];

    // Open each tab in a new page and set custom titles
    for (const tab of tabs) {
        const newPage = await context.newPage();
        await newPage.goto(tab.url);
        await newPage.evaluate((tabName) => {
            document.title = tabName; // Change the page title
        }, tab.name);
        console.log(`💻 Opened tab: ${tab.name}`);
    }

    console.log('😎 Successfully logged into Azure portal and opened common tabs.');

    // Keep the browser open
    console.log(`💀 Azure Console is running. PID: ${process.pid}`);
    console.log('💀 To terminate this process, use: kill -9 ' + process.pid);
    console.log('💤 To avoid accidentally killing this process, use "Ctrl+Z" followed by "bg" to background it. You can later terminate it with the PID command if needed.');


    // Prevent Node.js from exiting immediately
    await new Promise(() => { /* Keep the event loop running */ });
};

// Main function to handle user input and run the script
const main = async () => {
    // Prompt user to choose cloud provider
    const cloudProviderPrompt = {
        type: 'select',
        name: 'cloudProvider',
        message: 'Select a cloud provider:',
        choices: [
            { title: 'AWS', value: 'AWS' },
            { title: 'Azure', value: 'Azure' }
        ],
    };

    const cloudProviderResponse = await prompts(cloudProviderPrompt);
    const cloudProvider = cloudProviderResponse.cloudProvider;

    // Prompt user to choose region for AWS
    let region = null;
    if (cloudProvider === 'AWS') {
        const regionPrompt = {
            type: 'select',
            name: 'region',
            message: 'Select a region:',
            choices: [
                { title: 'Europe', value: 'dummy2' },
                { title: 'eu-central-1', value: 'eu-central-1' },
                { title: 'eu-west-1', value: 'eu-west-1' },
                { title: 'eu-west-2', value: 'eu-west-2' },
                { title: 'eu-west-3', value: 'eu-west-3' },
                { title: 'Americas', value: 'dummy' },
                { title: 'us-east-1', value: 'us-east-1' },
                { title: 'us-west-1', value: 'us-west-1' },
                { title: 'us-west-2', value: 'us-west-2' },
                { title: 'APAC', value: 'dummy3' },
                { title: 'ap-southeast-1', value: 'ap-southeast-1' },
                { title: 'ap-southeast-2', value: 'ap-southeast-2' },
                { title: 'ap-northeast-1', value: 'ap-northeast-1' },
                { title: 'ap-northeast-2', value: 'ap-northeast-2' },
                { title: 'ap-south-1', value: 'ap-south-1' },
                // Add more regions as needed
            ],
        };

        const regionResponse = await prompts(regionPrompt);
        region = regionResponse.region;
    }

    // Run the appropriate console automation based on cloud provider
    if (cloudProvider === 'AWS') {
        await runAWSConsoleAutomation(cloudProvider, region);
    } else if (cloudProvider === 'Azure') {
        await runAzureConsoleAutomation(cloudProvider);
    }
};

// Run the main function
main().catch((err) => {
    console.error('❌ An error occurred:', err);
    process.exit(1);
});
