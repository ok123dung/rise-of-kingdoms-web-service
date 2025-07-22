#!/bin/bash

# Script to create GitHub repository and push code
# Rise of Kingdoms Services

echo "🚀 GitHub Repository Setup Script"
echo "================================"

# Check if git remote already exists
if git remote | grep -q "origin"; then
    echo "⚠️  Git remote 'origin' already exists. Removing..."
    git remote remove origin
fi

# Get GitHub username
read -p "Enter your GitHub username: " GITHUB_USER
read -p "Enter repository name (default: rok-services): " REPO_NAME
REPO_NAME=${REPO_NAME:-rok-services}

# Option 1: Using GitHub API with personal token
echo ""
echo "📝 To create repository via API, you need a Personal Access Token"
echo "   Get one from: https://github.com/settings/tokens/new"
echo "   Required scopes: repo (full control)"
echo ""
read -sp "Enter your GitHub Personal Access Token: " GITHUB_TOKEN
echo ""

# Create repository using GitHub API
echo "Creating repository '$REPO_NAME'..."
curl -H "Authorization: token $GITHUB_TOKEN" \
     -H "Accept: application/vnd.github.v3+json" \
     https://api.github.com/user/repos \
     -d "{\"name\":\"$REPO_NAME\",\"private\":true,\"description\":\"Rise of Kingdoms Services - B2C Website for Vietnamese Gamers\"}"

# Add remote and push
echo ""
echo "🔗 Adding remote origin..."
git remote add origin "https://github.com/$GITHUB_USER/$REPO_NAME.git"

echo "📤 Pushing code to GitHub..."
git push -u origin main

echo ""
echo "✅ Complete! Your repository is at:"
echo "   https://github.com/$GITHUB_USER/$REPO_NAME"
echo ""
echo "🚀 Next steps:"
echo "1. Go to https://vercel.com/new"
echo "2. Import your GitHub repository"
echo "3. Deploy will start automatically!"