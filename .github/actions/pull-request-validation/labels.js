const core = require("@actions/core");

export function validatePullRequestLabels(pullRequest) {
    const validationErrors = [];

    const labels = pullRequest.labels;
    const labelNames = labels.map((label) => label.name);
    core.debug(`Pull request labels: "${labelNames}"`);

    // Check if one of the required labels is included
    const labelsRequired = (core.getInput("labels_required") === "true");
    validationErrors.push(`Labels required config (${labelsRequired})`);
    if (labelsRequired.length > 0) {
        const requiredLabels = labelsRequired.split(",");
        if (!labelNames.some((labelName) => requiredLabels.includes(labelName))) {
            validationErrors.push(`Pull request did not have one of the required labels (${requiredLabels})`);
        }
    }

    return validationErrors;
}
