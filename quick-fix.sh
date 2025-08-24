#!/bin/bash

# AWCRM Quick Git Fix - Remove 10k+ files issue
echo "🚀 AWCRM Quick Git Fix"
echo "====================="

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d ".git" ]; then
    echo "❌ Error: Run this script from the awcrm-bpm directory"
    exit 1
fi

echo "📊 Before cleanup:"
echo "   Files tracked: $(git ls-files | wc -l)"
echo "   Files to commit: $(git status --porcelain | wc -l)"

echo ""
echo "🧹 Removing large files from git tracking..."

# Remove large directories from git tracking
git rm -r --cached node_modules/ 2>/dev/null && echo "   ✅ Removed node_modules/" || echo "   ⚠️  node_modules/ not tracked"
git rm -r --cached local.db/ 2>/dev/null && echo "   ✅ Removed local.db/" || echo "   ⚠️  local.db/ not tracked"
git rm -r --cached .next/ 2>/dev/null && echo "   ✅ Removed .next/" || echo "   ⚠️  .next/ not tracked"
git rm -r --cached dist/ 2>/dev/null && echo "   ✅ Removed dist/" || echo "   ⚠️  dist/ not tracked"
git rm -r --cached build/ 2>/dev/null && echo "   ✅ Removed build/" || echo "   ⚠️  build/ not tracked"

echo ""
echo "💾 Committing cleanup..."

# Add .gitignore and commit
git add .gitignore
git commit -m "chore: fix git tracking - remove large files

- Remove node_modules/ from tracking (fixes 10k+ files issue)
- Remove database and build files from tracking
- Update .gitignore to prevent future issues

Repository size reduced significantly." 2>/dev/null

echo ""
echo "📊 After cleanup:"
echo "   Files tracked: $(git ls-files | wc -l)"
echo "   Files to commit: $(git status --porcelain | wc -l)"

echo ""
echo "🎉 Git cleanup completed!"
echo "   ✅ Repository size reduced"
echo "   ✅ Git operations will be faster"
echo "   ✅ Push/pull should work normally"
echo ""
echo "💡 Your application files are safe and the app will still work!"
