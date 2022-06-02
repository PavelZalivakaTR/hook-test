# Pull request validation
Github Action to validate pull requests are properly created (title, assignee(s), labels, projects)

## Usage
See [action.yml](action.yml)

```yaml
steps:
- uses: ./.github/actions/pull-request-validation
  with:
    title_regex: '(N/A|GCS\-)([a-z])+\/([a-z])+' # Regex the title should match.
    title_regex_flags: 'gi' # Regex flags that should be used with the title regex matching.
    title_allowed_prefixes: N/A,GCS- # Title should start with one of the given prefixes (comma delimited)
    title_prefix_case_sensitive: false # Title prefixes are case insensitive
    labels_required: enhancement,bug # Pull request should have at least one of the given labels (comma delimited)
    assignee_required: true # Pull request should have an assignee
    project_required: true # Pull request should have at least one project
    repo_token: ${{ secrets.GITHUB_TOKEN }} # Github token to use to comment on pull requests
```
