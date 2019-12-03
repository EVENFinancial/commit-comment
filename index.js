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
    const response = await request(
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
    console.log(`The event payload: ${response.keys.join(',')}`);
    core.setOutput("github_url", response.htmlUrl);
  } catch (error) {
    core.debug(inspect(error));
    core.setFailed(error.message);
  }
}

run();
