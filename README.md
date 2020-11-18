# Marathon – Comment Action

Marathon runs your task and comments about it on your Pull Request using GitHub Actions

## Usage

```yaml
- uses: travelnest/action-marathon@v1
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  with:
    command: make typecheck
    mode: failure
    text: "**Typechecker results**"
```
