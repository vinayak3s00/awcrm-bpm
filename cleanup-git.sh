#!/bin/bash

# AWCRM Git Cleanup Script
# This script removes large files and directories from git tracking

echo "🧹 AWCRM Git Cleanup Script"
echo "=========================="

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

echo "📊 Checking current git status..."
TRACKED_FILES=$(git ls-files | wc -l)
UNTRACKED_FILES=$(git status --porcelain | grep "^??" | wc -l)
MODIFIED_FILES=$(git status --porcelain | grep "^.M" | wc -l)

echo "   📁 Tracked files: $TRACKED_FILES"
echo "   📄 Untracked files: $UNTRACKED_FILES" 
echo "   ✏️  Modified files: $MODIFIED_FILES"

# Check for problematic files/directories
echo ""
echo "🔍 Checking for problematic files..."

# Check if node_modules is tracked
if git ls-files | grep -q "node_modules"; then
    echo "   ⚠️  node_modules/ is being tracked by git"
    NODE_MODULES_TRACKED=true
else
    echo "   ✅ node_modules/ is not tracked"
    NODE_MODULES_TRACKED=false
fi

# Check if local.db is tracked
if git ls-files | grep -q "local\.db"; then
    echo "   ⚠️  local.db/ is being tracked by git"
    LOCAL_DB_TRACKED=true
else
    echo "   ✅ local.db/ is not tracked"
    LOCAL_DB_TRACKED=false
fi

# Check if .next is tracked
if git ls-files | grep -q "\.next"; then
    echo "   ⚠️  .next/ is being tracked by git"
    NEXT_TRACKED=true
else
    echo "   ✅ .next/ is not tracked"
    NEXT_TRACKED=false
fi

# Check if dist is tracked
if git ls-files | grep -q "dist"; then
    echo "   ⚠️  dist/ is being tracked by git"
    DIST_TRACKED=true
else
    echo "   ✅ dist/ is not tracked"
    DIST_TRACKED=false
fi

# Check for large files
echo ""
echo "📏 Checking for large files (>1MB)..."
LARGE_FILES=$(git ls-files | xargs ls -la 2>/dev/null | awk '$5 > 1048576 {print $9 " (" $5 " bytes)"}')
if [ -n "$LARGE_FILES" ]; then
    echo "   ⚠️  Large files found:"
    echo "$LARGE_FILES" | sed 's/^/      /'
else
    echo "   ✅ No large files found"
fi

# Offer to fix issues
echo ""
echo "🔧 Cleanup Options:"
echo "=================="

if [ "$NODE_MODULES_TRACKED" = true ] || [ "$LOCAL_DB_TRACKED" = true ] || [ "$NEXT_TRACKED" = true ] || [ "$DIST_TRACKED" = true ]; then
    echo "The following cleanup actions are recommended:"
    echo ""
    
    if [ "$NODE_MODULES_TRACKED" = true ]; then
        echo "1. Remove node_modules/ from git tracking"
        echo "   Command: git rm -r --cached node_modules/"
    fi
    
    if [ "$LOCAL_DB_TRACKED" = true ]; then
        echo "2. Remove local.db/ from git tracking"
        echo "   Command: git rm -r --cached local.db/"
    fi
    
    if [ "$NEXT_TRACKED" = true ]; then
        echo "3. Remove .next/ from git tracking"
        echo "   Command: git rm -r --cached .next/"
    fi
    
    if [ "$DIST_TRACKED" = true ]; then
        echo "4. Remove dist/ from git tracking"
        echo "   Command: git rm -r --cached dist/"
    fi
    
    echo ""
    echo "5. Commit the cleanup"
    echo "   Command: git commit -m 'chore: remove large files from git tracking'"
    echo ""
    
    read -p "🤔 Do you want to run the cleanup automatically? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "🚀 Running cleanup..."
        
        # Remove problematic directories from git tracking
        if [ "$NODE_MODULES_TRACKED" = true ]; then
            echo "   📁 Removing node_modules/ from git..."
            git rm -r --cached node_modules/ 2>/dev/null || echo "      ⚠️  node_modules/ not found or already removed"
        fi
        
        if [ "$LOCAL_DB_TRACKED" = true ]; then
            echo "   🗄️  Removing local.db/ from git..."
            git rm -r --cached local.db/ 2>/dev/null || echo "      ⚠️  local.db/ not found or already removed"
        fi
        
        if [ "$NEXT_TRACKED" = true ]; then
            echo "   ⚡ Removing .next/ from git..."
            git rm -r --cached .next/ 2>/dev/null || echo "      ⚠️  .next/ not found or already removed"
        fi
        
        if [ "$DIST_TRACKED" = true ]; then
            echo "   📦 Removing dist/ from git..."
            git rm -r --cached dist/ 2>/dev/null || echo "      ⚠️  dist/ not found or already removed"
        fi
        
        # Check if there are changes to commit
        if git diff --cached --quiet; then
            echo "   ✅ No changes to commit (files may have already been removed)"
        else
            echo "   💾 Committing cleanup changes..."
            git commit -m "chore: remove large files and build artifacts from git tracking

- Remove node_modules/ from tracking (should be in .gitignore)
- Remove local.db/ from tracking (local database files)
- Remove .next/ from tracking (Next.js build files)
- Remove dist/ from tracking (build output)

This reduces repository size and follows best practices."
            
            echo "   ✅ Cleanup committed successfully!"
        fi
        
        echo ""
        echo "📊 New git status:"
        NEW_TRACKED_FILES=$(git ls-files | wc -l)
        echo "   📁 Tracked files: $NEW_TRACKED_FILES (was $TRACKED_FILES)"
        echo "   📉 Reduction: $((TRACKED_FILES - NEW_TRACKED_FILES)) files"
        
    else
        echo "   ⏭️  Cleanup skipped. You can run the commands manually."
    fi
    
else
    echo "✅ No cleanup needed! Your git repository looks good."
fi

echo ""
echo "💡 Additional Recommendations:"
echo "=============================="
echo "1. Make sure .gitignore is up to date"
echo "2. Run 'git gc' to clean up loose objects"
echo "3. Consider using 'git lfs' for large binary files"
echo "4. Regularly check repository size with 'du -sh .git'"

echo ""
echo "🎉 Git cleanup script completed!"
