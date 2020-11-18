import * as core from "@actions/core";
import { Octokit } from "@octokit/action";
import * as shell from "shelljs";
import { getPullRequestNumber, getCommentNumber } from "./github";

const shouldComment = (mode: String, code: Number) => {
  if (mode == "always") {
    return true;
  }

  if (mode == "success" && code == 0) {
    return true;
  }

  if (mode == "failure" && code != 0) {
    return true;
  }

  return false;
};

(async () => {
  try {
    const command = core.getInput("command");
    const mode = core.getInput("mode");
    const text = core.getInput("text");

    const octokit = new Octokit();
    const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
    const issueNumber = getPullRequestNumber();

    // Check that we're running in the correct context
    if (!issueNumber) {
      console.log("Not running in Pull Request context");
      return;
    }

    // Run command
    console.log(`Running "${command}"`);
    const commandOutput = shell.exec(command);
    console.log(commandOutput.stdout);
    console.log(commandOutput.stderr);

    // Add Comment
    if (shouldComment(mode, commandOutput.code)) {
      const body = `${text}\n\n**Output**\n${commandOutput.stdout}\n${commandOutput.stderr}`;

      const commentNumber = await getCommentNumber(text);
      if (commentNumber) {
        console.log(`Updating comment ${commentNumber}`);
        await octokit.request(
          "PATCH /repos/:owner/:repo/issues/comments/:commentNumber",
          {
            owner,
            repo,
            commentNumber,
            body,
          }
        );
      } else {
        console.log("Adding comment to PR");
        await octokit.request(
          "POST /repos/:owner/:repo/issues/:issueNumber/comments",
          {
            owner,
            repo,
            issueNumber,
            body,
          }
        );
      }
    }
  } catch (error) {
    core.setFailed(error.message);
  }
})();
