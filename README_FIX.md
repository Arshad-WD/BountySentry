# Project Structure Fix

If you are seeing errors related to `V5-Frontend & Backend/frontend/tsconfig.json`, please note:

1. **Ghost Directory**: The folder `V5-Frontend & Backend` is a legacy/incorrect directory that might be appearing in your workspace. It should be ignored or deleted.
2. **Correct Directory**: The actual source code is in `V5-Frontend_Backend` (underscore instead of ' & ').
3. **Application Status**: The application is running correctly from the valid directory.

## Action Required
- Verify you are editing files in `V5-Frontend_Backend`.
- If VS Code shows errors for the old folder, try closing those files or restarting the window.
- The `start_services.js` script has been updated to automatically use the correct folder.
