# Your Project's Title...
Your project's description...

## Environments
- Preview: https://main--residentportal--jfoxx.aem.page/
- Live: https://main--residentportal--jfoxx.aem.live/

## Installation

```sh
npm i
```

## Linting

```sh
npm run lint
```

## Local development

1. Create a new repository based on the `aem-boilerplate-forms` template and add a mountpoint in the `fstab.yaml`
1. Add the [AEM Code Sync GitHub App](https://github.com/apps/aem-code-sync) to the repository
1. Install the [AEM CLI](https://github.com/adobe/helix-cli): `npm install -g @adobe/aem-cli`
1. Start AEM Proxy: `aem up` (opens your browser at `http://localhost:3000`)
1. Open the project directory in your favorite IDE and start coding :)

## Prerequisites

- nodejs 18.3.x or newer
- AEM Cloud Service release 2024.8 or newer (>= `17465`)

## List of Form Components

1. Button  
2. Checkbox  
3. Checkbox Group  
4. Date Picker  
5. Dropdown List  
6. Email Input  
7. File Input  
8. Form Fragment  
9. Image  
10. Modal  
11. Number Input  
12. Panel  
13. Radio Group  
14. Reset  
15. Submit  
16. Telephone Input  
17. Terms and Conditions  
18. Text  
19. Text Input  
20. Wizard  

## Deployment Troubleshooting

### Code changes (CSS/JS) not appearing on a repoless live site

In a repoless setup, code changes should appear on both `.aem.page` and `.aem.live` at the same time. If CSS/JS updates show on one site (e.g. `residentportal.aem.page`) but not another (e.g. `ncdisaster.aem.live`), the live site is likely pointing to a different code source.

**Fix:** Update the ncdisaster site config to use the residentportal repo:

1. Get an auth token from [admin.hlx.page/login](https://admin.hlx.page/login) (login with Adobe, copy `auth_token` cookie)
2. Check current config: `curl -H "x-auth-token: <token>" https://admin.hlx.page/config/jfoxx/sites/ncdisaster.json`
3. If `code.repo` is not `residentportal`, update it via PUT to the same URL with:
   ```json
   { "code": { "owner": "jfoxx", "repo": "residentportal" } }
   ```
   (Merge with existing config; see [Admin API](https://www.aem.live/docs/admin.html) and [repoless docs](https://www.aem.live/docs/repoless))

### General deployment issues

1. **Verify AEM Code Sync is installed**: [github.com/apps/aem-code-sync](https://github.com/apps/aem-code-sync) → ensure `residentportal` is in "Repository access"
2. **Allow sync time**: Code Sync can take a few minutes after merge
3. **Cache**: Hard refresh (Cmd+Shift+R) or append `?nocache=1` to the URL

## Resources

### Documentation
- [Getting Started Guide](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/edge-dev-getting-started)
- [Creating Blocks](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/create-block)
- [Content Modelling](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/content-modeling)
- [Working with Tabular Data / Spreadsheets](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/edge-delivery/wysiwyg-authoring/tabular-data)

### Presentations and Recordings
- [Getting started with AEM Authoring and Edge Delivery Services](https://experienceleague.adobe.com/en/docs/events/experience-manager-gems-recordings/gems2024/aem-authoring-and-edge-delivery)
