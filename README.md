# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/c1cd2940-10b7-4c6d-900a-07b0f572e7b9

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/c1cd2940-10b7-4c6d-900a-07b0f572e7b9) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/c1cd2940-10b7-4c6d-900a-07b0f572e7b9) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Lovable Sandbox Configuration

### Disabling Hot Module Replacement (HMR)

In some cases, particularly when testing admin panel functionality in Lovable's sandbox environment, you may want to disable Hot Module Replacement to ensure stable previews without WebSocket connection interference.

To disable HMR, set the following environment variable:

**In Lovable:**
1. Go to your project settings
2. Navigate to "Variables del proyecto" 
3. Add: `VITE_DISABLE_HMR=1`

**In local development:**
```bash
VITE_DISABLE_HMR=1
```

This setting will:
- Disable Hot Module Replacement in the development server
- Disable the component tagger functionality  
- Provide more stable previews for `/admin` routes in sandbox environments

**When to use this:**
- Testing admin panel functionality in Lovable sandbox
- When encountering WebSocket connection issues that interfere with app functionality
- When you need consistent behavior across different sandbox sessions
