const core = require("@actions/core");

function validateTitlePrefix(pullRequestTitle, prefix, caseSensitive) {
    if (!caseSensitive) {
        prefix = prefix.toLowerCase();
        pullRequestTitle = pullRequestTitle.toLowerCase();
    }
    return pullRequestTitle.startsWith(prefix);
}

export function validatePullRequestTitle(pullRequest) {
    const validationErrors = [];

    const title = pullRequest.title;
    core.debug(`Pull request title: "${title}"`);

    // Check if title pass regex
    const regex = RegExp(core.getInput("title_regex"), core.getInput("title_regex_flags"));
    core.debug(`Pull request title regex: ${regex}`);
    if (!regex.test(title)) {
        validationErrors.push(`Pull request title "${title}" does not match regex (${regex})`);
    }

    // Check if title starts with a prefix
    const prefixes = core.getInput("title_allowed_prefixes");
    const prefixCaseSensitive = (core.getInput("title_prefix_case_sensitive") === "true");
    core.debug(`Allowed prefixes: ${prefixes}`);
    if (prefixes.length > 0 &&
        !prefixes.split(",").some((prefix) => validateTitlePrefix(title, prefix, prefixCaseSensitive))) {
        validationErrors.push(`Pull request title "${title}" does not match any of the prefixes (${prefixes})`);
    }

    return validationErrors;
}
