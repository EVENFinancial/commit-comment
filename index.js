const { inspect } = require("util");
const core = require("@actions/core");
const { request } = require("@octokit/request");

async function run() {
  try {
    const inputs = {
      token: core.getInput("token"),
      sha: core.getInput("sha"),
      body: core.getInput("body"),
      path: core.getInput("path"),
      position: core.getInput("position")
    };
    core.debug(`Inputs: ${inspect(inputs)}`);

    const sha = inputs.sha ? inputs.sha : process.env.GITHUB_SHA;
    core.debug(`SHA: ${sha}`);
    let interpolated_string = eval('`'+inputs.body+'`');
    const commentResponse = await request(
      `POST /repos/${process.env.GITHUB_REPOSITORY}/commits/${sha}/comments`,
      {
        headers: {
          authorization: `token ${inputs.token}`
        },
        body: interpolated_string,
        path: `${inputs.path}`,
        position: `${inputs.position}`
      }
    );

    const pullRequestResponse = await request(
      `GET /repos/${process.env.GITHUB_REPOSITORY}/commits/${sha}/pulls`,
      {
        headers: {
          authorization: `token ${inputs.token}`,
          Accept: `application/vnd.github.groot-preview+json`
        },
      }
    );

    console.log(`${ Object.keys(pullRequestResponse).join(',')}`);
    console.log(`${ Object.keys(pullRequestResponse.data).join(',')}`);
    const pr = pullRequestResponse.data[0] || { html_url: 'https://github.com/EVENFinancial/api-spec', title: 'Not opened yet'}
    core.setOutput("github_commit_url", commentResponse.data.html_url || 'https://github.com/EVENFinancial/api-spec');
    core.setOutput("github_pull_request_url", pr.html_url || 'https://github.com/EVENFinancial/api-spec');
    core.setOutput("github_pull_request_title", pr.title || 'Not opened yet');
  } catch (error) {
    core.debug(inspect(error));
    core.setFailed(error.message);
  }
}

run();
