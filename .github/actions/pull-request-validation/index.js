const core = require("@actions/core");
const github = require("@actions/github");
const title = require("./title");
const labels = require("./labels");
const assignees = require("./assignees");
const projects = require("./projects");

// Get pull request via REST API because github.context.payload.pull_request seems to get the pull request data at the time of latest commit
async function getPullRequest(client) {
    return await client.pulls.get({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        pull_number: github.context.payload.pull_request.number,
    }).then((response) => response.data)
}

function generateComment(validationErrors) {
    let comment = "The following issues were found with this pull request:";
    validationErrors.forEach((validationError) => comment += `\n* ${validationError}`);
    comment += "\n\n\n<sub>After resolving issues, you can retry this validation via the Checks tab on this pull request.</sub>";

    return comment;
}

async function run() {
    try {
        const eventName = github.context.eventName;
        core.debug(`Event name: ${eventName}`);
        if (eventName !== "pull_request") {
            core.setFailed(`Invalid event (${eventName})`);
            return;
        }

        const client = new github.GitHub(
            core.getInput("repo_token", {required: true}),
        );
        const pullRequest = await getPullRequest(client);

        const validationErrors = [
            ...title.validatePullRequestTitle(pullRequest),
            ...labels.validatePullRequestLabels(pullRequest),
            ...assignees.validatePullRequestAssignees(pullRequest),
            ...await projects.validatePullRequestProjects(pullRequest, client),
        ];

        if (validationErrors.length > 0) {
            const comment = generateComment(validationErrors);
            await client.issues.createComment({
                owner: github.context.repo.owner,
                repo: github.context.repo.repo,
                issue_number: pullRequest.number,
                body: comment,
            });
            core.setFailed(validationErrors[0]);
        }

    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
