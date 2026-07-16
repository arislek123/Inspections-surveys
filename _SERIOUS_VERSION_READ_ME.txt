SURVINSPEC serious clean version v2.1

Upload instructions:
1. Extract this ZIP.
2. In GitHub Desktop -> Show in Explorer.
3. Delete old project files, but DO NOT delete the hidden .git folder.
4. Paste every file/folder from this extracted ZIP into the repo folder.
5. Commit: SURVINSPEC serious clean version.
6. Push origin.
7. Wait for GitHub Actions to become green.
8. Open the site with Ctrl+F5 or incognito.

Visible checks after deployment:
- Sidebar must show SURVINSPEC, not MARITECH.
- Button must show New Survey / Service Case, not New Case (30s).
- Dashboard must show Inspections & Surveys Dashboard.
- No Worklist phase should be displayed. Legacy In Worklist data is automatically converted to In Progress.

Included fixes:
- Clean SURVINSPEC branding.
- Firebase online sync retained.
- Public npm registry GitHub Action retained, no package-lock.
- Compact vessel table with edit/archive/delete.
- Ports edit/archive/delete.
- Mail entry edit/delete.
- Internal notes default to Technical Department, no fake names.
- Advanced filters and quick search chips.
- Firestore undefined-value sanitizing.
