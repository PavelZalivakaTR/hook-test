const core = require("@actions/core");

export function validatePullRequestAssignees(pullRequest) {
    const validationErrors = [];

    const assignees = pullRequest.assignees;
    const assigneeNames = assignees.map((assignee) => assignee.login);
    core.debug(`Pull request assignees: "${assigneeNames}"`);

    // Check if the pull request is assigned
    const assigneeRequired = (core.getInput("assignee_required") === "true");
    if (assigneeRequired && assignees.length === 0) {
        validationErrors.push(`Pull request does not have an assignee`);
    }

    return validationErrors;
}
