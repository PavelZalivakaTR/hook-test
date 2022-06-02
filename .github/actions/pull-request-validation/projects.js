const core = require("@actions/core");
const github = require("@actions/github");

const OPEN_PULL_REQUEST_COLUMN_NAMES = ["In progress"];

async function getProjectsForRepo(client) {
    return client.projects.listForRepo({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        per_page: 100,
    }).then((response) => response.data);
}

async function getColumnsForProject(client, projectId) {
    return client.projects.listColumns({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        project_id: projectId,
    }).then((response) => response.data);
}

async function getCardsForProjectColumn(client, columnId) {
    return client.projects.listCards({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        column_id: columnId,
    }).then((response) => response.data);
}

async function getOpenPullRequestCards(projects, client) {
    return Promise.all(
        projects.map(async (project) => {
            const projectId = project.id;

            // Get all columns for projects in this repo, then filter by column names to which pull requests are auto-assigned
            const projectColumns = await getColumnsForProject(client, projectId);
            const openPullRequestColumns = projectColumns.filter((projectColumn) => {
                return OPEN_PULL_REQUEST_COLUMN_NAMES.includes(projectColumn.name);
            });

            // Get all cards in specified project columns, adding the `project_id` property
            return await Promise.all(
                openPullRequestColumns.map(async (column) => {
                    const columnId = column.id;
                    return (await getCardsForProjectColumn(client, columnId)).map((openPullRequestCard) => {
                        return {...openPullRequestCard, project_id: projectId};
                    });
                }),
            ).then((cards) => cards.flat());
        }),
    ).then((cards) => cards.flat());
}

export async function validatePullRequestProjects(pullRequest, client) {
    const validationErrors = [];

    // Check if the pull request has a project
    const projectsRequired = (core.getInput("project_required") === "true");
    if (projectsRequired) {
        const projects = await getProjectsForRepo(client);
        const openPullRequestCards = await getOpenPullRequestCards(projects, client);

        // Check for card(s) which have a content_url pointing to this pull request
        const pullRequestCards = openPullRequestCards.filter((card) => {
            return card.content_url === pullRequest.issue_url;
        });

        // Get names of projects for the matching card(s)
        const pullRequestProjectNames = pullRequestCards.map((pullRequestCard) => {
            const pullRequestProject = projects.find((project) => {
                return project.id === pullRequestCard.project_id;
            });
            return pullRequestProject.name;
        });
        core.debug(`Pull request projects: "${pullRequestProjectNames.join(", ")}"`);

        if (pullRequestCards.length < 1) {
            validationErrors.push("Pull request does not have a project");
        }
    }

    return validationErrors;
}

