# Create a GitHub Action Using TypeScript

```yaml
- uses: asg017/setup-sqite-dist
- run: sqlite-dist --help
```

```
gh release -R asg017/sqlite-dist list --json name,tagName,createdAt,isLatest > version.json
```
