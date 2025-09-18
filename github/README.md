# sgptcoder GitHub Action

A GitHub Action that integrates [sgptcoder](https://sgptcoder.ai) directly into your GitHub workflow.

Mention `/sgptcoder` in your comment, and sgptcoder will execute tasks within your GitHub Actions runner.

## Features

#### Explain an issues

Leave the following comment on a GitHub issue. `sgptcoder` will read the entire thread, including all comments, and reply with a clear explanation.

```
/sgptcoder explain this issue
```

#### Fix an issues

Leave the following comment on a GitHub issue. sgptcoder will create a new branch, implement the changes, and open a PR with the changes.

```
/sgptcoder fix this
```

#### Review PRs and make changes

Leave the following comment on a GitHub PR. sgptcoder will implement the requested change and commit it to the same PR.

```
Delete the attachment from S3 when the note is removed /oc
```

## Installation

Run the following command in the terminal from your GitHub repo:

```bash
sgptcoder github install
```

This will walk you through installing the GitHub app, creating the workflow, and setting up secrets.

### Manual Setup

1. Install the GitHub app https://github.com/apps/sgptcoder-agent. Make sure it is installed on the target repository.
2. Add the following workflow file to `.github/workflows/sgptcoder.yml` in your repo. Set the appropriate `model` and required API keys in `env`.

   ```yml
   name: sgptcoder

   on:
     issue_comment:
       types: [created]

   jobs:
     sgptcoder:
       if: |
         contains(github.event.comment.body, '/oc') ||
         contains(github.event.comment.body, '/sgptcoder')
       runs-on: ubuntu-latest
       permissions:
         id-token: write
       steps:
         - name: Checkout repository
           uses: actions/checkout@v4
           with:
             fetch-depth: 1

         - name: Run sgptcoder
           uses: skorpland/sgptcoder/github@latest
           env:
             ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
           with:
             model: anthropic/claude-sonnet-4-20250514
   ```

3. Store the API keys in secrets. In your organization or project **settings**, expand **Secrets and variables** on the left and select **Actions**. Add the required API keys.

## Support

This is an early release. If you encounter issues or have feedback, please create an issue at https://github.com/skorpland/sgptcoder/issues.

## Development

To test locally:

1. Navigate to a test repo (e.g. `hello-world`):

   ```bash
   cd hello-world
   ```

2. Run:

   ```bash
   MODEL=anthropic/claude-sonnet-4-20250514 \
     ANTHROPIC_API_KEY=sk-ant-api03-1234567890 \
     GITHUB_RUN_ID=dummy \
     MOCK_TOKEN=github_pat_1234567890 \
     MOCK_EVENT='{"eventName":"issue_comment",...}' \
     bun /path/to/sgptcoder/github/index.ts
   ```

   - `MODEL`: The model used by sgptcoder. Same as the `MODEL` defined in the GitHub workflow.
   - `ANTHROPIC_API_KEY`: Your model provider API key. Same as the keys defined in the GitHub workflow.
   - `GITHUB_RUN_ID`: Dummy value to emulate GitHub action environment.
   - `MOCK_TOKEN`: A GitHub persontal access token. This token is used to verify you have `admin` or `write` access to the test repo. Generate a token [here](https://github.com/settings/personal-access-tokens).
   - `MOCK_EVENT`: Mock GitHub event payload (see templates below).
   - `/path/to/sgptcoder`: Path to your cloned sgptcoder repo. `bun /path/to/sgptcoder/github/index.ts` runs your local version of `sgptcoder`.

### Issue comment event

```
MOCK_EVENT='{"eventName":"issue_comment","repo":{"owner":"sgpt","repo":"hello-world"},"actor":"fwang","payload":{"issue":{"number":4},"comment":{"id":1,"body":"hey sgptcoder, summarize thread"}}}'
```

Replace:

- `"owner":"sgpt"` with repo owner
- `"repo":"hello-world"` with repo name
- `"actor":"fwang"` with the GitHub username of commentor
- `"number":4` with the GitHub issue id
- `"body":"hey sgptcoder, summarize thread"` with comment body

### Issue comment with image attachment.

```
MOCK_EVENT='{"eventName":"issue_comment","repo":{"owner":"sgpt","repo":"hello-world"},"actor":"fwang","payload":{"issue":{"number":4},"comment":{"id":1,"body":"hey sgptcoder, what is in my image ![Image](https://github.com/user-attachments/assets/xxxxxxxx)"}}}'
```

Replace the image URL `https://github.com/user-attachments/assets/xxxxxxxx` with a valid GitHub attachment (you can generate one by commenting with an image in any issue).

### PR comment event

```
MOCK_EVENT='{"eventName":"issue_comment","repo":{"owner":"sgpt","repo":"hello-world"},"actor":"fwang","payload":{"issue":{"number":4,"pull_request":{}},"comment":{"id":1,"body":"hey sgptcoder, summarize thread"}}}'
```
